/* eslint-disable no-else-return */

import React, { useContext, useState, useLayoutEffect } from 'react';
import { Grid, Button } from '@material-ui/core';
import AppContext from '@root/AppContext.jsx';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer.jsx';
import { PermissionDialog } from '@components/Permissions/PermissionDialog.jsx';
import * as Mui from '@mui/material';
import paymentsEmpty from '@assets/paymentsEmpty.svg';
import paymentsEmpty2 from '@assets/paymentsEmpty2.svg';
import paymentsEmpty3 from '@assets/paymentsEmpty3.svg';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import * as Router from 'react-router-dom';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet';
import { FormattedAmount } from '@components/formattedValue/FormattedValue';
import css from './Payments.scss';
import Rupee from '../../assets/rupee.svg';
import QRCode from '../../assets/qr.svg';
import payment1 from '../../assets/payment1.svg';
import payment2 from '../../assets/payment2.svg';
import payment from '../../assets/payment.svg';
import effortless from '../../assets/effortless.svg';
import emptyPayments from '../../assets/emptyPayments.svg';
import PaymentBankReq from './component/PaymentBankReq.jsx';

const Payments = () => {
  const {
    changeSubView,
    organization,
    enableLoading,
    user,
    openSnackBar,
    userPermissions,
  } = useContext(AppContext);
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [payments, setPayments] = useState();
  const [vendorPaymentsSummary, setVendorPaymentsSummary] = useState([]);
  const navigate = Router.useNavigate();
  const [drawer, setDrawer] = React.useState({
    paymentBank: false,
  });
  const [clickVendorId, setClickVendorId] = React.useState('');

  const [userRoles, setUserRoles] = React.useState({});
  const [havePermission, setHavePermission] = React.useState({ open: false });

  React.useEffect(() => {
    if (Object.keys(userPermissions?.Payments || {})?.length > 0) {
      if (!userPermissions?.Payments?.Payment) {
        setHavePermission({
          open: true,
          back: () => {
            navigate('/dashboard');
            setHavePermission({ open: false });
          },
        });
      }
      setUserRoles({ ...userPermissions?.Payments });
    }
  }, [userPermissions]);

  // const themes = Mui.useTheme();
  // const desktopView = Mui.useMediaQuery(themes.breakpoints.up('sm'));
  const device = localStorage.getItem('device_detect');
  const handleBottomSheetOpen = (open, id) => {
    setDrawer((prev) => ({ ...prev, [open]: true }));
    if (id !== null) {
      setClickVendorId(id);
    }
  };

  const handleBottomSheetClose = (close) => {
    setDrawer((prev) => ({ ...prev, [close]: false }));
  };

  const getPayments = async () => {
    enableLoading(true);

    await RestApi(`organizations/${organization.orgId}/dashboard/payments`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        enableLoading(false);
        if (res && !res.error) {
          setPayments(res);
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const getVendorPaymentsSummary = async () => {
    enableLoading(true);

    await RestApi(
      `organizations/${organization.orgId}/vendor_unsettled?grouped=true`,
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
          setVendorPaymentsSummary(res.data);
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  useLayoutEffect(() => {
    const getData = async () => {
      await getPayments();
      await getVendorPaymentsSummary();
    };
    getData();
    setPaymentProcessed(false);
    setPaymentFailed(false);
  }, []);

  const makeQuickPayments = async (type, vendorId = null) => {
    const body = {};
    if (vendorId === null) {
      body.type = type;
    } else {
      body.vendor_id = vendorId;
    }
    enableLoading(true);
    await RestApi(`organizations/${organization.orgId}/quick_payments`, {
      method: METHOD.POST,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
      payload: {
        ...body,
      },
    })
      .then((res) => {
        enableLoading(false);
        if (res && !res.error) {
          if (res.message === 'No vendor bank details is present') {
            handleBottomSheetOpen('paymentBank', vendorId);
            return;
          } else if (res?.message) {
            openSnackBar({
              message:
                res?.message || 'Something went Wrong, We will look into it',
              type: MESSAGE_TYPE.ERROR,
            });
            return;
          }
          changeSubView('makePayment', res);
          navigate('/payment-makepayment', {
            state: {
              payment: res,
              vendorUnsettled: vendorPaymentsSummary,
              opt: type,
            },
          });
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };
  const [accStatus, setAccStatus] = React.useState(false);
  const fetchVirtualAccAmt = () => {
    enableLoading(true);
    RestApi(
      `organizations/${organization?.orgId}/effortless_virtual_accounts`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user?.activeToken}`,
        },
      },
    )
      .then((res) => {
        if (res) {
          if (res.message !== 'Effortless Virtual Account not created yet') {
            setAccStatus(true);
          } else {
            setAccStatus(false);
          }
        } else {
          enableLoading(false);
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  React.useEffect(() => {
    fetchVirtualAccAmt();
  }, []);
  return (
    <>
      {device === 'desktop' ? (
        <Mui.Stack className={css.paymentsContainer}>
          {/* <Mui.Stack className={css.paymentsStackMain} direction="row"> */}
          <Mui.Grid container>
            <Mui.Grid lg={8} md={8}>
              {/* left */}
              <Mui.Stack className={css.paymentsStackMain} spacing={2}>
                <Mui.Typography className={css.heading}>
                  Payments Made Effortless
                </Mui.Typography>
                <Mui.Stack
                  direction="row"
                  spacing={2}
                  style={{ width: '100%' }}
                >
                  <Mui.Stack spacing={2} style={{ width: '100%' }}>
                    <Mui.Stack style={{ width: '100%' }}>
                      <img
                        src={payment1}
                        alt="payment"
                        style={{ width: '100%' }}
                      />
                      <Mui.Stack className={css.payment1Text}>
                        <Mui.Typography className={css.payment1Text1}>
                          {accStatus
                            ? 'Effortless Pay'
                            : 'Add Effortless Account'}
                        </Mui.Typography>
                        {accStatus ? (
                          <Mui.Typography className={css.payment1Text2}>
                            Make a payment using <br /> effortless pay
                          </Mui.Typography>
                        ) : (
                          <Mui.Typography className={css.payment1Text2}>
                            Make payment with <br />
                            effortless account
                          </Mui.Typography>
                        )}
                      </Mui.Stack>
                      {accStatus ? (
                        <Mui.Grid className={css.avatarStackRemove}> </Mui.Grid>
                      ) : (
                        // <Mui.Avatar className={css.avatarStack}>
                        //   <ArrowForwardIcon />
                        // </Mui.Avatar>
                        <Mui.Avatar
                          className={css.avatarStackNoAcc}
                          onClick={() => {
                            navigate('/banking-virtualAccountOnBoarding');
                          }}
                        >
                          <img src={emptyPayments} alt="plus" width=" 40px" />
                        </Mui.Avatar>
                      )}
                    </Mui.Stack>

                    <Mui.Stack
                      direction="row"
                      className={
                        accStatus ? css.paynowStack : css.paynowStackNoAcc
                      }
                      style={{ width: '100%', cursor: 'pointer' }}
                      onClick={() => {
                        if (!userRoles?.Payment?.create_payment) {
                          setHavePermission({
                            open: true,
                            back: () => {
                              setHavePermission({ open: false });
                            },
                          });
                          return;
                        }
                        navigate('/payment-advancepayments');
                      }}
                    >
                      <Mui.Avatar
                        className={
                          accStatus ? css.avatarpaynow : css.avatarpaynowNoAcc
                        }
                      >
                        <img src={payment} alt="payment" />
                      </Mui.Avatar>
                      <Mui.Typography className={css.avatarpaynowText}>
                        Pay an Advance
                      </Mui.Typography>
                      {accStatus && (
                        <Mui.Button
                          className={css.avatarpaynowBtn}
                          onClick={() => {
                            if (!userRoles?.Payment?.create_payment) {
                              setHavePermission({
                                open: true,
                                back: () => {
                                  setHavePermission({ open: false });
                                },
                              });
                              return;
                            }
                            changeSubView('advancePayments');
                            navigate('/payment-advancepayments');
                          }}
                        >
                          <Mui.Typography className={css.avatarpaynowBtnText}>
                            Pay now
                          </Mui.Typography>
                        </Mui.Button>
                      )}
                    </Mui.Stack>
                  </Mui.Stack>
                  {/* right */}
                  <Mui.Stack
                    className={css.paymentStack}
                    style={{ width: '100%' }}
                  >
                    <img
                      src={
                        vendorPaymentsSummary.length > 0
                          ? payment2
                          : paymentsEmpty
                      }
                      alt="payment"
                      style={{ width: '180px', height: '140px' }}
                    />
                    {vendorPaymentsSummary.length > 0 && (
                      <Mui.Typography className={css.paymentStackText1}>
                        Make a Payment
                      </Mui.Typography>
                    )}
                    <Mui.Typography className={css.paymentStackText2}>
                      {vendorPaymentsSummary.length > 0
                        ? 'Click to pay instantly'
                        : 'Instant payment will be enabled on adding your account'}
                    </Mui.Typography>
                    {vendorPaymentsSummary.length > 0 && (
                      <Mui.Button
                        className={css.paymentStackBtn}
                        onClick={() => {
                          if (!userRoles?.Payment?.create_payment) {
                            setHavePermission({
                              open: true,
                              back: () => {
                                setHavePermission({ open: false });
                              },
                            });
                            return;
                          }
                          changeSubView('makePayment');
                          navigate('/payment-makepayment');
                        }}
                      >
                        <Mui.Typography className={css.paymentStackBtnText}>
                          Pay now
                        </Mui.Typography>
                      </Mui.Button>
                    )}
                  </Mui.Stack>
                </Mui.Stack>
                <Mui.Stack spacing={2} style={{ paddingTop: '4rem' }}>
                  <Mui.Typography className={css.heading}>
                    Pay your bills
                  </Mui.Typography>
                  <Mui.Stack spacing={2} style={{ width: '100%' }}>
                    <Mui.Stack direction="row" spacing={2}>
                      {vendorPaymentsSummary.length > 0 ? (
                        <Mui.Card
                          className={css.card1}
                          style={{ width: '100%' }}
                        >
                          {payments?.over_due &&
                            payments.over_due.amount > 0 && (
                              <Mui.Stack direction="row" alignItems="center">
                                <Mui.Stack className={css.card1Stack}>
                                  <Mui.Typography className={css.card1text1}>
                                    Overdue Today
                                  </Mui.Typography>
                                  <Mui.Typography className={css.card1text2}>
                                    {FormattedAmount(
                                      payments?.over_due?.amount,
                                    )}
                                  </Mui.Typography>
                                  <Mui.Typography className={css.card1text3}>
                                    {payments.over_due.bill_count} Bills to{' '}
                                    {payments.over_due.vendor_count} Parties are
                                    Overdue Today.
                                  </Mui.Typography>
                                </Mui.Stack>
                                <Mui.Button
                                  className={css.payBtn}
                                  onClick={() => {
                                    if (!userRoles?.Payment?.create_payment) {
                                      setHavePermission({
                                        open: true,
                                        back: () => {
                                          setHavePermission({ open: false });
                                        },
                                      });
                                      return;
                                    }
                                    makeQuickPayments('overdue');
                                  }}
                                >
                                  <Mui.Typography className={css.payBtnText}>
                                    pay now
                                  </Mui.Typography>
                                </Mui.Button>
                              </Mui.Stack>
                            )}
                        </Mui.Card>
                      ) : (
                        <Mui.Stack
                          className={css.paymentStackNoAcc}
                          style={{ width: '100%' }}
                        >
                          <img
                            src={paymentsEmpty3}
                            alt="payment"
                            style={{ width: '180px', height: '140px' }}
                          />

                          <Mui.Typography className={css.paymentStackText2}>
                            There are nothing to display.
                          </Mui.Typography>
                        </Mui.Stack>
                      )}
                      {vendorPaymentsSummary.length > 0 && (
                        <Mui.Card
                          className={css.card2}
                          style={{ width: '100%' }}
                        >
                          {payments?.payables &&
                          payments.payables.amount > 0 ? (
                            <Mui.Stack direction="row" alignItems="center">
                              <Mui.Stack className={css.card2Stack}>
                                <Mui.Typography className={css.card2text1}>
                                  Due This Week
                                </Mui.Typography>
                                <Mui.Typography className={css.card2text2}>
                                  {FormattedAmount(payments?.payables?.amount)}
                                </Mui.Typography>
                                <Mui.Typography className={css.card2text3}>
                                  {payments.payables.vendor_count} Bills to{' '}
                                  {payments.payables.bill_count} Parties due
                                  this Week
                                </Mui.Typography>
                              </Mui.Stack>
                              <Mui.Button
                                className={css.payBtn}
                                onClick={() => {
                                  if (!userRoles?.Payment?.create_payment) {
                                    setHavePermission({
                                      open: true,
                                      back: () => {
                                        setHavePermission({ open: false });
                                      },
                                    });
                                    return;
                                  }
                                  makeQuickPayments('payables');
                                }}
                              >
                                <Mui.Typography className={css.payBtnText}>
                                  pay now
                                </Mui.Typography>
                              </Mui.Button>
                            </Mui.Stack>
                          ) : (
                            <Mui.Stack
                              style={{
                                width: '100%',
                                height: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Mui.Typography> No Dues</Mui.Typography>
                            </Mui.Stack>
                          )}
                        </Mui.Card>
                      )}
                    </Mui.Stack>
                    {/* {vendorPaymentsSummary.length !== [] && (
                      <Mui.Stack direction="row" className={css.billPayStack}>
                        <Mui.Stack>
                          <Mui.Typography className={css.billPayStackText1}>
                            bill pays
                          </Mui.Typography>
                          <Mui.Typography className={css.billPayStackText2}>
                            You have successfully paid. 50 Bills this Month.
                          </Mui.Typography>
                        </Mui.Stack>
                        <Mui.Button className={css.billPayStackBtn}>
                          <Mui.Typography className={css.billPayStackBtnText}>
                            view
                          </Mui.Typography>
                        </Mui.Button>
                      </Mui.Stack>
                    )} */}
                  </Mui.Stack>
                </Mui.Stack>
              </Mui.Stack>
            </Mui.Grid>

            {/* right */}
            <Mui.Grid lg={4} md={4}>
              <Mui.Stack className={css.paymentsStackMain} spacing={2}>
                <Mui.Typography className={css.heading}>
                  Settle Vendor Bills
                </Mui.Typography>
                {vendorPaymentsSummary.length > 0 ? (
                  <>
                    <Mui.Stack className={css.vendorContainerDesktopMain}>
                      <Mui.Stack className={css.vendorContainerDesktop}>
                        {vendorPaymentsSummary &&
                          vendorPaymentsSummary.length > 0 &&
                          vendorPaymentsSummary
                            .filter((a) => Number(a.total_net_balance) > 0)
                            .map((item) => {
                              return (
                                <div
                                  className={css.vendorCard}
                                  key={item.vendor_id}
                                  style={{
                                    minWidth:
                                      device === 'desktop' ? '0px' : '72vw',
                                  }}
                                >
                                  <div className={css.vendorCardBody}>
                                    <p>
                                      {item.name} - {item.total_count}{' '}
                                      Outstanding Bills
                                    </p>
                                    <span>
                                      {FormattedAmount(item?.total_net_balance)}
                                    </span>
                                  </div>
                                  <div className={css.vendorCardAction}>
                                    <Button
                                      onClick={() => {
                                        if (
                                          !userRoles?.Payment?.create_payment
                                        ) {
                                          setHavePermission({
                                            open: true,
                                            back: () => {
                                              setHavePermission({
                                                open: false,
                                              });
                                            },
                                          });
                                          return;
                                        }
                                        makeQuickPayments(null, item.id);
                                      }}
                                      size="medium"
                                      className={css.outlineSubmit}
                                    >
                                      Pay Now
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                      </Mui.Stack>
                    </Mui.Stack>
                  </>
                ) : (
                  <Mui.Stack
                    className={css.paymentStack}
                    style={{ width: '100%' }}
                  >
                    <img
                      className={css.paddingTop}
                      src={paymentsEmpty2}
                      alt="payment"
                      style={{ width: '180px', height: '140px' }}
                    />

                    <Mui.Typography className={css.paymentStackTextNoacc}>
                      View vendor Bills on adding <br /> your account
                    </Mui.Typography>
                  </Mui.Stack>
                )}
                <Mui.Stack
                  className={css.activityStack}
                  style={{ width: '100%' }}
                >
                  <Mui.Stack
                    className={
                      // vendorPaymentsSummary.length > 0
                      css.activityStack1
                      // : css.activityStack2
                    }
                  >
                    <Mui.Typography>Other Activites</Mui.Typography>
                    <Mui.Stack
                      direction="row"
                      onClick={() => {
                        // if (vendorPaymentsSummary.length > 0) {
                        navigate('/banking-new');
                        // }
                      }}
                      style={{ alignItems: 'center', marginTop: '1rem' }}
                      spacing={2}
                    >
                      <Mui.Avatar className={css.activityAvatar}>
                        <img src={effortless} alt="payments" />
                      </Mui.Avatar>
                      <Mui.Typography className={css.activityText}>
                        Connected Banking
                      </Mui.Typography>
                    </Mui.Stack>
                    {vendorPaymentsSummary.length > 0 && (
                      <Mui.Stack
                        direction="row"
                        style={{ alignItems: 'center', marginTop: '1rem' }}
                        spacing={2}
                      >
                        <Mui.Avatar className={css.activityAvatar}>
                          <img src={QRCode} alt="Rupee" />
                        </Mui.Avatar>
                        <Mui.Typography className={css.activityText}>
                          Pay Your Bills
                        </Mui.Typography>
                      </Mui.Stack>
                    )}
                    <Mui.Stack
                      direction="row"
                      style={{ alignItems: 'center', marginTop: '1rem' }}
                      spacing={2}
                      onClick={() => {
                        // if (vendorPaymentsSummary.length > 0) {
                        if (
                          !userRoles['Payments History']?.view_payment_history
                        ) {
                          setHavePermission({
                            open: true,
                            back: () => {
                              setHavePermission({ open: false });
                            },
                          });
                          return;
                        }
                        changeSubView('paymentHistory');
                        navigate('/payment-history');
                        // }
                      }}
                    >
                      <Mui.Avatar className={css.activityAvatar}>
                        <img src={Rupee} alt="payments" />
                      </Mui.Avatar>
                      <Mui.Typography className={css.activityText}>
                        Payment History
                      </Mui.Typography>
                    </Mui.Stack>
                  </Mui.Stack>
                </Mui.Stack>
              </Mui.Stack>
            </Mui.Grid>
          </Mui.Grid>
          {/* end */}
          {/* </Mui.Stack> */}
        </Mui.Stack>
      ) : (
        <>
          <div className={css.dashboardBodyContainer}>
            <div className={css.advancePaymentContainer}>
              <div>
                {paymentProcessed && (
                  <div className={`${css.paymentProcessed} ${css.paymentInfo}`}>
                    <div className={css.cardBody}>
                      <p className={css.cardTitle}>Payment is Underway</p>
                      <p className={css.cardSubTitle}>
                        Payment to 3 Parties is being processed
                      </p>
                    </div>
                    <div className={css.cardAction}>
                      <Button
                        onClick={() => {
                          changeSubView('paymentHistory');
                          navigate('/payment-history');
                        }}
                        size="large"
                        className={css.submitButton}
                      >
                        Track
                      </Button>
                    </div>
                  </div>
                )}
                {paymentFailed && (
                  <div className={`${css.paymentFailed} ${css.paymentInfo}`}>
                    <div className={css.cardBody}>
                      <p className={css.cardTitle}>Attention Required</p>
                      <p className={css.cardSubTitle}>
                        Payment to 3 Parties has failed
                      </p>
                    </div>
                    <div className={css.cardAction}>
                      <Button size="large" className={css.submitButton}>
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
                <div className={css.overdueContainer}>
                  {payments?.over_due && payments.over_due.amount > 0 && (
                    <div className={css.overdueCard}>
                      <div className={css.overdueCardMain}>
                        <div className={css.overdueBody}>
                          <p className={css.overdueTitle}>Overdue Today</p>
                          <p className={css.overdueContent}>
                            {FormattedAmount(payments?.over_due?.amount)}
                            <br />
                            <span>
                              {payments.over_due.bill_count} Bills to{' '}
                              {payments.over_due.vendor_count} Parties are
                              Overdue Today.
                            </span>
                          </p>
                        </div>
                        <div className={css.overdueAction}>
                          <Button
                            onClick={() => {
                              if (!userRoles?.Payment?.create_payment) {
                                setHavePermission({
                                  open: true,
                                  back: () => {
                                    setHavePermission({ open: false });
                                  },
                                });
                                return;
                              }
                              makeQuickPayments('overdue');
                            }}
                            size="large"
                            className={css.submitButton}
                          >
                            <Mui.Typography className={css.submitButtonTxt}>
                              Pay Now
                            </Mui.Typography>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {payments?.payables && payments.payables.amount > 0 && (
                    <div className={css.overdueCard}>
                      <div className={css.overdueCardMain}>
                        <div className={css.overdueBody}>
                          <p className={css.overdueTitle}>Due This Week</p>
                          <p className={css.overdueContent}>
                            {FormattedAmount(payments?.payables?.amount)}
                            <br />
                            <span>
                              {payments.payables.vendor_count} Bills to{' '}
                              {payments.payables.bill_count} Parties due this
                              Week
                            </span>
                          </p>
                        </div>
                        <div className={css.overdueAction}>
                          <Button
                            onClick={() => {
                              if (!userRoles?.Payment?.create_payment) {
                                setHavePermission({
                                  open: true,
                                  back: () => {
                                    setHavePermission({ open: false });
                                  },
                                });
                                return;
                              }
                              makeQuickPayments('payables');
                            }}
                            size="large"
                            className={css.submitButton}
                          >
                            <Mui.Typography className={css.submitButtonTxt}>
                              Pay Now
                            </Mui.Typography>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className={css.mainContainer}>
                  <p className={css.title}>Payments Made Effortless</p>
                  <div className={css.contentBody}>
                    <Grid container spacing={2} direction="row">
                      <Grid
                        item
                        xs={4}
                        className={css.item}
                        onClick={() => {
                          if (!userRoles?.Payment?.create_payment) {
                            setHavePermission({
                              open: true,
                              back: () => {
                                setHavePermission({ open: false });
                              },
                            });
                            return;
                          }
                          changeSubView('makePayment');
                          navigate('/payment-makePayment');
                        }}
                      >
                        <div className={css.icon}>
                          <img src={Rupee} alt="Rupee" />
                        </div>
                        <p>Make a Payment</p>
                      </Grid>
                      <Grid item xs={4} className={css.item}>
                        <div className={css.icon}>
                          <img src={QRCode} alt="Rupee" />
                        </div>
                        <p>Effortless Pay</p>
                      </Grid>
                      <Grid
                        item
                        xs={4}
                        className={css.item}
                        onClick={() => {
                          if (!userRoles?.Payment?.create_payment) {
                            setHavePermission({
                              open: true,
                              back: () => {
                                setHavePermission({ open: false });
                              },
                            });
                            return;
                          }
                          changeSubView('advancePayments');
                          navigate('/payment-advancePayments');
                        }}
                      >
                        <div className={css.icon}>
                          <img src={Rupee} alt="Rupee" />
                        </div>
                        <p>Pay an Advance</p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
                {vendorPaymentsSummary && vendorPaymentsSummary.length > 0 && (
                  <p className={css.sectionTitle}>Settle Vendor Bills</p>
                )}
                <div className={css.vendorContainer}>
                  {vendorPaymentsSummary &&
                    vendorPaymentsSummary.length > 0 &&
                    vendorPaymentsSummary
                      .filter((a) => Number(a.total_net_balance) > 0)
                      .map((item) => {
                        return (
                          <div className={css.vendorCard} key={item.vendor_id}>
                            <div className={css.vendorCardBody}>
                              <p>
                                {item.name} - {item.total_count} Outstanding
                                Bills
                              </p>
                              <span>
                                {FormattedAmount(item?.total_net_balance)}
                              </span>
                            </div>
                            <div className={css.vendorCardAction}>
                              <Button
                                onClick={() => {
                                  if (!userRoles?.Payment?.create_payment) {
                                    setHavePermission({
                                      open: true,
                                      back: () => {
                                        setHavePermission({ open: false });
                                      },
                                    });
                                    return;
                                  }
                                  makeQuickPayments(null, item.id);
                                }}
                                size="medium"
                                className={css.outlineSubmit}
                              >
                                Pay Now
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                </div>
                <p className={css.sectionTitle}>Other Activities</p>
                <div className={css.otherActivities}>
                  <div
                    className={css.otherActivity}
                    onClick={
                      () => navigate('/banking')
                      //   {
                      //   if (accStatus === false) {
                      //     changeSubView('BankingForms', 'fromBottom');
                      //     navigate('/banking-M2PForms');
                      //   } else {
                      //     navigate('/banking-banklist');
                      //   }
                      // }
                    }
                  >
                    <p>Connected Banking</p>
                  </div>
                  <div className={css.otherActivity}>
                    <p>
                      Pay Your <br /> Bills
                    </p>
                  </div>
                  <div
                    className={css.otherActivity}
                    onClick={() => {
                      if (
                        !userRoles['Payments History']?.view_payment_history
                      ) {
                        setHavePermission({
                          open: true,
                          back: () => {
                            setHavePermission({ open: false });
                          },
                        });
                        return;
                      }
                      changeSubView('paymentHistory');
                      navigate('/payment-history');
                    }}
                  >
                    <p>Payment History</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <Mui.Dialog
        open={drawer.paymentBank && device === 'desktop'}
        onClose={() => handleBottomSheetClose('paymentBank')}
      >
        <PaymentBankReq
          vendorId={clickVendorId}
          handleBottomSheet={() => handleBottomSheetClose('paymentBank')}
        />
      </Mui.Dialog>
      <SelectBottomSheet
        open={drawer.paymentBank && device === 'mobile'}
        onClose={() => handleBottomSheetClose('paymentBank')}
        addNewSheet
        id="overFlowHidden"
        triggerComponent={<></>}
        onTrigger={handleBottomSheetOpen}
      >
        <PaymentBankReq
          vendorId={clickVendorId}
          handleBottomSheet={() => handleBottomSheetClose('paymentBank')}
        />
      </SelectBottomSheet>
      {havePermission.open && (
        <PermissionDialog onClose={() => havePermission.back()} />
      )}
    </>
  );
};
export default Payments;
