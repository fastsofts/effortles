import * as React from 'react';
import { makeStyles } from '@material-ui/core';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet';
import * as Router from 'react-router-dom';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer.jsx';
import { PermissionDialog } from '@components/Permissions/PermissionDialog.jsx';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import download from '@assets/WebAssets/download.svg';
import moment from 'moment';
import { FormattedAmount } from '@components/formattedValue/FormattedValue';
import deleteBin from '@assets/binRed.svg';
import viewYourBills from '@assets/viewYourBills.png';
import editYourBills from '@assets/editYourBills.png';
import * as Mui from '@mui/material';
import Input from '@components/Input/Input.jsx';
import Checkbox from '@components/Checkbox/Checkbox.jsx';
import { OnlyDatePicker } from '@components/DatePicker/DatePicker.jsx';
import {
  CheckedIcon,
  UncheckedIcon,
} from '@core/PaymentView/MultiplePayments/VendorBillSelection';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import AppContext from '@root/AppContext.jsx';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import CalendarIcon from '@mui/icons-material/CalendarToday';
// import DownloadIcon from '@mui/icons-material/Download';
import themes from '@root/theme.scss';
import SearchIcon from '@material-ui/icons/Search';
import Calender from '../InvoiceView/Calander';
import css from './BillsInDraft.scss';

const useStyles = makeStyles(() => ({
  chips: {
    background: '#FFF !important',
    flexDirection: 'row-reverse !important',
    justifyContent: 'space-between ',
    padding: '0 10px !important',
    border: '1.5px solid #E1E1E1 !important',
    borderRadius: '8px !important',
    cursor: 'pointer !important',
  },
  searchInput: {
    margin: '0 20px',
    padding: '5px 10px 0 0',
    '& .MuiTextField-root': {
      paddingLeft: '8px',
      marginBottom: '8px',
      border: '1px solid rgb(180 175 174)',
    },
    '& .MuiInput-root': {
      height: '56px !important',
    },
  },
  checkbox: {
    padding: 0,
    paddingTop: 4,
    '& .MuiSvgIcon-root': {
      fontSize: '2.4rem',
      fill: 'transparent',
    },
  },
  selectedchips: {
    minWidth: '80px',
    background: '#fdf1e6 !important',
    color: `${themes.colorPrimaryButton} !important`,
    borderColor: `${themes.colorPrimaryButton} !important`,
  },
}));

const sortOptions = [
  { id: 1, name: 'Recent payments', click: { order_by: 'date', order: 'asc' } },
  {
    id: 2,
    name: 'Bill amount Low to High',
    click: { order_by: 'amount', order: 'asc' },
  },
  {
    id: 3,
    name: 'Bill amount High to Low',
    click: { order_by: 'amount', order: 'desc' },
  },
  { id: 4, name: 'A-Z', click: { order_by: 'name', order: 'asc' } },
  { id: 5, name: 'Z-A', click: { order_by: 'name', order: 'desc' } },
];

export const paymentStatusListWithBill = [
  { id: 'company_cash', label: 'Paid with Company Cash' },
  { id: 'paid_as_advance', label: 'Paid as Advance' },
  { id: 'to_pay', label: 'To Pay' },
  { id: 'company_card', label: 'Paid with Company Card' },
  { id: 'personal', label: 'Paid Personally' },
  { id: 'company_account', label: 'Paid with Company Account' },
];

