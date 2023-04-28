/* eslint-disable no-unused-vars */
/* eslint-disable no-unneeded-ternary */

/* @flow */
/**
 * @fileoverview  Create Edit Invoice Container
 */

import React, { useState, useEffect, useContext } from 'react';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
// import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
// import MoreVertIcon from '@mui/icons-material/MoreVert';
import PageTitle from '@core/DashboardView/PageTitle';
import cssDash from '@core/DashboardView/DashboardViewContainer.scss';
import Checkbox from '@components/Checkbox/Checkbox.jsx';
import DialogContainer from '@components/DialogContainer/DialogContainer.jsx';
import RestApi, { METHOD, BASE_URL } from '@services/RestApi.jsx';
import SearchIcon from '@material-ui/icons/Search';
import ConfirmMessageDialog from '@core/InvoiceView/ConfirmMessageDialog';
import RecurringInvoiceDialog from '@core/InvoiceView/RecurringInvoiceDialog';
import RecurringInvoiceConfirm from '@core/InvoiceView/RecurringInvoiceConfirm';
import CreateInvoiceTemplate from '@core/InvoiceView/CreateInvoiceTemplate';
import * as Mui from '@mui/material';
import * as MuiIcons from '@mui/icons-material';
import { makeStyles, Chip } from '@material-ui/core';
import themes from '@root/theme.scss';
import { styled } from '@mui/material/styles';
import downArrowBlack from '@assets/downArrowBlack.svg';
import {
  DataGridPro,
  GridFilterPanel,
  GridColumnMenuContainer,
  SortGridMenuItems,
  // HideGridColMenuItem,
  // GridColumnsMenuItem,
  GridFilterMenuItem,
  // GridToolbar,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid-pro';
import Paper from '@mui/material/Paper';
import Button from '@material-ui/core/Button';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer.jsx';
import { FormattedAmount } from '@components/formattedValue/FormattedValue';
// import { DataGrid } from '@mui/x-data-grid';
// import DataGrid from '@components/DataGrid/CustomDataGrid';
import { PermissionDialog } from '@components/Permissions/PermissionDialog.jsx';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import AppContext from '@root/AppContext.jsx';
import { OnlyDatePicker } from '@components/DatePicker/DatePicker.jsx';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet.jsx';
import * as Router from 'react-router-dom';
import ReceivablesPopOver from '../Receivables/Components/ReceivablesPopover';
import Calender from './Calander';

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
    maxWidth: '45% !important',
    margin: '0 6px 0 0',
    background: '#fdf1e6',
    color: themes.colorPrimaryButton,
    border: `1px solid ${themes.colorPrimaryButton}`,
    borderRadius: '25px',
    marginBottom: '15px',
  },
  formControl: {
    width: '100%',
  },
}));

