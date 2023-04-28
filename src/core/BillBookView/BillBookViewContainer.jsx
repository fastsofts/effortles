import React, { useContext, useEffect, useState } from 'react';
import JSBridge from '@nativeBridge/jsbridge';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer.jsx';
import { PermissionDialog } from '@components/Permissions/PermissionDialog.jsx';
// import bill from '@assets/bill.svg';
import billsInQueue from '@assets/billsInQueue.svg';
import addAndManage from '@assets/addAndManage.svg';
import setupUtility from '@assets/setupUtility.svg';
import recordAnExpense from '@assets/recordAnExpense.svg';
import nothingtodisplay from '@assets/nothingtodisplay.svg';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import AppContext from '@root/AppContext.jsx';
import CheckIcon from '@material-ui/icons/Check';
import * as Mui from '@mui/material';
import BlockIcon from '@material-ui/icons/Block';
import Button from '@material-ui/core/Button';
import * as Router from 'react-router-dom';
import { useGoogleLogin, hasGrantedAllScopesGoogle } from '@react-oauth/google';
import css from './BillBookViewContainer.scss';
import DialogContainer from '../../components/DialogContainer/DialogContainer';
import { DontHaveBill, HaveBill } from '../../components/SvgIcons/SvgIcons';
import utilitybills from '../../assets/utilitybills.svg';
import yourbills from '../../assets/yourbills.svg';
import alarm1 from '../../assets/alarm1.svg';
import headset from '../../assets/headset.svg';
import recordexpense from '../../assets/recordexpense.svg';

const HaveBillDialogBody = ({ onClick }) => {
  return (
    <div className={css.haveBillDialogBody}>
      <div className={css.rowItem} onClick={() => onClick(true)}>
        <HaveBill />
        <div className={css.text}>I Have a Bill</div>
      </div>
      <div className={css.rowItem} onClick={() => onClick(false)}>
        <DontHaveBill />
        <div className={css.text}>I Do Not Have a Bill</div>
      </div>
    </div>
  );
};

const WithGstDialogBody = ({ onClick }) => {
  return (
    <div className={css.withGstDialogBody}>
      <div className={css.rowItem}>
        <div className={css.text}>I have a Bill</div>
      </div>
      <div className={css.rowItem} onClick={() => onClick(true)}>
        <CheckIcon />
        <div className={css.text}>With my GST number</div>
        <div className={css.desc}>
          GST Input Credit is available to the company only if it is mentioned
          in the bill
        </div>
      </div>
      <div className={css.rowItem} onClick={() => onClick(true)}>
        <BlockIcon />
        <div className={css.text}>Without my GST number</div>
        <div className={css.desc}>
          In case if you choose not to provide Company GST to the Vendor
        </div>
      </div>
    </div>
  );
};

const listItems = [
  {
    icon: recordAnExpense,
    view: 'uploadYourBillView-haveBill',
    title: 'Record An Expense',
    desc: 'Make a Note of your Recent Transaction',
    route: '/bill-upload',
  },
  {
    icon: setupUtility,
    view: 'utilityBillStatusView',
    title: 'Setup Utility Bills',
    desc: 'Create Bills for core Utilities needed to run your Business',
    route: '/bill-utility',
  },
  {
    icon: billsInQueue,
    view: 'draftBillView',
    title: 'Draft Bills',
    desc: 'Select a partially completed Bill and pick up where you had left off',
    route: '/bill-draft',
  },
  {
    icon: billsInQueue,
    view: 'billInQueueView',
    title: 'Bills In Queue',
    desc: 'Find Bills which are assigned to your SuperAccountant',
    route: '/bill-queue',
  },
  {
    icon: billsInQueue,
    view: 'yourBillsView',
    title: 'Your Bills',
    desc: 'Track all your Recorded Bills from one place',
    route: '/bill-yourbills',
  },
  {
    icon: addAndManage,
    view: 'addAndManage',
    title: 'Add And Manage',
    desc: 'Select a partially completed Bill and pick up where you had left off',
    route: '/bill-Add-And-Manage',
  },
];

