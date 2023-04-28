/* @flow */
/**
 * @fileoverview  Create Edit Invoice Container
 */

import React, { useState, useEffect, useContext, useMemo } from 'react';
import moment from 'moment';
import { OnlyDatePicker } from '@components/DatePicker/DatePicker.jsx';
import * as Mui from '@mui/material';
import * as MuiIcons from '@mui/icons-material';
import { styled } from '@mui/material/styles';
// import MoreVertIcon from '@mui/icons-material/MoreVert';
import { makeStyles, Drawer, Chip } from '@material-ui/core';
import Checkbox from '@components/Checkbox/Checkbox.jsx';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import {
  DataGridPro,
  GridFilterPanel,
  GridColumnMenuContainer,
  SortGridMenuItems,
  // HideGridColMenuItem,
  // GridColumnsMenuItem,
  GridFilterMenuItem,
  // GridToolbar,
  // GridToolbarContainer,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarQuickFilter,
  // GridToolbarDensitySelector,
} from '@mui/x-data-grid-pro';
import downArrowBlack from '@assets/downArrowBlack.svg';
import Paper from '@mui/material/Paper';
// import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
// import Checkbox from '@components/Checkbox/Checkbox.jsx';
import Grid from '@material-ui/core/Grid';
// import DataGrid from '@components/DataGrid/CustomDataGrid';
// import { DeleteIcon } from '@components/SvgIcons/SvgIcons.jsx';
// import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { FormattedAmount } from '@components/formattedValue/FormattedValue';
import DialogContainer from '@components/DialogContainer/DialogContainer.jsx';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer.jsx';
import { PermissionDialog } from '@components/Permissions/PermissionDialog.jsx';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import themes from '@root/theme.scss';
// import { MuiDatePicker } from '@components/DatePicker/DatePicker.jsx';
// import { DataGrid } from '@mui/x-data-grid';
import AppContext from '@root/AppContext.jsx';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet.jsx';
import * as Router from 'react-router-dom';
import ReceivablesPopOver from '../Receivables/Components/ReceivablesPopover';
// import sortdraft from '../../assets/sortdraft.svg';
import Calender from './Calander';

import css from './CreateInvoiceContainer.scss';
// import { borderBottom, padding } from '@mui/system';

export function CustomColumnMenu(props) {
  const { hideMenu, currentColumn, color, ...other } = props;

  return (
    <GridColumnMenuContainer
      hideMenu={hideMenu}
      currentColumn={currentColumn}
      {...other}
    >
      <SortGridMenuItems onClick={hideMenu} column={currentColumn} />
      <GridFilterMenuItem onClick={hideMenu} column={currentColumn} />
      {/* <HideGridColMenuItem onClick={hideMenu} column={currentColumn} /> */}
      {/* <GridColumnsMenuItem onClick={hideMenu} column={currentColumn} /> */}
    </GridColumnMenuContainer>
  );
}

const StyledDrawer = styled(Drawer)(() => ({
  '& .MuiPaper-root': {
    minHeight: '25vh',
    maxHeight: '80vh',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
  },
}));

const useStyles = makeStyles(() => ({
  chips: {
    marginRight: '5px',
    '& .MuiChip-root': {
      background: 'white',
      border: '1px solid #f0f0f0',
      flexDirection: 'row-reverse !important',
    },
    '& .MuiChip-icon': {
      marginRight: '5px',
      marginLeft: '-10px',
    },
  },
  selectedchips: {
    minWidth: '190px',
    maxWidth: '45% !important',
    margin: '0 6px 0 0',
    background: '#fdf1e6',
    color: themes.colorPrimaryButton,
    border: `1px solid ${themes.colorPrimaryButton}`,
    borderRadius: '25px',
    marginBottom: '15px',
  },
  textStyle: {
    fontWeight: '400 !important',
    fontStyle: 'normal !important',
    fontSize: '15px !important',
    lineHeight: '19px !important',
    color: '#283049 !important',
  },
  formControl: {
    width: '100%',
  },
}));

