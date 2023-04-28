/* eslint-disable no-lonely-if */

import React, { useContext, useEffect, useState } from 'react';
import { OnlyDatePicker } from '@components/DatePicker/DatePicker.jsx';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import Button from '@material-ui/core/Button';
import RestApi, { METHOD, BASE_URL } from '@services/RestApi.jsx';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer.jsx';
import AppContext from '@root/AppContext.jsx';
import loadinggif from '@assets/loading.gif';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet';
import Checkbox from '@material-ui/core/Checkbox';
import moment from 'moment';
import { withStyles, makeStyles } from '@material-ui/styles';
import { PermissionDialog } from '@components/Permissions/PermissionDialog.jsx';
import JSBridge from '@nativeBridge/jsbridge';
import CalendarIcon from '@mui/icons-material/CalendarToday';

import * as Mui from '@mui/material';
import * as MuiIcon from '@mui/icons-material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
// eslint-disable-next-line import/no-extraneous-dependencies
import { styled } from '@mui/system';
// import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import * as Router from 'react-router-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ReceivablesPopOver from '../Receivables/Components/ReceivablesPopover';
import Calender from './Calander';
import pencilEdit from '../../assets/pencilEdit.svg';
import notes from '../../assets/notes.svg';
import closex from '../../assets/closex.svg';
import download from '../../assets/downns.svg';
import RecurringDateDialog from './RecurringDateDialog';
import DeliverInvoiceToCustomer from './DeliverInvoiceToCustomer';

import css from './CreateInvoiceContainer.scss';

