/* eslint-disable import/no-unresolved */
/* eslint-disable no-unused-vars */
/* eslint-disable no-lonely-if */

/* @flow */
/**
 * @fileoverview  Fill in organizational Details
 */

import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import { PermissionDialog } from '@components/Permissions/PermissionDialog.jsx';
import { withStyles } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import {
  HomeIcon,
  BankingIcon,
  PeopleIcon,
  RupeeIcon,
  HomeGray,
  RupeeOrange,
  BankingOrange,
  PeopleOrange,
} from '@components/SvgIcons/SvgIcons.jsx';

import IconButton from '@material-ui/core/IconButton';
import AppContext from '@root/AppContext.jsx';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer.jsx';
import SimpleSnackbar from '@components/SnackBarContainer/CustomSnackBar.jsx';

import * as Mui from '@mui/material';
import theme from '@root/theme.scss';
import AppHeader from '@components/AppHeader/AppHeader';
import * as Router from 'react-router-dom';
import moment from 'moment';
import css from './DashboardViewContainer.scss';
import invoices from '../../assets/invoices.svg';
import expensebills from '../../assets/bookopened.svg';
import payments from '../../assets/payments.svg';
import banking from '../../assets/bankingnav.svg';
import circle from '../../assets/circle-ok.svg';

import time from '../../assets/time.svg';
import timer from '../../assets/timer.svg';
import creditNote from '../../assets/creditNote.svg';
import debitNote from '../../assets/debitNote.svg';
import receviable from '../../assets/receviable.svg';

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: theme.colorGreen,
    boxShadow: `0px 2.62774px 5.25547px ${theme.colorDarkLight}, 0px 3.50365px 7.0073px ${theme.colorDarkLight}, 0px 0.875912px 10.5109px ${theme.colorDarkLight}`,
  },
  paper: {
    borderRadius: 30,
    width: '100% !important',
    position: 'relative',
  },
}));

const PlusIcon = () => {
  const classes = useStyles();
  return (
    <IconButton classes={{ root: classes.root }} className={css.plusIconButton}>
      <AddIcon className={css.plusIcon} />
    </IconButton>
  );
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Mui.Slide direction="right" ref={ref} {...props} />;
});

