/* @flow */
/**
 * @fileoverview  Create Edit Invoice Container
 */
/* eslint-disable no-lonely-if */

import React, { useState, useEffect, useContext } from 'react';
import { OnlyDatePicker } from '@components/DatePicker/DatePicker.jsx';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import * as Router from 'react-router-dom';

import { makeStyles, Chip } from '@material-ui/core';
import themes from '@root/theme.scss';
import DropdownIcon from '@assets/downArrowBlack.svg';
import Checkbox from '@components/Checkbox/Checkbox.jsx';
import DialogContainer from '@components/DialogContainer/DialogContainer.jsx';
import RestApi, { METHOD } from '@services/RestApi.jsx';
// import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
// import { DataGrid } from '@mui/x-data-grid';
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
// import DataGrid from '@components/DataGrid/CustomDataGrid';
// import Checkbox from '@components/Checkbox/Checkbox.jsx';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import AppContext from '@root/AppContext.jsx';
// import ApproveDeclineDialog from '@core/InvoiceView/ApproveDeclineDialog';
import ConfirmMessageDialog from '@core/InvoiceView/ConfirmMessageDialog';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer.jsx';
import { PermissionDialog } from '@components/Permissions/PermissionDialog.jsx';
import * as Mui from '@mui/material';
import * as MuiIcons from '@mui/icons-material';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { FormattedAmount } from '@components/formattedValue/FormattedValue';
// import { MuiDatePicker } from '@components/DatePicker/DatePicker.jsx';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet.jsx';
import ReceivablesPopOver from '../Receivables/Components/ReceivablesPopover';
import Calender from './Calander';
// import sort from '../../assets/sort.svg';

import css from './CreateInvoiceContainer.scss';

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
    margin: '0 6px 0 0',
    background: '#fdf1e6',
    maxWidth: '45% !important',
    color: themes.colorPrimaryButton,
    border: `1px solid ${themes.colorPrimaryButton}`,
    borderRadius: '25px',
    marginBottom: '15px',
  },
  formControl: {
    width: '100%',
  },
}));