const UndispatchedInvoiceContainer = () => {
  const device = localStorage.getItem('device_detect');
  const {
    organization,
    user,
    changeSubView,
    enableLoading,
    openSnackBar,
    setActiveInvoiceId,
    loading,
    userPermissions,
  } = useContext(AppContext);
  const classes = useStyles();
  const Puller = styled(Mui.Box)(() => ({
    width: '50px',
    height: 6,
    backgroundColor: '#C4C4C4',
    borderRadius: 3,
    position: 'absolute',
    top: 8,
    left: 'calc(50% - 15px)',
  }));
  const [openSummary, setOpenSummary] = useState(false);
  const [draftInvoiceDesktop, setDraftInvoiceDesktop] = useState({});
  const [draftInvoice, setDraftInvoice] = useState([]);

  const [activeItem, setActiveItem] = useState({});
  const [deliveryDate, setDeliveryDate] = useState('');
  const [openSendDialog, setOpenSendDialog] = useState(false);
  const [openConfirmMessage, setOpenConfirmMessage] = useState(false);
  const [openRecurringInvoice, setOpenRecurringInvoice] = useState(false);
  const [openRecurringInvoiceConfirm, setOpenRecurringInvoiceConfirm] =
    useState(false);
  const [openCreateInvoiceTemplate, setOpenCreateInvoiceTemplate] =
    useState(false);
  const [drawerSort, setDrawerSort] = React.useState(false);
  const [customerDrawer, setCustomerDrawer] = React.useState(false);
  const [typeDrawer, setTypeDrawer] = React.useState(false);
  const [statusDrawer, setStatusDrawer] = React.useState(false);

  const [value, setValue] = React.useState('');
  const [customerList, setCustomerList] = React.useState([]);
  const [customerID, setCustomerID] = React.useState([]);
  const [orderOfValue, setOrderOfValue] = React.useState(false);
  const [orderBy, setOrderBy] = React.useState('');
  const [sortValue, setSortValue] = React.useState('');
  const [statusValue, setStatusValue] = React.useState('');
  const [typeValue, setTypeValue] = React.useState('');
  const [toDate, setToDate] = useState(null);
  // const [Data, setData] = useState([]);
  const [editSingle, setEditSingle] = useState('');
  const [query, setQuery] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [drawer, setDrawer] = useState({
    startDate: false,
    endDate: false,
    deletePopup: false,
  });
  const [anchorElFor, setAnchorElFor] = React.useState({
    sort: null,
    date: null,
    status: null,
    type: null,
    customerList: null,
    downlaod: null,
  });
  // const [columnHeader, setColumnHeader] = React.useState('');
  const [pagination, setPagination] = React.useState({
    currentPage: 1,
    totalPage: 1,
  });
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

  const [webValue, setWebValue] = React.useState({
    fromDate: null,
    toDate: null,
    customerID: [],
    orderBy: null,
  });
  const { state } = Router.useLocation();
  const navigate = Router.useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const onTriggerDrawer = (name) => {
    setDrawer((d) => ({ ...d, [name]: true }));
  };
  const [downlaodPDF, setDownloadPDF] = React.useState({
    month: new Date(),
    year: new Date(),
  });

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

  const handleStartDate = (val) => {
    setFromDate(val);
    setDrawer((d) => ({ ...d, startDate: false }));
  };

  const handleEndDate = (val) => {
    setToDate(val);
    setDrawer((d) => ({ ...d, endDate: false }));
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
    ).then((res) => {
      enableLoading(false);
      if (res && !res.error) {
        setCustomerList(res.data);
      } else {
        openSnackBar({
          message: res.message || 'Unknown error occured',
          type: MESSAGE_TYPE.ERROR,
        }).catch((err) => {
          enableLoading(false);
          openSnackBar({
            message: err.message || 'Unknown error occured',
            type: MESSAGE_TYPE.ERROR,
          });
        });
      }
    });
  };

  React.useEffect(() => {
    custListCall();
  }, [organization.orgId, user.activeToken]);

  const onOpenRecurringInvoice = () => {
    setOpenRecurringInvoice(true);
  };

  const fetchInvoice = (numPage, id_s_1, id_s_2) => {
    // enableLoading(true);
    let filter = '';
    let dateFilter = '';
    if (customerID && customerID.length === 1) {
      filter += `customer_id=${customerID || ''}`;
    } else if (customerID && customerID.length > 1) {
      customerID.forEach((v) => {
        filter += `customer_ids[]=${v}&`;
      });
    } else if (id_s_1 && !id_s_2) {
      filter += `customer_id=${id_s_1 || ''}`;
    }

    if (id_s_1 && id_s_2) {
      dateFilter += `start_date=${id_s_1}&end_date=${id_s_2}`;
    }
    RestApi(
      `organizations/${
        organization.orgId
      }/invoices/approved?type=${typeValue}&status=${
        statusValue && statusValue?.value
      }&order=${value}&order_by=${orderBy}&${filter || ''}&${
        dateFilter
          ? dateFilter
          : `start_date=${
              fromDate ? moment(fromDate).format('YYYY-MM-DD') : ''
            }&end_date=${toDate ? moment(toDate).format('YYYY-MM-DD') : ''}`
      }&page=${numPage || 1}`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error) {
        if (res.data) {
          setPagination({ currentPage: res?.page, totalPage: res?.pages });
          if (numPage > 1 && !state?.people) {
            setDraftInvoice((prev) => [...prev, ...res?.data]);
          } else {
            setDraftInvoice(res.data.map((c) => c));
          }
          // setDraftInvoiceDesktop(res.data.map((c) => c));
        } else if (res.message) {
          setDraftInvoice([]);
          // setDraftInvoiceDesktop([]);
          openSnackBar({
            message: res.message || 'Unknown error occured',
            type: MESSAGE_TYPE.ERROR,
          });
        }
        enableLoading(false);
      } else {
        enableLoading(false);
        openSnackBar({
          message: res.message || 'Unknown error occured',
          type: MESSAGE_TYPE.ERROR,
        });
      }
    });
  };

  React.useEffect(() => {
    if (pagination.totalPage > 1) {
      if (pagination?.currentPage < pagination?.totalPage) {
        setTimeout(() => {
          fetchInvoice(pagination?.currentPage + 1);
        }, 1000);
      }
    }
  }, [pagination.totalPage, pagination.currentPage]);

  const cancelInvoice = (id) => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/invoices/${id}/cancellations`,
      {
        method: METHOD.POST,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error) {
        setDrawer((prev) => ({ ...prev, deletePopup: false }));
        fetchInvoice();
        enableLoading(false);
        setTimeout(() => {
          openSnackBar({
            message: 'Invoice Cancelled Successfully',
            type: MESSAGE_TYPE.INFO,
          });
        }, 1000);
      } else {
        openSnackBar({
          message:
            Object.values(res.errors).join(', ') ||
            res?.message ||
            'Sorry Something went wrong',
          type: MESSAGE_TYPE.ERROR,
        });
        enableLoading(false);
      }
    });
  };

  const onDownloadPdf = () => {
    enableLoading(true);
    fetch(
      `${BASE_URL}/organizations/${
        organization.orgId
      }/gstr1_reports?month=${downlaodPDF.month.toLocaleString('default', {
        month: 'short',
      })}&year=${moment(downlaodPDF.year).format('yyyy')}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'GSTR';
        document.body.appendChild(a);
        a.click();
        a.remove();
        enableLoading(false);
      });
  };

  const createRecurringInvoice = ({ startDate, endDate, dayOfCreation }) => {
    RestApi(`organizations/${organization.orgId}/customer_agreements`, {
      method: METHOD.POST,
      payload: {
        approved_invoice_id: activeItem.id,
        start_date: startDate,
        end_date: endDate,
        day_of_creation: dayOfCreation,
        schedule_type: 'yearly',
      },
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    }).then((res) => {
      if (res && !res.error) {
        setOpenRecurringInvoice(false);
        setDeliveryDate(dayOfCreation);
        setOpenRecurringInvoiceConfirm(true);
      } else {
        openSnackBar({
          message: Object.values(res.errors).join(', '),
          type: MESSAGE_TYPE.ERROR,
        });
      }
    });
  };

  const createInvoiceTemplate = (templateName) => {
    RestApi(`organizations/${organization.orgId}/templates`, {
      method: METHOD.POST,
      payload: {
        approved_invoice_id: activeItem.id,
        name: templateName,
      },
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    }).then((res) => {
      if (res && !res.error) {
        changeSubView('');
        openSnackBar({
          message: 'Invoice Template has been created',
          type: MESSAGE_TYPE.INFO,
        });
      } else {
        openSnackBar({
          message: Object.values(res.errors).join(', '),
          type: MESSAGE_TYPE.ERROR,
        });
      }
    });
  };

  useEffect(() => {
    if (state?.people?.id) {
      fetchInvoice(1, state?.people?.id);
    } else if (state?.from === 'dashboard') {
      fetchInvoice(1, state?.fromDate, state?.endDate);
    } else {
      fetchInvoice();
    }
  }, [
    value,
    orderBy,
    customerID,
    fromDate,
    toDate,
    statusValue?.value,
    typeValue,
    state,
  ]);

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
        {activeItem.delivered ? (
          <>
            <div className={css.summaryInfo}>
              <span className={css.label}>TYPE</span>
              <span className={css.value}>
                {
                  INVOICE_TYPES.find(
                    (t) => t.payload === activeItem.document_type,
                  ).text
                }
              </span>
            </div>
            <div className={css.summaryInfo}>
              <span className={css.label}>AMOUNT</span>
              <span className={css.value}>
                {FormattedAmount(activeItem?.invoice_value)}
              </span>
            </div>
            <div className={css.summaryInfo}>
              <span className={css.label}>PRODUCT/SERVICES</span>
              <span className={css.value}>
                {activeItem?.invoice_items?.reduce((acc, val) => {
                  return acc ? `${val.item_name}, ${acc}` : val.item_name;
                }, '')}
              </span>
            </div>
            <Grid
              container
              spacing={3}
              alignItems="center"
              className={css.approveInvoiceForm}
            >
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  className={css.submitButton}
                  fullWidth
                  onClick={() => {
                    setOpenCreateInvoiceTemplate(true);
                  }}
                >
                  Set as Template
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  className={css.submitButton}
                  fullWidth
                  onClick={onOpenRecurringInvoice}
                >
                  Recurring Invoice
                </Button>
              </Grid>
            </Grid>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    );
  };

  const onOpenSendDialog = () => {
    setOpenSendDialog(true);
  };

  const titles = [
    'S.NO',
    'NAME OF THE CUSTOMER',
    'INVOICE ID',
    'CREATED DATE',
    'BILL AMOUNT',
    '',
  ];

  const onDateChangeFrom = (e) => {
    setWebValue((prev) => ({
      ...prev,
      fromDate: e,
      toDate: webValue.toDate,
    }));
  };

  const onDateChangeto = (e) => {
    setWebValue((prev) => ({
      ...prev,
      fromDate: webValue.fromDate,
      toDate: e,
    }));
  };

  const onMonthChange = (e) => {
    setDownloadPDF({ month: e.toDate(), year: e.toDate() });
  };

  const onYearChange = (e) => {
    setDownloadPDF({
      month: downlaodPDF.month,
      year: e.format('yyyy'),
    });
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
  const InvoiceType = [
    { value: 'tax_invoice', label: 'Tax Invoice' },
    { value: 'estimate', label: 'Estimate' },
    { value: 'credit_note', label: 'Credit Note' },
    { value: 'debit_note', label: 'Debit Note' },
  ];
  const StatusSelect = [
    { value: 'approved', label: 'Approved' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

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
      navigate(`/invoice-approved-pdf?id=${val?.id}`, {
        state: {
          id: val?.customer_id,
          type: 'approved',
          name: val?.customer_name,
          documentType: val?.document_type,
          startDateDef: val?.date,
          approvedAccess: userRoles,
        },
      });
    }
  };

  const WebCancel = () => {
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

  const approvedColumn = [
    {
      field: 'invoice_number',
      headerName: 'Invoice Number',
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
      maxWidth: 110,
      width: 100,
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
      // width: 340,
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
      minWidth: 150,
      sortable: false,
    },
    {
      field: 'created_at',
      headerName: 'Invoice Date',
      type: 'date',
      valueFormatter: (params) => moment(params.row?.date).format('DD-MM-YYYY'),
      renderCell: (params) => {
        return (
          <div
            onClick={() => {
              setEditSingle(params.row);
              handleRowSelection(params.row);
            }}
          >
            <p style={{ whiteSpace: 'break-spaces' }}>
              {moment(params.row?.date).format('DD-MM-YYYY')}
            </p>
          </div>
        );
      },
      maxWidth: 100,
    },
    {
      field: 'invoice_value',
      headerName: 'Invoice Value',
      type: 'number',
      headerClassName: 'left-align--header',
      // valueFormatter: (params) => Number(params.row?.invoice_value)?.('en-IN'),
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
      maxWidth: 120,
      width: 100,
      align: 'right',
    },
    {
      field: 'generator_name',
      headerName: 'Created By',
      renderCell: (params) => {
        return (
          <div
            onClick={() => {
              setEditSingle(params.row);
              handleRowSelection(params.row);
            }}
          >
            <p style={{ whiteSpace: 'break-spaces' }}>
              {params.row?.generator_name}
            </p>
          </div>
        );
      },
      maxWidth: 120,
      width: 100,
      sortable: false,
    },
    {
      field: 'approved_date',
      headerName: 'Approved On',
      type: 'date',
      valueFormatter: (params) =>
        moment(params.row?.approved_date).format('DD-MM-yyyy'),
      renderCell: (params) => {
        return (
          <div
            onClick={() => {
              setEditSingle(params.row);
              handleRowSelection(params.row);
            }}
          >
            <p style={{ whiteSpace: 'break-spaces' }}>
              {moment(params.row?.approved_date).format('DD-MM-yyyy')}
            </p>
          </div>
        );
      },
      maxWidth: 100,
    },
    {
      field: 'approver_name',
      headerName: 'Approved By',
      renderCell: (params) => {
        return (
          <div
            onClick={() => {
              setEditSingle(params.row);
              handleRowSelection(params.row);
            }}
          >
            <p style={{ whiteSpace: 'break-spaces' }}>
              {params.row?.approver_name}
            </p>
          </div>
        );
      },
      maxWidth: 120,
      width: 100,
      sortable: false,
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
                setEditSingle(params.row);
                setActiveItem(params.row);
                setAnchorEl(event.currentTarget);
                // onTriggerDrawer('draftInvoiceDrawer');
              }}
            >
              <MuiIcons.MoreVert sx={{ width: '15px' }} />
            </Mui.IconButton>
          </>
        );
      },
      maxWidth: 20,
      sortable: false,
      align: 'right',
      disableExport: true,
    },
  ];

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
    const [customerListPro, setCustomerListPro] = React.useState([]);

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

    return (
      <>
        {headCol === 'customer_name' && (
          <div>
            <div className={css.searchFilterPro}>
              <SearchIcon style={{ color: '#af9d9d' }} />{' '}
              <input
                placeholder="Search for Customer"
                onChange={(event) => {
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
        {/* {headCol === 'document_type' && <p>for_invoice_type</p>} */}
        {(headCol === 'invoice_number' ||
          headCol === 'invoice_value' ||
          headCol === 'created_at' ||
          headCol === 'generator_name' ||
          headCol === 'approved_date' ||
          headCol === 'approver_name' ||
          headCol === 'document_type') && <GridFilterPanel />}
      </>
    );
  };

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
    <>
      <PageTitle
        title="Invoices Raised"
        onClick={() => {
          if (state?.people) {
            navigate('/people', { state: { choose: 'tab1' } });
          } else {
            navigate(-1);
          }
        }}
      />
      <div
        className={
          device === 'mobile'
            ? cssDash.dashboardBodyContainerhideNavBar
            : cssDash.dashboardBodyContainerDesktop
        }
      >
        <div className={css.draftInvoiceContainer} style={{ height: '100%' }}>
          <Mui.Grid
            container
            className={
              device === 'mobile' ? css.container : css.containerDesktop
            }
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
                        <Mui.Grid className={css.heading}>
                          Invoices Raised
                        </Mui.Grid>
                        <Mui.Divider
                          className={css.divider}
                          variant="fullWidth"
                        />{' '}
                      </Mui.Stack>
                    </Mui.Stack>
                  )}

                  <Mui.Stack
                    direction="row"
                    style={{ justifyContent: 'space-between' }}
                  >
                    <div
                      className={css.mainButton}
                      style={{
                        justifyContent:
                          device === 'mobile' ? 'flex-start' : 'end',
                        padding:
                          device === 'mobile'
                            ? '5px 0px 5px 0px'
                            : '5px 40px 5px 20px',
                      }}
                    >
                      <Mui.Stack
                        direction="row"
                        spacing={2}
                        style={{
                          width: device === 'mobile' ? '100%' : '60%',
                          overflow: 'overlay',
                          marginBottom: device === 'mobile' ? '' : '-20px',
                          // desktop to hide
                          display: device === 'mobile' ? '' : 'none',
                        }}
                      >
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
                                  {/* <hr className={css.DividerFilter} /> */}

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
                                              : moment(
                                                  webValue.fromDate,
                                                ).format('DD MMM YYYY')
                                          }
                                          style={{
                                            width: '100%',
                                            border: 'none',
                                            padding: 5,
                                          }}
                                        />
                                        <OnlyDatePicker
                                          selectedDate={webValue.fromDate}
                                          onChange={onDateChangeFrom}
                                        />
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
                                          value={
                                            webValue.toDate === null
                                              ? 'dd-mm-yy'
                                              : moment(webValue.toDate).format(
                                                  'DD MMM YYYY',
                                                )
                                          }
                                        />
                                        <OnlyDatePicker
                                          selectedDate={webValue.toDate}
                                          onChange={onDateChangeto}
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
                                        ? 'dd-mm-yyyy'
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
                                    onTrigger={onTriggerDrawer}
                                    onClose={() => {
                                      setDrawer((d) => ({
                                        ...d,
                                        startDate: false,
                                      }));
                                    }}
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
                                        ? 'dd-mm-yyyy'
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
                                    onTrigger={onTriggerDrawer}
                                    onClose={() => {
                                      setDrawer((d) => ({
                                        ...d,
                                        endDate: false,
                                      }));
                                    }}
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
                                  //   setQuery('');
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
                                  >
                                    <SearchIcon
                                      className={css.searchFilterIcon}
                                    />{' '}
                                    <input
                                      placeholder="Search for Customer"
                                      onChange={(event) => {
                                        setQuery(event.target.value);
                                        if (event?.target?.value?.length > 2) {
                                          custListCall(event.target.value);
                                        }
                                        if (
                                          event?.target?.value?.length === 0
                                        ) {
                                          custListCall();
                                        }
                                      }}
                                      value={query}
                                      className={css.searchFilterInput}
                                    />
                                  </div>

                                  <ul
                                    className={css.optionsWrapper}
                                    style={{
                                      maxHeight: '18rem',
                                      overflow: 'auto',
                                    }}
                                  >
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
                                                  event.persist();
                                                  setWebValue((prev) => ({
                                                    ...prev,
                                                    customerID:
                                                      (webValue?.customerID?.includes(
                                                        event?.target?.value,
                                                      ) &&
                                                        webValue?.customerID?.filter(
                                                          (item) =>
                                                            item !==
                                                            event?.target
                                                              ?.value,
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
                                  </ul>
                                  <Mui.Button
                                    contained
                                    className={css.ApplyFilterButton}
                                    onClick={() => {
                                      setCustomerID(webValue.customerID);
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
                              {customerList?.length > 0 &&
                                customerList?.map((e) => (
                                  <li className={css.items} aria-hidden="true">
                                    <FormControlLabel
                                      style={{ textTransform: 'capitalize' }}
                                      value={e?.id}
                                      control={
                                        <Checkbox
                                          style={{ color: '#F08B32' }}
                                          checked={customerID?.includes(e?.id)}
                                          onChange={(event) => {
                                            setCustomerID(
                                              (customerID?.includes(
                                                event.target.value,
                                              ) &&
                                                customerID?.filter(
                                                  (item) =>
                                                    item !== event.target.value,
                                                )) || [
                                                ...customerID,
                                                event.target.value,
                                              ],
                                            );
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
                            </ul>
                          </div>
                        </SelectBottomSheet>
                        <>
                          <div
                            className={
                              device === 'mobile'
                                ? css.monthSelection
                                : css.dropdnDesktopIR
                            }
                            style={{
                              display: 'flex',
                              justifyContent: 'space-around',
                              alignItems: 'center',
                              width: 110,
                            }}
                            onClick={(event) => {
                              if (device === 'mobile') {
                                setTypeDrawer(true);
                              } else {
                                setAnchorElFor({
                                  sort: null,
                                  date: null,
                                  type: event.currentTarget,
                                });
                              }
                            }}
                          >
                            <div className={css.text}>Type</div>
                            <img
                              src={downArrowBlack}
                              alt="arrow"
                              className={css.icon}
                            />
                          </div>
                          <Mui.Popover
                            id="basic-menu-list"
                            anchorEl={anchorElFor.type}
                            open={Boolean(anchorElFor.type)}
                            onClose={() =>
                              setAnchorElFor({ ...anchorElFor, type: null })
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
                            <Mui.Stack className={css.drawer}>
                              <p className={css.heading}>Invoice Type</p>
                              {InvoiceType.map((c) => {
                                return (
                                  <>
                                    <Mui.Typography
                                      className={css.text}
                                      onClick={() => {
                                        setTypeDrawer(false);
                                        setTypeValue(c?.value);
                                        setAnchorElFor({
                                          ...anchorElFor,
                                          type: null,
                                        });
                                      }}
                                    >
                                      {c?.label}
                                    </Mui.Typography>
                                    <Mui.Divider />
                                  </>
                                );
                              })}
                            </Mui.Stack>
                          </Mui.Popover>
                        </>

                        <SelectBottomSheet
                          open={typeDrawer}
                          addNewSheet
                          onClose={() => {
                            setTypeDrawer(false);
                          }}
                          triggerComponent={<div style={{ display: 'none' }} />}
                        >
                          <Mui.Stack className={css.drawer}>
                            <Puller />
                            <p className={css.heading}>Invoice Type</p>
                            {InvoiceType.map((c) => {
                              return (
                                <>
                                  <Mui.Typography
                                    className={css.text}
                                    onClick={() => {
                                      setTypeDrawer(false);
                                      setTypeValue(c?.value);
                                    }}
                                  >
                                    {c?.label}
                                  </Mui.Typography>
                                  <Mui.Divider />
                                </>
                              );
                            })}
                          </Mui.Stack>
                        </SelectBottomSheet>

                        <>
                          <div
                            className={
                              device === 'mobile'
                                ? css.monthSelection
                                : css.dropdnDesktopIR
                            }
                            style={{
                              display: 'flex',
                              justifyContent: 'space-around',
                              alignItems: 'center',
                              width: 110,
                            }}
                            onClick={(event) => {
                              if (device === 'mobile') {
                                setStatusDrawer(true);
                              } else {
                                setAnchorElFor({
                                  sort: null,
                                  date: null,
                                  type: null,
                                  status: event?.target,
                                });
                              }
                            }}
                          >
                            <div className={css.text}>Status</div>
                            <img
                              src={downArrowBlack}
                              alt="arrow"
                              className={css.icon}
                            />
                          </div>
                          <Mui.Popover
                            id="basic-menu-list"
                            anchorEl={anchorElFor.status}
                            open={Boolean(anchorElFor.status)}
                            onClose={() =>
                              setAnchorElFor({ ...anchorElFor, status: null })
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
                            <Mui.Stack className={css.drawer}>
                              <p className={css.heading}>Invoice Status</p>
                              {[
                                { label: 'Approved', value: 'approved' },
                                { label: 'Cancelled', value: 'cancelled' },
                              ].map((c) => {
                                return (
                                  <>
                                    <Mui.Typography
                                      className={css.text}
                                      onClick={() => {
                                        setStatusDrawer(false);
                                        setStatusValue(c);
                                        setAnchorElFor({
                                          ...anchorElFor,
                                          status: null,
                                        });
                                      }}
                                    >
                                      {c?.label}
                                    </Mui.Typography>
                                    <Mui.Divider />
                                  </>
                                );
                              })}
                            </Mui.Stack>
                          </Mui.Popover>
                        </>

                        <SelectBottomSheet
                          open={statusDrawer}
                          addNewSheet
                          onClose={() => {
                            setStatusDrawer(false);
                          }}
                          triggerComponent={<div style={{ display: 'none' }} />}
                        >
                          <Mui.Stack className={css.drawer}>
                            <Puller />
                            <p className={css.heading}>Invoice Status</p>
                            {[
                              { label: 'Approved', value: 'approved' },
                              { label: 'Cancelled', value: 'cancelled' },
                            ].map((c) => {
                              return (
                                <>
                                  <Mui.Typography
                                    className={css.text}
                                    onClick={() => {
                                      setStatusDrawer(false);
                                      setStatusValue(c);
                                    }}
                                  >
                                    {c?.label}
                                  </Mui.Typography>
                                  <Mui.Divider />
                                </>
                              );
                            })}
                          </Mui.Stack>
                        </SelectBottomSheet>
                      </Mui.Stack>
                      <Mui.Stack
                        className={css.ForWebDownload}
                        style={{
                          width: device === 'desktop' ? 'auto' : '91px',
                        }}
                      >
                        {device === 'desktop' && (
                          <>
                            <Mui.Button
                              className={css.viewSampleBtn}
                              onClick={(event) => {
                                setAnchorElFor({
                                  sort: null,
                                  download: event.currentTarget,
                                  date: null,
                                  customerList: null,
                                });
                              }}
                              disableElevation
                              disableTouchRipple
                              disableFocusRipple
                            >
                              Download GSTR1 Report
                            </Mui.Button>
                            <Mui.Popover
                              id="basic-menu-list"
                              anchorEl={anchorElFor.download}
                              open={Boolean(anchorElFor.download)}
                              onClose={() =>
                                setAnchorElFor({
                                  ...anchorElFor,
                                  download: null,
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
                                <span>Download GSTR1 Reports</span>
                                <hr className={css.forline} />

                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-around',
                                    marginBottom: '20px',
                                  }}
                                >
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
                                      Select Month
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
                                        value={downlaodPDF.month.toLocaleString(
                                          'default',
                                          { month: 'short' },
                                        )}
                                        style={{
                                          width: '100%',
                                          border: 'none',
                                          padding: 5,
                                        }}
                                      />
                                      <OnlyDatePicker
                                        selectedDate={
                                          new Date(
                                            moment(downlaodPDF.year).format(
                                              'YYYY',
                                            ),
                                            new Date(
                                              downlaodPDF.month,
                                            ).getMonth(),
                                            new Date().getDate(),
                                          )
                                        }
                                        onChange={onMonthChange}
                                        id="month"
                                      />
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
                                      Select Year
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
                                        value={moment(downlaodPDF.year).format(
                                          'YYYY',
                                        )}
                                      />
                                      <OnlyDatePicker
                                        selectedDate={downlaodPDF.year}
                                        onChange={onYearChange}
                                        id="year"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <Mui.Button
                                  contained
                                  style={{
                                    backgroundColor: '#F08B32',
                                    color: '#fff',
                                    margin: '20px 25%',
                                    width: '50%',
                                    borderRadius: 25,
                                  }}
                                  disableElevation
                                  disableTouchRipple
                                  disableFocusRipple
                                  onClick={() => {
                                    onDownloadPdf();
                                    setAnchorElFor({
                                      ...anchorElFor,
                                      download: null,
                                    });
                                  }}
                                >
                                  Download
                                </Mui.Button>
                              </div>
                            </Mui.Popover>
                          </>
                        )}
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
                                  display:
                                    device === 'mobile' ? 'flex' : 'none',
                                  justifyContent: 'space-around',
                                  alignItems: 'center',
                                  alignSelf: 'flex-start',
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
                                  <ul
                                    className={css.optionsWrapper}
                                    style={{
                                      height: '20rem',
                                      overflow: 'auto',
                                    }}
                                  >
                                    {[
                                      'Name Ascending',
                                      'Name Descending',
                                      'Amount Ascending',
                                      'Amount Descending',
                                      'Date Ascending',
                                      'Date Descending',
                                    ].map((e) => (
                                      <li
                                        className={css.items}
                                        aria-hidden="true"
                                      >
                                        <RadioGroup
                                          value={sortValue}
                                          onChange={(event) => {
                                            setSortValue(event.target.value);
                                          }}
                                        >
                                          <FormControlLabel
                                            value={e}
                                            control={
                                              <Radio
                                                style={{ color: '#F08B32' }}
                                              />
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
                                        temp[1] === 'Ascending'
                                          ? 'asc'
                                          : 'desc',
                                      );
                                      setOrderBy(temp[0].toLowerCase());
                                      setAnchorElFor({
                                        ...anchorElFor,
                                        sort: null,
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
                                      const temp =
                                        event.target.value.split(' ');
                                      setSortValue(event.target.value);
                                      setValue(
                                        temp[1] === 'Ascending'
                                          ? 'asc'
                                          : 'desc',
                                      );
                                      setOrderBy(temp[0].toLowerCase());
                                    }}
                                    onClick={() => setDrawerSort(false)}
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
                          </div>
                        </SelectBottomSheet>
                      </Mui.Stack>
                    </div>
                  </Mui.Stack>
                  <div
                    className={css.rowFilter}
                    style={{
                      display:
                        customerID?.length > 0 ||
                        (toDate && fromDate) ||
                        typeValue ||
                        sortValue ||
                        statusValue
                          ? // desktop to hide
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
                        <Chip
                          className={classes.selectedchips}
                          label={`${moment(fromDate, 'YYYY-MM-DD').format(
                            'MMM DD',
                          )} - ${moment(toDate, 'YYYY-MM-DD').format(
                            'MMM DD, YYYY',
                          )}`}
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

                    {typeValue && (
                      <div className={css.orangeList}>
                        <Chip
                          className={classes.selectedchips}
                          label={`${
                            InvoiceType.find((val) => val.value === typeValue)
                              .label
                          }`}
                          variant="outlined"
                          onDelete={() => {
                            setTypeValue('');
                          }}
                        />
                      </div>
                    )}

                    {statusValue && (
                      <div className={css.orangeList}>
                        <Chip
                          className={classes.selectedchips}
                          label={`${statusValue?.label}`}
                          variant="outlined"
                          onDelete={() => {
                            setStatusValue('');
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

                  {(device === 'mobile' &&
                    (draftInvoice && draftInvoice?.length === 0 ? (
                      <Grid item xs={12} className={css.draftInfo}>
                        <Mui.Typography align="center">
                          No Invoices found!!!
                        </Mui.Typography>
                      </Grid>
                    ) : (
                      draftInvoice?.map((d) => (
                        <Mui.Stack
                          direction="row"
                          width="100%"
                          justifyContent="space-between"
                          style={{ marginTop: '0px' }}
                          className={css.box}
                          onClick={() => {
                            handleRowSelection(d);
                          }}
                        >
                          <Item
                            style={{
                              width: '100%',
                              padding: '10px 20px',
                              borderRadius: '0px',
                            }}
                          >
                            <Mui.Stack
                              direction="row"
                              justifyContent="space-between"
                              className={css.contentSpace}
                            >
                              <Mui.Grid className={css.contentName}>
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
                              <Mui.Grid className={css.date}>
                                {d?.invoice_number}
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

                  {device === 'desktop' && draftInvoice && (
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
                        columns={approvedColumn}
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
                  )}
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
                WebCancel();
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
                    // setTimeout(() => {
                    cancelInvoice(activeItem?.id);
                    // }, 1000);
                  }}
                >
                  &nbsp; OK &nbsp;
                </Button>
              </div>
            </div>
          </ReceivablesPopOver>

          <DialogContainer
            title="Invoice Summary"
            body={summaryContent()}
            open={openSummary}
            onSubmit={activeItem.delivered ? undefined : onOpenSendDialog}
            maxWidth="lg"
            submitText="Dispatch Invoice"
          />

          <RecurringInvoiceDialog
            open={openRecurringInvoice}
            onSubmit={createRecurringInvoice}
            onCancel={() => {
              setOpenRecurringInvoice(false);
            }}
          />

          <CreateInvoiceTemplate
            open={openCreateInvoiceTemplate}
            onSubmit={createInvoiceTemplate}
            onCancel={() => {
              setOpenCreateInvoiceTemplate(false);
            }}
          />

          <RecurringInvoiceConfirm
            open={openRecurringInvoiceConfirm}
            onSubmit={() => {
              changeSubView('');
            }}
            onCancel={() => {
              setOpenRecurringInvoiceConfirm(false);
            }}
            dayOfDelivery={deliveryDate}
            invoiceId={activeItem.id}
          />

          <ConfirmMessageDialog
            open={openConfirmMessage}
            onSubmit={() => {
              changeSubView('');
            }}
            onCancel={() => {
              changeSubView('');
            }}
            submitText="Return to Dashboard"
            title="Invoice Dispatched"
            message="Your Invoice has been sent"
            info=""
          />
        </div>
      </div>
      {havePermission.open && (
        <PermissionDialog onClose={() => havePermission.back()} />
      )}
    </>
  );
};

export default UndispatchedInvoiceContainer;
