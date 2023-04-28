import React, { useState, useContext, useEffect } from 'react';
import * as Router from 'react-router-dom';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet';
// import { MuiDatePicker } from '@components/DatePicker/DatePicker.jsx';
import Input from '@components/Input/Input.jsx';
import { OnlyDatePicker } from '@components/DatePicker/DatePicker.jsx';
import Checkbox from '@components/Checkbox/Checkbox.jsx';
import * as Mui from '@mui/material';
import SearchIcon from '@material-ui/icons/Search';
import { PermissionDialog } from '@components/Permissions/PermissionDialog.jsx';
import { FormattedAmount } from '@components/formattedValue/FormattedValue';

// import DownloadImg from '@assets/download.svg';
// import { SearchIcon2 } from '@assets/search.svg';
import { makeStyles, Chip } from '@material-ui/core';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import themes from '@root/theme.scss';
import AppContext from '@root/AppContext.jsx';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import moment from 'moment';
import {
  CheckedIcon,
  UncheckedIcon,
} from '@core/PaymentView/MultiplePayments/VendorBillSelection';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import Calender from '../InvoiceView/Calander';
import css from './BillsInQueue.scss';

const useStyles = makeStyles(() => ({
  chips: {
    marginRight: '5px',
    '& .MuiChip-root': {
      background: 'white',
      border: '1px solid #f0f0f0',
      flexDirection: 'row-reverse !important',
      cursor: 'pointer',
    },
    '& .MuiChip-icon': {
      marginRight: '5px',
      marginLeft: '-10px',
    },
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
    margin: '0 6px 0 0',
    background: '#fdf1e6',
    color: themes.colorPrimaryButton,
    borderColor: themes.colorPrimaryButton,
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

const downloadOptions = [
  { id: 1, name: 'Microsoft Excel' },
  { id: 2, name: 'PDF File' },
  { id: 3, name: 'CSV File' },
];

const initialState = {
  vendors: [],
  sort: '',
  date: '',
  order_by: '',
  order: '',
};

export const paymentStatusListWithBill = [
  { id: 'company_cash', label: 'Paid with Company Cash' },
  { id: 'paid_as_advance', label: 'Paid as Advance' },
  { id: 'to_pay', label: 'To Pay' },
  { id: 'company_card', label: 'Paid with Company Card' },
  { id: 'personal', label: 'Paid Personally' },
  { id: 'company_account', label: 'Paid with Company Account' },
];

const BillsInQueue = () => {
  const {
    organization,
    enableLoading,
    user,
    changeSubView,
    loading,
    userPermissions,
  } = useContext(AppContext);
  const classes = useStyles();

  const [state, setState] = useState(initialState);
  const [vendorQuery, setVendorQuery] = useState();
  const [yourBills, setYourBills] = useState([]);
  const [toDate, setToDate] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [draft, setDraft] = useState(false);
  const [selectedBill, setSelectedBill] = useState({});
  const [webValue, setWebValue] = useState({
    fromDate: null,
    toDate: null,
    order_by: '',
  });
  const deviceDetect = localStorage.getItem('device_detect');
  // const [query, setQuery] = React.useState();

  const [drawer, setDrawer] = useState({
    date: false,
    vendor: false,
    sort: false,
    download: false,
    yourBill: false,
    startDate: false,
    endDate: false,
  });

  const [search, setSearch] = React.useState('');
  const [filterBillsArray, setFilterBillsArray] = React.useState([]);
  const navigate = Router.useNavigate();

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

  React.useEffect(() => {
    const filterBills = search
      ? yourBills?.filter((val) =>
          val?.vendor?.name
            ?.trim()
            ?.toLowerCase()
            ?.includes(search.trim().toLowerCase()),
        )
      : yourBills;
    setFilterBillsArray(filterBills);
  }, [search, yourBills]);

  const handleStartDate = (val) => {
    if (deviceDetect === 'desktop') {
      setWebValue((prev) => ({ ...prev, fromDate: new Date(val) }));
    } else {
      setFromDate(new Date(val));
    }
    setDrawer((d) => ({ ...d, startDate: false }));
  };
  const handleEndDate = (val) => {
    if (deviceDetect === 'desktop') {
      setWebValue((prev) => ({ ...prev, toDate: new Date(val) }));
    } else {
      setToDate(new Date(val));
    }
    setDrawer((d) => ({ ...d, endDate: false }));
  };

  const onTriggerDrawer = (name) => {
    setDrawer((d) => ({ ...d, [name]: true }));
  };

  const openRecordAnExpense = (item) => {
    if (item.status === 'draft') {
      changeSubView('uploadYourBillView-haveBill', item);
    } else {
      onTriggerDrawer('yourBill');
      setSelectedBill(item);
    }
  };

  const handleBottomSheet = (name, data) => {
    setDrawer((d) => ({ ...d, [name]: false }));
    if (data) {
      setState((s) => ({ ...s, [name]: data }));
    }
  };

  const handleValueChange = (v, checked) => {
    const newVendors = state.vendors.map((item) => {
      if (item.id === v.id) {
        const updatedItem = {
          ...item,
          check: checked,
        };
        return updatedItem;
      }

      return { ...item };
    });
    handleBottomSheet('vendors', newVendors);
  };

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
          setState({ ...state, vendors: res.data });
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };
  const titles = [
    { name: 'Name' },
    { name: 'Bill Number' },
    { name: 'Status', align: 'center' },
    { name: 'Date' },
    { name: 'Payment Amount', align: 'right' },
  ];

  const getYourBills = () => {
    enableLoading(true);
    let filter = '';
    const vendorId =
      state &&
      state.vendors &&
      state.vendors.filter((f) => f.check).map((v) => v.id);

    if (vendorId && vendorId.length === 1) {
      filter += `vendor_id=${vendorId}`;
    } else if (vendorId && vendorId.length > 1) {
      vendorId.forEach((v) => {
        filter += `vendor_ids[]=${v}&`;
      });
    }

    if (toDate) {
      const toDataStr = moment(toDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
      filter +=
        filter === '' ? `end_date=${toDataStr}` : `&end_date=${toDataStr}`;
    }

    if (fromDate) {
      const fromDataStr = moment(fromDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
      filter +=
        filter === ''
          ? `start_date=${fromDataStr}`
          : `&start_date=${fromDataStr}`;
    }

    if (state?.order_by && state?.order) {
      filter +=
        filter === ''
          ? `order_by=${state?.order_by}&order=${state?.order}`
          : `&order_by=${state?.order_by}&order=${state?.order}`;
    }

    RestApi(
      `organizations/${organization.orgId}/vendor_bills?source_type=in_queue&${filter}`,
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
          res.data.map((a) => Object.assign(a));
          setYourBills(res.data);
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  useEffect(() => {
    getVendors();
  }, []);

  useEffect(() => {
    getYourBills();
  }, [state.vendors, toDate, fromDate, state?.order_by, state?.order]);

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

  const onSortChange = (v) => {
    handleBottomSheet('sort', v);
    setState((s) => ({
      ...s,
      order_by: v?.click?.order_by,
      order: v?.click?.order,
    }));
    // if (v.id === 4) {
    //   yourBills.sort((a, b) =>
    //     a.vendor_name.toLowerCase().localeCompare(b.vendor_name.toLowerCase()),
    //   );
    //   setYourBills(yourBills);
    // } else if (v.id === 2) {
    //   const newData = yourBills.sort((a, b) => {
    //     return (a.amount || 0) - (b.amount || 0);
    //   });
    //   setYourBills([...newData]);
    // } else if (v.id === 3) {
    //   const newData = yourBills.sort((a, b) => {
    //     return (b.amount || 0) - (a.amount || 0);
    //   });
    //   setYourBills([...newData]);
    // } else if (v.id === 1) {
    //   yourBills.sort((a, b) => {
    //     return new Date(b.date) - new Date(a.date);
    //   });
    //   setYourBills(yourBills);
    // }
  };
  const [anchorElCalendar, setAnchorElCalendar] = React.useState(null);

  // const [anchorElStartDate, setAnchorElStartDate] = React.useState(null);
  // const [anchorElEndDate, setAnchorElEndDate] = React.useState(null);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorElVendor, setAnchorElVendor] = React.useState(null);
  const handleClick = (event, component) => {
    if (component === 'calendar') {
      setAnchorElCalendar(event.currentTarget);
    }
    //  else if (component === 'startDate') {
    //   setAnchorElStartDate(event.currentTarget);
    // } else if (component === 'endDate') {
    //   setAnchorElEndDate(event.currentTarget);
    // }
    else {
      setAnchorEl(event.currentTarget);
    }
  };
  const open = Boolean(anchorEl);
  const openVendor = Boolean(anchorElVendor);
  const openCalendar = Boolean(anchorElCalendar);
  // const openCalendarStart = Boolean(anchorElStartDate);
  // const openCalendarEnd = Boolean(anchorElEndDate);

  return (
    <div className={css.container}>
      <div
        className={
          deviceDetect !== 'desktop'
            ? css.billsInQueueContainer
            : css.billsInQueueContainer2
        }
      >
        <div className={css.headerMainContainer}>
          <div className={css.headerContainer}>
            <div className={css.headerLabel}>Bills In Queue</div>
            <span className={css.headerUnderline} />
          </div>
          {/* <div className={css.headerContainer}>
            <div className={css.draftHeader} onClick={() => setDraft(true)}>
              Drafts
            </div>
          </div> */}
        </div>
        {deviceDetect !== 'desktop' ? (
          <div className={css.searchContainer}>
            <div
              className={classes.chips}
              onClick={() => onTriggerDrawer('date')}
            >
              <Chip
                label="Date"
                icon={<KeyboardArrowDown />}
                className={css.chipLabel}
              />
            </div>
            <div
              className={classes.chips}
              onClick={() => onTriggerDrawer('vendor')}
            >
              <Chip
                label="Vendor"
                icon={<KeyboardArrowDown />}
                className={css.chipLabel}
              />
            </div>
            <div
              className={classes.chips}
              onClick={() => onTriggerDrawer('sort')}
            >
              <Chip
                label="Sort"
                icon={<KeyboardArrowDown />}
                className={css.chipLabel}
              />
            </div>

            {/* <div
            onClick={() => onTriggerDrawer('download')}
            className={css.downloadImg}
          >
            <img src={DownloadImg} alt="Well Done" />
          </div> */}
          </div>
        ) : (
          <>
            <Mui.Grid className={css.transhead}>Transactions</Mui.Grid>
            <div className={css.searchContainer}>
              <Mui.Stack direction="row">
                <div
                  className={css.searchFilter}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0px 0px 40px rgba(48, 73, 191, 0.05)',
                    borderRadius: '16px',
                    backgroundColor: 'white',
                    height: '34px',
                    width: '69%',
                  }}
                >
                  <SearchIcon style={{ color: '#af9d9d' }} />{' '}
                  <input
                    placeholder="Search for"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={css.textFieldFocus}
                    style={{
                      border: 'none',
                      overflow: 'auto',
                      fontSize: '12px',
                    }}
                  />
                </div>
                <div
                  className={classes.chips}
                  onClick={(e) => handleClick(e, 'calendar')}
                >
                  <Chip
                    label="Date"
                    icon={<KeyboardArrowDown />}
                    className={css.chipLabel2}
                  />
                </div>
                <div
                  className={classes.chips}
                  onClick={(event) => setAnchorElVendor(event.currentTarget)}
                >
                  <Chip
                    label="Vendor"
                    icon={<KeyboardArrowDown />}
                    className={css.chipLabel2}
                  />
                </div>
              </Mui.Stack>
              {((state.vendors &&
                state.vendors.filter((a) => a.check === true).length > 0) ||
                state.sort ||
                (toDate && fromDate) ||
                draft) && (
                <div
                  className={
                    deviceDetect !== 'desktop'
                      ? css.selectedOptions
                      : css.selectedOptions2
                  }
                >
                  {state.sort && (
                    <Chip
                      className={classes.selectedchips}
                      label={state.sort.name}
                      variant="outlined"
                      onDelete={() => {
                        setState({
                          ...state,
                          sort: '',
                          order_by: '',
                          order: '',
                        });
                      }}
                    />
                  )}
                  {toDate && fromDate && (
                    <Chip
                      className={classes.selectedchips}
                      label={`${moment(fromDate, 'YYYY-MM-DD').format(
                        'MMM DD',
                      )}-${moment(toDate, 'YYYY-MM-DD').format(
                        'MMM DD, YYYY',
                      )}`}
                      variant="outlined"
                      onDelete={() => {
                        setToDate(null);
                        setFromDate(null);
                      }}
                    />
                  )}
                  {draft && (
                    <Chip
                      className={classes.selectedchips}
                      label="Draft"
                      variant="outlined"
                      onDelete={() => {
                        setDraft(false);
                      }}
                    />
                  )}
                  {state.vendors &&
                    state.vendors
                      .filter((a) => a.check === true)
                      .map((a) => {
                        return (
                          <Chip
                            className={classes.selectedchips}
                            label={a.name}
                            key={a.id}
                            variant="outlined"
                            onDelete={() => {
                              const newVendors = state.vendors.map((item) => {
                                if (item.id === a.id) {
                                  const updatedItem = {
                                    ...item,
                                    check: false,
                                  };
                                  return updatedItem;
                                }

                                return { ...item };
                              });

                              setState({ ...state, vendors: newVendors });
                            }}
                          />
                        );
                      })}
                </div>
              )}
              <div
                className={classes.chips}
                onClick={(e) => {
                  onTriggerDrawer('sort');
                  handleClick(e);
                }}
              >
                <Chip
                  label="SortBy   "
                  icon={<KeyboardArrowDown />}
                  className={css.chipLabel2}
                />
              </div>
            </div>
          </>
        )}
        {deviceDetect === 'mobile' &&
          ((state.vendors &&
            state.vendors.filter((a) => a.check === true).length > 0) ||
            state.sort ||
            (toDate && fromDate) ||
            draft) && (
            <div
              className={
                deviceDetect !== 'desktop'
                  ? css.selectedOptions
                  : css.selectedOptions2
              }
            >
              {state.sort && (
                <Chip
                  className={classes.selectedchips}
                  label={state.sort.name}
                  variant="outlined"
                  onDelete={() => {
                    setState({ ...state, sort: '' });
                  }}
                />
              )}
              {toDate && fromDate && (
                <Chip
                  className={classes.selectedchips}
                  label={`${moment(fromDate, 'YYYY-MM-DD').format(
                    'MMM DD',
                  )}-${moment(toDate, 'YYYY-MM-DD').format('MMM DD, YYYY')}`}
                  variant="outlined"
                  onDelete={() => {
                    setToDate(null);
                    setFromDate(null);
                  }}
                />
              )}
              {draft && (
                <Chip
                  className={classes.selectedchips}
                  label="Draft"
                  variant="outlined"
                  onDelete={() => {
                    setDraft(false);
                  }}
                />
              )}
              {state.vendors &&
                state.vendors
                  .filter((a) => a.check === true)
                  .map((a) => {
                    return (
                      <Chip
                        className={classes.selectedchips}
                        label={a.name}
                        key={a.id}
                        variant="outlined"
                        onDelete={() => {
                          const newVendors = state.vendors.map((item) => {
                            if (item.id === a.id) {
                              const updatedItem = {
                                ...item,
                                check: false,
                              };
                              return updatedItem;
                            }

                            return { ...item };
                          });

                          setState({ ...state, vendors: newVendors });
                        }}
                      />
                    );
                  })}
            </div>
          )}
      </div>
      <div className={css.billsInQueueInfoContainer}>
        {deviceDetect !== 'desktop' ? (
          <>
            {filterBillsArray.length > 0 &&
              filterBillsArray
                .filter((y) => (draft ? y.status === 'draft' : true))
                .map((item) => {
                  return (
                    <div
                      className={css.main}
                      onClick={() => {
                        // onTriggerDrawer('yourBill');
                        // setSelectedBill(item);
                        openRecordAnExpense(item);
                      }}
                    >
                      <div className={css.infoItem}>
                        <div className={css.infoTitle}>
                          {(item.vendor && item.vendor.name?.toLowerCase()) ||
                            '-'}
                        </div>
                        {item.status === 'draft' && (
                          <div className={css.draftLabel}>{item.status}</div>
                        )}
                      </div>
                      <div className={css.infoItem}>
                        <p className={css.key}>Bill Number</p>
                        <p className={css.value}>{item.document_number}</p>
                      </div>
                      <div className={css.infoItem}>
                        <p className={css.key}>Payment Amount</p>
                        <p className={css.value}>
                          {FormattedAmount(item?.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })}
          </>
        ) : (
          <>
            {filterBillsArray?.length > 0 && (
              <Mui.TableContainer
                sx={{
                  borderRadius: 5,
                  // minHeight: 600,
                  maxHeight: '59vh',
                }}
              >
                <Mui.Table
                  stickyHeader
                  size="medium"
                  style={{ background: '#ffff' }}
                >
                  <Mui.TableHead
                    sx={{
                      bgcolor: '#0000',
                      fontSize: '13px',
                      borderColor: (theme) => theme.palette.grey[100],
                    }}
                  >
                    {/* <Mui.TableCell>
                    <Mui.Typography
                      noWrap
                      variant="body2"
                      color="text.secondary"
                    >
                      {' '}
                    </Mui.Typography>
                  </Mui.TableCell> */}
                    {titles?.map((title) => (
                      <Mui.TableCell align={title?.align || 'left'}>
                        <Mui.Typography noWrap className={css.tableHead}>
                          {title?.name}
                        </Mui.Typography>
                      </Mui.TableCell>
                    ))}
                  </Mui.TableHead>

                  {filterBillsArray.length > 0 &&
                    filterBillsArray
                      .filter((y) => (draft ? y.status === 'draft' : true))
                      .map((item) => {
                        return (
                          <Mui.TableBody>
                            {/* {customerData?.map((value) => ( */}
                            <Mui.TableRow
                              sx={{
                                borderColor: (theme) => theme.palette.grey[100],
                              }}
                            >
                              <>
                                {/* <Mui.TableCell >
                            <Mui.Typography noWrap variant="body2">
                              <Mui.Avatar>
                                s
                              </Mui.Avatar>{' '}
                            </Mui.Typography>
                          </Mui.TableCell> */}
                                <Mui.TableCell className={css.tableCell}>
                                  <Mui.Typography
                                    noWrap
                                    variant="body2"
                                    className={css.tableFont}
                                  >
                                    {(item?.vendor &&
                                      item?.vendor?.name?.toLowerCase()) ||
                                      '-'}
                                  </Mui.Typography>
                                  {/* <Mui.TableCell> */}
                                  <Mui.Typography
                                    noWrap
                                    variant="body2"
                                    className={css.tableFontSm}
                                  >
                                    {(item?.payment_mode &&
                                      paymentStatusListWithBill?.find(
                                        (v) => v.id === item?.payment_mode,
                                      )?.label) ||
                                      item?.payment_mode ||
                                      '-'}
                                  </Mui.Typography>
                                  {/* </Mui.TableCell> */}
                                </Mui.TableCell>
                                {/* <Mui.TableCell>
                                <Mui.Typography noWrap variant="body2">
                                  {item.name}
                                </Mui.Typography>
                              </Mui.TableCell> */}
                                <Mui.TableCell className={css.tableCell}>
                                  <Mui.Typography
                                    noWrap
                                    variant="body2"
                                    className={css.tableBillNumber}
                                  >
                                    {item?.document_number}
                                  </Mui.Typography>
                                </Mui.TableCell>
                                <Mui.TableCell className={css.tableCell}>
                                  <Mui.Typography
                                    noWrap
                                    variant="body2"
                                    className={css.tableStatus}
                                  >
                                    {item?.status}
                                  </Mui.Typography>
                                </Mui.TableCell>

                                <Mui.TableCell className={css.tableCell}>
                                  <Mui.Typography
                                    noWrap
                                    variant="body2"
                                    className={css.tableDate}
                                  >
                                    {moment(item?.assign_date).format(
                                      'DD-MM-YYYY',
                                    )}
                                  </Mui.Typography>
                                </Mui.TableCell>
                                <Mui.TableCell className={css.tableCell}>
                                  <Mui.Typography
                                    noWrap
                                    variant="body2"
                                    className={css.tableAmount}
                                    align="right"
                                  >
                                    {FormattedAmount(item?.amount)}
                                  </Mui.Typography>
                                </Mui.TableCell>
                              </>
                            </Mui.TableRow>
                            {/* ))} */}
                          </Mui.TableBody>
                        );
                      })}
                </Mui.Table>
              </Mui.TableContainer>
            )}
            {!loading && filterBillsArray?.length === 0 && (
              <Mui.Typography align="center">No Data Found!!!</Mui.Typography>
            )}
            {loading && (
              <Mui.Typography align="center">
                Data is being fetched...
              </Mui.Typography>
            )}
          </>
        )}
      </div>
      {deviceDetect !== 'desktop' ? (
        <SelectBottomSheet
          triggerComponent
          open={drawer.date}
          name="date"
          onClose={handleBottomSheet}
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
                    fromDate === null
                      ? 'dd-mm-yy'
                      : moment(fromDate).format('DD-MM-YYYY')
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
                  style={{
                    pointerEvents: 'none',
                    width: '70%',
                    border: 'none',
                  }}
                  value={
                    toDate === null
                      ? 'dd-mm-yy'
                      : moment(toDate).format('DD-MM-YYYY')
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
      ) : (
        <Mui.Menu
          id="basic-menu-sort"
          anchorEl={anchorElCalendar}
          open={openCalendar}
          onClose={() => setAnchorElCalendar(null)}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
          PaperProps={{
            elevation: 3,
            style: {
              maxHeight: 260,
              width: '40ch',
              padding: '5px',
              borderRadius: 20,
            },
          }}
        >
          <div className={css.dateWrapper}>
            {/* <MuiDatePicker
            selectedDate={fromDate}
            label="Start Date"
            onChange={(m) => setFromDate(m.format('YYYY-MM-DD'))}
          /> */}
            <span>Select the start and end date to filter</span>
            <hr className={css.DividerFilter} />
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
            className={css.ApplyFilterButton}
            onClick={() => {
              setFromDate(webValue.fromDate);
              setToDate(webValue.toDate);
              setAnchorElCalendar(null);
            }}
          >
            Apply Filters
          </Mui.Button>
        </Mui.Menu>
      )}
      <SelectBottomSheet
        triggerComponent
        open={drawer.vendor && deviceDetect === 'mobile'}
        name="vendor"
        onClose={handleBottomSheet}
        id="overFlowHidden"
        addNewSheet
      >
        <div className={classes.searchInput}>
          <span>Select Vendor</span>
          <hr className={css.DividerFilter} />
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
                // <img
                //   src={SearchIcon2}
                //   alt="search"
                //   className={css.searchVendor}
                // />
              ),
            }}
            fullWidth
            onChange={onInputChange}
            theme="light"
          />
          <div style={{ overflow: 'auto', maxHeight: '49vh' }}>
            {state &&
              state.vendors &&
              state.vendors.map((item) => {
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
                          checked={item.check}
                          inputProps={{ id: item.name }}
                          value={false}
                          icon={<UncheckedIcon />}
                          checkedIcon={<CheckedIcon />}
                          onChange={(e) => {
                            handleValueChange(item, e.target.checked);
                          }}
                        />
                      }
                    />
                  </div>
                );
              })}
            {state?.vendors.length === 0 && (
              <Mui.Typography align="center">
                {loading ? 'Data is being fetched' : 'No Data!'}
              </Mui.Typography>
            )}
          </div>
        </div>
      </SelectBottomSheet>
      <Mui.Popover
        id="basic-menu-sort"
        anchorEl={anchorElVendor}
        open={openVendor}
        onClose={() => setAnchorElVendor(null)}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        PaperProps={{
          elevation: 3,
          style: {
            maxHeight: 600,
            width: '35ch',
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
          <span>Select Vendor</span>
          <hr className={css.DividerFilter} />
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
                // <img
                //   src={SearchIcon2}
                //   alt="search"
                //   className={css.searchVendor}
                // />
              ),
            }}
            value={vendorQuery}
            fullWidth
            onChange={onInputChange}
            theme="light"
          />
          <div style={{ overflow: 'auto', maxHeight: '22rem' }}>
            {state &&
              state.vendors &&
              state.vendors.map((item) => {
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
                          checked={item.check}
                          inputProps={{ id: item.name }}
                          value={false}
                          icon={<UncheckedIcon />}
                          checkedIcon={<CheckedIcon />}
                          onChange={(e) => {
                            handleValueChange(item, e.target.checked);
                          }}
                        />
                      }
                    />
                  </div>
                );
              })}
            {state?.vendors.length === 0 && (
              <Mui.Typography align="center">
                {loading ? 'Data is being fetched' : 'No Data!'}
              </Mui.Typography>
            )}
          </div>
        </div>
      </Mui.Popover>
      {deviceDetect !== 'desktop' ? (
        <SelectBottomSheet
          triggerComponent
          addNewSheet
          open={drawer.sort}
          name="sort"
          onClose={handleBottomSheet}
        >
          <div className={css.list}>
            <div style={{ padding: '15px' }}>
              <span>Sort</span>
              <hr className={css.DividerFilter} />
            </div>
            {sortOptions.map((v) => (
              <div
                className={css.categoryOptions}
                onClick={() => onSortChange(v)}
                key={v.id}
                role="menuitem"
              >
                {v.name}
              </div>
            ))}
          </div>
        </SelectBottomSheet>
      ) : (
        <Mui.Menu
          id="basic-menu-sort"
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
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
          <div className={css.effortlessOptions}>
            <div className={css.sortPopoverHeading}>
              <span>Sort by</span>
              <hr className={css.forline} />
            </div>
            <ul
              className={css.optionsWrapper}
              style={{ listStyleType: 'none' }}
            >
              {sortOptions.map((e) => (
                <li className={css.items} aria-hidden="true">
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
                setAnchorEl(null);
              }}
            >
              Apply Filters
            </Mui.Button>
          </div>
        </Mui.Menu>
      )}
      <SelectBottomSheet
        triggerComponent
        open={drawer.download}
        name="download"
        onClose={handleBottomSheet}
      >
        <div className={css.list}>
          {downloadOptions.map((v) => (
            <div
              className={css.categoryOptions}
              onClick={() => handleBottomSheet('download', v)}
              key={v.id}
              role="menuitem"
            >
              {v.name}
            </div>
          ))}
        </div>
      </SelectBottomSheet>
      <SelectBottomSheet
        triggerComponent
        open={drawer.yourBill}
        name="yourBill"
        onClose={handleBottomSheet}
      >
        <div className={css.mainContainer}>
          {selectedBill.document_number && (
            <div className={[css.headerContainer]}>
              <div className={css.headerLabel}>
                {selectedBill.document_number}
              </div>
              <span className={css.headerUnderline} />
            </div>
          )}
          <div className={css.parentDrawerContainer}>
            <p className={css.label}>Vendor</p>
            <p className={css.value}>
              {(selectedBill.vendor && selectedBill.vendor.name) || '-'}
            </p>
          </div>
          <div className={css.drawerContainer}>
            <p className={css.label}>Amount</p>
            <p className={css.value}>{FormattedAmount(selectedBill?.amount)}</p>
          </div>
          <div className={css.drawerContainer}>
            <p className={css.label}>Expense Category</p>
            <p className={css.value}>
              {(selectedBill.expense_category &&
                selectedBill.expense_category.name) ||
                ''}
            </p>
          </div>
          <div className={css.drawerContainer}>
            <p className={css.label}>Payment Mode</p>
            <p className={css.value}>
              {(selectedBill.payment_mode === 'to_pay' ? 'To Pay' : '') || ''}
            </p>
          </div>
          <div className={css.drawerContainer}>
            <p className={css.label}>Location</p>
            <p className={css.value}>{selectedBill.location || '-'}</p>
          </div>
          <div className={css.drawerContainer}>
            <p className={css.label}>Description</p>
            <p className={css.value}>{selectedBill.description || '-'}</p>
          </div>
        </div>
      </SelectBottomSheet>
      {havePermission.open && (
        <PermissionDialog onClose={() => havePermission.back()} />
      )}
    </div>
  );
};

export default BillsInQueue;