export default function GenerateInvoicePdf() {
  const WhiteBackgroundCheckbox = withStyles((theme) => ({
    root: {
      '& .MuiSvgIcon-root': {
        fill: 'white',
        '&:hover': {
          backgroundColor: 'rgba(153, 158, 165, 0.4)',
        },
      },
      '&$checked': {
        '& .MuiIconButton-label': {
          position: 'relative',
          zIndex: 0,
          border: '1px solid #F08B32',
          borderRadius: 3,
          width: '19px',
          height: '19px',
        },
        '& .MuiIconButton-label:after': {
          content: '""',
          left: 2,
          top: 2,
          height: 15,
          width: 15,
          position: 'absolute',
          backgroundColor: '#F08B32',
          zIndex: -1,
          borderColor: 'transparent',
        },
      },
      '&:not($checked) .MuiIconButton-label': {
        position: 'relative',
        zIndex: 0,
        border: '1px solid #191919',
        borderRadius: 3,
        width: '19px',
        height: '19px',
      },
      '&:not($checked) .MuiIconButton-label:after': {
        content: '""',
        left: 2,
        top: 2,
        height: 15,
        width: 15,
        position: 'absolute',
        backgroundColor: 'white',
        zIndex: -1,
        borderColor: 'transparent',
      },
      '& .MuiSwitch-track': {
        backgroundColor: 'green !important',
      },
    },
    color: theme,
    checked: {},
  }))(Checkbox);

  const useStyles = makeStyles(() => ({
    paper: {
      '& .MuiPaper-root': {
        borderRadius: '20px',
        padding: '10px',
      },
    },
  }));
  const classes = useStyles();

  const {
    organization,
    user,
    changeSubView,
    openSnackBar,
    enableLoading,
    setActiveInvoiceId,
    userPermissions,
    setInvoiceCounts,
  } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [BottomSheet, setBottomSheet] = useState(false);
  const [view, setView] = useState({
    shared: false,
    download: false,
    recurring: false,
  });
  const [style1, setStyle1] = useState(false);
  const [style2, setStyle2] = useState(false);
  const [style3, setStyle3] = useState(false);
  const [style4, setStyle4] = useState(false);
  const [style5, setStyle5] = useState(false);
  const [style6, setStyle6] = useState(false);
  const [style7, setStyle7] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [remainder, setRemainder] = useState(true);
  const [value, setValue] = useState({
    startDate: new Date(),
    endDate: '',
    deletePopup: false,
  });
  const [days, setDays] = useState();
  const [drawer, setDrawer] = useState({
    startDate: false,
    endDate: false,
    datePopup: false,
  });
  const [pdfurl, setPdfUrl] = useState('');
  const navigate = Router.useNavigate();
  const { state } = Router.useLocation();
  const [deliverSheet, setDeliverSheet] = useState(false);
  const [openPop, setOpenPop] = useState(null);
  const [popValue, setPopValue] = useState('');
  const [valueRadio, setValueRadio] = React.useState();
  const [pageNumber, setPageNumber] = useState(1);
  const onDocumentLoadSuccess = (numPages) => {
    setPageNumber(numPages?.numPages);
    setLoading(false);
  };
  const [havePermission, setHavePermission] = React.useState({ open: false });

  React.useEffect(() => {
    //   if (state === null || !organization?.activeInvoiceId) {
    //     if (state?.type === 'draft') {
    //       navigate('/invoice-draft');
    //     } else {
    //       navigate(-1);
    //     }
    //   }
    if (state?.startDateDef && state?.type === 'approved') {
      setValue((prev) => ({
        ...prev,
        startDate: state?.startDateDef,
      }));
    }
  }, [state]);

  const queryParam = new URLSearchParams(window.location.search).get('id');
  const pathName = window.location.pathname;

  React.useEffect(() => {
    if (!queryParam) {
      navigate(-1);
    } else {
      setActiveInvoiceId({
        activeInvoiceId: queryParam,
      });
    }
  }, []);

  const [html, sethtml] = useState();
  const theme = Mui.useTheme();
  const desktopView = Mui.useMediaQuery(theme.breakpoints.up('sm'));
  const handleStartDate = (val) => {
    setValue((prev) => ({
      ...prev,
      startDate: val,
    }));
    setDrawer((d) => ({ ...d, startDate: false }));
  };

  const handleEndDate = (val) => {
    setValue((prev) => ({
      ...prev,
      endDate: val,
    }));
    setDrawer((d) => ({ ...d, endDate: false }));
  };

  const [intialDays, setIntialDays] = useState({
    90: false,
    60: false,
    30: false,
    15: false,
    7: false,
    1: false,
  });

  const daysData = [
    {
      id: 1,
      lable: '90 Days',
      value: 90,
      selected: intialDays[90],
    },
    {
      id: 2,
      lable: '60 Days',
      value: 60,
      selected: intialDays[60],
    },
    {
      id: 3,
      lable: '30 Days',
      value: 30,
      selected: intialDays[30],
    },
    {
      id: 4,
      lable: '15 Days',
      value: 15,
      selected: intialDays[15],
    },
    {
      id: 5,
      lable: '7 Days',
      value: 7,
      selected: intialDays[7],
    },
    {
      id: 6,
      lable: '1 Days',
      value: 1,
      selected: intialDays[1],
    },
  ];
  const [recurringField, setRecurringField] = React.useState({
    id: '',
    popOver: false,
  });
  const [invoiceRes, setInvoiceRes] = React.useState([]);

  React.useEffect(() => {
    setDays(
      Object.entries(intialDays)
        .map(([key, values]) => values && +key)
        .filter(Boolean),
    );
  }, [JSON.stringify(intialDays)]);

  const cliking = (event) => {
    setView((prev) => ({ ...prev, [event]: true }));
  };

  const RecurringApiForId = () => {
    // enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/invoices/${organization.activeInvoiceId}`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error) {
        // enableLoading(false);
        setRecurringField((prev) => ({
          ...prev,
          id: res?.recurring_invoice_id,
        }));
        setInvoiceRes(res);
      } else {
        // enableLoading(false);
        openSnackBar({
          message: Object.values(res.errors).join(', '),
          type: MESSAGE_TYPE.ERROR,
        });
      }
    });
  };

  React.useEffect(() => {
    RecurringApiForId();
  }, []);

  const createRecurringInvoice = () => {
    enableLoading(true);
    RestApi(`organizations/${organization.orgId}/customer_agreements`, {
      method: METHOD.POST,
      payload: {
        approved_invoice_id: organization.activeInvoiceId,
        start_date: moment(value.startDate).format('YYYY-MM-DD'),
        end_date:
          moment(value.endDate).format('YYYY-MM-DD') === 'Invalid date'
            ? null
            : moment(value.endDate).format('YYYY-MM-DD'),
        day_of_creation: popValue,
        schedule_type: 'monthly',
        remainder_dates: value.NumberOfDays,
      },
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    }).then((res) => {
      if (res && !res.error) {
        openSnackBar({
          message: 'Your Contract has been created Successfully',
          type: MESSAGE_TYPE.INFO,
        });
        setBottomSheet(false);
        setView((prev) => ({ ...prev, recurring: false }));
        RecurringApiForId();
        enableLoading(false);
        // setRecurring(false);
        changeSubView('invoiceView');
      } else {
        enableLoading(false);
        openSnackBar({
          message: Object.values(res.errors).join(', '),
          type: MESSAGE_TYPE.ERROR,
        });
      }
    });
  };

  const moreActions = () => {
    setBottomSheet(true);
  };
  const HandlePop = () => {
    setOpenPop(!openPop);
  };

  const device = localStorage.getItem('device_detect');
  useEffect(() => {
    if (device === 'desktop') {
      const myHeaders = new Headers();
      myHeaders.append('Authorization', user.activeToken);
      myHeaders.append(
        'Cookie',
        'ahoy_visit=81beb4a2-ae4e-4414-8e0c-6eddff401f95; ahoy_visitor=8aba61b6-caf3-4ef5-a0f8-4e9afc7d8d0f',
      );

      const requestOptions = {
        method: METHOD.GET,
        headers: myHeaders,
        redirect: 'follow',
      };

      fetch(
        `${BASE_URL}/organizations/${organization.orgId}/invoices/${organization.activeInvoiceId}.html`,
        requestOptions,
      )
        .then((response) => response.text())
        .then((result) => {
          sethtml(result);
        })
        .catch((error) => console.log('error', error));
    } else if (device === 'mobile') {
      const pdfUrlAPI = {
        url: `${BASE_URL}/organizations/${organization.orgId}/invoices/${organization.activeInvoiceId}.pdf`,
        method: 'GET',
        httpHeaders: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      };
      setPdfUrl(pdfUrlAPI);
    }
  }, [device, organization.activeInvoiceId]);

  const pdfGeneration = (type) => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/invoices/${organization.activeInvoiceId}/url?type=pdf`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error) {
        enableLoading(false);
        if (desktopView) {
          window.open(res.pdf, '_blank', 'popup');
        } else {
          JSBridge.shareLink(res, type);
        }
      } else {
        enableLoading(false);
        openSnackBar({
          message: Object.values(res.errors).join(', '),
          type: MESSAGE_TYPE.ERROR,
        });
      }
    });
    // }
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  useEffect(() => {
    setValue((prev) => ({
      ...prev,
      NumberOfDays: days,
      userRemainder: remainder,
      conditionAagreed: agreed,
    }));
  }, [remainder, days, agreed, value.startDate, value.endDate]);

  useEffect(() => {
    if (
      new Date(value.startDate).setHours(0, 0, 0, 0) >=
      new Date(value.endDate).setHours(0, 0, 0, 0)
    ) {
      setValue((v) => ({ ...v, startDate: '' }));
    }
  }, [value.startDate]);

  useEffect(() => {
    if (
      new Date(value.endDate).setHours(0, 0, 0, 0) <=
      new Date(value.startDate).setHours(0, 0, 0, 0)
    ) {
      setValue((v) => ({ ...v, endDate: '' }));
    }
  }, [value.endDate]);

  const onTriggerDrawer = (name) => {
    setDrawer((d) => ({ ...d, [name]: true }));
  };

  const declineInvoice = (reason) => {
    if (state?.type === 'unApproved' && reason === 'edit') {
      if (
        !state?.unApprovedAccess?.Estimate?.edit_estimate &&
        state?.documentType === 'estimate'
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
        !state?.unApprovedAccess?.['Tax Invoice']?.edit_invoices &&
        state?.documentType === 'tax_invoice'
      ) {
        setHavePermission({
          open: true,
          back: () => {
            setHavePermission({ open: false });
          },
        });
        return;
      }
    }
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/invoices/${organization.activeInvoiceId}/declines`,
      {
        method: METHOD.POST,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        if (res && !res.error) {
          if (res.message) {
            if (reason === 'edit') {
              // setOpenBottomList(false);
              setTimeout(() => {
                navigate(`/invoice-draft-new`, { state: { type: 'draft' } });
              }, 100);
            } else {
              openSnackBar({
                message: res.message,
                type: MESSAGE_TYPE.INFO,
              });
              setDrawer((prev) => ({
                ...prev,
                deletePopup: false,
              }));
            }
            enableLoading(false);
          } else {
            if (reason === 'edit') {
              // setOpenBottomList(false);
              setTimeout(() => {
                navigate(`/invoice-draft-new`, { state: { type: 'draft' } });
              }, 500);
            } else {
              openSnackBar({
                message: 'Invoice Declined',
                type: MESSAGE_TYPE.INFO,
              });
            }
            enableLoading(false);
          }
          if (state?.type === 'unApproved') {
            navigate('/invoice-unapproved');
          } else {
            navigate('/invoice');
          }
        } else {
          openSnackBar({
            message: Object.values(res.errors).join(', '),
            type: MESSAGE_TYPE.ERROR,
          });
          enableLoading(false);
        }
      })
      .catch((e) => {
        openSnackBar({
          message: Object.values(e.errors).join(', '),
          type: MESSAGE_TYPE.ERROR,
        });
        enableLoading(false);
      });
  };

  const cancelInvoice = () => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/invoices/${organization.activeInvoiceId}/cancellations`,
      {
        method: METHOD.POST,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error) {
        openSnackBar({
          message: 'Invoice Cancelled',
          type: MESSAGE_TYPE.INFO,
        });
        enableLoading(false);
        // changeSubView('invoiceView');
        // navigate('/invoice');
        if (state?.type === 'estimate') {
          setActiveInvoiceId({
            activeInvoiceId: '',
          });
          navigate('/invoice-estimate');
        }
        if (state?.type === 'approved') {
          navigate('/invoice-approved');
        }
        if (state?.type === 'draft') {
          navigate('/invoice-draft');
        } else {
          setActiveInvoiceId({
            activeInvoiceId: '',
          });
          navigate('/invoice');
        }
      } else {
        openSnackBar({
          message: Object.values(res.errors).join(', '),
          type: MESSAGE_TYPE.ERROR,
        });
        enableLoading(false);
      }
    });
  };

  const AntSwitch = styled(Mui.Switch)(() => ({
    width: 34,
    height: 21,
    padding: 0,
    display: 'flex',
    '&:active': {
      '& .MuiSwitch-thumb': {
        width: 15,
      },
      '& .MuiSwitch-switchBase.Mui-checked': {
        transform: 'translateX(9px)',
      },
    },
    '& .MuiSwitch-switchBase': {
      padding: 2,
      '&.Mui-checked': {
        transform: 'translateX(12px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: '#e86e48e8',
        },
      },
    },
    '& .MuiSwitch-thumb': {
      boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
      width: 17,
      height: 17,
      borderRadius: 10,
    },
    '& .MuiSwitch-track': {
      borderRadius: 16 / 2,
      opacity: 1,
      backgroundColor: '#9c9c9c',
      boxSizing: 'border-box',
    },
  }));

  // const handleChange = (e) => {
  //   setValue((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  // };

  const approveCustomer = () => {
    if (
      !state?.unApprovedAccess?.Estimate?.approve_estimate &&
      state?.documentType === 'estimate'
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
      !state?.unApprovedAccess?.['Tax Invoice']?.approve_invoices &&
      state?.documentType === 'tax_invoice'
    ) {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
      return;
    }
    // console.log('work');
    RestApi(`organizations/${organization.orgId}/invoices/batches/approve`, {
      method: METHOD.POST,
      payload: {
        ids: organization.activeInvoiceId,
      },
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    }).then((res) => {
      if (res && !res.error) {
        // console.log('res', res);
        RestApi(
          `organizations/${organization.orgId}/invoices/dashboard?date=${moment(
            new Date(),
          ).format('YYYY-MM-DD')}`,
          // `organizations/${organization.orgId}/receivables/ageing?date=19/03/2021`,
          {
            method: METHOD.GET,
            headers: {
              Authorization: `Bearer ${user.activeToken}`,
            },
          },
        ).then((resVal) => {
          if (resVal && !resVal.error) {
            setInvoiceCounts(resVal?.invoice_action);
            // enableLoading(false);
          } else if (resVal.error) {
            // enableLoading(false);
            openSnackBar({
              message: resVal.message || 'Unknown error occured',
              type: MESSAGE_TYPE.ERROR,
            });
          }
        });
        changeSubView('unApprovedSuccess');
        navigate('/invoice-unapproved-success', {
          state: { type: 'unApprovedSuccess' },
        });
      } else {
        openSnackBar({
          message: res.message || 'Unknown error occured',
          type: MESSAGE_TYPE.ERROR,
        });
      }
    });
  };

  const estimateToTax = () => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/invoices/${queryParam}/generate_estimate`,
      {
        method: METHOD.POST,
        // payload: {
        //   ids: organization.activeInvoiceId,
        // },
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error) {
        setActiveInvoiceId({
          activeInvoiceId: res?.id,
        });
        openSnackBar({
          message: 'Estimate Invoice Converted into Tax Invoice.',
          type: MESSAGE_TYPE.INFO,
        });
        enableLoading(true);
        // RecurringApiForId();
        setInvoiceRes(res);
        setTimeout(() => {
          if (res?.status === 'unapproved') {
            enableLoading(false);
            navigate(`/invoice-unapproved-pdf?id=${res?.id}`, {
              state: {
                type: 'unApproved',
                name: '',
                converted: true,
                status: res?.status,
              },
            });
          } else {
            enableLoading(false);
            navigate(`/invoice-new-pdf?id=${res?.id}`, {
              state: {
                type: 'unApproved',
                name: '',
                converted: true,
                status: res?.status,
              },
            });
          }
        }, [2000]);
        enableLoading(false);
      } else {
        openSnackBar({
          message: res.message || 'Unknown error occured',
          type: MESSAGE_TYPE.ERROR,
        });
        enableLoading(false);
      }
    });
  };

  const CreateRecurringAccess = () => {
    if (
      !userPermissions?.Invoicing?.['Recurring Invoice']
        ?.create_recurring_invoices
    ) {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
      return;
    }
    if (!recurringField?.id) {
      cliking('recurring');
    } else {
      setRecurringField((prev) => ({ ...prev, popOver: true }));
    }
  };

  const editInvoice = () => {
    if (state?.type === 'approved') {
      if (
        !state?.approvedAccess?.Estimate?.edit_estimate &&
        state?.documentType === 'estimate'
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
        !state?.approvedAccess?.['Tax Invoice']?.edit_invoices &&
        state?.documentType === 'tax_invoice'
      ) {
        setHavePermission({
          open: true,
          back: () => {
            setHavePermission({ open: false });
          },
        });
        return;
      }
    }
    // console.log('work');
    RestApi(
      `organizations/${organization.orgId}/invoices/${organization.activeInvoiceId}/versions`,
      {
        method: METHOD.POST,
        // payload: {
        //   ids: organization.activeInvoiceId,
        // },
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error) {
        setActiveInvoiceId({
          activeInvoiceId: res?.id,
        });
        // navigate('/invoice-draft-new');
        if (pathName.includes('people')) {
          navigate('/people-invoice-new', {
            state: { from: 'editInvoice', versionRes: res },
          });
        } else {
          navigate('/invoice-new', {
            state: { from: 'editInvoice', versionRes: res },
          });
        }
      } else {
        openSnackBar({
          message: res.message || 'Unknown error occured',
          type: MESSAGE_TYPE.ERROR,
        });
      }
    });
  };

  const CancelInvoice = () => {
    if (state?.type === 'approved' || state?.type === 'unApproved') {
      if (
        !state?.approvedAccess?.Estimate?.cancel_estimate &&
        state?.documentType === 'estimate'
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
        !state?.approvedAccess?.['Tax Invoice']?.cancel_invoices &&
        state?.documentType === 'tax_invoice'
      ) {
        setHavePermission({
          open: true,
          back: () => {
            setHavePermission({ open: false });
          },
        });
        return;
      }
    }
    setDrawer((prev) => ({
      ...prev,
      deletePopup: true,
    }));
  };
  const RecurringOption = () => {
    return (
      <>
        <SelectBottomSheet
          name="Recuring"
          triggerComponent={
            <div
              style={{
                fontWeight: 400,
                fontSize: '16px',
                padding: '10px',
                color: '#434343',
              }}
              onClick={() => {
                CreateRecurringAccess();
              }}
            >
              <img src={notes} alt="notes" style={{ width: '17px' }} />
            </div>
          }
          open={view.recurring}
          onTrigger={() => {
            setView((prev) => ({
              ...prev,
              recurring: true,
            }));
          }}
          onClose={() => {
            setBottomSheet(false);
            setView((prev) => ({
              ...prev,
              recurring: false,
            }));
          }}
          maxHeight="45vh"
        >
          <div className={css.valueHeader}> Set as a Recurring Invoice</div>
          <div style={{ padding: '5px 20px' }}>
            <div
              style={{
                display: 'flex',
                padding: 15,
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  width: '75%',
                  fontSize: '12px',
                }}
              >
                By turning on this toggle, you are initiating an ongoing
                relationship with {`${state?.name}`} over a mutually agreed
                period of time
              </span>
              <div style={{ width: '20%' }}>
                <AntSwitch
                  inputProps={{
                    'aria-label': 'ant design',
                  }}
                  checked={agreed}
                  onChange={() => setAgreed(!agreed)}
                />
              </div>
            </div>
            {agreed && (
              <section style={{ margin: '25px' }}>
                <div
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                      marginBottom: '20px',
                    }}
                  >
                    <div
                      style={{
                        border: '1px solid #A0A4AF',
                        borderRadius: '10px',
                        width: '40%',
                        padding: '5px',
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
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        <input
                          type="text"
                          value={
                            value?.startDate
                              ? moment(value?.startDate).format('DD-MM-YYYY')
                              : moment(new Date()).format('DD-MM-YYYY')
                          }
                          style={{
                            pointerEvents: 'none',
                            width: '70%',
                            border: 'none',
                          }}
                        />
                        <OnlyDatePicker
                          className={css.recurringDate}
                          selectedDate={
                            value?.startDate ? value?.startDate : new Date()
                          }
                          // // label={new Date(invoiceDate).toLocaleDateString()}
                          onChange={handleStartDate}
                        />

                        {/* <SelectBottomSheet
                              name="startDate"
                              triggerComponent={
                                <CalendarIcon
                                  style={{
                                    width: 20,
                                    color: '#949494',
                                  }}
                                  onClick={() => {
                                    onTriggerDrawer('startDate');
                                  }}
                                />
                              }
                              open={drawer.startDate}
                              // value={taxValue}
                              onTrigger={onTriggerDrawer}
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
                            </SelectBottomSheet> */}
                      </div>
                    </div>
                    <div
                      style={{
                        border: '1px solid #A0A4AF',
                        borderRadius: '10px',
                        width: '40%',
                        padding: '5px',
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
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
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
                            value?.endDate
                              ? moment(value?.endDate).format('DD-MM-YYYY')
                              : 'dd-mm-yyyy'
                          }
                        />
                        <OnlyDatePicker
                          className={css.recurringDate}
                          selectedDate={
                            value?.endDate ? value?.endDate : new Date()
                          }
                          // // label={new Date(invoiceDate).toLocaleDateString()}
                          onChange={handleEndDate}
                        />
                        {/* <SelectBottomSheet
                              name="endDate"
                              triggerComponent={
                                <CalendarIcon
                                  style={{
                                    width: 20,
                                    color: '#949494',
                                  }}
                                  onClick={() => {
                                    onTriggerDrawer('endDate');
                                  }}
                                />
                              }
                              open={drawer.endDate}
                              // value={taxValue}
                              onTrigger={onTriggerDrawer}
                              onClose={() => {
                                setDrawer((d) => ({
                                  ...d,
                                  endDate: false,
                                }));
                              }}
                              // maxHeight="45vh"
                            >
                              <Calender
                                head="Select End Date"
                                button="Select"
                                handleDate={handleEndDate}
                              />
                            </SelectBottomSheet> */}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px',
                    }}
                  >
                    <WhiteBackgroundCheckbox
                      checked={remainder}
                      onChange={() => setRemainder(!remainder)}
                      disabled={!agreed}
                    />
                    <div
                      style={{
                        flex: 1,
                        padding: '5px',
                        fontStyle: 'light',
                        fontSize: '11px',
                      }}
                    >
                      Send Reminders as the Agreement concludes
                    </div>
                  </div>
                  {remainder && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        columnGap: '10px',
                        rowGap: '1em',
                        marginBottom: '20px',
                      }}
                      disabled={!agreed}
                    >
                      {daysData.map((item) => {
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              // setDays(item.value);
                              // setSelected(item.id);
                              setIntialDays((prev) => ({
                                ...prev,
                                [item.value]: !intialDays[item.value],
                              }));
                            }}
                            style={
                              !item.selected
                                ? {
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: '30px',
                                    height: '40px',
                                    border: '1px solid #A0A4AF',
                                    cursor: 'pointer',
                                  }
                                : {
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: '30px',
                                    height: '40px',
                                    backgroundColor: 'rgba(240, 139, 50, 0.12)',
                                    border: '1px solid #F08B32',
                                    cursor: 'pointer',
                                  }
                            }
                          >
                            <div
                              style={
                                !item.selected
                                  ? {
                                      textAlign: 'center',
                                      color: '#6E6E6E',
                                      fontSize: '13px',
                                    }
                                  : {
                                      textAlign: 'center',
                                      color: '#F08B32',
                                      fontSize: '13px',
                                    }
                              }
                              disabled={!agreed}
                            >
                              {item.lable}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <Mui.Stack className={css.dispatchStackDesktop}>
                    <Mui.Stack
                      direction="row"
                      className={css.dispatchStackMainDesktop}
                    >
                      <Mui.Typography className={css.text1}>
                        Please select the Day of the Month you would like to
                        send this Invoice to {`${state?.name}`}
                      </Mui.Typography>
                      <Mui.Stack
                        style={{ cursor: 'pointer' }}
                        onClick={() => HandlePop()}
                        className={css.text2Stack}
                      >
                        <Mui.Typography className={css.text2}>
                          send invoice on
                        </Mui.Typography>
                        <Mui.Typography
                          onClick={() => HandlePop()}
                          style={{ cursor: 'pointer' }}
                        >
                          {popValue}
                        </Mui.Typography>

                        {/* <Mui.Dialog
                              open={openPop}
                              // anchorEl={HandlePop}
                              onClose={HandlePop}
                              anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'center',
                              }}
                            >
                              <Mui.Stack
                                style={{ width: '20rem', height: '10rem' }}
                              >
                                <Mui.Grid container>
                                  {Number.map((c) => (
                                    <Mui.Grid xs={2}>
                                      <Mui.Stack
                                        className={css.numberStackNew}
                                        onClick={() => setPopValue(c)}
                                      >
                                        <Mui.Typography>{c}</Mui.Typography>
                                      </Mui.Stack>
                                    </Mui.Grid>
                                  ))}
                                </Mui.Grid>
                              </Mui.Stack>
                            </Mui.Dialog> */}
                      </Mui.Stack>
                    </Mui.Stack>
                  </Mui.Stack>
                </div>
              </section>
            )}
          </div>
          <div
            className={css.addCustomerFooter}
            // style={{ justifyContent: 'center' }}
          >
            <Button
              variant="contained"
              className={css.secondary}
              style={{
                padding: '15px 35px',
                textTransform: 'initial',
              }}
              onClick={() => {
                setBottomSheet(false);
                setView((prev) => ({
                  ...prev,
                  recurring: false,
                }));
                // setRecurring(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              className={`${css.primary}`}
              style={{
                padding: '15px',
                textTransform: 'initial',
              }}
              onClick={() => {
                // handleClick();
                createRecurringInvoice();
              }}
              disabled={!agreed}
            >
              Create Contract
            </Button>
          </div>
          {/* </SelectBottomSheet>
          </div> */}
        </SelectBottomSheet>
        <RecurringDateDialog
          openPop={openPop}
          HandlePop={HandlePop}
          valueRadio={valueRadio}
          setValueRadio={setValueRadio}
          drawer={drawer.datePopup}
          setPopValue={setPopValue}
          // setSendDate={setSendDate}
          setDrawer={setDrawer}
        />
      </>
    );
  };
  const Pdfj = () => {
    const htmlFile = html;
    return (
      // <Mui.Stack
      //   style={{ overflow: 'auto', margin: '1rem' }}
      //   dangerouslySetInnerHTML={{ __html: htmlFile }}
      // />
      <Mui.Stack
        style={{
          backgroundColor: 'white',
          height: state?.type === 'approved' ? '80vh' : '65vh',
          width: '100%',
        }}
      >
        <iframe
          srcDoc={htmlFile?.replace(
            'div.nobreak{page-break-inside:avoid}',
            'div.nobreak{page-break-inside:avoid} ::-webkit-scrollbar {width:0px}',
          )}
          title="html"
          frameBorder="0"
          className={css.scrolling}
        />
      </Mui.Stack>
    );
  };
  return (
    <>
      {desktopView ? (
        // here
        <>
          {loading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <div
                style={{
                  height: '130px',
                  width: '130px',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <img
                  src={loadinggif}
                  style={{ height: '100px', width: '100px' }}
                  alt="loading..."
                />
              </div>
              <div
                style={{
                  color: '#000000',
                  fontSize: '24px',
                  marginTop: '10px',
                }}
              >
                {' '}
                {/* {console.log('pageParams', pageParams)} */}
                {state?.type === 'unApproved' ||
                state?.type === 'approved' ||
                state?.type === undefined
                  ? (state?.documentType === 'estimate' &&
                      'Fetching Your Estimate') ||
                    'Fetching Your Invoice'
                  : (state?.type === 'estimate' &&
                      'Estimate Invoice Created') ||
                    'Creating Your Invoice'}
              </div>
            </div>
          ) : (
            <Mui.Stack className={css.pdfContainer}>
              <Mui.Stack direction="row" className={css.pdfRow} width="95%">
                <Mui.Stack className={css.pdfStack}>
                  {state?.type === 'unApproved' && (
                    <Mui.Typography className={css.pdfText}>
                      This is an Unapproved Invoice.
                    </Mui.Typography>
                  )}
                  {(state?.type === 'create' ||
                    // state?.type === 'approved' ||
                    state?.type === 'draft') && (
                    <Mui.Typography className={css.pdfText}>
                      Success ! Your Invoice has been generated!
                    </Mui.Typography>
                  )}

                  {state?.type === 'estimate' && (
                    <Mui.Typography className={css.pdfText}>
                      {state?.converted
                        ? 'Success ! Your Estimate has been converted to Tax Invoice!.'
                        : 'Success ! Your Estimate has been generated!.'}
                    </Mui.Typography>
                  )}

                  <Mui.Stack
                    style={{
                      backgroundColor: 'white',
                      // height: '73vh',
                      borderRadius: '15px',
                    }}
                    direction="row"
                  >
                    {device === 'desktop' && Pdfj()}
                    {device === 'mobile' && (
                      <div className={css.fieldRow}>
                        {Array.from(
                          { length: pageNumber },
                          (_, i) => i + 1,
                        ).map((i) => (
                          <>
                            <TransformWrapper>
                              <TransformComponent>
                                <Document
                                  file={pdfurl}
                                  className={css.pdfStyle}
                                  loading="  "
                                  onLoadSuccess={onDocumentLoadSuccess}
                                >
                                  <Page pageNumber={i} />
                                </Document>
                              </TransformComponent>
                            </TransformWrapper>
                          </>
                        ))}
                      </div>
                    )}
                  </Mui.Stack>
                </Mui.Stack>
                <Mui.Stack className={css.iconStack} spacing={2}>
                  {/* Tax Invoice to Estimate FLow  */}
                  {console.log(state?.documentType)}
                  {invoiceRes?.document_type === 'estimate' &&
                    pathName !== '/invoice-estimate-pdf' && (
                      <Mui.Stack direction="row" className={css.avatarStack}>
                        <Mui.Avatar
                          className={css.avatarEstToTax}
                          onClick={() => {
                            estimateToTax();
                          }}
                          onMouseEnter={() => {
                            setStyle6(true);
                          }}
                          onMouseLeave={() => {
                            setStyle6(false);
                          }}
                        >
                          {/* <img
                        src={download}
                        alt="download"
                        style={{ width: '17px' }}
                      /> */}
                          <MuiIcon.AutoMode />
                        </Mui.Avatar>{' '}
                        <Mui.Typography
                          className={
                            style6 ? css.avatarEstToTaxText : css.invisible
                          }
                        >
                          To Tax Invoice
                        </Mui.Typography>
                      </Mui.Stack>
                    )}

                  {state?.type === 'unApproved' && (
                    <Mui.Stack direction="row" className={css.avatarStack}>
                      <Mui.Avatar
                        className={css.avatarPencil}
                        onMouseEnter={() => {
                          setStyle7(true);
                        }}
                        onMouseLeave={() => {
                          setStyle7(false);
                        }}
                        onClick={() => {
                          declineInvoice('edit');
                        }}
                      >
                        <img
                          src={pencilEdit}
                          alt="edit"
                          style={{ width: '22px' }}
                        />
                      </Mui.Avatar>
                      <Mui.Typography
                        className={
                          style7 ? css.avatarPencilText : css.invisible
                        }
                      >
                        {/* {state?.type === 'unApproved' ? 'Approve This' : 'edit'}{' '} */}
                        Edit this Invoice
                      </Mui.Typography>
                    </Mui.Stack>
                  )}

                  <Mui.Stack direction="row" className={css.avatarStack}>
                    <Mui.Avatar
                      className={css.avatarPencil}
                      onMouseEnter={() => {
                        setStyle1(true);
                      }}
                      onMouseLeave={() => {
                        setStyle1(false);
                      }}
                      onClick={() => {
                        if (state?.type === 'unApproved') {
                          approveCustomer();
                        } else {
                          editInvoice();
                        }
                      }}
                    >
                      {state?.type === 'unApproved' ? (
                        <MuiIcon.AddTask />
                      ) : (
                        <img
                          src={pencilEdit}
                          alt="edit"
                          style={{ width: '22px' }}
                        />
                      )}
                    </Mui.Avatar>
                    <Mui.Typography
                      className={style1 ? css.avatarPencilText : css.invisible}
                    >
                      {state?.type === 'unApproved' ? 'Approve This' : 'edit'}{' '}
                      invoice
                    </Mui.Typography>
                  </Mui.Stack>
                  <SelectBottomSheet
                    name="addProductService"
                    triggerComponent={
                      state?.type !== 'unApproved' &&
                      state?.status !== 'unapproved' ? (
                        // && state?.type !== 'estimate'
                        <Mui.Stack direction="row" className={css.avatarStack}>
                          <Mui.Avatar
                            className={css.avatarMail}
                            onClick={() => {
                              // changeSubView('deliverInvoiceToCustomer');
                              if (
                                !userPermissions?.Invoicing?.[
                                  'Email Subject & Body'
                                ]?.view_email_templates
                              ) {
                                setHavePermission({
                                  open: true,
                                  back: () => {
                                    setHavePermission({ open: false });
                                  },
                                });
                                return;
                              }
                              setDeliverSheet(true);
                            }}
                            onMouseEnter={() => {
                              setStyle2(true);
                            }}
                            onMouseLeave={() => {
                              setStyle2(false);
                            }}
                          >
                            <MailOutlineIcon style={{ width: '22px' }} />
                          </Mui.Avatar>
                          <Mui.Typography
                            className={
                              style2 ? css.avatarMailText : css.invisible
                            }
                          >
                            Send to Customer
                          </Mui.Typography>
                        </Mui.Stack>
                      ) : (
                        <></>
                      )
                    }
                    open={deliverSheet}
                    onTrigger={onTriggerDrawer}
                    onClose={() => {
                      setDeliverSheet(false);
                    }}
                    maxHeight="45vh"
                  >
                    <DeliverInvoiceToCustomer fromSheet={setDeliverSheet} />
                  </SelectBottomSheet>
                  {state?.type !== 'unApproved' &&
                    state?.status !== 'unapproved' && (
                      <Mui.Stack direction="row" className={css.avatarStack}>
                        <Mui.Avatar
                          className={css.avatarDownload}
                          onClick={() => {
                            pdfGeneration('download');
                          }}
                          onMouseEnter={() => {
                            setStyle3(true);
                          }}
                          onMouseLeave={() => {
                            setStyle3(false);
                          }}
                        >
                          <img
                            src={download}
                            alt="download"
                            style={{ width: '17px' }}
                          />
                        </Mui.Avatar>{' '}
                        <Mui.Typography
                          className={
                            style3 ? css.avatarDownloadText : css.invisible
                          }
                        >
                          Download as PDF
                        </Mui.Typography>
                      </Mui.Stack>
                    )}

                  {state?.type !== 'unApproved' &&
                    state?.status !== 'unapproved' &&
                    state?.type !== 'estimate' &&
                    state?.documentType !== 'estimate' &&
                    state?.documentType !== 'credit_note' &&
                    state?.documentType !== 'debit_note' && (
                      <Mui.Stack
                        direction="row"
                        className={css.avatarStack}
                        onMouseEnter={() => {
                          setStyle4(true);
                        }}
                        onMouseLeave={() => {
                          setStyle4(false);
                        }}
                      >
                        <Mui.Avatar className={css.avatarNotes}>
                          {RecurringOption()}
                        </Mui.Avatar>
                        <Mui.Typography
                          className={
                            style4 ? css.avatarNotesText : css.invisible
                          }
                        >
                          Set as a Recurring Invoice
                        </Mui.Typography>
                      </Mui.Stack>
                    )}

                  <Mui.Stack direction="row" className={css.avatarStack}>
                    <Mui.Avatar
                      className={css.avatarClosex}
                      onMouseEnter={() => {
                        setStyle5(true);
                      }}
                      onMouseLeave={() => {
                        setStyle5(false);
                      }}
                      onClick={() => CancelInvoice()}
                    >
                      <img
                        src={closex}
                        alt="closex"
                        style={{ width: '16px' }}
                      />
                    </Mui.Avatar>
                    <Mui.Typography
                      className={style5 ? css.avatarClosexText : css.invisible}
                    >
                      cancel invoice
                    </Mui.Typography>
                  </Mui.Stack>
                </Mui.Stack>
              </Mui.Stack>
              <ReceivablesPopOver
                open={drawer.deletePopup}
                handleClose={() =>
                  setDrawer((prev) => ({ ...prev, deletePopup: false }))
                }
                position="center"
              >
                {/* deleteInvoice(activeItem.id) */}
                <div className={css.effortlessOptions}>
                  <h3>Cancel this Invoice</h3>
                  <p>Are you sure you want to Cancel this Invoice?</p>

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
                        if (
                          state?.type === 'unApproved' ||
                          state?.status === 'unapproved'
                        ) {
                          declineInvoice();
                        } else {
                          cancelInvoice();
                        }
                      }}
                    >
                      &nbsp; OK &nbsp;
                    </Button>
                  </div>
                </div>
              </ReceivablesPopOver>
            </Mui.Stack>
          )}
        </>
      ) : (
        <>
          {loading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  height: '130px',
                  width: '130px',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <img
                  src={loadinggif}
                  style={{ height: '100px', width: '100px' }}
                  alt="loading..."
                />
              </div>
              <div
                style={{
                  color: '#000000',
                  fontSize: '24px',
                  marginTop: '10px',
                }}
              >
                {' '}
                {/* {console.log('pageParams', pageParams)} */}
                {state?.type === 'unApproved' ||
                state?.type === 'approved' ||
                state?.type === undefined
                  ? (state?.documentType === 'estimate' &&
                      'Fetching Your Estimate') ||
                    'Fetching Your Invoice'
                  : (state?.type === 'estimate' &&
                      'Estimate Invoice Created') ||
                    'Creating Your Invoice'}
              </div>
            </div>
          ) : (
            <div
              className={css.createInvoiceContainer}
              style={{ display: 'flex' }}
            >
              <div className={css.fieldWrapper} style={{ padding: '0 10px' }}>
                {state?.type === 'unApproved' && (
                  <div style={{ alignSelf: 'center' }}>
                    This is an Unapproved Invoice.
                  </div>
                )}

                {(state?.type === 'create' ||
                  // state?.type === 'approved' ||
                  state?.type === 'draft') && (
                  <div>Success ! Your Invoice has been generated!</div>
                )}

                {state?.type === 'estimate' && (
                  <div>
                    {state?.converted
                      ? 'Success ! Your Estimate has been converted to Tax Invoice!.'
                      : 'Success ! Your Estimate has been generated!.'}
                  </div>
                )}
                {device === 'desktop' && (
                  <Mui.Stack
                    style={{
                      backgroundColor: 'white',
                      margin: '1rem',
                      height: '100%',
                      borderRadius: '15px',
                    }}
                  >
                    Pdfj()
                  </Mui.Stack>
                )}
                {device === 'mobile' && (
                  <div className={css.fields}>
                    <div className={css.fieldRow}>
                      {Array.from({ length: pageNumber }, (_, i) => i + 1).map(
                        (i) => (
                          <TransformWrapper>
                            <TransformComponent>
                              <Document
                                file={pdfurl}
                                className={css.pdfStyle}
                                loading="  "
                                onLoadSuccess={onDocumentLoadSuccess}
                              >
                                <Page pageNumber={i} />
                              </Document>
                            </TransformComponent>
                          </TransformWrapper>
                        ),
                      )}
                    </div>
                  </div>
                )}
                {/* {pageParams === 5 ? (
              <div style={{}}>
                <Button
                  variant="contained"
                  className={css.submitApproach}
                  fullWidth
                  onClick={approveCustomer}
                  style={{ margin: '25px' }}
                >
                  Approve this Invoice
                </Button>
              </div>
            ) : ( */}
                {invoiceRes?.status !== 'cancelled' && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12%',
                      left: 0,
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    {state?.type === 'unApproved' ? (
                      <Button
                        variant="contained"
                        className={`${css.submitButton} ${css.borderRadius}`}
                        fullWidth
                        onClick={approveCustomer}
                        style={{
                          width: '80%',
                        }}
                      >
                        Approve this Invoice
                      </Button>
                    ) : (
                      state?.status !== 'unapproved' && (
                        <Button
                          variant="contained"
                          className={`${css.submitButton} ${css.borderRadius}`}
                          fullWidth
                          onClick={() => {
                            if (state?.type === 'estimate') {
                              navigate('/invoice-estimate-deliver', {
                                state: { documentType: state?.documentType },
                              });
                            } else if (state?.type === 'approved') {
                              navigate('/invoice-approved-deliver', {
                                state: { documentType: state?.documentType },
                              });
                            } else {
                              if (pathName.includes('people')) {
                                navigate('/people-invoice-new-deliver', {
                                  state: { documentType: state?.documentType },
                                });
                              } else {
                                navigate('/invoice-new-deliver', {
                                  state: { documentType: state?.documentType },
                                });
                              }
                            }
                          }}
                          style={{
                            width: '80%',
                          }}
                        >
                          Deliver to Customer
                        </Button>
                      )
                    )}

                    <SelectBottomSheet
                      name="moreAction"
                      triggerComponent={
                        <Button
                          variant="contained"
                          className={`${css.submitButton} ${css.borderRadius}`}
                          fullWidth
                          onClick={moreActions}
                          style={{
                            width: '80%',
                          }}
                        >
                          More Actions
                        </Button>
                      }
                      open={BottomSheet}
                      onTrigger={() => setBottomSheet(true)}
                      onClose={() => setBottomSheet(false)}
                      maxHeight="45vh"
                      addNewSheet
                    >
                      <div style={{ padding: '15px' }}>
                        <div>
                          {state?.documentType === 'estimate' &&
                            pathName !== '/invoice-estimate-pdf' && (
                              <>
                                <div
                                  style={{
                                    fontWeight: 400,
                                    fontSize: '16px',
                                    padding: '10px',
                                    color: '#434343',
                                  }}
                                  onClick={async () => {
                                    await estimateToTax();
                                    setBottomSheet(false);
                                  }}
                                >
                                  Convert to Tax Invoice
                                </div>
                                <hr />
                              </>
                            )}
                          {state?.type !== 'unApproved' &&
                            state?.status !== 'unapproved' && (
                              <>
                                <div
                                  style={{
                                    fontWeight: 400,
                                    fontSize: '16px',
                                    padding: '10px',
                                    color: '#434343',
                                  }}
                                  onClick={() => {
                                    pdfGeneration('share');
                                  }}
                                >
                                  Share
                                </div>
                                <hr />
                              </>
                            )}
                          {state?.type !== 'unApproved' &&
                            state?.status !== 'unapproved' && (
                              <>
                                <div
                                  style={{
                                    fontWeight: 400,
                                    fontSize: '16px',
                                    padding: '10px',
                                    color: '#434343',
                                  }}
                                  onClick={() => {
                                    pdfGeneration('download');
                                  }}
                                >
                                  Download as PDF
                                </div>
                                <hr />
                              </>
                            )}

                          {state?.type !== 'unApproved' &&
                            state?.status !== 'unapproved' &&
                            state?.type !== 'estimate' &&
                            state?.documentType !== 'estimate' &&
                            state?.documentType !== 'credit_note' &&
                            state?.documentType !== 'debit_note' && (
                              <>
                                <SelectBottomSheet
                                  name="Recuring"
                                  triggerComponent={
                                    <div
                                      style={{
                                        fontWeight: 400,
                                        fontSize: '16px',
                                        padding: '10px',
                                        color: '#434343',
                                      }}
                                      onClick={() => {
                                        CreateRecurringAccess();
                                      }}
                                    >
                                      Set as a Recurring Invoice
                                    </div>
                                  }
                                  open={view.recurring}
                                  onTrigger={() => {
                                    setView((prev) => ({
                                      ...prev,
                                      recurring: true,
                                    }));
                                  }}
                                  onClose={() => {
                                    setBottomSheet(false);
                                    setView((prev) => ({
                                      ...prev,
                                      recurring: false,
                                    }));
                                  }}
                                  // maxHeight="45vh"
                                >
                                  <div className={css.valueHeader}>
                                    {' '}
                                    Set as a Recurring Invoice
                                  </div>
                                  <div
                                    style={{
                                      padding: '5px 20px',
                                      maxHeight: '60vh',
                                      overflow: 'auto',
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: 'flex',
                                        padding: 15,
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <span
                                        style={{
                                          width: '75%',
                                          fontSize: '12px',
                                        }}
                                      >
                                        By turning on this toggle, you are
                                        initiating an ongoing relationship with{' '}
                                        {`${state?.name}`} over a mutually
                                        agreed period of time
                                      </span>
                                      <div style={{ width: '20%' }}>
                                        <AntSwitch
                                          inputProps={{
                                            'aria-label': 'ant design',
                                          }}
                                          checked={agreed}
                                          onChange={() => setAgreed(!agreed)}
                                        />
                                      </div>
                                    </div>
                                    {agreed && (
                                      <section style={{ margin: '25px' }}>
                                        <div
                                          style={{
                                            backgroundColor: 'white',
                                            borderRadius: '20px',
                                          }}
                                        >
                                          <div
                                            style={{
                                              display: 'flex',
                                              flexDirection: 'row',
                                              justifyContent: 'space-around',
                                              marginBottom: '20px',
                                            }}
                                          >
                                            <div
                                              style={{
                                                border: '1px solid #A0A4AF',
                                                borderRadius: '10px',
                                                width: '40%',
                                                padding: '5px',
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
                                                  justifyContent:
                                                    'space-between',
                                                  alignItems: 'center',
                                                }}
                                              >
                                                <input
                                                  type="text"
                                                  value={
                                                    value?.startDate
                                                      ? moment(
                                                          value?.startDate,
                                                        ).format('DD-MM-YYYY')
                                                      : 'dd-mm-yyyy'
                                                  }
                                                  style={{
                                                    pointerEvents: 'none',
                                                    width: '70%',
                                                    border: 'none',
                                                  }}
                                                />

                                                <SelectBottomSheet
                                                  name="startDate"
                                                  triggerComponent={
                                                    <CalendarIcon
                                                      style={{
                                                        width: 20,
                                                        color: '#949494',
                                                      }}
                                                      onClick={() => {
                                                        onTriggerDrawer(
                                                          'startDate',
                                                        );
                                                      }}
                                                    />
                                                  }
                                                  addNewSheet
                                                  open={drawer.startDate}
                                                  // value={taxValue}
                                                  onTrigger={onTriggerDrawer}
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
                                                width: '40%',
                                                padding: '5px',
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
                                                  justifyContent:
                                                    'space-between',
                                                  alignItems: 'center',
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
                                                    value?.endDate
                                                      ? moment(
                                                          value?.endDate,
                                                        ).format('DD-MM-YYYY')
                                                      : 'dd-mm-yyyy'
                                                  }
                                                />
                                                <SelectBottomSheet
                                                  name="endDate"
                                                  triggerComponent={
                                                    <CalendarIcon
                                                      style={{
                                                        width: 20,
                                                        color: '#949494',
                                                      }}
                                                      onClick={() => {
                                                        onTriggerDrawer(
                                                          'endDate',
                                                        );
                                                      }}
                                                    />
                                                  }
                                                  addNewSheet
                                                  open={drawer.endDate}
                                                  // value={taxValue}
                                                  onTrigger={onTriggerDrawer}
                                                  onClose={() => {
                                                    setDrawer((d) => ({
                                                      ...d,
                                                      endDate: false,
                                                    }));
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
                                          <div
                                            style={{
                                              display: 'flex',
                                              flexDirection: 'row',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              marginBottom: '20px',
                                            }}
                                          >
                                            <WhiteBackgroundCheckbox
                                              checked={remainder}
                                              onChange={() =>
                                                setRemainder(!remainder)
                                              }
                                              disabled={!agreed}
                                            />
                                            <div
                                              style={{
                                                flex: 1,
                                                padding: '5px',
                                                fontStyle: 'light',
                                                fontSize: '11px',
                                              }}
                                            >
                                              Send Reminders as the Agreement
                                              concludes
                                            </div>
                                          </div>
                                          {remainder && (
                                            <div
                                              style={{
                                                display: 'grid',
                                                gridTemplateColumns:
                                                  'repeat(3, 1fr)',
                                                columnGap: '10px',
                                                rowGap: '1em',
                                                marginBottom: '20px',
                                              }}
                                              disabled={!agreed}
                                            >
                                              {daysData.map((item) => {
                                                return (
                                                  <div
                                                    key={item.id}
                                                    onClick={() => {
                                                      // setDays(item.value);
                                                      // setSelected(item.id);
                                                      setIntialDays((prev) => ({
                                                        ...prev,
                                                        [item.value]:
                                                          !intialDays[
                                                            item.value
                                                          ],
                                                      }));
                                                    }}
                                                    style={
                                                      !item.selected
                                                        ? {
                                                            display: 'flex',
                                                            justifyContent:
                                                              'center',
                                                            alignItems:
                                                              'center',
                                                            borderRadius:
                                                              '30px',
                                                            height: '40px',
                                                            border:
                                                              '1px solid #A0A4AF',
                                                          }
                                                        : {
                                                            display: 'flex',
                                                            justifyContent:
                                                              'center',
                                                            alignItems:
                                                              'center',
                                                            borderRadius:
                                                              '30px',
                                                            height: '40px',
                                                            backgroundColor:
                                                              'rgba(240, 139, 50, 0.12)',
                                                            border:
                                                              '1px solid #F08B32',
                                                          }
                                                    }
                                                  >
                                                    <div
                                                      style={
                                                        !item.selected
                                                          ? {
                                                              textAlign:
                                                                'center',
                                                              color: '#6E6E6E',
                                                              fontSize: '13px',
                                                            }
                                                          : {
                                                              textAlign:
                                                                'center',
                                                              color: '#F08B32',
                                                              fontSize: '13px',
                                                            }
                                                      }
                                                      disabled={!agreed}
                                                    >
                                                      {item.lable}
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}

                                          {/* {device === 'desktop' ? ( */}

                                          <Mui.Stack
                                            className={css.dispatchStack}
                                          >
                                            <Mui.Stack
                                              direction="row"
                                              className={css.dispatchStackMain}
                                            >
                                              <Mui.Stack>
                                                <Mui.Typography
                                                  className={css.text1}
                                                >
                                                  Confirm Dispatch Date
                                                </Mui.Typography>
                                                <Mui.Typography
                                                  className={css.text2}
                                                >
                                                  Send a Recurring Invoice to
                                                  {`${state?.name}`} on this
                                                  day, every month, till the End
                                                  of the Agreement.
                                                </Mui.Typography>
                                              </Mui.Stack>
                                              <Mui.Stack
                                                className={css.inputStack}
                                                direction="row"
                                              >
                                                <Mui.Typography
                                                  onClick={() => HandlePop()}
                                                  style={{
                                                    cursor: 'pointer',
                                                    paddingLeft: '5px',
                                                  }}
                                                >
                                                  {popValue}
                                                </Mui.Typography>
                                                <KeyboardArrowDownIcon
                                                  className={css.arrow}
                                                  onClick={() => HandlePop()}
                                                  style={{
                                                    cursor: 'pointer',
                                                  }}
                                                />
                                              </Mui.Stack>
                                            </Mui.Stack>
                                          </Mui.Stack>
                                        </div>
                                      </section>
                                    )}
                                  </div>
                                  <div
                                    className={css.addCustomerFooter}
                                    // style={{ justifyContent: 'center' }}
                                  >
                                    <Button
                                      variant="contained"
                                      className={css.secondary}
                                      style={{
                                        padding: '15px 35px',
                                        textTransform: 'initial',
                                      }}
                                      onClick={() => {
                                        setBottomSheet(false);
                                        setView((prev) => ({
                                          ...prev,
                                          recurring: false,
                                        }));
                                        // setRecurring(false);
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="contained"
                                      className={`${css.primary}`}
                                      style={{
                                        padding: '15px',
                                        textTransform: 'initial',
                                      }}
                                      onClick={() => {
                                        // handleClick();
                                        createRecurringInvoice();
                                      }}
                                      disabled={!agreed}
                                    >
                                      Create Contract
                                    </Button>
                                  </div>
                                  {/* </SelectBottomSheet>
                                </div> */}
                                </SelectBottomSheet>
                                <hr />{' '}
                              </>
                            )}

                          <>
                            <div
                              style={{
                                fontWeight: 400,
                                fontSize: '16px',
                                padding: '10px',
                                color: '#F08B32',
                              }}
                              onClick={() => {
                                if (state?.type === 'unApproved') {
                                  declineInvoice('edit');
                                } else {
                                  editInvoice();
                                }
                              }}
                            >
                              Edit this Invoice
                            </div>

                            <hr />
                          </>

                          <div
                            style={{
                              fontWeight: 400,
                              color: '#DB4200',
                              padding: '10px',
                              fontSize: '16px',
                            }}
                            onClick={() => CancelInvoice()}
                          >
                            Cancel this Invoice
                          </div>
                        </div>
                      </div>
                    </SelectBottomSheet>
                    {/* )} */}
                  </div>
                )}
                {/* )} */}
              </div>
              <ReceivablesPopOver
                open={drawer.deletePopup}
                handleClose={() =>
                  setDrawer((prev) => ({ ...prev, deletePopup: false }))
                }
                position="center"
              >
                {/* deleteInvoice(activeItem.id) */}
                <div className={css.effortlessOptions}>
                  <h3>Cancel this Invoice</h3>
                  <p>Are you sure you want to Cancel this Invoice?</p>

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
                        if (
                          state?.type === 'unApproved' ||
                          state?.status === 'unapproved'
                        ) {
                          declineInvoice();
                        } else {
                          cancelInvoice();
                        }
                      }}
                    >
                      &nbsp; OK &nbsp;
                    </Button>
                  </div>
                </div>
              </ReceivablesPopOver>
            </div>
          )}
          <RecurringDateDialog
            openPop={openPop}
            HandlePop={HandlePop}
            valueRadio={valueRadio}
            setValueRadio={setValueRadio}
            drawer={drawer.datePopup}
            setPopValue={setPopValue}
            // setSendDate={setSendDate}
            setDrawer={setDrawer}
          />
        </>
      )}
      <Mui.Dialog
        open={recurringField.popOver}
        handleClose={() =>
          setRecurringField((prev) => ({ ...prev, popOver: false }))
        }
        position="center"
        className={classes.paper}
      >
        {/* deleteInvoice(activeItem.id) */}
        <div className={css.effortlessOptions}>
          <h3>Recurring Invoice Already Created.</h3>
          {/* <p>Are you sure you want to Cancel this Invoice?</p> */}

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
              onClick={() =>
                setRecurringField((prev) => ({ ...prev, popOver: false }))
              }
            >
              Back
            </Button>
          </div>
        </div>
      </Mui.Dialog>
      {havePermission.open && (
        <PermissionDialog onClose={() => havePermission.back()} />
      )}
    </>
  );
}