const UnApprovedInvoiceContainer = () => {
  const {
    organization,
    user,
    setActiveInvoiceId,
    changeSubView,
    enableLoading,
    openSnackBar,
    loading,
    userPermissions,
  } = useContext(AppContext);
  const device = localStorage.getItem('device_detect');
  const classes = useStyles();

  const [openSummary, setOpenSummary] = useState(false);
  // const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openConfirmMessage, setOpenConfirmMessage] = useState(false);
  const [activeItem, setActiveItem] = useState({});
  const [unapprovedInvoice, setUnapprovedInvoice] = useState([]);
  // const [unapprovedInvoiceDesktop, setUnapprovedInvoiceDesktop] = useState({});
  const [drawerSort, setDrawerSort] = React.useState(false);
  const [customerDrawer, setCustomerDrawer] = React.useState(false);
  const [value, setValue] = React.useState('');
  // eslint-disable-next-line no-unused-vars
  const [customerList, setCustomerList] = React.useState([]);
  const [customerID, setCustomerID] = React.useState([]);
  const [orderOfValue, setOrderOfValue] = React.useState(false);
  const [orderBy, setOrderBy] = React.useState('');
  const [selectedCustomer, setSelectedCustomer] = React.useState([]);
  const [selectedCustomerType, setSelectedCustomerType] = React.useState([]);
  const [sortValue, setSortValue] = React.useState('');
  const [toDate, setToDate] = useState(null);
  const [query, setQuery] = useState('');
  const [openBottomList, setOpenBottomList] = useState(false);
  // const [Data, setData] = useState([]);
  // const [editSingle, setEditSingle] = useState('');
  const navigate = Router.useNavigate();

  // const [selected, setSelected] = React.useState([]);
  // React.useEffect(() => {
  //   console.log(selected);
  // }, [selected]);
  // const [editSingle, setEditSingle] = useState('');
  const [userCustomerId, setUserCustomerId] = useState([]);
  // const [anchorEl, setAnchorEl] = React.useState(null);

  const [fromDate, setFromDate] = useState(null);
  const [drawer, setDrawer] = useState({
    startDate: false,
    endDate: false,
    deletePopup: false,
  });

  const [anchorElFor, setAnchorElFor] = React.useState({
    sort: null,
    date: null,
    customerList: null,
  });
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [webValue, setWebValue] = React.useState({
    fromDate: null,
    toDate: null,
    customerID: [],
    orderBy: null,
  });

  // const [columnHeader, setColumnHeader] = React.useState('');
  const [pagination, setPagination] = React.useState({
    currentPage: 1,
    totalPage: 1,
  });
  const [typeValue, setTypeValue] = React.useState('');

  const InvoiceType = [
    { value: 'tax_invoice', label: 'Tax Invoice' },
    { value: 'estimate', label: 'Estimate' },
    { value: 'credit_note', label: 'Credit Note' },
    { value: 'debit_note', label: 'Debit Note' },
  ];

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

  const handleRowSelection = (val) => {
    if (
      !userRoles?.Estimate?.view_estimate &&
      val?.document_type === 'estimate'
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
      !userRoles?.['Tax Invoice']?.view_invoices &&
      val?.document_type === 'tax_invoice'
    ) {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
      return;
    }
    user.customerId = val?.customer_id;
    setActiveInvoiceId({
      activeInvoiceId: val?.id,
    });
    if (val?.id) {
      navigate(`/invoice-unapproved-pdf?id=${val?.id}`, {
        state: {
          id: val?.customer_id,
          type: 'unApproved',
          params: 5,
          documentType: val?.document_type,
          unApprovedAccess: userRoles,
        },
      });
    }
  };

  // const filteredUsers = query
  //   ? customerList.filter((val) => {
  //       return val?.name?.toLowerCase().includes(query?.toLowerCase());
  //     })
  //   : customerList;

  // console.log(filteredUsers);

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
    //   setValue('');
    //   setCustomerID(false);
    //   setOrderBy('');
  };

  const custListCall = (searchVal) => {
    enableLoading(true);
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
        enableLoading(false);
        if (res && !res.error) {
          setCustomerList(res.data);
        } else {
          openSnackBar({
            message: res.message || 'Unknown error occured',
            type: MESSAGE_TYPE.ERROR,
          });
        }
      })
      .catch((err) => {
        enableLoading(false);
        openSnackBar({
          message: err.message || 'Unknown error occured',
          type: MESSAGE_TYPE.ERROR,
        });
      });
  };

  React.useEffect(() => {
    custListCall();
  }, [organization.orgId, user.activeToken]);
  const keyPass = 5;
  const toPdf = () => {
    setActiveInvoiceId({
      activeInvoiceId: selectedCustomer,
    });
    navigate(`/invoice-unapproved-pdf?id=${selectedCustomer}`, {
      state: {
        type: 'unApproved',
        params: keyPass,
        documentType: selectedCustomerType?.[0]?.document_type,
        unApprovedAccess: userRoles,
      },
    });

    // changeSubView('generateInvoicePdfUnapproved', keyPass);
  };
  const approveCustomer = () => {
    enableLoading(true);
    RestApi(`organizations/${organization.orgId}/invoices/batches/approve`, {
      method: METHOD.POST,
      payload: {
        ids: selectedCustomer,
      },
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        if (res && !res.error) {
          // changeSubView('unApprovedSuccess');
          navigate('/invoice-unapproved-success', {
            state: { type: 'unApprovedSuccess' },
          });
        } else {
          openSnackBar({
            message: res.message || 'Unknown error occured',
            type: MESSAGE_TYPE.ERROR,
          });
        }
        enableLoading(false);
      })
      .catch((e) => {
        enableLoading(false);
        openSnackBar({
          message: e || 'Unknown error occured',
          type: MESSAGE_TYPE.ERROR,
        });
      });
  };

  const selectedCust = (data) => {
    if (selectedCustomer.indexOf(data.id) < 0) {
      setSelectedCustomer((previous) => [...previous, data.id]);
      setSelectedCustomerType((previous) => [...previous, data]);
    } else {
      setSelectedCustomer((previous) => [
        ...previous.filter((val) => val !== data.id),
      ]);
      const filterType = selectedCustomerType?.filter(
        (val) => val?.id !== data?.id,
      );
      setSelectedCustomerType(filterType);
    }

    if (userCustomerId.indexOf(data.id) < 0) {
      setUserCustomerId((previous) => [...previous, data.customer_id]);
    } else {
      setUserCustomerId((previous) => [
        ...previous.filter((val) => val !== data.customer_id),
      ]);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const onOpenSummary = (i) => {
    setActiveItem(i);
    setActiveInvoiceId({
      activeInvoiceId: i.id,
    });
    setOpenSummary(true);
  };

  const onCloseSummary = () => {
    setOpenSummary(false);
  };

  const onReviewInvoice = () => {
    setOpenSummary(false);
    // setOpenApproveDialog(true);
  };

  // const onReviewInvoiceClose = () => {
  // setOpenApproveDialog(false);
  // };
  const approvePdf = () => {
    const typeOfInvoice = selectedCustomerType?.map(
      (val) => val?.document_type,
    );
    if (selectedCustomer.length === 1) {
      if (
        !userRoles?.Estimate?.view_estimate &&
        typeOfInvoice?.includes('estimate')
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
        !userRoles?.['Tax Invoice']?.view_invoices &&
        typeOfInvoice?.includes('tax_invoice')
      ) {
        setHavePermission({
          open: true,
          back: () => {
            setHavePermission({ open: false });
          },
        });
        return;
      }
      const [id] = userCustomerId;
      user.customerId = id;
      toPdf();
    }
    if (selectedCustomer.length > 1) {
      if (
        !userRoles?.Estimate?.approve_estimate &&
        typeOfInvoice?.includes('estimate')
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
        !userRoles?.['Tax Invoice']?.approve_invoices &&
        typeOfInvoice?.includes('tax_invoice')
      ) {
        setHavePermission({
          open: true,
          back: () => {
            setHavePermission({ open: false });
          },
        });
        return;
      }
      approveCustomer();
    }
  };
  const fetchUnapprovedInvoices = (numPage) => {
    // enableLoading(true);
    // RestApi(
    //   `organizations/${organization.orgId}/invoices/unapproved?order=${
    //     value === 'Ascending' ? 'asc' : 'desc'
    //   }&order_by=${orderBy}&customer_ids=${
    //     customerID?.id ? customerID.id : ''
    //   }`,
    let filter = '';
    if (customerID && customerID.length === 1) {
      filter += `customer_id=${customerID || ''}`;
    } else if (customerID && customerID.length > 1) {
      customerID.forEach((v) => {
        filter += `customer_ids[]=${v}&`;
      });
    }
    RestApi(
      `organizations/${
        organization.orgId
      }/invoices/unapproved?order=${value}&order_by=${orderBy}&${
        filter || ''
      }&start_date=${
        fromDate ? moment(fromDate).format('YYYY-MM-DD') : ''
      }&end_date=${
        toDate ? moment(toDate).format('YYYY-MM-DD') : ''
      }&type=${typeValue}&page=${numPage || 1}`,
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
            setPagination({ currentPage: res?.page, totalPage: res?.pages });
            if (numPage > 1) {
              setUnapprovedInvoice((prev) => [...prev, ...res?.data]);
            } else {
              setUnapprovedInvoice(res.data.map((c) => c));
            }
            // setUnapprovedInvoiceDesktop([...res.data]);
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
          fetchUnapprovedInvoices(pagination?.currentPage + 1);
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
      if (res && !res.error) {
        fetchUnapprovedInvoices();
        openSnackBar({
          message: 'Invoice Deleted Successfully',
          type: MESSAGE_TYPE.INFO,
        });
      }
    });
  };

  const declineInvoice = (id, reason) => {
    RestApi(
      `organizations/${organization.orgId}/invoices/${
        id || organization.activeInvoiceId
      }/declines`,
      {
        method: METHOD.POST,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error) {
        if (res?.message === 'Invoice not found') {
          openSnackBar({
            message: res?.message ? res?.message : 'Invoice has been Declined',
            type: MESSAGE_TYPE.INFO,
          });
        } else {
          if (reason === 'edit') {
            setOpenBottomList(false);
            setTimeout(() => {
              navigate(`/invoice-draft-new`, { state: { type: 'draft' } });
            }, 500);
          } else {
            openSnackBar({
              message: res?.message
                ? res?.message
                : 'Invoice has been Declined',
              type: MESSAGE_TYPE.INFO,
            });
            changeSubView('');
            setDrawer((prev) => ({ ...prev, deletePopup: false }));
            setOpenBottomList(false);
            fetchUnapprovedInvoices();
          }
        }
      } else if (res.error) {
        openSnackBar({
          message: res?.message || 'Something went wrong, we will look into it',
          type: MESSAGE_TYPE.ERROR,
        });
      }
    });
  };
  // eslint-disable-next-line no-unused-vars
  const approveInvoice = () => {
    RestApi(
      `organizations/${organization.orgId}/invoices/${organization.activeInvoiceId}/approvals`,
      {
        method: METHOD.POST,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error) {
        openSnackBar({
          message: 'Invoice Approved Successfully',
          type: MESSAGE_TYPE.INFO,
        });
        // setOpenApproveDialog(false);
        setOpenConfirmMessage(true);
      }
    });
  };

  useEffect(() => {
    fetchUnapprovedInvoices();
  }, [value, customerID, orderBy, fromDate, toDate, typeValue]);

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

  // const titles = [
  //   '',
  //   'S.NO',
  //   'NAME OF THE CUSTOMER',
  //   'INVOICE ID',
  //   'CREATED DATE',
  //   'BILL AMOUNT',
  // ];

  // function randomColor() {
  //   const hex = Math.floor(Math.random() * 0xffffff);
  //   const color = `#${hex.toString(16)}`;

  //   return color;
  // }

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
  const unApprovedColumn = [
    {
      field: 'invoice_number',
      headerName: 'Invoice Number',
      renderCell: (params) => {
        return (
          <div
            onClick={() => {
              // setEditSingle(params.row);
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
      sortable: false,
    },
    {
      field: 'customer_name',
      headerName: 'Customer',
      filterable: false,
      flex: 1,
      renderCell: (params) => {
        return (
          <div
            onClick={() => {
              // setEditSingle(params.row);
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
      valueFormatter: (params) =>
        InvoiceType.filter((c) => c.value === params?.value)[0]?.label,
      renderCell: (params) => {
        return (
          <div
            onClick={() => {
              // setEditSingle(params.row);
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
            </p>
          </div>
        );
      },
      maxWidth: 120,
      sortable: false,
    },
    {
      field: 'invoice_value',
      headerName: 'Invoice Value',
      type: 'number',
      headerClassName: 'left-align--header',
      renderCell: (params) => {
        return (
          <div
            onClick={() => {
              // setEditSingle(params.row);
              handleRowSelection(params.row);
            }}
          >
            <p style={{ whiteSpace: 'nowrap' }}>
              {FormattedAmount(params.row?.invoice_value)}
            </p>
          </div>
        );
      },
      maxWidth: 150,
      width: 120,
      align: 'right',
    },
    {
      field: 'created_at',
      headerName: 'Created On',
      type: 'date',
      valueFormatter: (params) =>
        moment(params.row?.created_at).format('DD-MM-yyyy'),
      renderCell: (params) => {
        return (
          <div
            onClick={() => {
              // setEditSingle(params.row);
              handleRowSelection(params.row);
            }}
          >
            <p style={{ whiteSpace: 'break-spaces' }}>
              {moment(params.row?.created_at).format('DD-MM-yyyy')}
            </p>
          </div>
        );
      },
      maxWidth: 120,
    },
    {
      field: 'id',
      headerName: '',
      renderCell: (params) => {
        return (
          <>
            <Mui.IconButton
              className={css.dots}
              onClick={(event) => {
                // setEditSingle(params.row);
                setActiveItem(params.row);
                setAnchorEl(event.currentTarget);
              }}
            >
              <MuiIcons.MoreVert sx={{ width: '15px' }} />
            </Mui.IconButton>
          </>
        );
      },
      maxWidth: 40,
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
  // const columns = [
  //   // {
  //   //   field: '',
  //   //   headerName: '',
  //   //   maxWidth: 50,
  //   //   sortable: false,
  //   //   renderCell: () => {
  //   //     return <Checkbox />;
  //   //   },
  //   // },
  //
  //
  //
  //
  //
  // ];
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

  const EditInvoice = () => {
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
    setAnchorEl(null);
    setActiveInvoiceId({
      activeInvoiceId: activeItem?.id,
    });
    declineInvoice(activeItem?.id, 'edit');
  };

  const ApproveInvoice = () => {
    if (
      !userRoles?.Estimate?.view_estimate &&
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
      !userRoles?.['Tax Invoice']?.view_invoices &&
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
    setAnchorEl(null);
    setActiveInvoiceId({
      activeInvoiceId: activeItem?.id,
    });
    navigate(`/invoice-unapproved-pdf?id=${activeItem?.id}`, {
      state: {
        id: activeItem?.customer_id,
        type: 'unApproved',
        params: 5,
        documentType: activeItem?.document_type,
        unApprovedAccess: userRoles,
      },
    });
  };

  const CancelInvoice = () => {
    if (
      !userRoles?.Estimate?.cancel_estimate &&
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
      !userRoles?.['Tax Invoice']?.cancel_invoices &&
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
    setAnchorEl(null);
    setActiveInvoiceId({
      activeInvoiceId: activeItem?.id,
    });
    setDrawer((prev) => ({
      ...prev,
      deletePopup: true,
    }));
  };

  return (
    <div
      className={
        device === 'mobile' ? css.draftInvoiceContainer : css.unApprovedDesktop
      }
    >
      <>
        {device === 'mobile' && (
          <div className={css.unapprovedTitle}>
            <Mui.Typography
              variant="h5"
              style={{
                fontSize: '13px',
                fontWeight: 500,
                lineHeight: '15px',
                color: '#283049',
              }}
              className={css.valueHeader}
              align="left"
            >
              Unapproved Invoices
            </Mui.Typography>
          </div>
        )}

        <Mui.Stack
          direction="row"
          style={{
            justifyContent: 'space-between',
            width: '100%',
            // desktop to hide
            display: device === 'mobile' ? '' : 'none',
          }}
        >
          <div
            className={css.mainButton}
            style={{
              // marginBottom: '10px',
              paddingTop: '0.8rem',
              // marginLeft: 25,
              // placeContent: 'space-evenly',
              justifyContent:
                device === 'mobile' ? 'flex-start' : 'space-between',
              padding:
                device === 'mobile' ? '5px 0px 5px 0px' : '5px 40px 5px 20px',
            }}
          >
            <Mui.Stack direction="row" spacing={2}>
              <SelectBottomSheet
                open={orderOfValue}
                addNewSheet
                onClose={() => setOrderOfValue(false)}
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
                        src={DropdownIcon}
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
                        <span>Select the start and end date to filter</span>
                        <hr className={css.DividerFilter} />

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
                                //   setWebValue({
                                //     fromDate: e.target.value,
                                //     toDate: webValue.toDate,
                                //     customerID: null,
                                //     orderBy: null,
                                //   });
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
                            setAnchorElFor({ ...anchorElFor, date: null });
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
                            setDrawer((d) => ({ ...d, startDate: false }));
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
                      // style={{ width: 110 }}
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
                    >
                      <div className={css.text}>Customer</div>
                      <img
                        src={DropdownIcon}
                        alt="arrow"
                        className={css.icon}
                      />
                    </div>
                    <Mui.Popover
                      id="basic-menu-list"
                      anchorEl={anchorElFor.customerList}
                      open={Boolean(anchorElFor.customerList)}
                      onClose={() =>
                        setAnchorElFor({
                          ...anchorElFor,
                          customerList: null,
                        })
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
                        >
                          <SearchIcon className={css.searchFilterIcon} />{' '}
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
                              <li className={css.items} aria-hidden="true">
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
                                                  item !== event?.target?.value,
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
                    <SearchIcon className={css.searchFilterIcon} />{' '}
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
                                  event?.persist();
                                  setCustomerID(
                                    (customerID?.includes(
                                      event?.target?.value,
                                    ) &&
                                      customerID?.filter(
                                        (item) => item !== event?.target?.value,
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
                    {customerList?.length === 0 && (
                      <Mui.Typography align="center">
                        {loading ? 'Data is being fetched' : 'No Data Found'}
                      </Mui.Typography>
                    )}
                    {/* </RadioGroup>
                     </Mui.FormControl> */}
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
                    <img src={DropdownIcon} alt="arrow" className={css.icon} />
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
                      <ul
                        className={css.optionsWrapper}
                        style={{ height: '20rem', overflow: 'auto' }}
                      >
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
                                control={<Radio style={{ color: '#F08B32' }} />}
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
                          setValue(temp[1] === 'Ascending' ? 'asc' : 'desc');
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
                          setValue(temp[1] === 'Ascending' ? 'asc' : 'desc');
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
        {/* {device === 'desktop' && customerID?.length > 0 && (
           <div
             className={css.orangeList}
             style={{
               // height: '40px',
               width: '90%',
               margin: '10px 0 5px 15px',
               padding: 0,
             }}
           >
             {customerID?.map((val) => (
               <Mui.Chip
                 className={classes.selectedchips}
                 label={filteredUsers.find((item) => item.id === val)?.name}
                 variant="outlined"
                 onDelete={() => {
                   setCustomerID(customerID?.filter((item) => item !== val));
                   setWebValue((prev) => ({
                     ...prev,
                     customerID: webValue?.customerID?.filter(
                       (item) => item !== val,
                     ),
                   }));
                   setSelectedCustomer([]);
                 }}
               />
             ))}
           </div>
         )} */}

        <div
          className={`${css.rowFilter} ${css.rowFilterUnApprove}`}
          style={{
            display:
              customerID?.length > 0 || (toDate && fromDate) || sortValue
                ? // desktop to hide
                  (device === 'desktop' && 'none') || ''
                : 'none',
            width: '98%',
          }}
        >
          {customerID?.length > 0 &&
            customerID?.map((val) => (
              <div className={css.orangeList}>
                <Chip
                  className={classes.selectedchips}
                  label={customerList.find((item) => item.id === val)?.name}
                  variant="outlined"
                  onDelete={() => {
                    setCustomerID(customerID?.filter((item) => item !== val));
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
        </div>

        <Mui.Grid
          container
          spacing={0}
          alignItems="center"
          className={css.draftItemNew}
          style={{
            width: '100%',
            paddingBottom: device === 'mobile' ? '5rem' : 0,
            marginTop: customerID ? '1px' : '.5rem',
            padding: device === 'mobile' ? 'auto' : '0',
            overflow: device === 'mobile' ? 'auto' : 'hidden',
            height: device === 'mobile' ? '' : '100%',
          }}
        >
          {(device === 'mobile' &&
            (unapprovedInvoice && unapprovedInvoice?.length === 0 ? (
              // <Grid
              //   container
              //   spacing={3}
              //   alignItems="center"
              //   className={css.draftItem}
              // >
              <Grid item xs={12} className={css.draftInfo}>
                <Mui.Typography align="center">
                  No Invoices found!!!
                </Mui.Typography>
              </Grid>
            ) : (
              // </Grid>
              unapprovedInvoice?.map((val, index) => (
                <Mui.Grid
                  item
                  xs={12}
                  style={{
                    width: '100%',
                    background: index % 2 === 0 ? '#ffffff' : 'transparent',
                    padding: '10px 20px',
                  }}
                  key={val.id}
                >
                  <div
                    style={{ width: '100%', height: '60px', display: 'flex' }}
                    // onClick={() => {
                    //   setActiveItem(val);
                    //   setOpenBottomList(true);
                    // }}
                  >
                    <div style={{ width: '15%' }}>
                      <Mui.Checkbox
                        onClick={() => selectedCust(val)}
                        style={{ color: '#F08B32' }}
                      />
                    </div>
                    <div
                      className={css.mainSection}
                      onClick={() => {
                        setActiveItem(val);
                        setOpenBottomList(true);
                      }}
                    >
                      <div className={css.section1}>
                        <Mui.Typography
                          variant="body1"
                          style={{
                            margin: '0 0 10px 0',
                            fontSize: '14px',
                            fontWeight: 700,
                            textTransform: 'capitalize',
                            width: '60vw',
                          }}
                          noWrap
                        >
                          {val?.customer_name?.toLowerCase()}
                        </Mui.Typography>
                        <Mui.Typography
                          variant="body1"
                          style={{
                            margin: '0 0 10px 0',
                            fontSize: '14px',
                            fontWeight: 700,
                            display: 'flex',
                            justifyContent: 'flex-end',
                          }}
                          noWrap
                        >
                          {FormattedAmount(val?.invoice_value)}
                        </Mui.Typography>
                      </div>
                      <div className={css.section2}>
                        <Mui.Typography
                          variant="body2"
                          style={{
                            fontSize: '12px',
                            fontWeight: 400,
                          }}
                          noWrap
                        >
                          {new Date(val?.invoice_date).toLocaleDateString()}
                        </Mui.Typography>
                        <Mui.Typography
                          variant="body2"
                          style={{
                            fontSize: '12px',
                            fontWeight: 400,
                          }}
                          noWrap
                        >
                          {val?.invoice_number}
                        </Mui.Typography>
                        <Mui.Typography
                          className={css.documentType}
                          style={{
                            background: INVOICE_TYPES.find(
                              (typeVal) =>
                                typeVal.payload === val.document_type,
                            )?.color,
                          }}
                        >
                          {
                            INVOICE_TYPES.find(
                              (typeVal) =>
                                typeVal.payload === val.document_type,
                            )?.text
                          }
                        </Mui.Typography>
                      </div>
                    </div>
                    {/* <div style={{ width: '30%' }}>
                       <Mui.ListItemText
                         primary={
                           <Mui.Typography
                             variant="body1"
                             style={{
                               margin: '0 0 10px 0',
                               fontSize: '14px',
                               fontWeight: 700,
                               textTransform: 'capitalize',
                             }}
                             noWrap
                           >
                             {val?.customer_name?.toLowerCase()}
                           </Mui.Typography>
                         }
                         secondary={
                           <Mui.Typography
                             variant="body2"
                             style={{
                               margin: '0 0 10px 0',
                               fontSize: '12px',
                               fontWeight: 400,
                             }}
                             noWrap
                           >
                             {new Date(val?.invoice_date).toLocaleDateString()}
                           </Mui.Typography>
                         }
                       />
                     </div>
                     <div style={{ width: '30%' }}>
                       <Mui.ListItemText
                         // * This primary section for UI issue
                         primary={
                           <Mui.Typography
                             variant="body1"
                             style={{
                               margin: '0 0 10px 0',
                               fontSize: '14px',
                               fontWeight: 700,
                               color: 'transparent',
                               pointerEvents: 'none',
                               visibility: 'hidden',
                             }}
                             noWrap
                           >
                             .
                           </Mui.Typography>
                         }
                         secondary={
                           <Mui.Typography
                             variant="body2"
                             style={{
                               margin: '0 0 10px 0',
                               fontSize: '12px',
                               fontWeight: 400,
                             }}
                             noWrap
                           >
                             {val?.invoice_number}
                           </Mui.Typography>
                         }
                       />
                     </div>
                     {/* <div style={{ width: '30%', position: 'relative' }}>
                       <Mui.Typography
                         variant="body2"
                         style={{
                           margin: '0 0 10px 0',
                           fontSize: '12px',
                           fontWeight: 400,
                           position: 'absolute',
                           bottom: -5,
                         }}
                         noWrap
                       >
                         {val?.invoice_number}
                       </Mui.Typography>
                     </div> 
                     <div style={{ width: '25%' }}>
                       <Mui.ListItemText
                         style={
                           {
                             // display: 'flex',
                             // justifyContent: 'flex-end',
                             // whiteSpace: 'nowrap',
                           }
                         }
                         primary={
                           <Mui.Typography
                             variant="body1"
                             style={{
                               margin: '0 0 10px 0',
                               fontSize: '14px',
                               fontWeight: 700,
                               display: 'flex',
                               justifyContent: 'flex-end',
                             }}
                             noWrap
                           >
                             ₹{' '}
                             {Number(val?.invoice_value) 'en-IN')}
                           </Mui.Typography>
                         }
                         secondary={
                           <Mui.Typography
                             className={css.documentType}
                             style={{
                               background: INVOICE_TYPES.find(
                                 (typeVal) =>
                                   typeVal.payload === val.document_type,
                               )?.color,
                             }}
                           >
                             {
                               INVOICE_TYPES.find(
                                 (typeVal) =>
                                   typeVal.payload === val.document_type,
                               )?.text
                             }
                           </Mui.Typography>
                         }
                       />
                     </div> */}
                  </div>
                </Mui.Grid>
              ))
            ))) || <></>}
          {
            device === 'desktop' && unapprovedInvoice && (
              //   (unapprovedInvoice?.length === 0 && (
              //     // <Grid
              //     //   container
              //     //   spacing={3}
              //     //   alignItems="center"
              //     //   className={css.draftItem}
              //     //   style={{ margin: 'auto' }}
              //     // >
              //     <Grid item xs={12} className={css.draftInfo}>
              //       <Mui.Typography align="center">
              //         No Invoices found!!!
              //       </Mui.Typography>
              //     </Grid>
              //     // </Grid>
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
                  rows={unapprovedInvoice}
                  columns={unApprovedColumn}
                  density="compact"
                  getRowHeight={() => 'auto'}
                  // loading={data.rows.length === 0}
                  rowHeight={60}
                  disableColumnReorder
                  hideFooter
                  checkboxSelection
                  onSelectionModelChange={(ids) => {
                    const selectedRowsData = ids?.map((id) =>
                      unapprovedInvoice?.find((row) => row.id === id),
                    );
                    setSelectedCustomer(ids);
                    setSelectedCustomerType(selectedRowsData);
                  }}
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
                    NoResultsOverlay: () => (
                      <Mui.Stack
                        height="100%"
                        alignItems="center"
                        justifyContent="center"
                      >
                        Local filter returns no result
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

          {/* {!unapprovedInvoice && (
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

          {unapprovedInvoice?.length > 0 && (
            <Mui.Stack
              className={
                device === 'mobile'
                  ? css.approveBtnStack
                  : css.approveBtnStackDesktop
              }
              mt={3}
            >
              <Mui.Button
                variant="contained"
                className={css.approveBtn}
                onClick={() => {
                  if (selectedCustomer.length > 0) {
                    approvePdf();
                  }
                }}
                // disabled={selectedCustomer.length === 0}
              >
                {/* <ConfirmMessageDialog open={open} /> */}
                <Mui.Typography className={css.approveBtnText}>
                  {' '}
                  Approve these Invoices
                </Mui.Typography>
              </Mui.Button>
            </Mui.Stack>
          )}
          {/* <Mui.Grid item xs={12} className={css.bottomButton}>
                  <Mui.Button
                    variant="contained"
                    className={css.primary}
                    onClick={() => {
                      approveCustomer(selectedCustomer);
                    }}
                  >
                    View Bill-Wise Breakup
                  </Mui.Button>
                </Mui.Grid> */}
        </Mui.Grid>
      </>

      <SelectBottomSheet
        open={device === 'mobile' && openBottomList}
        addNewSheet
        onClose={() => setOpenBottomList(false)}
        triggerComponent={<></>}
      >
        {/* <Mui.MenuItem
          onClick={() => {
            setAnchorEl(null);
            setActiveInvoiceId({
              activeInvoiceId: activeItem?.id,
            });
            navigate(`/invoice-unapproved-pdf?id=${activeItem?.id}`, {
              state: {
                id: activeItem?.customer_id,
                type: 'unApproved',
                params: 5,
              },
            });
          }}
        >
          Approve This Invoice
        </Mui.MenuItem> */}
        <Mui.MenuItem
          onClick={() => {
            EditInvoice();
          }}
        >
          Edit This Invoice
        </Mui.MenuItem>
        <hr />
        <Mui.MenuItem
          onClick={() => {
            CancelInvoice();
          }}
        >
          Cancel This Invoice
        </Mui.MenuItem>
      </SelectBottomSheet>

      <DialogContainer
        title="Invoice Summary"
        body={summaryContent()}
        open={openSummary}
        onCancel={onCloseSummary}
        onSubmit={onReviewInvoice}
        maxWidth="lg"
        submitText="Review Invoice"
      />

      {/* <ApproveDeclineDialog
        open={openApproveDialog}
        onCancel={onReviewInvoiceClose}
        onApprove={approveInvoice}
        onDecline={declineInvoice}
      /> */}

      <ConfirmMessageDialog
        open={openConfirmMessage}
        onSubmit={() => {
          changeSubView('');
        }}
        onCancel={() => {
          changeSubView('');
        }}
        submitText="Return to Dashboard"
        title="Successfully Approved"
        message="Your Invoice has been approved"
        info="You can now dispatch the invoice to the customer"
      />

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
            ApproveInvoice();
          }}
        >
          Approve This Invoice
        </Mui.MenuItem>
        <Mui.MenuItem
          onClick={() => {
            EditInvoice();
          }}
        >
          Edit This Invoice
        </Mui.MenuItem>
        <hr />
        <Mui.MenuItem
          onClick={() => {
            CancelInvoice();
          }}
        >
          Cancel This Invoice
        </Mui.MenuItem>
      </Mui.Menu>

      <ReceivablesPopOver
        open={drawer.deletePopup}
        handleClose={() =>
          setDrawer((prev) => ({ ...prev, deletePopup: false }))
        }
        position="center"
      >
        <div className={css.effortlessOptions}>
          <h3>Cancel this Invoice</h3>
          <p>Are you sure you want to Cancel this Invoice?</p>
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
              onClick={() =>
                setDrawer((prev) => ({ ...prev, deletePopup: false }))
              }
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              className={`${css.primary}`}
              style={{
                padding: '15px 35px',
                textTransform: 'initial',
                width: 'auto',
              }}
              onClick={() => {
                declineInvoice(activeItem?.id);
              }}
            >
              &nbsp; OK &nbsp;
            </Button>
          </div>
        </div>
      </ReceivablesPopOver>
      {havePermission.open && (
        <PermissionDialog onClose={() => havePermission.back()} />
      )}
    </div>
  );
};

export default UnApprovedInvoiceContainer;