const DraftInvoiceContainer = () => {
  const {
    organization,
    user,
    // changeSubView,
    setActiveInvoiceId,
    // enableLoading,
    openSnackBar,
    loading,
    userPermissions,
  } = useContext(AppContext);

  const device = localStorage.getItem('device_detect');
  const classes = useStyles();

  const [openSummary, setOpenSummary] = useState(false);
  const [activeItem, setActiveItem] = useState({});
  const [draftInvoice, setDraftInvoice] = useState([]);
  // const [draftInvoiceDesktop, setDraftInvoiceDesktop] = useState({});
  // const [Data, setData] = React.useState([]);
  // const [drawer, setDrawer] = React.useState(false);
  const [drawerSort, setDrawerSort] = React.useState(false);
  const [customerDrawer, setCustomerDrawer] = React.useState(false);
  const [value, setValue] = React.useState('');
  // eslint-disable-next-line no-unused-vars
  const [customerList, setCustomerList] = React.useState([]);
  const [customerID, setCustomerID] = React.useState([]);
  const [orderOfValue, setOrderOfValue] = React.useState(false);
  const [orderBy, setOrderBy] = React.useState('');
  const [sortValue, setSortValue] = React.useState('');
  const [toDate, setToDate] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [query, setQuery] = useState('');
  const [editSingle, setEditSingle] = useState('');
  const [bottomSheet, setBottomSheet] = useState({
    draftInvoiceDrawer: false,
    deletePopup: false,
  });
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [anchorElFor, setAnchorElFor] = React.useState({
    sort: null,
    date: null,
    customerList: null,
  });

  const [webValue, setWebValue] = React.useState({
    fromDate: null,
    toDate: null,
    customerID: [],
    orderBy: null,
  });

  const [drawer, setDrawer] = useState({
    startDate: false,
    endDate: false,
  });
  // const [columnHeader, setColumnHeader] = React.useState('');
  const [pagination, setPagination] = React.useState({
    currentPage: 1,
    totalPage: 1,
  });
  const [typeValue, setTypeValue] = React.useState('');

  const navigate = Router.useNavigate();

  const [userRoles, setUserRoles] = React.useState({});
  const [havePermission, setHavePermission] = React.useState({ open: false });

  React.useEffect(() => {
    if (Object.keys(userPermissions?.Invoicing || {})?.length > 0) {
      if (!userPermissions?.Invoicing?.Invoicing) {
        setHavePermission({
          open: true,
          back: () => {
            navigate('/dashboard');
            setHavePermission({ open: false });
          },
        });
      }
      setUserRoles({ ...userPermissions?.Invoicing });
    }
  }, [userPermissions]);

  const InvoiceType = [
    { value: 'tax_invoice', label: 'Tax Invoice' },
    { value: 'estimate', label: 'Estimate' },
    { value: 'credit_note', label: 'Credit Note' },
    { value: 'debit_note', label: 'Debit Note' },
  ];

  const onTriggerDrawerForCalander = (name) => {
    setDrawer((d) => ({ ...d, [name]: true }));
  };

  const handleStartDate = (val) => {
    setFromDate(val);
    setDrawer((d) => ({ ...d, startDate: false }));
    // setValue('');
    // setCustomerID(false);
    // setOrderBy('');
  };

  const handleEndDate = (val) => {
    setToDate(val);
    setDrawer((d) => ({ ...d, endDate: false }));
    // setValue('');
    // setCustomerID(false);
    // setOrderBy('');
  };

  const onTriggerDrawer = (drawerName) => {
    setBottomSheet((d) => ({ ...d, [drawerName]: true }));
  };

  const handleBottomSheet = (drawerName) => {
    setBottomSheet((d) => ({ ...d, [drawerName]: false }));
  };

  const custListCall = (searchVal) => {
    // enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/entities?type[]=customer&search=${
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
        // enableLoading(false);
        if (res && !res.error) {
          setCustomerList(res.data);
        } else {
          openSnackBar({
            message: res.message || 'Unknown error occured',
            type: MESSAGE_TYPE.ERROR,
          });
        }
      })
      .catch((res) => {
        // enableLoading(false);
        openSnackBar({
          message: res.message || 'Unknown error occured',
          type: MESSAGE_TYPE.ERROR,
        });
      });
  };

  React.useEffect(() => {
    custListCall();
  }, [organization.orgId, user.activeToken]);

  const onCloseSummary = () => {
    setOpenSummary(false);
  };

  const fetchDraftInvoice = (numPage) => {
    // enableLoading(true);
    let filter = '';
    if (customerID && customerID.length === 1) {
      filter += `customer_id=${customerID || ''}`;
    } else if (customerID && customerID.length > 1) {
      customerID.forEach((v) => {
        filter += `customer_ids[]=${v}&`;
      });
    }
    RestApi(
      // `organizations/${organization.orgId}/invoices/drafts`
      `organizations/${
        organization.orgId
      }/invoices/drafts?order=${value}&type=${typeValue}&order_by=${orderBy}&${
        filter || ''
      }&start_date=${
        fromDate ? moment(fromDate).format('YYYY-MM-DD') : ''
      }&end_date=${toDate ? moment(toDate).format('YYYY-MM-DD') : ''}&page=${
        numPage || 1
      }`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        if (res && !res.error) {
          if (res?.data) {
            // setData(res?.data);
            setPagination({ currentPage: res?.page, totalPage: res?.pages });
            if (numPage > 1) {
              setDraftInvoice((prev) => [...prev, ...res?.data]);
            } else {
              setDraftInvoice(res.data.map((c) => c));
            }
            // setDraftInvoiceDesktop(res.data.map((c) => c));
          } else if (res.message) {
            openSnackBar({
              message: res.message || 'Unknown error occured',
              type: MESSAGE_TYPE.ERROR,
            });
          }
        } else {
          openSnackBar({
            message: res.message || 'Unknown error occured',
            type: MESSAGE_TYPE.ERROR,
          });
        }
        // enableLoading(false);
      })
      .catch((res) => {
        openSnackBar({
          message: res.message || 'Unknown error occured',
          type: MESSAGE_TYPE.ERROR,
        });
      });
  };

  React.useEffect(() => {
    if (pagination.totalPage > 1) {
      if (pagination?.currentPage < pagination?.totalPage) {
        setTimeout(() => {
          fetchDraftInvoice(pagination?.currentPage + 1);
        }, 1000);
      }
    }
  }, [pagination.totalPage, pagination.currentPage]);
  // eslint-disable-next-line no-unused-vars
  const deleteInvoice = (id) => {
    RestApi(`organizations/${organization.orgId}/invoices/${id}`, {
      method: METHOD.DELETE,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    }).then((res) => {
      fetchDraftInvoice();
      if (res && !res.error) {
        openSnackBar({
          message: 'Invoice Deleted Successfully',
          type: MESSAGE_TYPE.INFO,
        });
        handleBottomSheet('deletePopup');
      } else if (res.error) {
        openSnackBar({
          message: res.error || res.message || 'Sorry, Something went wrong',
          type: MESSAGE_TYPE.ERROR,
        });
        handleBottomSheet('deletePopup');
      }
    });
  };

  const openInvoice = () => {
    // changeSubView('invoiceCreateViewBetaDraft');
    if (
      !userRoles?.Estimate?.edit_estimate &&
      activeItem?.document_type === 'estimate'
    ) {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
      return;
    }
    if (
      !userRoles?.['Tax Invoice']?.edit_invoices &&
      activeItem?.document_type === 'tax_invoice'
    ) {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
      return;
    }
    setActiveInvoiceId({
      activeInvoiceId: activeItem?.id,
    });
    navigate(`/invoice-draft-new`, { state: { type: 'draft' } });
  };

  const openInvoiceFromRow = (id, type) => {
    if (!userRoles?.Estimate?.edit_estimate && type === 'estimate') {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
      return;
    }
    if (!userRoles?.['Tax Invoice']?.edit_invoices && type === 'tax_invoice') {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
      return;
    }
    setActiveInvoiceId({
      activeInvoiceId: id,
    });
    // changeSubView('invoiceCreateViewBetaDraft');
    navigate(`/invoice-draft-new`, { state: { type: 'draft' } });
  };

  useEffect(() => {
    fetchDraftInvoice();
  }, [value, customerID, orderBy, fromDate, toDate, typeValue]);

  // useEffect(() => {
  //   if(activeItem){
  //     openInvoice();
  //   }
  // }, [activeItem]);

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: 'rgba(237, 237, 237, 0.15)',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    boxSizing: 'border-box',
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: 'None',
  }));
  const summaryContent = () => {
    return (
      <div className={css.summaryContainer}>
        <div className={css.summaryInfo}>
          <span className={css.label}>Date Created</span>
          <span className={css.value}>
            {moment(activeItem.created_at).format('Do MMMM, YYYY')}
          </span>
        </div>
        <div className={css.summaryInfo}>
          <span className={css.label}>Last Updated</span>
          <span className={css.value}>
            {moment(activeItem.updated_at).format('Do MMMM, YYYY')}
          </span>
        </div>
        <div className={css.summaryInfo}>
          <span className={css.label}>ALL FIELDS COMPLETED</span>
          <span className={css.value}>
            {activeItem.all_fields_completed ? 'Yes' : 'No'}
          </span>
        </div>
        <div className={css.summaryInfo}>
          <span className={css.label}>Approved ?</span>
          <span className={css.value}>
            {activeItem.approved ? 'Yes' : 'No'}
          </span>
        </div>
        <div className={css.summaryInfo}>
          <span className={css.label}>Delivered?</span>
          <span className={css.value}>
            {activeItem.delivered ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    );
  };
  // const FilterCustomer =
  //   customerList &&
  //   customerList?.filter((post) => {
  //     (query === "" ) ?
  //       customerList
  //     :
  //     (post?.name?.toLowerCase()?.includes(query?.toLowerCase())) ?
  //       post
  //     });

  // const filteredUsers = query
  //   ? customerList.filter((val) => {
  //       return val?.name?.toLowerCase().includes(query?.toLowerCase());
  //     })
  //   : customerList;

  const onDateChangeFrom = (e) => {
    setWebValue((prev) => ({
      ...prev,
      fromDate: e.format('DD MMM yyyy'),
      toDate: webValue.toDate,
      // customerID: null,
      // orderBy: null,
    }));
  };

  const onDateChangeto = (e) => {
    setWebValue((prev) => ({
      ...prev,
      fromDate: webValue.fromDate,
      toDate: e.format('DD MMM yyyy'),
      // customerID: null,
      // orderBy: null,
    }));
  };

  useEffect(() => {
    if (device === 'desktop' && webValue.fromDate && webValue.toDate) {
      if (
        new Date(webValue.fromDate).setHours(0, 0, 0, 0) >
        new Date(webValue.toDate).setHours(0, 0, 0, 0)
      ) {
        setWebValue((prev) => ({
          ...prev,
          toDate: webValue.toDate,
          fromDate: null,
        }));
      }
    } else if (device === 'mobile' && fromDate && toDate) {
      if (
        new Date(fromDate).setHours(0, 0, 0, 0) >
        new Date(toDate).setHours(0, 0, 0, 0)
      ) {
        setFromDate(null);
      }
    }
  }, [fromDate, webValue.fromDate]);

  useEffect(() => {
    if (device === 'desktop' && webValue.fromDate && webValue.toDate) {
      if (
        new Date(webValue.toDate).setHours(0, 0, 0, 0) <
        new Date(webValue.fromDate).setHours(0, 0, 0, 0)
      ) {
        setWebValue((prev) => ({
          ...prev,
          fromDate: webValue.fromDate,
          toDate: null,
        }));
      }
    } else if (device === 'mobile' && fromDate && toDate) {
      if (
        new Date(toDate).setHours(0, 0, 0, 0) <
        new Date(fromDate).setHours(0, 0, 0, 0)
      ) {
        setToDate(null);
      }
    }
  }, [toDate, webValue.toDate]);

  const handleRowSelection = (val) => {
    setActiveItem(val);
    openInvoiceFromRow(val.id, val?.document_type);
  };
  const WebDelete = () => {
    if (
      !userRoles?.Estimate?.delete_estimate &&
      activeItem?.document_type === 'estimate'
    ) {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
      return;
    }
    if (
      !userRoles?.['Tax Invoice']?.delete_invoices &&
      activeItem?.document_type === 'tax_invoice'
    ) {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
      return;
    }
    onTriggerDrawer('deletePopup');
    setAnchorEl(null);
  };

  const MobileDelete = () => {
    if (
      !userRoles?.Estimate?.delete_estimate &&
      activeItem?.document_type === 'estimate'
    ) {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
      return;
    }
    if (
      !userRoles?.['Tax Invoice']?.delete_invoices &&
      activeItem?.document_type === 'tax_invoice'
    ) {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
      return;
    }
    onTriggerDrawer('deletePopup');
    handleBottomSheet('draftInvoiceDrawer');
  };
  // const head = [
  //   {
  //     id: 1,
  //     title: (
  //       <Mui.Typography className={css.headingStackText}>
  //         NAME OF THE CUSTOMER
  //       </Mui.Typography>
  //     ),
  //     type: 'string',
  //     hideSort: false,
  //     value: 'customer_name',
  //     style: () => ({
  //       // padding: '0 10px',
  //       borderBottom: '1px solid rgb(224, 224, 224)',
  //       minHeight: '52px',
  //       maxHeight: '52px',
  //     }),
  //     // cellClick: (val) => teamView(val),
  //     cellClick: (row) => {
  //       setEditSingle(row);
  //       handleRowSelection(row);
  //     },
  //     displayVal: (cellValues) => {
  //       return (
  //         <div
  //           className={css.cosDiv}
  //           onClick={() => handleRowSelection(editSingle)}
  //         >
  //           <Mui.Avatar
  //             className={css.avatar}
  //             src={`https://avatars.dicebear.com/api/initials/${cellValues}.svg?chars=1`}
  //           />{' '}
  //           <Mui.Typography className={css.cosName}>
  //             {cellValues?.toLowerCase()}
  //           </Mui.Typography>
  //         </div>
  //       );
  //     },
  //   },

  //   {
  //     id: 2,
  //     title: (
  //       <Mui.Typography className={css.headingStackText}>
  //         NAME OF THE INVOICE
  //       </Mui.Typography>
  //     ),
  //     type: 'string',
  //     hideSort: true,
  //     value: 'document_type',
  //     style: () => ({
  //       // padding: '0 10px',
  //       borderBottom: '1px solid rgb(224, 224, 224)',
  //       minHeight: '52px',
  //       maxHeight: '52px',
  //     }),
  //     cellClick: (row) => {
  //       setEditSingle(row);
  //       handleRowSelection(row);
  //     },
  //     displayVal: (cellValues) => {
  //       return (
  //         <Mui.Typography
  //           className={css.content}
  //           onClick={() => handleRowSelection(editSingle)}
  //         >
  //           {cellValues}
  //         </Mui.Typography>
  //       );
  //     },
  //   },
  //   {
  //     id: 3,
  //     title: (
  //       <Mui.Typography className={css.headingStackText}>
  //         CREATED DATE
  //       </Mui.Typography>
  //     ),
  //     type: 'string',
  //     hideSort: false,
  //     value: 'created_at',
  //     style: () => ({
  //       // padding: '0 10px',
  //       borderBottom: '1px solid rgb(224, 224, 224)',
  //       minHeight: '52px',
  //       maxHeight: '52px',
  //     }),
  //     cellClick: (row) => {
  //       setEditSingle(row);
  //       handleRowSelection(row);
  //     },
  //     displayVal: (cellValues) => {
  //       return (
  //         <Mui.Typography
  //           className={css.content}
  //           onClick={() => handleRowSelection(editSingle)}
  //         >
  //           {moment(cellValues).format('DD-MM-yyyy')}
  //         </Mui.Typography>
  //       );
  //     },
  //   },
  //   {
  //     id: 4,
  //     align: 'right',
  //     title: (
  //       <Mui.Typography className={css.headingStackText}>
  //         BILL AMOUNT
  //       </Mui.Typography>
  //     ),
  //     type: 'string',
  //     hideSort: false,
  //     // hideSortLeft: false,
  //     value: 'invoice_value',
  //     style: () => ({
  //       // padding: '0 10px',
  //       borderBottom: '1px solid rgb(224, 224, 224)',
  //       minHeight: '52px',
  //       maxHeight: '52px',
  //     }),
  //     cellClick: (row) => {
  //       setEditSingle(row);
  //       handleRowSelection(row);
  //     },
  //     displayVal: (cellValues) => {
  //       return (
  //         <div
  //           className={css.cosDivmoneyIR2}
  //           onClick={() => handleRowSelection(editSingle)}
  //         >
  //           <CurrencyRupeeIcon className={css.money} />

  //           <Mui.Typography className={css.cosName} textAlign="right">
  //             {Number(cellValues) 'en-IN')}
  //           </Mui.Typography>
  //         </div>
  //       );
  //     },
  //   },
  //   {
  //     id: 5,
  //     title: '',
  //     style: () => ({
  //       borderBottom: '1px solid rgb(224, 224, 224)',
  //       minHeight: '52px',
  //       maxHeight: '52px',
  //     }),
  //     cellClick: (row) => {
  //       setEditSingle(row);
  //       // handleRowSelection(row);
  //     },
  //     icon: (
  //       <>
  //         <Mui.IconButton
  //           className={css.dots}
  //           onClick={(event) => {
  //             setActiveItem(editSingle);
  //             setAnchorEl(event.currentTarget);
  //             // onTriggerDrawer('draftInvoiceDrawer');
  //           }}
  //         >
  //           <MuiIcons.MoreVert sx={{ width: '15px' }} />
  //         </Mui.IconButton>
  //       </>
  //     ),
  //     type: 'icon',
  //     hideSort: true,
  //   },
  // ];
  const draftColumn = [
    {
      field: 'invoice_number',
      headerName: 'Invoice Number',
      flex: 1,
      renderCell: (params) => {
        return (
          <div
            onClick={() => {
              setEditSingle(params.row);
              handleRowSelection(params.row);
            }}
          >
            <p style={{ whiteSpace: 'break-spaces' }}>
              {params.row?.invoice_number}
            </p>
          </div>
        );
      },
      maxWidth: 150,
      width: 130,
      // sortable: false,
    },
    {
      field: 'customer_name',
      headerName: 'Customer',
      filterable: false,
      flex: 1,
      // hideFilterPanel: () => {return null;},
      renderCell: (params) => {
        return (
          <div
            onClick={() => {
              setEditSingle(params.row);
              handleRowSelection(params.row);
            }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Mui.Avatar
              className={css.avatar}
              src={`https://avatars.dicebear.com/api/initials/${params.row?.customer_name}.svg?chars=1`}
            />{' '}
            <p style={{ whiteSpace: 'break-spaces' }}>
              {params.row?.customer_name}
            </p>
          </div>
        );
      },
      // maxWidth: 360,
      minWidth: 250,
      // width: 350,
    },
    {
      field: 'document_type',
      headerName: 'Invoice Type',
      flex: 1,
      valueFormatter: (params) =>
        InvoiceType.filter((c) => c.value === params?.value)[0]?.label,
      renderCell: (params) => {
        return (
          <div
            onClick={() => {
              setEditSingle(params.row);
              handleRowSelection(params.row);
            }}
          >
            <p
              style={{
                whiteSpace: 'break-spaces',
                textTransform: 'capitalize',
              }}
            >
              {InvoiceType.filter((c) => c.value === params?.value)[0]?.label ||
                ' '}
              {/* {params.row?.document_type} */}
            </p>
          </div>
        );
      },
      maxWidth: 130,
      width: 120,
      sortable: true,
    },
    {
      field: 'invoice_value',
      headerName: 'Invoice Value',
      headerClassName: 'left-align--header',
      type: 'number',
      flex: 1,
      renderCell: (params) => {
        return (
          <div
            onClick={() => {
              setEditSingle(params.row);
              handleRowSelection(params.row);
            }}
          >
            <p style={{ whiteSpace: 'nowrap' }}>
              {FormattedAmount(params.row?.invoice_value)}
            </p>
          </div>
        );
      },
      maxWidth: 180,
      width: 150,
      align: 'right',
    },
    {
      field: 'created_at',
      headerName: 'Created On',
      type: 'date',
      flex: 1,
      valueFormatter: (params) =>
        moment(params.row?.created_at).format('DD-MM-yyyy'),
      renderCell: (params) => {
        return (
          <div
            onClick={() => {
              setEditSingle(params.row);
              handleRowSelection(params.row);
            }}
          >
            <p style={{ whiteSpace: 'break-spaces' }}>
              {moment(params.row?.created_at).format('DD-MM-yyyy')}
            </p>
          </div>
        );
      },
      maxWidth: 150,
      width: 120,
    },
    {
      field: 'id',
      headerName: '',
      flex: 1,
      renderCell: (params) => {
        return (
          <>
            <Mui.IconButton
              className={css.dots}
              onClick={(event) => {
                setEditSingle(params.row);
                setActiveItem(editSingle);
                setAnchorEl(event.currentTarget);
                // onTriggerDrawer('draftInvoiceDrawer');
              }}
            >
              <MuiIcons.MoreVert sx={{ width: '15px' }} />
            </Mui.IconButton>
          </>
        );
      },
      maxWidth: 50,
      sortable: false,
      align: 'right',
      disableExport: true,
    },
  ];

  // eslint-disable-next-line no-unused-vars
  const CustomerListDraft = (props) => {
    const {
      headCol,
      // customerListPro,
      setFilterCustListTempPro,
      setWebValuePro,
      // custListCallPro,
      // searchValueFilter,
      // setSearchValueFilter,
    } = props;
    const [filterCustListPro, setFilterCustListPro] = React.useState([]);
    const [proQuery, setProQuery] = React.useState('');
    const [customerListPro] = React.useState([]);

    const handleCustList = (ids) => {
      if (
        filterCustListPro?.length === 0 ||
        !filterCustListPro?.includes(ids)
      ) {
        setFilterCustListPro((prev) => [...prev, ids]);
      } else if (filterCustListPro?.includes(ids)) {
        const temp = filterCustListPro?.filter((item) => item !== ids);
        setFilterCustListPro(temp);
      }
    };

    // const custListCallPro = (searchVal) => {
    //   // enableLoading(true);
    //   RestApi(
    //     `organizations/${organization.orgId}/entities?type[]=customer&search=${
    //       searchVal || ''
    //     }`,
    //     {
    //       method: METHOD.GET,
    //       headers: {
    //         Authorization: `Bearer ${user.activeToken}`,
    //       },
    //     },
    //   )
    //     .then((res) => {
    //       // enableLoading(false);
    //       if (res && !res.error) {
    //         setCustomerListPro(res.data);
    //       } else {
    //         openSnackBar({
    //           message: res.message || 'Unknown error occured',
    //           type: MESSAGE_TYPE.ERROR,
    //         });
    //       }
    //     })
    //     .catch((res) => {
    //       // enableLoading(false);
    //       openSnackBar({
    //         message: res.message || 'Unknown error occured',
    //         type: MESSAGE_TYPE.ERROR,
    //       });
    //     });
    // };

    // React.useEffect(() => {
    //   if (headCol === 'customer_name') {
    //     custListCallPro();
    //   }
    // }, [headCol]);

    return (
      <>
        {headCol === 'customer_name' && (
          <div>
            <div className={css.searchFilterPro}>
              <SearchIcon style={{ color: '#af9d9d' }} />{' '}
              <input
                placeholder="Search for Customer"
                onChange={(event) => {
                  event.persist();
                  if (event?.target?.value?.length > 2) {
                    custListCall(event.target.value);
                  }
                  if (event?.target?.value?.length === 0) {
                    custListCall();
                  }
                  setProQuery(event.target.value);
                }}
                value={proQuery}
                className={css.textFieldFocus}
              />
            </div>
            <div className={css.datagridProFilter}>
              {customerListPro?.length > 0 &&
                customerListPro?.map((val) => (
                  <Mui.FormControlLabel
                    label={val?.name}
                    control={
                      <Mui.Checkbox
                        checked={
                          filterCustListPro?.length === 0
                            ? false
                            : filterCustListPro?.includes(val?.id)
                        }
                        value={val?.id}
                        onChange={(e) => {
                          handleCustList(e?.target?.value);
                        }}
                        style={{ color: '#f08b32' }}
                      />
                    }
                    // onClick=(())
                  />
                ))}
              {customerListPro?.length === 0 && (
                <Mui.Typography align="center">
                  {loading ? 'Data is being fetched' : 'No Data Found'}
                </Mui.Typography>
              )}
            </div>
            <div className={css.buttonProDiv}>
              <Mui.Button
                className={css.submitButtonPro}
                onClick={() => {
                  setTypeValue('');
                  setWebValuePro((prev) => ({
                    ...prev,
                    customerID: filterCustListPro,
                  }));
                  setFilterCustListTempPro(filterCustListPro);
                }}
              >
                Apply Filters
              </Mui.Button>
            </div>
          </div>
        )}
        {headCol === 'document_type' && (
          <div className={css.datagridProFilter}>
            <p className={css.heading}>Invoice Type</p>
            {InvoiceType.map((c) => {
              return (
                <>
                  <Mui.Typography
                    className={css.text}
                    onClick={() => {
                      setWebValuePro((prev) => ({
                        ...prev,
                        customerID: [],
                      }));
                      setFilterCustListTempPro([]);
                      setTypeValue(c?.value);
                    }}
                  >
                    {c?.label}
                  </Mui.Typography>
                  <Mui.Divider />
                </>
              );
            })}
          </div>
        )}
        {(headCol === 'invoice_number' ||
          headCol === 'invoice_value' ||
          headCol === 'created_at') && <GridFilterPanel />}
      </>
    );
  };

  useMemo(() => {
    if (editSingle) {
      setActiveItem(editSingle);
    }
  }, [editSingle]);

  const INVOICE_TYPES = [
    {
      text: 'Tax Invoice',
      payload: 'tax_invoice',
      color: '#A5D399',
    },
    {
      text: 'Estimate',
      payload: 'estimate',
      color: '#99BFD3',
    },
    {
      text: 'Credit Note',
      payload: 'credit_note',
      color: '#A5D399',
    },
    {
      text: 'Debit Note',
      payload: 'debit_note',
      color: '#A5D399',
    },
  ];

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        {/* <GridToolbarDensitySelector /> */}
        <GridToolbarExport />
        <GridToolbarQuickFilter sx={{ marginLeft: 'auto' }} />
      </GridToolbarContainer>
    );
  }

  return (
    <div className={css.draftInvoiceContainer}>
      <Mui.Grid
        container
        className={device === 'mobile' ? css.container : css.containerDesktop}
        sx={{
          // desktop to hide
          padding: device === 'desktop' && '0',
        }}
      >
        <Mui.Grid item xs={12} lg={12} md={12}>
          <Mui.Box sx={{ width: '100%', height: '100%' }}>
            <Mui.Stack spacing={1} style={{ height: '100%' }}>
              {device === 'mobile' && (
                <Mui.Stack
                  direction="row"
                  justifyContent="space-between"
                  className={css.stack1}
                >
                  <Mui.Stack direction="column" className={css.stack2}>
                    <Mui.Grid className={css.heading}>Draft Invoices</Mui.Grid>
                    <Mui.Divider
                      className={css.divider}
                      variant="fullWidth"
                    />{' '}
                  </Mui.Stack>
                </Mui.Stack>
              )}
              <Mui.Stack
                direction="row"
                style={{
                  justifyContent: 'space-between',
                  // desktop to hide
                  display: device === 'desktop' && 'none',
                }}
              >
                <div
                  className={css.mainButton}
                  style={{
                    justifyContent:
                      device === 'mobile' ? 'flex-start' : 'space-between',
                    padding:
                      device === 'mobile'
                        ? '5px 0px 5px 0px'
                        : '5px 40px 5px 20px',
                  }}
                >
                  <Mui.Stack direction="row" spacing={2}>
                    <SelectBottomSheet
                      open={orderOfValue}
                      onClose={() => setOrderOfValue(false)}
                      addNewSheet
                      triggerComponent={
                        <>
                          <div
                            className={
                              device === 'mobile'
                                ? css.monthSelection
                                : css.dropdnDesktop
                            }
                            style={{
                              display: 'flex',
                              justifyContent: 'space-around',
                              alignItems: 'center',
                            }}
                            onClick={(event) => {
                              if (device === 'mobile') {
                                setOrderOfValue(true);
                              } else {
                                setAnchorElFor({
                                  sort: null,
                                  date: event.currentTarget,
                                  customerList: null,
                                });
                              }
                            }}
                          >
                            <div className={css.text}>Date</div>
                            <img
                              src={downArrowBlack}
                              alt="arrow"
                              className={css.icon}
                            />
                          </div>

                          <Mui.Popover
                            id="basic-menu-list"
                            anchorEl={anchorElFor.date}
                            open={Boolean(anchorElFor.date)}
                            onClose={() =>
                              setAnchorElFor({ ...anchorElFor, date: null })
                            }
                            MenuListProps={{
                              'aria-labelledby': 'basic-button',
                            }}
                            PaperProps={{
                              elevation: 3,
                              style: {
                                maxHeight: 500,
                                width: '35ch',
                                padding: '5px',
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
                            <div className={css.titleDateFilter}>
                              <span>
                                Select the start and end date to filter
                              </span>

                              <div className={css.DatesContainer}>
                                <div className={css.dateSelection}>
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
                                        webValue.fromDate === null
                                          ? 'dd-mm-yy'
                                          : webValue.fromDate
                                      }
                                      style={{
                                        width: '100%',
                                        border: 'none',
                                        padding: 5,
                                      }}
                                      // onChange={(e) => {
                                      // setWebValue({
                                      //   fromDate: e.target.value,
                                      //   toDate: webValue.toDate,
                                      //   customerID: null,
                                      //   orderBy: null,
                                      // });
                                      // }}
                                    />
                                    <OnlyDatePicker
                                      // className={css.avatarForDate}
                                      selectedDate={webValue.fromDate}
                                      // label={new Date(invoiceDate).toLocaleDateString()}
                                      onChange={onDateChangeFrom}
                                    />

                                    {/* <CalendarIcon
                                   style={{ width: 20, color: '#949494' }}
                                   // onClick={() => {
                                   //   onTriggerDrawerForCalander('startDate');
                                   // }}
                                 /> */}
                                  </div>
                                </div>

                                <div className={css.dateSelection}>
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
                                        width: '100%',
                                        border: 'none',
                                        padding: 5,
                                      }}
                                      // onChange={(e) => {
                                      //   setWebValue({
                                      //     fromDate: webValue.fromDate,
                                      //     toDate: e.target.value,
                                      //     customerID: null,
                                      //     orderBy: null,
                                      //   });
                                      // }}
                                      value={
                                        webValue.toDate === null
                                          ? 'dd-mm-yy'
                                          : webValue.toDate
                                      }
                                    />
                                    <OnlyDatePicker
                                      // className={css.avatarForDate}
                                      selectedDate={webValue.toDate}
                                      // label={new Date(invoiceDate).toLocaleDateString()}
                                      onChange={onDateChangeto}
                                    />
                                    {/* <CalendarIcon
                                   style={{ width: 20, color: '#949494' }}
                                   onClick={() => {
                                     onTriggerDrawerForCalander('endDate');
                                   }}
                                 /> */}
                                  </div>
                                </div>
                              </div>
                              <Mui.Button
                                contained
                                className={css.ApplyFilterButton}
                                onClick={() => {
                                  // setCustomerID(false);
                                  setFromDate(webValue.fromDate);
                                  setToDate(webValue.toDate);
                                  // setOrderBy('');
                                  // setValue('');
                                  setAnchorElFor({
                                    ...anchorElFor,
                                    date: null,
                                  });
                                }}
                              >
                                Apply Filters
                              </Mui.Button>
                            </div>
                          </Mui.Popover>
                        </>
                      }
                    >
                      <div className={css.effortlessOptions}>
                        <span className={css.title}>Order By</span>
                        {/* <ul className={css.optionsWrapper}> */}
                        {/* <div className={css.dateWrapper}>
             <MuiDatePicker
               selectedDate={fromDate}
               label="Start Date"
               onChange={(m) => {
                 setFromDate(m.format('YYYY-MM-DD'));
                 if (fromDate) {
                   setTimeout(() => {
                     setOrderOfValue(false);
                   }, 2000);
                 }
                 setValue('');
                 setCustomerID([]);
                 setOrderBy('');
               }}
             />
           </div>
           <div className={css.dateWrapper}>
             <MuiDatePicker
               selectedDate={toDate}
               label="End Date"
               onChange={(m) => {
                 setToDate(m.format('YYYY-MM-DD'));
                 if (fromDate) {
                   setTimeout(() => {
                     setOrderOfValue(false);
                   }, 2000);
                 }
                 setValue('');
                 setCustomerID([]);
                 setOrderBy('');
               }}
             />
           </div> */}
                        {/* </ul> */}

                        <div className={css.DatesContainerMobile}>
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
                                      onTriggerDrawerForCalander('startDate');
                                    }}
                                  />
                                }
                                open={drawer.startDate}
                                // value={taxValue}

                                onTrigger={onTriggerDrawerForCalander}
                                onClose={() => {
                                  setDrawer((d) => ({
                                    ...d,
                                    startDate: false,
                                  }));
                                }}
                                // maxHeight="45vh"
                              >
                                <Calender
                                  head="Select Start Date"
                                  button="Select"
                                  handleDate={handleStartDate}
                                />
                              </SelectBottomSheet>
                            </div>
                          </div>
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
                                      onTriggerDrawerForCalander('endDate');
                                    }}
                                  />
                                }
                                open={drawer.endDate}
                                // value={taxValue}
                                onTrigger={onTriggerDrawerForCalander}
                                onClose={() => {
                                  setDrawer((d) => ({ ...d, endDate: false }));
                                }}
                                // maxHeight="45vh"
                              >
                                <Calender
                                  head="Select End Date"
                                  button="Select"
                                  handleDate={handleEndDate}
                                />
                              </SelectBottomSheet>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SelectBottomSheet>

                    <SelectBottomSheet
                      id="overFlowHidden"
                      open={customerDrawer}
                      onClose={() => {
                        setCustomerDrawer(false);
                        // setQuery('');
                      }}
                      addNewSheet
                      triggerComponent={
                        <>
                          <div
                            className={
                              device === 'mobile'
                                ? css.monthSelection
                                : css.dropdnDesktop
                            }
                            style={{
                              display: 'flex',
                              justifyContent: 'space-around',
                              alignItems: 'center',
                              width: 110,
                            }}
                            onClick={(event) => {
                              if (device === 'mobile') {
                                setCustomerDrawer(true);
                              } else {
                                setAnchorElFor({
                                  sort: null,
                                  date: null,
                                  customerList: event.currentTarget,
                                });
                              }
                            }}
                            // style={{ width: 110 }}
                          >
                            <div className={css.text}>Customer</div>
                            <img
                              src={downArrowBlack}
                              alt="arrow"
                              className={css.icon}
                            />
                          </div>
                          <Mui.Popover
                            id="basic-menu-list"
                            anchorEl={anchorElFor.customerList}
                            open={Boolean(anchorElFor.customerList)}
                            onClose={() => {
                              setAnchorElFor({
                                ...anchorElFor,
                                customerList: null,
                              });
                              // setQuery('');
                            }}
                            MenuListProps={{
                              'aria-labelledby': 'basic-button',
                            }}
                            PaperProps={{
                              elevation: 3,
                              style: {
                                maxHeight: 500,
                                width: '35ch',
                                padding: '5px',
                                overflow: 'hidden',
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
                            <div className={css.titleDateFilter}>
                              <span>Select Customer</span>
                              <hr className={css.DividerFilter} />

                              <div
                                className={
                                  device === 'mobile'
                                    ? css.searchFilterFull
                                    : css.searchFilterFullWeb
                                }
                                onClick={(event) =>
                                  setQuery(event.target.value)
                                }
                              >
                                <SearchIcon className={css.searchFilterIcon} />
                                <input
                                  placeholder="Search for Customer"
                                  onChange={(event) => {
                                    setQuery(event.target.value);
                                    if (event?.target?.value?.length > 2) {
                                      custListCall(event.target.value);
                                    }
                                    if (event?.target?.value?.length === 0) {
                                      custListCall();
                                    }
                                  }}
                                  value={query}
                                  className={css.searchFilterInput}
                                />
                              </div>

                              <ul
                                className={css.optionsWrapper}
                                style={{ maxHeight: '18rem', overflow: 'auto' }}
                              >
                                {/* <Mui.FormControl
                                  classes={{ root: classes.formControl }}
                                >
                                  <RadioGroup
                                    // value={customerList.filter((data) => data.id === e.id )}
                                    value={webValue.customerID}
                                    onChange={(e) => {
                                      setWebValue((prev) => ({
                                        ...prev,
                                        // fromDate: null,
                                        // toDate: null,
                                        customerID: e.target.value,
                                        // orderBy: null,
                                      }));
                                    }}
                                    name="radio-buttons-group"
                                  > */}
                                {customerList?.length > 0 &&
                                  customerList?.map((e) => (
                                    <li
                                      className={css.items}
                                      aria-hidden="true"
                                    >
                                      <FormControlLabel
                                        value={e?.id}
                                        style={{
                                          textTransform: 'capitalize',
                                        }}
                                        control={
                                          <Checkbox
                                            style={{
                                              color: '#F08B32',
                                              textTransform: 'capitalize',
                                            }}
                                            checked={webValue?.customerID?.includes(
                                              e?.id,
                                            )}
                                            onChange={(event) => {
                                              event?.persist();
                                              setWebValue((prev) => ({
                                                ...prev,
                                                customerID:
                                                  (webValue?.customerID?.includes(
                                                    event?.target?.value,
                                                  ) &&
                                                    webValue?.customerID?.filter(
                                                      (item) =>
                                                        item !==
                                                        event?.target?.value,
                                                    )) || [
                                                    ...webValue?.customerID,
                                                    event?.target?.value,
                                                  ],
                                              }));
                                            }}
                                          />
                                        }
                                        label={e?.short_name?.toLowerCase()}
                                      />
                                    </li>
                                  ))}
                                {customerList?.length === 0 && (
                                  <Mui.Typography align="center">
                                    {loading
                                      ? 'Data is being fetched'
                                      : 'No Data Found'}
                                  </Mui.Typography>
                                )}
                                {/* </RadioGroup>
                                </Mui.FormControl> */}
                              </ul>
                              <Mui.Button
                                contained
                                className={css.ApplyFilterButton}
                                onClick={() => {
                                  setCustomerID(webValue.customerID);
                                  // setFromDate(null);
                                  // setToDate(null);
                                  // setOrderBy('');
                                  // setValue('');
                                  setAnchorElFor({
                                    ...anchorElFor,
                                    customerList: null,
                                  });
                                  // setQuery('');
                                }}
                              >
                                Apply Filters
                              </Mui.Button>
                            </div>
                          </Mui.Popover>
                        </>
                      }
                    >
                      <div className={css.effortlessOptions}>
                        <span className={css.title}>Customer List</span>
                        <div className={css.searchFilterFull}>
                          <SearchIcon className={css.searchFilterIcon} />
                          <input
                            placeholder="Search for Customer"
                            onChange={(event) => {
                              setQuery(event.target.value);
                              if (event?.target?.value?.length > 2) {
                                custListCall(event.target.value);
                              }
                              if (event?.target?.value?.length === 0) {
                                custListCall();
                              }
                            }}
                            value={query}
                            className={css.searchFilterInputMobile}
                          />
                        </div>
                        <ul
                          className={css.optionsWrapper}
                          style={{ maxHeight: '60vh', overflow: 'auto' }}
                        >
                          {/* <Mui.FormControl>
                            <RadioGroup
                              // value={customerList.filter((data) => data.id === e.id )}
                              value={customerID}
                              onChange={(e) => {
                                setCustomerID(e.target.value);
                                // setFromDate(null);
                                // setToDate(null);
                                // setOrderBy('');
                                // setValue('');
                              }}
                              onClick={() => setCustomerDrawer(false)}
                              name="radio-buttons-group"
                            > */}
                          {customerList?.length > 0 &&
                            customerList?.map((e) => (
                              <li className={css.items} aria-hidden="true">
                                {/* <RadioGroup
                                  // value={customerList.filter((data) => data.id === e.id )}
                                  value={customerID?.name?.toLowerCase()}
                                  onChange={() => {
                                    setCustomerID(e);
                                    // setFromDate(null);
                                    // setToDate(null);
                                    // setOrderBy('');
                                    // setValue('');
                                  }}
                                  onClick={() => setCustomerDrawer(false)}
                                > */}
                                <FormControlLabel
                                  value={e?.id}
                                  style={{ textTransform: 'capitalize' }}
                                  control={
                                    <Checkbox
                                      style={{
                                        color: '#F08B32',
                                        textTransform: 'capitalize',
                                      }}
                                      checked={customerID?.includes(e?.id)}
                                      onChange={(event) => {
                                        event.persist();
                                        setCustomerID(
                                          (customerID?.includes(
                                            event?.target?.value,
                                          ) &&
                                            customerID?.filter(
                                              (item) =>
                                                item !== event?.target?.value,
                                            )) || [
                                            ...customerID,
                                            event?.target?.value,
                                          ],
                                        );
                                      }}
                                    />
                                  }
                                  label={e?.short_name?.toLowerCase()}
                                />
                                {/* </RadioGroup> */}
                              </li>
                            ))}
                          {/* </RadioGroup>
                          </Mui.FormControl> */}
                          {customerList?.length === 0 && (
                            <Mui.Typography align="center">
                              {loading
                                ? 'Data is being fetched'
                                : 'No Data Found'}
                            </Mui.Typography>
                          )}
                        </ul>
                      </div>
                    </SelectBottomSheet>
                  </Mui.Stack>
                  <SelectBottomSheet
                    open={drawerSort}
                    onClose={() => setDrawerSort(false)}
                    triggerComponent={
                      <>
                        <div
                          className={
                            device === 'mobile'
                              ? css.monthSelection
                              : css.dropdnDesktop
                          }
                          style={{
                            display: device === 'mobile' ? 'flex' : 'none',
                            justifyContent: 'space-around',
                            alignItems: 'center',
                          }}
                          onClick={(event) => {
                            if (device === 'mobile') {
                              setDrawerSort(true);
                            } else {
                              setAnchorElFor({
                                sort: event.currentTarget,
                                date: null,
                                customerList: null,
                              });
                            }
                          }}
                        >
                          <div className={css.text}>Sort</div>
                          <img
                            src={downArrowBlack}
                            alt="arrow"
                            className={css.icon}
                          />
                        </div>
                        <Mui.Popover
                          id="basic-menu-sort"
                          anchorEl={anchorElFor.sort}
                          open={Boolean(anchorElFor.sort)}
                          onClose={() =>
                            setAnchorElFor({ ...anchorElFor, sort: null })
                          }
                          MenuListProps={{
                            'aria-labelledby': 'basic-button',
                          }}
                          PaperProps={{
                            elevation: 3,
                            style: {
                              maxHeight: '100%',
                              width: '35ch',
                              padding: '5px',
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
                          <div className={css.effortlessOptions}>
                            <span>Sort by</span>
                            <hr className={css.forline} />
                            <ul className={css.optionsWrapper}>
                              {[
                                'Name Ascending',
                                'Name Descending',
                                'Amount Ascending',
                                'Amount Descending',
                                'Date Ascending',
                                'Date Descending',
                              ].map((e) => (
                                <li className={css.items} aria-hidden="true">
                                  <RadioGroup
                                    value={sortValue}
                                    onChange={(event) => {
                                      setSortValue(event.target.value);
                                    }}
                                    // onClick={() => setAnchorElFor({...anchorElFor, sort : null})}
                                  >
                                    <FormControlLabel
                                      value={e}
                                      control={
                                        <Radio style={{ color: '#F08B32' }} />
                                      }
                                      label={e}
                                    />
                                  </RadioGroup>
                                </li>
                              ))}
                            </ul>
                            <Mui.Button
                              contained
                              style={{
                                backgroundColor: '#F08B32',
                                color: '#fff',
                                margin: '20px 25%',
                                width: '50%',
                                borderRadius: 25,
                              }}
                              onClick={() => {
                                const temp = sortValue.split(' ');
                                setValue(
                                  temp[1] === 'Ascending' ? 'asc' : 'desc',
                                );
                                setOrderBy(temp[0].toLowerCase());
                                // setCustomerID(false);
                                // setFromDate(null);
                                // setToDate(null);
                                setAnchorElFor({ ...anchorElFor, sort: null });
                              }}
                            >
                              Apply Filters
                            </Mui.Button>
                          </div>
                        </Mui.Popover>
                      </>
                    }
                  >
                    <div className={css.effortlessOptions}>
                      <span className={css.title}>Sort by</span>
                      <ul className={css.optionsWrapper}>
                        {[
                          'Name Ascending',
                          'Name Descending',
                          'Amount Ascending',
                          'Amount Descending',
                          'Date Ascending',
                          'Date Descending',
                        ].map((e) => (
                          <li className={css.items} aria-hidden="true">
                            <RadioGroup
                              value={sortValue}
                              onChange={(event) => {
                                const temp = event.target.value.split(' ');
                                setSortValue(event.target.value);
                                setValue(
                                  temp[1] === 'Ascending' ? 'asc' : 'desc',
                                );
                                setOrderBy(temp[0].toLowerCase());
                                // setCustomerID(false);
                                // setFromDate(null);
                                // setToDate(null);
                              }}
                              onClick={() => setDrawerSort(false)}
                            >
                              <FormControlLabel
                                value={e}
                                control={<Radio style={{ color: '#F08B32' }} />}
                                label={e}
                              />
                            </RadioGroup>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </SelectBottomSheet>
                </div>
              </Mui.Stack>
              {/* {device === 'desktop' &&
                  customerID?.length > 0 &&
                  customerID?.map((val) => (
                    <div
                      className={css.orangeList}
                      style={{ marginLeft: '15px' }}
                    >
                      <Mui.Chip
                        className={classes.selectedchips}
                        label={
                          filteredUsers.find((item) => item.id === val)?.name
                        }
                        variant="outlined"
                        onDelete={() => {
                          setCustomerID(
                            customerID?.filter((item) => item !== val)
                          );
                          setWebValue((prev) => ({
                            ...prev,
                            customerID: webValue?.customerID?.filter(
                              (item) => item !== val
                            ),
                          }));
                        }}
                      />
                    </div>
                  ))} */}
              <div
                className={
                  device === 'desktop' ? css.rowFilter : css.rowFilterForMobile
                }
                style={{
                  display:
                    customerID?.length > 0 || (toDate && fromDate) || sortValue
                      ? // || typeValue
                        // desktop to hide
                        (device === 'desktop' && 'none') || ''
                      : 'none',
                }}
              >
                {customerID?.length > 0 &&
                  customerID?.map((val) => (
                    <div className={css.orangeList}>
                      <Chip
                        className={classes.selectedchips}
                        label={
                          customerList.find((item) => item.id === val)?.name
                        }
                        variant="outlined"
                        onDelete={() => {
                          setCustomerID(
                            customerID?.filter((item) => item !== val),
                          );
                          setWebValue((prev) => ({
                            ...prev,
                            customerID: webValue?.customerID?.filter(
                              (item) => item !== val,
                            ),
                          }));
                        }}
                      />
                    </div>
                  ))}
                {toDate && fromDate && (
                  <div className={css.orangeList}>
                    {console.log(fromDate, toDate)}
                    <Chip
                      className={classes.selectedchips}
                      label={`${moment(fromDate).format('MMM DD')} - ${moment(
                        toDate,
                      ).format('MMM DD, YYYY')}`}
                      variant="outlined"
                      onDelete={() => {
                        setToDate(null);
                        setFromDate(null);
                        setWebValue({
                          ...webValue,
                          fromDate: null,
                          toDate: null,
                        });
                      }}
                    />
                  </div>
                )}
                {sortValue && (
                  <div className={css.orangeList}>
                    <Chip
                      className={classes.selectedchips}
                      label={`${sortValue}`}
                      variant="outlined"
                      onDelete={() => {
                        setSortValue('');
                      }}
                    />
                  </div>
                )}

                {/* {typeValue && (
                  <div className={css.orangeList}>
                    <Chip
                      className={classes.selectedchips}
                      label={`${typeValue}`}
                      variant="outlined"
                      onDelete={() => {
                        setTypeValue('');
                      }}
                    />
                  </div>
                )} */}
              </div>
              {(device === 'mobile' &&
                (draftInvoice && draftInvoice?.length === 0 ? (
                  //  <Grid
                  //    container
                  //    spacing={3}
                  //    alignItems="center"
                  //    className={css.draftItem}
                  //  >
                  <Grid item xs={12} className={css.draftInfo}>
                    <Mui.Typography align="center">
                      No Invoices found!!!
                    </Mui.Typography>
                  </Grid>
                ) : (
                  //  </Grid>
                  draftInvoice?.map((d) => (
                    <Mui.Stack
                      direction="row"
                      width="100%"
                      justifyContent="space-between"
                      style={{ padding: '5px 0', marginTop: 0 }}
                      className={css.box}
                      onClick={() => {
                        // openInvoice(d);
                        setActiveItem(d);
                        onTriggerDrawer('draftInvoiceDrawer');
                      }}
                    >
                      <Item
                        style={{
                          width: '100%',
                          padding: '10px 20px',
                          borderRadius: '0px',
                          // textAlignLast: 'center',
                        }}
                      >
                        <Mui.Stack
                          direction="row"
                          justifyContent="space-between"
                          className={css.contentSpace}
                        >
                          <Mui.Grid className={css.contentName}>
                            {/* DT2022-102 */}
                            {d?.customer_name?.toLowerCase()}
                          </Mui.Grid>
                          <Mui.Grid className={css.amount}>
                            {FormattedAmount(d?.invoice_value)}
                          </Mui.Grid>
                        </Mui.Stack>

                        <Mui.Stack
                          direction="row"
                          justifyContent="space-between"
                          className={css.contentSpace}
                        >
                          <Mui.Grid className={css.date}>
                            {moment(d?.created_at).format('DD-MM-YYYY')}
                          </Mui.Grid>
                          <Mui.Grid
                            className={css.documentType}
                            style={{
                              background: INVOICE_TYPES.find(
                                (val) => val.payload === d.document_type,
                              )?.color,
                            }}
                          >
                            {
                              INVOICE_TYPES.find(
                                (val) => val.payload === d.document_type,
                              )?.text
                            }
                          </Mui.Grid>
                        </Mui.Stack>
                      </Item>
                    </Mui.Stack>
                  ))
                ))) || <></>}
              {
                device === 'desktop' && draftInvoice && (
                  // (draftInvoice?.length === 0 && (
                  //     //  <Grid
                  //     //    container
                  //     //    spacing={3}
                  //     //    alignItems="center"
                  //     //    className={css.draftItem}
                  //     //  >
                  //     <Grid item xs={12} className={css.draftInfo}>
                  //       <Mui.Typography align="center">
                  //         No Invoices found!!!
                  //       </Mui.Typography>
                  //     </Grid>
                  // )) ||
                  <Mui.Box
                    sx={{
                      height: '100%',
                      width: '100%',
                      marginTop: '0 !important',
                      '& .left-align--header': {
                        '.MuiDataGrid-columnHeaderDraggableContainer': {
                          flexDirection: 'row !important',
                        },
                        '.MuiDataGrid-columnHeaderTitleContainer': {
                          flexDirection: 'row !important',
                        },
                        textAlign: 'left',
                      },
                    }}
                  >
                    <DataGridPro
                      rows={draftInvoice}
                      columns={draftColumn}
                      density="compact"
                      getRowHeight={() => 'auto'}
                      // loading={data.rows.length === 0}
                      rowHeight={60}
                      disableColumnReorder
                      hideFooter
                      // checkboxSelection
                      disableSelectionOnClick
                      // disableColumnFilter
                      // disableColumnSelector
                      // disableDensitySelector
                      // onFilterModelChange={(item) =>
                      //   setColumnHeader(item?.items?.[0]?.columnField)
                      // }
                      components={{
                        Toolbar: CustomToolbar,
                        // FilterPanel: CustomerListDraft,
                        // Footer: CustomFooter,
                        ColumnMenu: CustomColumnMenu,
                        // Header: CustomFooter
                        // ColumnMenu: CustomFooter
                        NoRowsOverlay: () => (
                          <Mui.Stack
                            height="100%"
                            alignItems="center"
                            justifyContent="center"
                          >
                            No Data Found
                          </Mui.Stack>
                        ),
                      }}
                      componentsProps={{
                        toolbar: {
                          showQuickFilter: true,
                          quickFilterProps: { debounceMs: 500 },
                        },
                        // filterPanel: {
                        //   headCol: columnHeader,
                        //   setFilterCustListTempPro: setCustomerID,
                        //   setWebValuePro: setWebValue,
                        // },
                      }}
                      sx={{
                        background: '#fff',
                        borderRadius: '16px',
                        '& .MuiDataGrid-columnHeaderTitle': {
                          whiteSpace: 'break-spaces',
                          textAlign: 'center',
                          lineHeight: '20px',
                        },
                        '& .MuiDataGrid-row': {
                          cursor: 'pointer !important',
                        },
                      }}
                    />
                  </Mui.Box>
                )
                // ) : (
                //   <Mui.CircularProgress style={{ margin: 'auto' }} />
              }

              {/* {!draftInvoice && (
                <Mui.CircularProgress
                  style={{
                    margin: 'auto',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#f08b32',
                  }}
                />
              )} */}
            </Mui.Stack>
          </Mui.Box>
        </Mui.Grid>
      </Mui.Grid>

      <Mui.Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        PaperProps={{
          elevation: 3,
          style: {
            maxHeight: 48 * 4.5,
            width: '20ch',
            padding: '5px',
            borderRadius: 20,
          },
        }}
      >
        <Mui.MenuItem
          onClick={() => {
            setAnchorEl(null);
            openInvoice();
          }}
          classes={{ root: classes.textStyle }}
        >
          Edit Invoice
        </Mui.MenuItem>
        <hr />
        <Mui.MenuItem
          onClick={() => {
            WebDelete();
          }}
          classes={{ root: classes.textStyle }}
        >
          Delete Draft
        </Mui.MenuItem>
      </Mui.Menu>
      <StyledDrawer
        anchor="bottom"
        variant="temporary"
        name="draftInvoiceDrawer"
        // triggerComponent={addVendor}
        open={bottomSheet.draftInvoiceDrawer}
        // onTrigger={onTriggerDrawer}
        onClose={() => handleBottomSheet('draftInvoiceDrawer')}
        // maxHeight="45vh"
        className={css.draftInvoiceDrawer}
      >
        <div className={css.valueWrapper}>
          <span className={`${css.value}`} onClick={() => openInvoice()}>
            Edit this Draft Invoice
          </span>
          <hr />
          <span
            className={`${css.value} ${css.valueColor}`}
            onClick={() => {
              MobileDelete();
            }}
          >
            Delete this Draft Invoice
          </span>
          <hr />
        </div>
      </StyledDrawer>

      <ReceivablesPopOver
        open={bottomSheet.deletePopup}
        handleClose={() => handleBottomSheet('deletePopup')}
        position="center"
      >
        {/* deleteInvoice(activeItem.id) */}
        <div className={css.effortlessOptions}>
          {device === 'mobile' && (
            <>
              <h3>Delete</h3>
              <p>Are you sure you want to delete this Draft Invoice?</p>
            </>
          )}

          {device === 'desktop' && (
            <>
              <h3>
                Delete Invoice <hr className={css.forline} />
              </h3>
              <p>
                Are you sure to delete this Invoice{' '}
                <span style={{ textTransform: 'capitalize' }}>
                  {activeItem?.customer_name?.toLowerCase()}
                </span>
              </p>
              <p>
                Note: Invoices deleted from drafts cannot be retrieved back.
              </p>
            </>
          )}

          {/* </ul> */}
          <div
            className={css.addCustomerFooter}
            style={{ marginBottom: '10px' }}
          >
            <Button
              variant="contained"
              className={css.secondary}
              style={{
                padding: '15px 35px',
                textTransform: 'initial',
              }}
              onClick={() => {
                handleBottomSheet('deletePopup');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              className={`${css.primary}`}
              style={{
                padding: '15px 35px',
                textTransform: 'initial',
              }}
              onClick={() => {
                deleteInvoice(activeItem?.id);
              }}
            >
              &nbsp; Delete Invoice&nbsp;
            </Button>
          </div>
        </div>
      </ReceivablesPopOver>

      <DialogContainer
        title="Invoice Summary"
        body={summaryContent()}
        open={openSummary}
        onCancel={onCloseSummary}
        onSubmit={openInvoice}
        maxWidth="lg"
        submitText="Open Invoice"
      />
      {havePermission.open && (
        <PermissionDialog onClose={() => havePermission.back()} />
      )}
    </div>
  );
};

export default DraftInvoiceContainer;