const BillBookViewContainer = () => {
  const {
    organization,
    user,
    changeSubView,
    enableLoading,
    registerEventListeners,
    openSnackBar,
    userPermissions,
  } = useContext(AppContext);
  const [haveBillDialog, setHaveBillDialog] = useState(false);
  const [withGstBillDialog, setWithGstBillDialog] = useState(false);
  const [yourBills, setYourBills] = useState([]);
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

  const onClick = (view, path, index) => {
    const tempAccess = [
      userRoles?.['Bill Booking']?.view_bills,
      true,
      userRoles?.['Bill Booking']?.view_bills,
      userRoles?.['Bill Booking']?.view_bills,
      userRoles?.['Bill Booking']?.view_bills,
      userRoles?.['Bill Booking']?.view_bills,
    ];
    if (tempAccess[index]) {
      navigate(path);
    } else {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
    }
  };

  const onClickBillDialog = (haveBill) => {
    setHaveBillDialog(false);
    if (haveBill) setWithGstBillDialog(true);
    else changeSubView('uploadYourBillView');
  };

  const onClickGstDialog = () => {
    setWithGstBillDialog(false);
    changeSubView('uploadYourBillView-haveBill');
  };

  const connectGmailListener = (e) => {
    const { detail } = e;
    enableLoading(true);
    RestApi(`organizations/${organization.orgId}/email_users`, {
      method: METHOD.POST,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
      payload: {
        code: detail.code,
        provider: 'google',
      },
    })
      .then((res) => {
        enableLoading(false);
        console.log(res, 'successful');
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const [emailUsersList, setEmailUsersList] = React.useState('');
  const checkEmailList = () => {
    enableLoading(true);
    RestApi(`organizations/${organization.orgId}/email_users`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        if (res && !res.error) {
          setEmailUsersList(res.data);
        } else if (res && res.message) {
          openSnackBar({
            message: res.message,
            type: MESSAGE_TYPE.ERROR,
          });
        } else if (res.error) {
          const errorMessages = Object.values(res.errors);
          openSnackBar({
            message: errorMessages.join(', '),
            type: MESSAGE_TYPE.ERROR,
          });
        }
        enableLoading(false);
      })
      .catch((e) => {
        const errorMessages = Object.values(e.errors);
        openSnackBar({
          message: errorMessages.join(', '),
          type: MESSAGE_TYPE.ERROR,
        });
      });
  };

  const connectGmailListenerForWeb = (e) => {
    const hasAccess = hasGrantedAllScopesGoogle(
      e,
      'https://www.googleapis.com/auth/gmail.readonly',
    );
    console.log('hasAccess', hasAccess);
    enableLoading(true);
    RestApi(`organizations/${organization.orgId}/email_users`, {
      method: METHOD.POST,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
      payload: {
        code: e.code,
        provider: 'google',
        redirect_uri: window.location.origin,
      },
    })
      .then((res) => {
        enableLoading(false);
        console.log(res, 'successful');
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  useEffect(() => {
    registerEventListeners({
      name: 'gmailConnect',
      method: connectGmailListener,
    });
    checkEmailList();
  }, []);
  const device = localStorage.getItem('device_detect');
  // const Data = [
  //   {
  //     name: 'Acme Incorporated',
  //     amount: '35,000',
  //     date: '27th March 2022',
  //     quote: 'Contact your Super Accountant',
  //   },
  //   {
  //     name: 'Bongo Corp.',
  //     amount: '35,000',
  //     date: '27th March 2022',
  //     quote: 'Contact your Super Accountant',
  //   },
  //   {
  //     name: 'ABC Restaurants',
  //     amount: '35,000',
  //     date: '27th March 2022',
  //     quote: 'Contact your Super Accountant',
  //   },
  //   {
  //     name: 'Acme Incorporated',
  //     amount: '35,000',
  //     date: '27th March 2022',
  //     quote: 'Contact your Super Accountant',
  //   },
  // ];

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => connectGmailListenerForWeb(tokenResponse),
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    flow: 'auth-code',
    auto_select: true,
  });

  const getYourBills = () => {
    RestApi(
      `organizations/${organization.orgId}/vendor_bills?source_type=in_queue`,
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
          // res.data.map((a) => Object.assign(a));
          setYourBills(res?.data || []);
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  React.useEffect(() => {
    getYourBills();
  }, []);

  const OpenBillPage = (link, open) => {
    if (!open) {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
    } else {
      navigate(link);
    }
  };

  const GoogleLog = () => {
    if (!userRoles?.['Connect via Gmail']?.create_email_users) {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
      return;
    }
    googleLogin();
  };
  return device === 'desktop' ? (
    // here
    <>
      <Mui.Grid container spacing={2}>
        <Mui.Grid item container spacing={2} lg={6} md={6} xs={12}>
          <Mui.Grid item lg={6}>
            <Mui.Stack
              className={css.stack1}
              onClick={() =>
                OpenBillPage(
                  '/bill-yourbills',
                  userRoles?.['Bill Booking']?.view_bills,
                )
              }
            >
              <img src={yourbills} alt="yourbills" />
              <Mui.Typography className={css.imgText}>
                your bills
              </Mui.Typography>
            </Mui.Stack>
            <Mui.Stack
              mt={3}
              className={css.stack1}
              onClick={() => navigate('/bill-utility')}
            >
              <img src={utilitybills} alt="utilitybills" />
              <Mui.Typography className={css.imgText}>
                Setup Utility Bills
              </Mui.Typography>
            </Mui.Stack>
            <Mui.Stack
              mt={3}
              className={css.stack1}
              onClick={() =>
                OpenBillPage(
                  '/bill-salary',
                  userRoles?.['Bill Booking']?.view_bills,
                )
              }
            >
              {' '}
              <img src={utilitybills} alt="utilitybills" />
              <Mui.Typography className={css.imgText}>
                Salary Cost
              </Mui.Typography>
            </Mui.Stack>
          </Mui.Grid>
          <Mui.Grid item lg={6}>
            <Mui.Stack
              className={css.stack1}
              onClick={() =>
                OpenBillPage(
                  '/bill-upload',
                  userRoles?.['Bill Booking']?.view_bills,
                )
              }
            >
              <img
                src={recordexpense}
                alt="recordexpense"
                style={{ padding: '14px' }}
              />
              <Mui.Typography className={css.imgText}>
                Record an Expense
              </Mui.Typography>
            </Mui.Stack>
            <Mui.Stack
              mt={3}
              className={css.stack1}
              onClick={() =>
                OpenBillPage(
                  '/bill-draft',
                  userRoles?.['Bill Booking']?.view_bills,
                )
              }
            >
              {' '}
              <img src={utilitybills} alt="utilitybills" />
              <Mui.Typography className={css.imgText}>
                Draft Bills
              </Mui.Typography>
            </Mui.Stack>
            <Mui.Stack
              mt={3}
              className={css.stack1}
              onClick={() =>
                OpenBillPage(
                  '/bill-queue',
                  userRoles?.['Bill Booking']?.view_bills,
                )
              }
            >
              {' '}
              <img src={utilitybills} alt="utilitybills" />
              <Mui.Typography className={css.imgText}>
                Bills in Queue
              </Mui.Typography>
            </Mui.Stack>
          </Mui.Grid>
          {emailUsersList && emailUsersList.length > 0 ? (
            <Mui.Stack className={css.stack2} spacing={2} mt={2}>
              <Mui.Stack direction="row" className={css.connectTextStack}>
                <Mui.Typography className={css.connectText}>
                  <span className={css.connectTextTitle}>
                    {' '}
                    Record Bills from your Email
                  </span>
                  View Bills which have been delivered to your Email{' '}
                </Mui.Typography>
                <Mui.Button
                  className={css.connectTextBtn}
                  onClick={() => navigate('/bill-Add-And-Manage')}
                >
                  <Mui.Typography className={css.connectTextBtnText}>
                    Add and Manage
                  </Mui.Typography>
                </Mui.Button>
              </Mui.Stack>
            </Mui.Stack>
          ) : (
            <Mui.Stack className={css.stack2} spacing={2}>
              <Mui.Stack direction="row" className={css.connectTextStack}>
                <Mui.Typography className={css.connectText}>
                  Connecting your Gmail allows Effortless to track Bills sent to
                  you by your Vendor. Use this for a smoother Bill Booking
                  experience.{' '}
                </Mui.Typography>
                <Mui.Button
                  className={css.connectTextBtn}
                  onClick={() => GoogleLog()}
                >
                  <Mui.Typography className={css.connectTextBtnText}>
                    Connect Your Gmail
                  </Mui.Typography>
                </Mui.Button>
              </Mui.Stack>
            </Mui.Stack>
          )}
        </Mui.Grid>
        <Mui.Grid item lg={6} md={6} xs={12}>
          <Mui.Stack className={css.rightbillsqueueMain}>
            <Mui.Stack className={css.rightbillsqueueStack}>
              <Mui.Typography className={css.heading}>
                Your Bills in Queue
              </Mui.Typography>
              {yourBills?.length === 0 ? (
                <Mui.Stack
                  style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    // marginTop: '1rem',
                    minHeight: '67vh',
                  }}
                  className={css.cardStack}
                >
                  <img
                    src={nothingtodisplay}
                    alt="nothing"
                    style={{ width: '100px' }}
                  />
                  <Mui.Typography className={css.noDataText}>
                    No Bills Available in Queue
                  </Mui.Typography>
                </Mui.Stack>
              ) : (
                <>
                  {yourBills?.slice(0, 4)?.map((c) => {
                    return (
                      <Mui.Stack className={css.cardStack}>
                        <Mui.Card className={css.card}>
                          <Mui.Stack className={css.carddivmain} spacing={2}>
                            <Mui.Stack
                              direction="row"
                              className={css.carddivmainstack}
                            >
                              <Mui.Typography className={css.cardtext1}>
                                {c?.vendor?.name}
                              </Mui.Typography>
                              <Mui.Stack
                                direction="row"
                                className={css.cardtext2stack}
                              >
                                <Mui.Typography className={css.cardtext2}>
                                  Rs {c.amount}
                                </Mui.Typography>
                                <img src={alarm1} alt="alarm" />
                              </Mui.Stack>
                            </Mui.Stack>
                            <Mui.Stack
                              direction="row"
                              className={css.carddivmainstack}
                            >
                              <Mui.Typography className={css.cardtext3}>
                                {c.document_date}
                              </Mui.Typography>
                              <Mui.Stack
                                direction="row"
                                className={css.cardtext4stack}
                              >
                                <Mui.Typography className={css.cardtext4}>
                                  {/* {c.quote} */}
                                  Contact your Super Accountant
                                </Mui.Typography>
                                <img src={headset} alt="headset" />
                              </Mui.Stack>
                            </Mui.Stack>
                          </Mui.Stack>
                        </Mui.Card>
                      </Mui.Stack>
                    );
                  })}
                </>
              )}
            </Mui.Stack>
          </Mui.Stack>
        </Mui.Grid>
        {/* <Mui.Grid item lg={6} md={6}>
          <Mui.Stack spacing={2}>
            <Mui.Stack spacing={2}>
              <Mui.Stack direction="row" justifyContent="space-between">
                
                
              </Mui.Stack>
              <Mui.Stack direction="row" justifyContent="space-between">
               
                
              </Mui.Stack>
            </Mui.Stack>
            
          </Mui.Stack>
        </Mui.Grid>
        <Mui.Grid item lg={6} md={6}>
          
        </Mui.Grid> */}
      </Mui.Grid>
      {havePermission.open && (
        <PermissionDialog onClose={() => havePermission.back()} />
      )}
    </>
  ) : (
    <>
      <div className={css.billBookViewContainer}>
        <section className={css.header}>
          <div className={css.valueHeader}>Bill Booking</div>
          <div className={css.headerUnderline} />
        </section>
        <div className={css.card}>
          {listItems.map((item, index) => (
            <div
              key={item.title}
              className={css.listItem}
              onClick={() => onClick(item.view, item.route, index)}
              role="menuitem"
            >
              <div className={css.icon}>
                <img
                  src={item.icon}
                  className={css.iconImg}
                  alt={`${item.title} icon`}
                />
              </div>
              <div className={css.content}>
                <div className={css.title}>{item.title}</div>
                <div className={css.desc}>{item.desc}</div>
              </div>
              <ArrowForwardIosIcon className={css.arrow} />
            </div>
          ))}
        </div>
        {emailUsersList && emailUsersList.length > 0 ? (
          <div className={css.card}>
            <div className={css.note}>
              <span className={css.connectTextTitle}>
                {' '}
                Record Bills from your Email
              </span>
              View Bills which have been delivered to your Email{' '}
            </div>
            <div className={css.buttonContainer}>
              <Button
                variant="contained"
                className={css.primary}
                onClick={() => navigate('/bill-Add-And-Manage')}
              >
                Add and Manage
              </Button>
            </div>
          </div>
        ) : (
          <div className={css.card}>
            <div className={css.note}>
              Connecting your Gmail allows Effortless to track Bills sent to you
              by your Vendor. Use this for a smoother Bill Booking experience.{' '}
            </div>
            <div className={css.buttonContainer}>
              <Button
                variant="contained"
                className={css.primary}
                onClick={() => {
                  JSBridge.launchGoogleForGmailConnect();
                }}
              >
                Connect Your Gmail
              </Button>
            </div>
          </div>
        )}
        <DialogContainer
          title=""
          body={<HaveBillDialogBody onClick={onClickBillDialog} />}
          open={haveBillDialog}
          dismissOnBackdropClick
          onCancel={() => setHaveBillDialog(false)}
          maxWidth="lg"
        />
        <DialogContainer
          title=""
          body={<WithGstDialogBody onClick={onClickGstDialog} />}
          open={withGstBillDialog}
          dismissOnBackdropClick
          onCancel={() => setWithGstBillDialog(false)}
          maxWidth="lg"
        />
      </div>
      {havePermission.open && (
        <PermissionDialog onClose={() => havePermission.back()} />
      )}
    </>
  );
};

export default BillBookViewContainer;