const DraftBills = () => {
  const classes = useStyles();
  const {
    organization,
    enableLoading,
    user,
    loading,
    openSnackBar,
    userPermissions,
  } = React.useContext(AppContext);
  const [anchorEl, setAnchorEl] = React.useState({
    vendor: null,
    date: null,
    sort: null,
  });
  const [webValue, setWebValue] = React.useState({
    fromDate: null,
    toDate: null,
    order_by: '',
  });
  const [sortData, setSortData] = React.useState({
    fromDate: null,
    toDate: null,
    order_by: '',
    order: '',
  });
  const [searchVendorList, setSearchVendorList] = React.useState([]);
  const [selectVendorList, setSelectVendorList] = React.useState([]);
  const [draftBills, setDraftBills] = React.useState([]);
  const [dialogDelete, setDialogDelete] = React.useState(false);

  const [search, setSearch] = React.useState('');
  const [filterBillsArray, setFilterBillsArray] = React.useState([]);
  const [BottomSheet, setBottomSheet] = React.useState(false);
  const [tableDetails, setTableDetails] = React.useState([]);
  const navigate = Router.useNavigate();
  const { state } = Router.useLocation();
  const device = localStorage.getItem('device_detect');
  const [drawer, setDrawer] = React.useState({
    startDate: false,
    endDate: false,
  });
  const [viewBill, setViewBill] = React.useState(false);
  const [file, setFile] = React.useState('');
  const [pageNumber, setPageNumber] = React.useState(1);
  const [vendorQuery, setVendorQuery] = React.useState();

  const [userRoles, setUserRoles] = React.useState({});
  const [havePermission, setHavePermission] = React.useState({ open: false });

  React.useEffect(() => {
    if (Object.keys(userPermissions?.Expense || {})?.length > 0) {
      if (!userPermissions?.Expense?.Expense) {
        setHavePermission({
          open: true,
          back: () => {
            navigate('/dashboard');
            setHavePermission({ open: false });
          },
        });
      }
      setUserRoles({ ...userPermissions?.Expense });
    }
  }, [userPermissions]);

  React.useEffect(() => {
    if (Object.keys(userRoles?.['Bill Booking'] || {})?.length > 0) {
      if (!userRoles?.['Bill Booking']?.view_bills) {
        setHavePermission({
          open: true,
          back: () => {
            navigate('/bill');
            setHavePermission({ open: false });
          },
        });
      }
    }
  }, [userRoles?.['Bill Booking']]);

  const onDocumentLoadSuccess = (numPages) => {
    setPageNumber(numPages?.numPages);
  };

  React.useEffect(() => {
    const filterBills = search
      ? draftBills?.filter(
          (val) =>
            val?.vendor?.name
              ?.trim()
              ?.toLowerCase()
              ?.includes(search.trim().toLowerCase()) ||
            val?.new_vendor?.name
              ?.trim()
              ?.toLowerCase()
              ?.includes(search.trim().toLowerCase()),
        )
      : draftBills;
    setFilterBillsArray(filterBills);
  }, [search, draftBills]);

  const openVendor = anchorEl.vendor;
  const openSort = anchorEl.sort;
  const openCalendar = anchorEl.date;

  const getVendors = async (searchVal) => {
    enableLoading(true);

    RestApi(
      `organizations/${organization.orgId}/entities?type[]=vendor&search=${
        searchVal || ''
      }`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        enableLoading(false);
        if (res && !res.error) {
          res.data.map((a) => Object.assign(a, { check: false }));
          // setVendorList(res.data);
          setSearchVendorList(res.data);
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const getDraftBills = () => {
    enableLoading(true);
    let filter = '';

    if (selectVendorList && selectVendorList.length === 1) {
      filter += `&vendor_id=${selectVendorList}`;
    } else if (selectVendorList && selectVendorList.length > 1) {
      selectVendorList.forEach((v) => {
        filter += `&vendor_ids[]=${v}&`;
      });
    }

    if (sortData?.toDate) {
      const toDataStr = moment(sortData?.toDate, 'YYYY-MM-DD').format(
        'YYYY-MM-DD',
      );
      filter += `&end_date=${toDataStr}`;
    }

    if (sortData?.fromDate) {
      const fromDataStr = moment(sortData?.fromDate, 'YYYY-MM-DD').format(
        'YYYY-MM-DD',
      );
      filter += `&start_date=${fromDataStr}`;
    }

    if (sortData?.order_by && sortData?.order) {
      filter += `&order_by=${sortData?.order_by}&order=${sortData?.order}`;
    }

    if (state?.id) {
      filter += `&vendor_bill_ids[]=${state?.id}`;
    }

    RestApi(
      `organizations/${organization.orgId}/vendor_bills?status=draft${filter}`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        if (res && !res.error) {
          setDraftBills(Object.assign(res?.data));
        }
        enableLoading(false);
        // if(id_s) setVendorList([id_s]);
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const deleteBill = (id) => {
    setDialogDelete(false);
    enableLoading(true);

    RestApi(`organizations/${organization.orgId}/vendor_bills/${id}`, {
      method: METHOD.DELETE,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        enableLoading(false);
        if (res?.error || res?.message) {
          openSnackBar({
            message: res?.message || 'Unknown error occured',
            type: MESSAGE_TYPE.ERROR,
          });
        } else {
          getDraftBills();
          setTableDetails([]);
          setBottomSheet(false);
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const editbill = (id) => {
    if (!userRoles?.['Bill Booking']?.edit_bills) {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
      return;
    }
    enableLoading(true);

    RestApi(`organizations/${organization.orgId}/vendor_bills/${id}`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        enableLoading(false);
        if (res?.error || res?.message === 'Vendor Bill not found') {
          openSnackBar({
            message: res?.message || 'Unknown error occured',
            type: MESSAGE_TYPE.ERROR,
          });
        } else {
          navigate('/bill-upload', {
            state: { selected: res },
          });
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  React.useEffect(() => {
    getVendors();
  }, []);

  React.useEffect(() => {
    getDraftBills();
  }, [
    sortData?.toDate,
    sortData?.fromDate,
    sortData?.order,
    sortData?.order_by,
    selectVendorList,
  ]);

  const onSortChange = (v) => {
    setSortData((s) => ({
      ...s,
      order_by: v?.click?.order_by,
      order: v?.click?.order,
    }));
    setAnchorEl((prev) => ({
      ...prev,
      sort: null,
    }));
  };

  const onTriggerDrawer = (name) => {
    setDrawer((d) => ({ ...d, [name]: true }));
  };

  const handleValueChange = (v, checked) => {
    if (checked) {
      setSelectVendorList((prev) => [...prev, v]);
    } else {
      const checkedList = selectVendorList?.filter((item) => item !== v);
      setSelectVendorList(checkedList);
    }
  };

  const handleStartDate = (val) => {
    setWebValue((prev) => ({ ...prev, fromDate: new Date(val) }));
    if (device === 'mobile') {
      setSortData((prev) => ({
        ...prev,
        fromDate: new Date(val),
      }));
      setDrawer((d) => ({ ...d, startDate: false }));
    }
  };
  const handleEndDate = (val) => {
    setWebValue((prev) => ({ ...prev, toDate: new Date(val) }));
    if (device === 'mobile') {
      setSortData((prev) => ({
        ...prev,
        toDate: new Date(val),
      }));
      setDrawer((d) => ({ ...d, endDate: false }));
    }
  };

  const onInputChange = (e) => {
    const { value } = e.target;
    setVendorQuery(value);
    if (value?.length === 0) {
      getVendors();
    }
    if (value?.length > 2) {
      getVendors(value);
    }
  };

  const handleDownloadClick = async () => {
    const image = await fetch(file);
    const imageBlog = await image.blob();
    const imageURL = URL.createObjectURL(imageBlog);

    const link = document.createElement('a');
    link.href = imageURL;
    link.download = 'draft-bill';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ViewUploadBill = (url) => {
    setViewBill(true);
    setFile(url);
  };

  React.useEffect(() => {
    if (state?.id && draftBills?.length > 0) {
      const temp = draftBills?.find((val) => val?.id === state?.id);
      if (temp?.file_url) {
        ViewUploadBill(temp?.file_url);
      } else {
        setBottomSheet(true);
        setTableDetails([temp]);
      }
    }
  }, [state?.id, draftBills]);

  const DeleteUploadBill = () => {
    if (!userRoles?.['Bill Booking']?.delete_bills) {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
      return;
    }
    setDialogDelete(true);
  };

  return (
    <div
      className={
        device === 'desktop'
          ? css.draftBills
          : `${css.draftBills} ${css.draftBillsMob}`
      }
    >
      <p
        className={
          (device === 'desktop' && css.draftTitle) || css.draftTitleMob
        }
      >
        Draft Bills
      </p>

      <div
        className={
          device === 'desktop'
            ? css.secondRow
            : `${css.secondRow} ${css.secondRowMob}`
        }
      >
        <div
          className={
            device === 'desktop'
              ? css.firstSet
              : `${css.firstSet} ${css.firstSetMob}`
          }
        >
          {device === 'desktop' && (
            <div className={css.searchFilter}>
              <SearchIcon style={{ color: '#af9d9d' }} />{' '}
              <input
                placeholder="Search for"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={css.textFieldFocus}
              />
            </div>
          )}
          <Mui.Chip
            label="Date"
            icon={<KeyboardArrowDown />}
            onClick={(event) => {
              setAnchorEl((prev) => ({ ...prev, date: event.currentTarget }));
            }}
            sx={{
              '& .MuiChip-label': {
                paddingLeft: 0,
              },
            }}
            className={classes.chips}
          />
          <Mui.Chip
            label="Vendor"
            icon={<KeyboardArrowDown />}
            onClick={(event) => {
              setAnchorEl((prev) => ({ ...prev, vendor: event.currentTarget }));
            }}
            sx={{
              '& .MuiChip-label': {
                paddingLeft: 0,
              },
            }}
            className={classes.chips}
          />

          {device === 'mobile' && (
            <Mui.Chip
              label="Sort by"
              icon={<KeyboardArrowDown />}
              onClick={(event) => {
                setAnchorEl((prev) => ({ ...prev, sort: event.currentTarget }));
              }}
              sx={{
                '& .MuiChip-label': {
                  paddingLeft: 0,
                },
              }}
              className={classes.chips}
            />
          )}
        </div>

        {(selectVendorList?.length > 0 ||
          (sortData?.order && sortData?.order_by) ||
          (sortData?.fromDate && sortData?.toDate)) && (
          <div
            className={
              device === 'mobile'
                ? css.selectedOptions3Mob
                : css.selectedOptions3
            }
          >
            {sortData?.order && sortData?.order_by && (
              <Mui.Chip
                className={classes.selectedchips}
                label={webValue?.order_by}
                variant="outlined"
                onDelete={() => {
                  setSortData((prev) => ({
                    ...prev,
                    order: '',
                    order_by: '',
                  }));
                  setWebValue((prev) => ({
                    ...prev,
                    order_by: '',
                  }));
                }}
              />
            )}

            {sortData?.fromDate && sortData?.toDate && (
              <Mui.Chip
                className={classes.selectedchips}
                label={`${moment(sortData.fromDate, 'YYYY-MM-DD').format(
                  'MMM DD',
                )} - ${moment(sortData.toDate, 'YYYY-MM-DD').format(
                  'MMM DD, YYYY',
                )}`}
                variant="outlined"
                onDelete={() => {
                  setSortData((prev) => ({
                    ...prev,
                    fromDate: null,
                    toDate: null,
                  }));
                  setWebValue((prev) => ({
                    ...prev,
                    fromDate: null,
                    toDate: null,
                  }));
                }}
              />
            )}
            {selectVendorList?.length >= 1 &&
              selectVendorList?.map((a) => {
                return (
                  <Mui.Chip
                    className={classes.selectedchips}
                    label={
                      searchVendorList?.find((val) => val?.id === a)?.name ||
                      '-'
                    }
                    key={a}
                    variant="outlined"
                    onDelete={() => {
                      handleValueChange(a, false);
                    }}
                  />
                );
              })}
          </div>
        )}

        {device === 'desktop' && (
          <div className={css.secondSet}>
            <Mui.Chip
              label="Sort by"
              icon={<KeyboardArrowDown />}
              onClick={(event) => {
                setAnchorEl((prev) => ({ ...prev, sort: event.currentTarget }));
              }}
              sx={{
                '& .MuiChip-label': {
                  paddingLeft: 0,
                },
              }}
              className={classes.chips}
            />

            {/* <div className={css.downloadImg}>
            <DownloadIcon style={{ color: '#FFF' }} />
          </div> */}
          </div>
        )}
      </div>

      {device === 'desktop' && (
        <div className={css.thirdRow}>
          {filterBillsArray?.length > 0 && (
            <Mui.TableContainer
              sx={{
                borderRadius: 5,
                // minHeight: 600,
                maxHeight: '62vh',
              }}
            >
              <Mui.Table
                stickyHeader
                size="medium"
                style={{ background: '#ffff' }}
              >
                <Mui.TableHead>
                  {[
                    { name: 'Name' },
                    { name: 'Bill Number' },
                    // { name: 'Status', align: 'center' },
                    { name: 'Date' },
                    { name: 'Payment Amount', align: 'right' },
                  ]?.map((title) => (
                    <Mui.TableCell
                      className={css.tableHead}
                      align={title?.align || 'left'}
                    >
                      {title?.name}
                    </Mui.TableCell>
                  ))}
                </Mui.TableHead>

                <Mui.TableBody>
                  {filterBillsArray?.map((item) => (
                    <Mui.TableRow
                      onClick={() => {
                        setBottomSheet(true);
                        setTableDetails([item]);
                      }}
                      sx={{ cursor: 'pointer' }}
                    >
                      <Mui.TableCell>
                        <p className={css.vendorName}>
                          {item?.vendor
                            ? item?.vendor?.name?.toLowerCase()
                            : (item?.new_vendor &&
                                item?.new_vendor?.name?.toLowerCase()) ||
                              '-'}
                        </p>
                        <p className={css.vendorId}>
                          {(item?.payment_mode &&
                            paymentStatusListWithBill?.find(
                              (v) => v.id === item?.payment_mode,
                            )?.label) ||
                            item?.payment_mode ||
                            '-'}
                        </p>
                      </Mui.TableCell>
                      <Mui.TableCell>
                        <p className={css.billNumber}>
                          {item?.document_number}
                        </p>
                      </Mui.TableCell>
                      {/* <Mui.TableCell align="center">
                        <div
                          style={{
                            display: 'flex',
                            gap: 5,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <div className={css.DraftBillIcon}>
                            <span className={css.innerSpan} />
                          </div>
                          <p className={css.status}>{item?.status}</p>
                        </div>
                      </Mui.TableCell> */}
                      <Mui.TableCell>
                        <p className={css.vendorDate}>
                          {item?.document_date !== null
                            ? moment(item?.document_date).format('DD-MM-YYYY')
                            : '-'}
                        </p>
                      </Mui.TableCell>
                      <Mui.TableCell align="right">
                        <p className={css.vendorAmt}>
                          {FormattedAmount(item?.amount)}
                        </p>
                      </Mui.TableCell>
                    </Mui.TableRow>
                  ))}
                </Mui.TableBody>
              </Mui.Table>
            </Mui.TableContainer>
          )}
          {!loading && filterBillsArray.length === 0 && (
            <Mui.Typography align="center">No Data Found!!!</Mui.Typography>
          )}
          {loading && (
            <Mui.Typography align="center">
              Data is being fetched...
            </Mui.Typography>
          )}
        </div>
      )}

      {device === 'mobile' && (
        <div className={css.draftMobCard}>
          {filterBillsArray?.map((item) => (
            <div className={css.cardDetail}>
              <div
                className={css.firstSet}
                onClick={() => {
                  setBottomSheet(true);
                  setTableDetails([item]);
                }}
              >
                <p className={css.vendorName}>
                  {item?.vendor
                    ? item?.vendor?.name?.toLowerCase()
                    : (item?.new_vendor &&
                        item?.new_vendor?.name?.toLowerCase()) ||
                      '-'}
                </p>
                <div className={css.innerFirst}>
                  <p className={css.key}>Bill Number</p>
                  <p className={css.value}>{item?.document_number}</p>
                </div>
                <div className={css.innerFirst}>
                  <p className={css.key}>Payment Amount</p>
                  <p className={css.value}>{FormattedAmount(item?.amount)}</p>
                </div>
              </div>
              <div className={css.secondSet}>
                <div
                  onClick={() => {
                    setTableDetails([item]);
                    DeleteUploadBill();
                  }}
                >
                  <img src={deleteBin} alt="delete" />
                </div>
              </div>
            </div>
          ))}
          {!loading && filterBillsArray.length === 0 && (
            <Mui.Typography align="center">No Data Found!!!</Mui.Typography>
          )}
          {loading && (
            <Mui.Typography align="center">
              Data is being fetched...
            </Mui.Typography>
          )}
        </div>
      )}

      <SelectBottomSheet
        open={Boolean(anchorEl.vendor) && device === 'mobile'}
        addNewSheet
        onClose={() => {
          setAnchorEl((prev) => ({ ...prev, vendor: null }));
        }}
        triggerComponent={<span style={{ display: 'none' }} />}
      >
        <div className={classes.searchInput}>
          <p className={css.forline}>Select Vendor</p>
          <Input
            name="search"
            placeholder="Search Vendor"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              type: 'text',
              startAdornment: (
                <SearchIcon style={{ color: 'rgb(175, 157, 157)' }} />
              ),
            }}
            value={vendorQuery}
            fullWidth
            onChange={onInputChange}
            theme="light"
          />
          <div style={{ overflow: 'auto', maxHeight: '50vh' }}>
            {searchVendorList &&
              searchVendorList?.map((item) => {
                return (
                  <div
                    className={css.checkboxList}
                    key={item.id}
                    role="menuitem"
                  >
                    <Mui.FormControlLabel
                      label={
                        <div className={css.checkboxLabel}>
                          {item.short_name?.toLowerCase()}
                        </div>
                      }
                      control={
                        <Checkbox
                          className={classes.checkbox}
                          checked={selectVendorList?.includes(item?.id)}
                          inputProps={{ id: item.name }}
                          value={item?.id}
                          icon={<UncheckedIcon />}
                          checkedIcon={<CheckedIcon />}
                          onChange={(e) => {
                            handleValueChange(item?.id, e.target.checked);
                          }}
                        />
                      }
                    />
                  </div>
                );
              })}
            {searchVendorList.length === 0 && (
              <Mui.Typography align="center">
                {loading ? 'Data is being fetched' : 'No Data!'}
              </Mui.Typography>
            )}
          </div>
        </div>
      </SelectBottomSheet>

      <Mui.Popover
        id="basic-menu-sort"
        anchorEl={anchorEl.vendor}
        open={openVendor && device === 'desktop'}
        onClose={() => setAnchorEl((prev) => ({ ...prev, vendor: null }))}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        PaperProps={{
          elevation: 3,
          style: {
            maxHeight: 600,
            width: '38ch',
            padding: '5px 5px 20px 5px',
            borderRadius: 20,
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <div className={classes.searchInput}>
          <p className={css.forline}>Select Vendor</p>
          <Input
            name="search"
            placeholder="Search Vendor"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              type: 'text',
              startAdornment: (
                <SearchIcon style={{ color: 'rgb(175, 157, 157)' }} />
              ),
            }}
            value={vendorQuery}
            fullWidth
            onChange={onInputChange}
            theme="light"
          />
          <div style={{ overflow: 'auto', maxHeight: '25rem' }}>
            {searchVendorList &&
              searchVendorList?.map((item) => {
                return (
                  <div
                    className={css.checkboxList}
                    key={item.id}
                    role="menuitem"
                  >
                    <Mui.FormControlLabel
                      label={
                        <div className={css.checkboxLabel}>
                          {item.short_name?.toLowerCase()}
                        </div>
                      }
                      control={
                        <Checkbox
                          className={classes.checkbox}
                          checked={selectVendorList?.includes(item?.id)}
                          inputProps={{ id: item.name }}
                          value={item?.id}
                          icon={<UncheckedIcon />}
                          checkedIcon={<CheckedIcon />}
                          onChange={(e) => {
                            handleValueChange(item?.id, e.target.checked);
                          }}
                        />
                      }
                    />
                  </div>
                );
              })}
            {searchVendorList.length === 0 && (
              <Mui.Typography align="center">
                {loading ? 'Data is being fetched' : 'No Data!'}
              </Mui.Typography>
            )}
          </div>
        </div>
      </Mui.Popover>

      <SelectBottomSheet
        open={Boolean(anchorEl.sort) && device === 'mobile'}
        addNewSheet
        onClose={() => {
          setAnchorEl((prev) => ({ ...prev, sort: null }));
        }}
        triggerComponent={<span style={{ display: 'none' }} />}
      >
        <div>
          <p style={{ margin: '20px' }} className={css.forline}>
            Sort
          </p>
          {sortOptions?.map((val) => (
            <div
              onClick={() => {
                setWebValue({
                  ...webValue,
                  order_by: val?.name,
                });
                onSortChange(val);
                setAnchorEl((prev) => ({ ...prev, sort: null }));
              }}
              className={css.categoryOptions}
            >
              {val?.name}
            </div>
          ))}
        </div>
      </SelectBottomSheet>

      <Mui.Menu
        id="basic-menu-sort"
        anchorEl={anchorEl.sort}
        open={openSort && device === 'desktop'}
        onClose={() => setAnchorEl((prev) => ({ ...prev, sort: null }))}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        PaperProps={{
          elevation: 3,
          style: {
            maxHeight: 350,
            width: '35ch',
            padding: '10px',
            borderRadius: 20,
          },
        }}
      >
        <div>
          <div>
            <p className={css.forline}>Sort by</p>
          </div>
          <ul style={{ listStyleType: 'none' }}>
            {sortOptions.map((e) => (
              <li aria-hidden="true">
                <Mui.RadioGroup
                  value={webValue.order_by}
                  onChange={(event) => {
                    setWebValue({
                      ...webValue,
                      order_by: event.target.value,
                    });
                  }}
                >
                  <Mui.FormControlLabel
                    value={e.name}
                    control={<Mui.Radio style={{ color: '#F08B32' }} />}
                    label={e.name}
                  />
                </Mui.RadioGroup>
              </li>
            ))}
          </ul>
          <Mui.Button
            contained
            className={css.applyFiltersButton}
            onClick={() => {
              onSortChange(
                sortOptions.find((data) => data.name === webValue?.order_by),
              );
              setAnchorEl((prev) => ({ ...prev, sort: null }));
            }}
          >
            Apply Filters
          </Mui.Button>
        </div>
      </Mui.Menu>

      <SelectBottomSheet
        triggerComponent
        open={Boolean(anchorEl.date) && device === 'mobile'}
        name="date"
        onClose={() => setAnchorEl((prev) => ({ ...prev, date: null }))}
        addNewSheet
      >
        <div style={{ padding: '15px' }}>
          <span>Select the start and end date to filter</span>
          <hr className={css.DividerFilter} />
        </div>
        <div className={css.dateWrapper}>
          {/* <MuiDatePicker
            selectedDate={fromDate}
            label="Start Date"
            onChange={(m) => setFromDate(m.format('YYYY-MM-DD'))}
          /> */}
          <div
            style={{
              border: '1px solid #A0A4AF',
              borderRadius: '10px',
              width: '78%',
              padding: '5px',
              margin: '0 10% 5%',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontStyle: 'light',
                color: '#283049',
              }}
            >
              Start Date
            </div>

            <div
              style={{
                marginLeft: '5px',
                marginTop: '5px',
                fontSize: '14px',
                fontStyle: 'bold',
                color: '#283049',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                margin: '5px',
              }}
            >
              <input
                type="text"
                value={
                  webValue?.fromDate === null
                    ? 'dd-mm-yy'
                    : moment(webValue?.fromDate).format('DD-MM-YYYY')
                }
                style={{
                  pointerEvents: 'none',
                  width: '70%',
                  border: 'none',
                }}
              />

              <SelectBottomSheet
                name="startDate"
                addNewSheet
                triggerComponent={
                  <CalendarIcon
                    style={{ width: 20, color: '#949494' }}
                    onClick={() => {
                      onTriggerDrawer('startDate');
                    }}
                  />
                }
                open={drawer.startDate}
                // value={taxValue}

                onTrigger={onTriggerDrawer}
                onClose={() => {
                  setDrawer((d) => ({ ...d, startDate: false }));
                }}

                // maxHeight="45vh"
              >
                <div style={{ padding: '15px' }}>
                  <span>Start Date</span>
                  <hr className={css.DividerFilter} />
                </div>
                <Calender
                  head="Select Start Date"
                  button="Select"
                  handleDate={handleStartDate}
                />
              </SelectBottomSheet>
            </div>
          </div>
        </div>
        <div className={css.dateWrapper}>
          {/* <MuiDatePicker
            selectedDate={toDate}
            label="End Date"
            onChange={(m) => setToDate(m.format('YYYY-MM-DD'))}
          /> */}
          <div
            style={{
              border: '1px solid #A0A4AF',
              borderRadius: '10px',
              width: '78%',
              padding: '5px',
              margin: '0 10% 5%',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontStyle: 'light',
                color: '#283049',
              }}
            >
              End Date
            </div>

            <div
              style={{
                marginLeft: '5px',
                marginTop: '5px',
                fontSize: '14px',
                fontStyle: 'bold',
                color: '#283049',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                margin: '5px',
              }}
            >
              <input
                type="text"
                style={{
                  pointerEvents: 'none',
                  width: '70%',
                  border: 'none',
                }}
                value={
                  webValue?.toDate === null
                    ? 'dd-mm-yy'
                    : moment(webValue?.toDate).format('DD-MM-YYYY')
                }
              />

              <SelectBottomSheet
                name="endDate"
                addNewSheet
                triggerComponent={
                  <CalendarIcon
                    style={{ width: 20, color: '#949494' }}
                    onClick={() => {
                      onTriggerDrawer('endDate');
                    }}
                  />
                }
                open={drawer.endDate}
                // value={taxValue}

                onTrigger={onTriggerDrawer}
                onClose={() => {
                  setDrawer((d) => ({ ...d, endDate: false }));
                }}

                // maxHeight="45vh"
              >
                <div style={{ padding: '15px' }}>
                  <span>End Date</span>
                  <hr className={css.DividerFilter} />
                </div>
                <Calender
                  head="Select End Date"
                  button="Select"
                  handleDate={handleEndDate}
                />
              </SelectBottomSheet>
            </div>
          </div>
        </div>
      </SelectBottomSheet>

      <Mui.Menu
        id="basic-menu-sort"
        anchorEl={anchorEl.date}
        open={openCalendar && device === 'desktop'}
        onClose={() => setAnchorEl((prev) => ({ ...prev, date: null }))}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        PaperProps={{
          elevation: 3,
          style: {
            maxHeight: 300,
            width: '40ch',
            padding: '5px 25px',
            borderRadius: 20,
          },
        }}
      >
        <div className={css.dateWrapper}>
          <p className={css.forline}>Select the start and end date to filter</p>
          <div
            style={{
              border: '1px solid #A0A4AF',
              borderRadius: '10px',
              width: '90%',
              padding: '5px',
              margin: '10px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontStyle: 'light',
                color: '#283049',
              }}
            >
              Start Date
            </div>

            <div
              style={{
                marginLeft: '5px',
                marginTop: '5px',
                fontSize: '14px',
                fontStyle: 'bold',
                color: '#283049',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                margin: '5px',
              }}
            >
              <input
                type="text"
                value={
                  webValue.fromDate
                    ? moment(webValue.fromDate).format('DD-MM-YYYY')
                    : 'DD-MM-YYYY'
                }
                style={{
                  width: '100%',
                  border: 'none',
                  padding: 5,
                }}
              />
              <OnlyDatePicker
                // className={css.avatarForDate}
                selectedDate={webValue.fromDate || new Date()}
                // label={new Date(invoiceDate).toLocaleDateString()}
                onChange={handleStartDate}
              />
            </div>
          </div>
        </div>
        <div className={css.dateWrapper}>
          {/* <MuiDatePicker
            selectedDate={toDate}
            label="End Date"
            onChange={(m) => setToDate(m.format('YYYY-MM-DD'))}
          /> */}
          <div
            style={{
              border: '1px solid #A0A4AF',
              borderRadius: '10px',
              width: '90%',
              padding: '5px',
              margin: '10px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontStyle: 'light',
                color: '#283049',
              }}
            >
              End Date
            </div>
            <div
              style={{
                marginLeft: '5px',
                marginTop: '5px',
                fontSize: '14px',
                fontStyle: 'bold',
                color: '#283049',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                margin: '5px',
              }}
            >
              <input
                type="text"
                value={
                  webValue.toDate
                    ? moment(webValue.toDate).format('DD-MM-YYYY')
                    : 'DD-MM-YYYY'
                }
                style={{
                  width: '100%',
                  border: 'none',
                  padding: 5,
                }}
              />

              <OnlyDatePicker
                // className={css.avatarForDate}
                selectedDate={webValue.toDate || new Date()}
                // label={new Date(invoiceDate).toLocaleDateString()}
                onChange={handleEndDate}
              />
            </div>
          </div>
        </div>
        <Mui.Button
          contained
          className={css.applyFiltersButton}
          onClick={() => {
            setSortData((prev) => ({
              ...prev,
              fromDate: webValue?.fromDate,
              toDate: webValue?.toDate,
            }));
            setAnchorEl((prev) => ({ ...prev, date: null }));
          }}
        >
          Apply Filters
        </Mui.Button>
      </Mui.Menu>
      <SelectBottomSheet
        name="draftBills"
        addNewSheet
        triggerComponent={<></>}
        open={BottomSheet}
        onTrigger={() => setBottomSheet(true)}
        onClose={() => {
          setBottomSheet(false);
          setTableDetails([]);
        }}
      >
        <div className={css.draftOpenSheet}>
          {tableDetails?.map((e) => (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: '10px 0',
                }}
              >
                <p className={css.documentTitle}>{e?.document_number}</p>
                {e?.file_url && device === 'desktop' && (
                  <div
                    onClick={() => {
                      ViewUploadBill(e?.file_url);
                    }}
                  >
                    <p className={css.viewInvoice}>View Invoice</p>
                  </div>
                )}

                {device === 'mobile' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {e?.file_url && (
                      <Mui.Grid
                        onClick={() => {
                          ViewUploadBill(e?.file_url);
                        }}
                      >
                        <img
                          src={viewYourBills}
                          className={css.editButton}
                          alt="viewYourbills"
                        />{' '}
                      </Mui.Grid>
                    )}
                    <Mui.Grid
                      onClick={() => {
                        editbill(e?.id);
                      }}
                    >
                      <img
                        src={editYourBills}
                        className={css.editButton}
                        alt="editYourBills"
                      />{' '}
                    </Mui.Grid>
                  </div>
                )}
              </div>
              <div>
                {[
                  {
                    name: 'Vendor',
                    value: e?.vendor
                      ? e?.vendor?.name?.toLowerCase()
                      : (e?.new_vendor && e?.new_vendor?.name?.toLowerCase()) ||
                        '-',
                  },
                  { name: 'Amount', value: FormattedAmount(e?.amount) },
                  {
                    name: 'Expense Category',
                    value: e?.expense_account ? e?.expense_account?.name : '-',
                  },
                  {
                    name: 'Payment Mode',
                    value:
                      (e?.payment_mode &&
                        paymentStatusListWithBill?.find(
                          (v) => v.id === e?.payment_mode,
                        )?.label) ||
                      e?.payment_mode ||
                      '-',
                  },
                  { name: 'Location', value: '-' },
                  { name: 'TDS', value: FormattedAmount(e?.tds_amount) },
                  { name: 'Description', value: e?.description || '-' },
                ]?.map((val) => (
                  <div
                    className={css.fields}
                    style={{
                      padding: device === 'mobile' ? '6px 0' : '12px 0',
                    }}
                  >
                    <p className={css.leftFields}>{val.name}</p>
                    <p className={css.rightFields}>{val.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className={css.finalButtonDiv}>
            {device === 'desktop' && (
              <div className={css.firstRow}>
                <div className={css.delete} onClick={() => DeleteUploadBill()}>
                  <p>Delete draft</p>
                </div>
                <div
                  className={css.continue}
                  onClick={() => {
                    editbill(tableDetails?.[0]?.id);
                  }}
                >
                  <p>Continue Editing</p>
                </div>
              </div>
            )}
            {/* <div className={css.lastRow}>
              <p>Record This Expense</p>
            </div> */}
          </div>
        </div>
      </SelectBottomSheet>
      <SelectBottomSheet
        open={dialogDelete && device === 'mobile'}
        addNewSheet
        onClose={() => {
          setDialogDelete(false);
        }}
        triggerComponent={<span style={{ display: 'none' }} />}
      >
        <Mui.Grid className={css.deleteMainDiv}>
          <Mui.Grid>
            <Mui.Typography className={css.deletetitle}>
              Heads Up !
            </Mui.Typography>

            <Mui.Divider className={css.deleteDivider} variant="fullWidth" />
          </Mui.Grid>
          <Mui.Grid className={css.deleteDescription}>
            {' '}
            Are you sure that you want to delete this Bill?
          </Mui.Grid>
          <Mui.Stack direction="row" className={css.buttonWidth}>
            <Mui.Button
              className={css.CancelButton}
              onClick={() => {
                setDialogDelete(false);
              }}
            >
              Cancel
            </Mui.Button>
            <Mui.Button
              className={css.submitButton}
              onClick={() => {
                deleteBill(tableDetails[0]?.id);
              }}
            >
              Confirm
            </Mui.Button>
          </Mui.Stack>
        </Mui.Grid>
      </SelectBottomSheet>
      <Mui.Dialog
        PaperProps={{
          elevation: 3,
          style: {
            width: '86%',
            // position: 'absolute',

            overflow: 'visible',
            borderRadius: 16,
            cursor: 'pointer',
          },
        }}
        open={dialogDelete && device === 'desktop'}
        onClose={() => setDialogDelete(false)}
      >
        <Mui.DialogContent>
          <Mui.Grid
          // className={css.deleteMainDiv}
          >
            <Mui.Grid>
              <Mui.Typography className={css.deletetitle}>
                Heads Up !
              </Mui.Typography>

              <Mui.Divider className={css.deleteDivider} variant="fullWidth" />
            </Mui.Grid>
            <Mui.Grid className={css.deleteDescriptionDesktop}>
              {' '}
              Are your sure that you want to delete this bill?
            </Mui.Grid>
            <Mui.Grid className={css.deleteDescriptionDesktop2}>
              {' '}
              Please note that all data associated with this bill will be
              permanently deleted
            </Mui.Grid>
            <Mui.Stack direction="row" className={css.buttonWidth}>
              <Mui.Button
                className={css.CancelButton}
                onClick={() => {
                  setDialogDelete(false);
                }}
              >
                Cancel
              </Mui.Button>
              <Mui.Button
                className={css.submitButton}
                onClick={() => {
                  deleteBill(tableDetails[0]?.id);
                }}
              >
                Confirm
              </Mui.Button>
            </Mui.Stack>
          </Mui.Grid>
        </Mui.DialogContent>
      </Mui.Dialog>

      <Mui.Dialog
        PaperProps={{
          elevation: 3,
          style: {
            width: '86%',
            height: file.includes('.pdf') ? '100%' : '',
            // position: 'absolute',

            overflow: 'visible',
            borderRadius: 16,
            cursor: 'pointer',
          },
        }}
        open={viewBill}
        onClose={() => setViewBill(false)}
      >
        <Mui.Stack
          direction="row"
          justifyContent="flex-end"
          p={1}
          onClick={() => handleDownloadClick()}
        >
          {/* <a href={file} target="_blank" rel="noreferrer" download> */}
          <img src={download} alt="download" />
          {/* </a> */}
        </Mui.Stack>
        <Mui.DialogContent style={{ position: 'relative' }}>
          <Mui.Grid className={css.iframeViewDocument}>
            {file.includes('.jpeg') ||
            file.includes('.png') ||
            file.includes('.pdf') === false ? (
              <img src={file} alt="upload" style={{ width: '100%' }} />
            ) : (
              Array.from({ length: pageNumber }, (_, i) => i + 1).map((i) => (
                <Document
                  file={file}
                  className={css.pdfStyle}
                  loading="  "
                  onLoadSuccess={onDocumentLoadSuccess}
                >
                  <Page pageNumber={i} className={css.page} />
                </Document>
              ))
            )}
          </Mui.Grid>
        </Mui.DialogContent>
      </Mui.Dialog>
      {havePermission.open && (
        <PermissionDialog onClose={() => havePermission.back()} />
      )}
    </div>
  );
};

export default DraftBills;