export const BottomNavigation = ({ iconList, setNavVisibilityParent }) => {
  const themes = Mui.useTheme();
  const desktopView = Mui.useMediaQuery(themes.breakpoints.up('sm'));
  const pathName = window.location.pathname;
  const [navVisibility, setNavVisibility] = useState(false);

  const navBarVisibility = () => {
    if (
      pathName === '/' ||
      pathName === '/dashboard' ||
      pathName === '/invoice-new-pdf' ||
      // pathName === '/invoice-new-deliver' ||
      // pathName === '/bill-upload' ||
      pathName === '/payment-advancePayments' ||
      // pathName === '/banking-categorize' ||
      pathName === '/RequestPayment'
    ) {
      setNavVisibility(true);
      setNavVisibilityParent(true);
    } else {
      setNavVisibility(false);
      setNavVisibilityParent(false);
    }
  };
  React.useEffect(() => {
    navBarVisibility();
  }, [pathName]);
  return (
    <div
      style={{ display: navVisibility === false ? 'none' : '' }}
      className={
        (!desktopView && css.bottomNavigationContainer) ||
        css.bottomNavIconWrapper2
      }
    >
      <div className={css.bottomNavIconWrapper}>
        {iconList.map((i) => (
          <div
            className={css.iconWrapper}
            onClick={i.onClick}
            onKeyPress={i.onClick}
            aria-hidden="true"
            key={i.id}
          >
            {i.icon}
            {i.id !== 'plus' && (
              <span
                className={css.iconTitle}
                style={{ color: i.active ? '#000000' : '#A0A4AF' }}
              >
                {i.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardViewContainer = () => {
  const {
    changeSubView,
    subView,
    organization,
    user,
    // pageParams,
    setLogo,
    setActiveInvoiceId,
    enableLoading,
    openSnackBar,
    setInvoiceCounts,
    userPermissions,
    currentUserInfo,
  } = useContext(AppContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const { state } = Router.useLocation();
  const [openProgress, setOpenProgress] = useState(null);
  const navigate = Router.useNavigate();
  const [syncStatus, setSyncStatus] = React.useState({});
  const deviceOut = localStorage.getItem('device_detect');

  const [featureDrawer, setFeatureDrawer] = useState(false);
  const [bankReq, setBankReq] = useState(false);
  const [roleAccess, setRoleAccess] = React.useState({});

  const [userRolesPeople, setUserRolesPeople] = React.useState({});
  // const [userRolesReceviables, setUserRolesReceviables] = React.useState({});
  // const [userRolesInvoicing, setUserRolesInvoicing] = React.useState({});
  // const [userRolesExpense, setUserRolesExpense] = React.useState({});
  // const [userRolesPayments, setUserRolesPayments] = React.useState({});
  // // const [userRolesPayables, setUserRolesPayables] = React.useState({});
  const [userRolesBanking, setUserRolesBanking] = React.useState({});
  const [havePermission, setHavePermission] = React.useState({ open: false });

  React.useEffect(() => {
    setUserRolesPeople({ ...userPermissions?.People });
    // setUserRolesReceviables({ ...userPermissions?.Receivables });
    // setUserRolesInvoicing({ ...userPermissions?.Invoicing });
    // setUserRolesExpense({ ...userPermissions?.Expense });
    // setUserRolesPayments({ ...userPermissions?.Payments });
    // // setUserRolesPayables({ ...userPermissions?.Payables });
    setUserRolesBanking({ ...userPermissions?.Banking });
    const temp = currentUserInfo?.permissions?.reduce((obj, item) => {
      obj[item.name] = item.active;
      return obj;
    }, {});
    setRoleAccess(temp);
  }, [currentUserInfo?.permissions, userPermissions]);

  const onClickMenuMethod = (item, params, path, access, navigateProps) => {
    const tempAccess =
      access === '' || access === undefined ? false : !roleAccess[access];
    if (tempAccess) {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
    } else {
      if (item === 'onProgress') {
        setAnchorEl(false);
        setOpenProgress(true);
      } else {
        if (params && params === 'estimate') {
          setActiveInvoiceId({
            activeInvoiceId: '',
          });
        }
        if (navigateProps) {
          navigate(path, navigateProps);
        } else {
          navigate(path);
        }
        setAnchorEl(null);
      }
    }
  };

  const quickBookStatus = () => {
    enableLoading(true);
    RestApi(`organizations/${organization.orgId}/quick_books_sync_status`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        enableLoading(false);
        if (res?.error) {
          openSnackBar({
            message: res?.message || 'Unkonown Error Occured',
            type: MESSAGE_TYPE.ERROR,
          });
        } else if (
          !res?.error &&
          res?.message?.toLocaleLowerCase() ===
            'quick books synced successfully'
        ) {
          setSyncStatus({
            type: 'Success!',
            message: res?.message,
            open: true,
          });
        }
      })
      .catch(() => {
        enableLoading(false);
        openSnackBar({
          message: 'Unknown Error Occured',
          type: MESSAGE_TYPE.ERROR,
        });
      });
  };

  const zohoBookStatus = () => {
    enableLoading(true);
    RestApi(`organizations/${organization.orgId}/zoho_books_sync_status`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        enableLoading(false);
        if (res?.error) {
          openSnackBar({
            message: res?.message || 'Unkonown Error Occured',
            type: MESSAGE_TYPE.ERROR,
          });
        } else if (
          !res?.error &&
          res?.message?.toLocaleLowerCase() === 'zoho books synced successfully'
        ) {
          setSyncStatus({
            type: 'Success!',
            message: res?.message,
            open: true,
          });
        }
      })
      .catch(() => {
        enableLoading(false);
        openSnackBar({
          message: 'Unknown Error Occured',
          type: MESSAGE_TYPE.ERROR,
        });
      });
  };

  const integrationType = () => {
    enableLoading(true);
    RestApi(`organizations/${organization?.orgId}`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        if (res) {
          if (res.error) {
            openSnackBar({
              message: Object.values(res.errors)[0],
              type: MESSAGE_TYPE.ERROR,
            });
            enableLoading(false);
            return;
          }
          if (!res?.error) {
            if (res?.integration_type === 'quick_books') {
              quickBookStatus();
            }
            if (
              res?.integration_type === 'tally' &&
              res?.sync_status?.toLocaleLowerCase() === 'success'
            ) {
              setSyncStatus({
                type: 'Success!',
                message: res?.sync_status,
                open: true,
              });
            }
            if (res?.integration_type === 'zoho') {
              zohoBookStatus();
            }
          }
        }
        enableLoading(false);
      })
      .catch((error) => {
        enableLoading(false);
        throw new Error(error);
      });
  };

  const NotifyCall = (ids) => {
    enableLoading(true);
    RestApi(`organizations/${organization.orgId}/settings`, {
      method: ids ? METHOD.PATCH : METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
      payload: {
        sync_completion_notified: ids,
      },
    })
      .then((res) => {
        enableLoading(false);
        if (res?.error) {
          openSnackBar({
            message: res?.message || 'Unkonown Error Occured',
            type: MESSAGE_TYPE.ERROR,
          });
        } else if (!res?.error) {
          if (!res?.sync_completion_notified) {
            integrationType();
          }
          if (res?.sync_completion_notified) {
            setSyncStatus({});
          }
        }
      })
      .catch(() => {
        enableLoading(false);
        openSnackBar({
          message: 'Unknown Error Occured',
          type: MESSAGE_TYPE.ERROR,
        });
      });
  };

  React.useEffect(() => {
    if (state?.from === 'openedNow' && deviceOut === 'desktop') {
      NotifyCall();
    }
    if (state?.from === 'bankReq') {
      setBankReq(true);
    }
  }, [state]);

  const onPlusIconClick = (e) => {
    setAnchorEl(e?.currentTarget);
  };

  const onInvoiceOptionsClose = () => {
    setAnchorEl(null);
  };

  const onProgressDialogClose = () => {
    setOpenProgress(null);
  };
  // kbtcheck - keeping this to bypass for development purpose - will remove the comment later
  useEffect(() => {
    RestApi(`organizations/${organization.orgId}/logos`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        setLogo(res?.data[0]?.image_url);
      })
      .catch(() => {
        console.log('Logo Error');
      });
  }, []);

  React.useEffect(() => {
    // enableLoading(true);
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
    ).then((res) => {
      if (res && !res.error) {
        setInvoiceCounts(res?.invoice_action);
        // enableLoading(false);
      } else if (res.error) {
        // enableLoading(false);
        openSnackBar({
          message: res.message || 'Unknown error occured',
          type: MESSAGE_TYPE.ERROR,
        });
      }
    });
  }, []);
  const Dialog = withStyles({
    root: {
      '& .css-1t1j96h-MuiPaper-root-MuiDialog-paper': {
        borderRadius: '16px',
      },
    },
  })(Mui.Dialog);
  const InvoicePopOver = ({
    open,
    // anchorEl,
    handleClose,
    effortLessOptions,
  }) => {
    return (
      <Mui.Drawer
        id="invoiceOptions"
        open={open}
        anchor="bottom"
        anchorEl={anchorEl}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          style: {
            backgroundColor: 'white',
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
          },
        }}
      >
        <Mui.Stack className={css.effortlessOptions}>
          <Mui.Typography className={css.heading}>go Effortless</Mui.Typography>

          <Mui.Grid container style={{ padding: '0px 16px' }}>
            {effortLessOptions.map((e) => (
              <Mui.Grid item xs={3} key={`index${e.id}`}>
                <Mui.Stack style={{ alignItems: 'center' }}>
                  <Mui.Stack
                    style={{ backgroundColor: 'white', width: '50px' }}
                  >
                    <Mui.Stack
                      className={css.span}
                      key={e.id}
                      onClick={() =>
                        onClickMenuMethod(
                          e.route,
                          e.params,
                          e.path,
                          e.access,
                          e.navigateProps,
                        )
                      }
                    >
                      <img src={e.image} alt={e.image} />
                    </Mui.Stack>
                    {e.subIcon === true && (
                      <img src={timer} alt={timer} className={css.timer} />
                    )}
                  </Mui.Stack>
                  <Mui.Typography
                    className={css.stackIconText}
                    key={e.id}
                    onClick={e.onClick}
                  >
                    {e.label}
                  </Mui.Typography>
                </Mui.Stack>
              </Mui.Grid>
            ))}
          </Mui.Grid>
        </Mui.Stack>
      </Mui.Drawer>
    );
  };
  const effortLessOptions = [
    {
      id: 'invoice',
      label: 'Invoice',
      image: invoices,
      subIcon: false,
      // onClick: () => {
      //   effortlessOptionsClick('invoiceView');
      // },
      path: '/invoice-new',
      navigateProps: {
        state: { typeOfInvoice: 'tax_invoice' },
      },
      route: '/invoice-new',
      access: 'Invoicing',
    },
    {
      id: 'expense bills',
      label: 'expenses',
      image: expensebills,
      subIcon: false,
      // onClick: () => {
      //   effortlessOptionsClick('billbookView');
      // },
      path: '/bill-upload',
      route: '/bill-upload',
      access: 'Expense',
    },
    {
      id: 'payments',
      label: 'payments',
      image: payments,
      subIcon: false,
      // onClick: () => {
      //   effortlessOptionsClick('paymentView');
      // },
      path: '/payment-makepayment',
      route: '/payment-makepayment',
      access: 'Payments',
    },
    {
      id: 'banking',
      label: 'banking',
      image: banking,
      subIcon: false,
      // onClick: () => {
      //   effortlessOptionsClick('banking');
      // },
      path: '/banking',
      route: '/banking',
      access: 'Banking',
    },
    {
      id: 'creditNote',
      label: 'Credit Note',
      image: creditNote,
      subIcon: false,
      // onClick: () => {
      //   setOpenProgress(true);
      // },
      path: '/invoice-new',
      navigateProps: {
        state: { typeOfInvoice: 'credit_note' },
      },
      route: '/invoice-new',
      access: 'Invoicing',
    },
    {
      id: 'debitNote',
      label: 'Debit Note',
      image: debitNote,
      subIcon: false,
      // onClick: () => {
      //   setOpenProgress(true);
      // },
      path: '/invoice-new',
      navigateProps: {
        state: { typeOfInvoice: 'debit_note' },
      },
      route: '/invoice-new',
      access: 'Invoicing',
    },
    {
      id: 'estimate',
      label: 'estimate',
      image: time,
      subIcon: false,
      // onClick: () => {
      //   effortlessOptionsClick('estimateView');
      // },
      path: '/invoice-estimate',
      navigateProps: {
        state: { typeOfInvoice: 'estimate' },
      },
      route: '/invoice-estimate',
      params: 'estimate',
      access: 'Invoicing',
    },
    {
      id: 'receviable',
      label: 'Receviables',
      image: receviable,
      subIcon: false,
      path: '/receivables',
      route: '/receivables',
      access: 'Receivables',
    },
  ];

  const bottomArray = {
    Dashboard: false,
    banking: false,
    People: false,
    funding: false,
  };

  const [bottomsIcons, setBottomIcons] = useState({
    Dashboard: true,
    banking: false,
    People: false,
    funding: false,
  });

  const bottomNavIcons = [
    {
      id: 'home',
      icon: bottomsIcons.Dashboard ? <HomeIcon /> : <HomeGray />,
      label: 'Home',
      active: bottomsIcons.Dashboard,
      onClick: () => {
        changeSubView('Dashboard');
        navigate('/dashboard');
      },
    },
    {
      id: 'Banking',
      icon: bottomsIcons.banking ? <BankingOrange /> : <BankingIcon />,
      label: 'Banking',
      active: bottomsIcons.banking,
      onClick: () => {
        if (!userRolesBanking.Banking) {
          setHavePermission({
            open: true,
            back: () => {
              setHavePermission({ open: false });
            },
          });
          return;
        }
        changeSubView('banking');
        navigate('/banking');
      },
    },

    {
      id: 'plus',
      icon: <PlusIcon />,
      label: 'addInvoice',
      onClick: (e) => {
        onPlusIconClick(e);
      },
    },
    {
      id: 'People',
      icon: bottomsIcons.People ? <PeopleOrange /> : <PeopleIcon />,
      label: 'People',
      active: bottomsIcons.People,
      onClick: () => {
        if (!userRolesPeople.People) {
          setHavePermission({
            open: true,
            back: () => {
              setHavePermission({ open: false });
            },
          });
          return;
        }
        changeSubView('People');
        navigate('/people');
      },
    },
    {
      id: 'funding',
      icon: bottomsIcons.funding ? <RupeeOrange /> : <RupeeIcon />,
      label: 'Funding',
      active: bottomsIcons.funding,
      onClick: () => {
        setFeatureDrawer(!featureDrawer);
      },
    },
  ];

  const pathName = window.location.pathname;

  React.useEffect(() => {
    if (pathName.includes('/dashboard')) {
      setBottomIcons({ ...bottomArray, Dashboard: true });
    } else if (pathName.includes('/banking')) {
      setBottomIcons({ ...bottomArray, banking: true });
    } else if (pathName.includes('/people')) {
      setBottomIcons({ ...bottomArray, People: true });
    } else {
      setBottomIcons({ ...bottomArray });
    }
  }, [pathName]);

  const themes = Mui.useTheme();
  const desktopView = Mui.useMediaQuery(themes.breakpoints.up('sm'));

  const device = localStorage.getItem('device_detect');
  const [navVisibility, setNavVisibility] = useState(false);

  // const navBarVisibility = () => {
  //   if (
  //     pathName === '/dashboard' ||
  //     pathName === '/invoice-new-pdf' ||
  //     pathName === '/invoice-new-deliver' ||
  //     pathName === '/bill-upload' ||
  //     pathName === '/payment-advancePayments' ||
  //     // pathName === '/banking-categorize' ||
  //     pathName === '/payment-makepayment' ||
  //     pathName === '/RequestPayment'
  //   ) {
  //     setNavVisibility(true);
  //   } else {
  //     setNavVisibility(false);
  //   }
  // };
  // React.useEffect(() => {
  //   navBarVisibility();
  // }, [pathName]);
  return pathName === '/companydata' ? (
    <Router.Outlet />
  ) : (
    <Mui.Grid container height="100%" sx={{ justifyContent: 'flex-end' }}>
      <Mui.Grid
        item
        sx={{ width: device === 'mobile' ? '100%' : '82%', height: '100%' }}
      >
        <div
          style={{
            height:
              navVisibility === false && device === 'mobile' ? '100%' : '',
          }}
          className={
            (desktopView &&
              (subView !== 'makePayment'
                ? css.dashboardContainer2
                : css.hideDashboardContainerDesktop)) ||
            (subView !== 'makePayment'
              ? css.dashboardContainer
              : css.hideDashboardContainer)
          }
        >
          {/* {subView === 'effortlessPay' || <AppHeader />} */}
          <AppHeader />
          <Router.Outlet />
          {device === 'mobile' && !pathName.includes('/makepayment') ? (
            <BottomNavigation
              iconList={bottomNavIcons}
              setNavVisibilityParent={setNavVisibility}
            />
          ) : null}

          <InvoicePopOver
            open={Boolean(anchorEl)}
            handleClose={onInvoiceOptionsClose}
            anchorEl={anchorEl}
            effortLessOptions={effortLessOptions}
          />
          <Dialog
            open={Boolean(openProgress)}
            onClose={onProgressDialogClose}
            sx={{ borderRadius: '40px !important' }}
          >
            <Mui.Stack style={{ padding: '1rem' }}>
              <Mui.Typography variant="h6">Whoa!</Mui.Typography>
              <Mui.Typography>This feature is coming soon!</Mui.Typography>
            </Mui.Stack>
          </Dialog>
          <Mui.Dialog
            TransitionComponent={Transition}
            open={syncStatus?.open}
            onClose={() => setSyncStatus({})}
            PaperProps={{
              elevation: 3,
              style: {
                maxWidth: '25rem',
                minWidth: '20rem',
                width: 'auto',
                height: 'auto',
                minHeight: '75px',
                padding: '5px',
                position: 'absolute',
                left: '15px',
                bottom: '15px',
                overflow: 'visible',
                borderRadius: 16,
                cursor: 'pointer',
                border: '2px solid #40B145',
                justifyContent: 'center',
              },
            }}
          >
            <Mui.Stack direction="row" sx={{ gap: '10px' }}>
              <img src={circle} alt="success" className={css.success} />
              <Mui.Stack>
                <Mui.Typography className={css.successTxt}>
                  {syncStatus?.type}
                </Mui.Typography>
                <Mui.Typography className={css.messageTxt}>
                  {syncStatus?.message}
                </Mui.Typography>
              </Mui.Stack>
              <Mui.Button
                variant="contained"
                className={css.proceedBtn}
                onClick={() => NotifyCall(true)}
              >
                Proceed
              </Mui.Button>
            </Mui.Stack>
          </Mui.Dialog>
        </div>
      </Mui.Grid>
      <SimpleSnackbar
        openSnack={bankReq}
        message="Please add your bank account"
        setOpenSnack={setBankReq}
      />
      {havePermission.open && (
        <PermissionDialog onClose={() => havePermission.back()} />
      )}
    </Mui.Grid>
  );
};

export default DashboardViewContainer;
