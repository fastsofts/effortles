/* eslint-disable no-unused-vars */
/* eslint-disable no-lonely-if */

import React, { useState, useContext, useEffect } from 'react';
import AppContext from '@root/AppContext.jsx';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer.jsx';
import LoadWithDraw from '@components/LoadAndWithdraw/LoadWithDrawSheet';
import TransactionPassword from '@core/PaymentView/TransactionVerify/TransactionPassword';

import * as Mui from '@mui/material';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import { Dialog } from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import * as Router from 'react-router-dom';
import JSBridge from '@nativeBridge/jsbridge';
import VerificationView from '@core/PaymentView/EffortlessPay/VerificationView';
import { FormattedAmount } from '@components/formattedValue/FormattedValue';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet';
import {
  VerificationCodeInput,
  VCODE_LENGTH,
} from '@core/LoginContainer/VerificationCodeContainer.jsx';
import css from './ProceedToPay.scss';
import PayNow from './PayNow';

function ProceedToPay({
  onClose,
  showVerifyPassword,
  bankAccounts,
  paidAmount,
  payNow,
  paymentVoucharId,
  advancePaymentId,
  setAdvancePaymentDetails,
  setMultiplePayments,
  setPaymentsResponse,
  ShowTransForgPass,
}) {
  const navigate = Router.useNavigate();
  const {
    organization,
    user,
    openSnackBar,
    enableLoading,
    changeSubView,
    setTransactionType,
    transactionType,
    currentUserInfo,
    setTransactionTypeList,
  } = useContext(AppContext);

  const [otpMobileNumber, setOtpMobileNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [accountId, setAccountId] = useState('');
  const [drawer, setDrawer] = showVerifyPassword;
  const [oneClickButton, setOneClickButton] = useState(false);
  const [payUDatas, setPayUData] = React.useState();
  const [payUSha, setPayUSha] = React.useState();
  const [showPassword, setShowPassword] = useState(true);
  const [apiError, setApiError] = useState('');
  const [hasBalance, setHasBalance] = useState(
    Number(
      bankAccounts?.connected_banking?.find(
        (a) => a.name === 'Effortless Virtual Account',
      )?.balance -
        Number(paidAmount) >
        0,
    ),
  );
  const [otpNumber, setOtpNumber] = useState('');
  const [modalError, setModalError] = React.useState(false);
  const [transactionPasswordInput, setTransactionPasswordInput] =
    React.useState('');
  const [collapseFirstModalSection, setCollapseFirstModalSection] =
    React.useState(false);
  const onOtpComplete = (val) => setOtpNumber(val);
  const [completedTransaction, setCompletedTransaction] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [bankDetail, setBankDetail] = React.useState({
    data: [],
    open: false,
    id: '',
  });
  const [bankListingDetails, setBankListingDetails] = React.useState();
  const [congratsDrawer, setCongratsDrawer] = React.useState(false);
  const [payUlink, setPayUlink] = React.useState(
    'https://secure.payu.in/_payment',
  );
  const [payUSalt, setPayUSalt] = React.useState(
    '1m95eGJLk8MgVsrw817fxCkz3YC9JCwu',
  );

  useEffect(() => {
    const live =
      window.location.origin === 'https://app.goeffortless.co' ||
      window.location.origin === 'https://i.goeffortless.ai' ||
      window.location.origin === 'https://d11997a5ngzp0a.cloudfront.net';
    if (live) {
      setPayUlink('https://secure.payu.in/_payment');
      setPayUSalt('1m95eGJLk8MgVsrw817fxCkz3YC9JCwu');
    } else {
      setPayUlink('https://test.payu.in/_payment');
      setPayUSalt('4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW');
    }
  }, []);

  const showError = (message) => {
    openSnackBar({
      message: message || 'Unknown Error Occured',
      type: 'error',
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  function sha512(str) {
    return window.crypto.subtle
      .digest('SHA-512', new TextEncoder('utf-8').encode(str))
      .then((buf) => {
        return Array.prototype.map
          .call(new Uint8Array(buf), (x) => `00${x?.toString(16)}`.slice(-2))
          .join('');
      });
  }

  const createPayment = async (bankId) => {
    await RestApi(
      `organizations/${organization.orgId}/effortless_virtual_accounts/create_payment`,
      {
        method: METHOD.POST,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
        payload: {
          amount: Number(
            (
              Number(paidAmount) -
              Number(
                bankAccounts.connected_banking.find(
                  (a) => a.name === 'Effortless Virtual Account',
                )?.balance,
              )
            )?.toFixed(2),
          ),
          payment_voucher_id: paymentVoucharId,
          bank_account_id: bankId,
        },
      },
    )
      .then(async (res) => {
        if (res && !res.error) {
          if (localStorage.getItem('device_detect') !== 'desktop') {
            const udf1 = `${window.location.origin}/banking`;
            const payUsha = await sha512(
              `${res.key}|${res.txn_id}|${res.amount}|${res.product_info}|${res.firstname}|${res.email}|${udf1}||||||||||${payUSalt}`,
            ).then((x) => x);
            await Object.assign(res, { payUsha });
            JSBridge.connectPayU(JSON.stringify(res));
          } else {
            const udf1 = `${window.location.origin}/banking`;
            const payUsha = await sha512(
              `${res.key}|${res.txn_id}|${res.amount}|${res.product_info}|${res.firstname}|${res.email}|${udf1}||||||||||${payUSalt}`,
            ).then((x) => x);
            setPayUSha(payUsha);
            setPayUData(res);
            setTimeout(() => {
              document.getElementById('payUbtn').click();
              enableLoading(false);
            }, 2000);
          }
        } else if(res?.error){
          showError(res?.message);
        }
      })
      .catch((e) => {
        showError(e);
      });
  };

  const fetchBankDetails = () => {
    enableLoading(true);
    RestApi(
      `organizations/${organization?.orgId}/yodlee_bank_accounts/bank_listing`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user?.activeToken}`,
        },
      },
    )
      .then((res) => {
        if (res && !res.error) {
          if (res.message) {
            openSnackBar({
              message: res.message,
              type: MESSAGE_TYPE.WARNING,
            });
          } else {
            setBankListingDetails(res.data);
            setBankDetail((prev) => ({
              ...prev,
              open: true,
              type: 'load',
            }));
          }
        }
        enableLoading(false);
      })
      .catch((e) => {
        openSnackBar({
          message: e.message,
          type: MESSAGE_TYPE.INFO,
        });
      });
  };

  // call below function after onSuccess of payU
  // const capturePayment = async () => {
  //   await RestApi(
  //     `organizations/${organization.orgId}/effortless_virtual_accounts/capture_payment`,
  //     {
  //       method: METHOD.PATCH,
  //       headers: {
  //         Authorization: `Bearer ${user.activeToken}`,
  //       },
  //     },
  //   )
  //     .then((res) => {
  //       if (res && !res.error) {
  //         // Payment Done
  //       } else {
  //         showError(res.message);
  //       }
  //     })
  //     .catch((e) => {
  //       showError(e);
  //     });
  // };

  function selectTransactionType(id) {
    const BankAccount = bankAccounts?.connected_banking?.find(
      (a) => a.id === id,
    );
    if (BankAccount.service_provider === 'fidypay') {
      if (Number(paidAmount) >= 200000) {
        setTransactionTypeList(['NEFT', 'RTGS']);
        setTransactionType('RTGS');
      } else {
        setTransactionTypeList(['NEFT', 'IMPS', 'RTGS']);
        setTransactionType('RTGS');
      }
    } else {
      if (Number(paidAmount) >= 200000) {
        setTransactionTypeList(['RTGS', 'NEFT']);
        setTransactionType('RTGS');
      } else {
        setTransactionTypeList(['NEFT', 'IMPS', 'RTGS']);
        setTransactionType('NEFT');
      }
    }
  }

  const updateAdvancePaymentDetail = async (id) => {
    // enableLoading(true);
    const paramsPayload = id
      ? {
          account_id: id,
          paid: true,
          transaction_type: transactionType,
        }
      : {
          transaction_type: transactionType,
        };
    await RestApi(
      `organizations/${organization.orgId}/advance_payments/${advancePaymentId}`,
      {
        method: METHOD.PATCH,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
        payload: paramsPayload,
      },
    )
      .then((res) => {
        // enableLoading(false);
        if (res && !res.error) {
          setAdvancePaymentDetails(res);
          // selectTransactionType(id);
          // setTransactionType(res?.transaction_type);
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const setAccountToVoucher = async (id) => {
    const paramsPayload = id
      ? {
          account_id: id,
          paid: true,
          transaction_type: transactionType,
        }
      : {
          transaction_type: transactionType,
        };
    await RestApi(
      `organizations/${organization.orgId}/payment_vouchers/${paymentVoucharId}`,
      {
        method: METHOD.PATCH,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
        payload: paramsPayload,
      },
    )
      .then((res) => {
        if (res && !res.error) {
          // setTransactionType(res?.transaction_type);
          // if(id) selectTransactionType(id);
        } else {
          showError(res.message);
        }
      })
      .catch((e) => {
        showError(e);
      });
  };

  React.useEffect(() => {
    if (transactionType) {
      if (advancePaymentId) {
        updateAdvancePaymentDetail();
      } else {
        setAccountToVoucher();
      }
    }
  }, [transactionType]);

  const fetchVoucherItemStatus = async () => {
    await RestApi(
      `organizations/${organization.orgId}/payment_vouchers/${
        advancePaymentId || paymentVoucharId
      }/items`,
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
          setDrawer((d) => ({ ...d, paymentSuccess: true }));
          if (res?.data?.find((ele) => ele.payment_status === 'Failed')?.id) {
            setMultiplePayments(true);
            setPaymentsResponse(res.data);
          } else if (res?.data.length === 1) {
            setCompletedTransaction(true);
            // setMultiplePayments(false);
          }
        }
      })
      .catch((e) => {
        enableLoading(false);
        showError(e);
      });
  };

  const generateOtpForPayment = async () => {
    await RestApi(
      `organizations/${organization.orgId}/payment_vouchers/${
        advancePaymentId || paymentVoucharId
      }/generate_otp`,
      {
        method: METHOD.POST,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
        payload: {
          transaction_password: transactionPasswordInput,
        },
      },
    )
      .then((res) => {
        if (res?.mobile_number) {
          setOtpMobileNumber(res.mobile_number);
          setDrawer((d) => ({ ...d, verifyPassword: true }));
          setCollapseFirstModalSection(true);
        } else if (res?.message) {
          setApiError('password');
          showError(res?.message);
        }
      })
      .catch((e) => {
        showError(e);
      });
  };

  const authenticatePayment = async (otp) => {
    setOneClickButton(true);
    await RestApi(
      `organizations/${organization.orgId}/payment_vouchers/${
        advancePaymentId || paymentVoucharId
      }/authenticate_payment`,
      {
        method: METHOD.POST,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
        payload: {
          otp,
          // transaction_password: transactionPassword,
        },
      },
    )
      .then((res) => {
        if (res.success) {
          enableLoading(true);
          // setTimeout(() => {
          fetchVoucherItemStatus();
          // }, 60000);
          // setDrawer((d) => ({ ...d, paymentSuccess: true }));
          // setCompletedTransaction(true);
        } else if (res.error === true) {
          if (res.errors === 'OTP is invalid') {
            enableLoading(false);
            setOneClickButton(false);
            setApiError('otp');
            setErrorMessage('OTP is invalid');
          }
        } else if (res.message === 'OTP is valid') {
          enableLoading(true);
          // setTimeout(() => {
          fetchVoucherItemStatus();
          // }, 60000);
          // setOneClickButton(false);
          // setDrawer((d) => ({ ...d, paymentSuccess: true }));
        }
        // enableLoading(false);
      })
      .catch((e) => {
        showError(e);
      });
  };
  const handlePay = async () => {
    if (
      !currentUserInfo?.transactionPasswordEnabled &&
      +new Date(currentUserInfo?.transactionPasswordExpireDate) <= +new Date()
    ) {
      setCongratsDrawer(true);
    } else {
      if (accountId === '') {
        return;
      }
      if (hasBalance) {
        setPaymentDialog(true);
        setCollapseFirstModalSection(false);
        // await generateOtpForPayment();
        // setDrawer((d) => ({ ...d, verifyPassword: true }));
      } else {
        // Pay U
        await fetchBankDetails();
        // await createPayment();
      }
    }
  };

  const handleVerify = (otp, transactionPassword) => {
    authenticatePayment(otp, transactionPassword);
  };

  useEffect(() => {
    setTransactionPasswordInput('');
    if (accountId !== '') {
      const balance = bankAccounts.connected_banking?.find(
        (a) => a.id === accountId,
      ).balance;
      setHasBalance(Number(balance) > Number(paidAmount));
      if (advancePaymentId) {
        updateAdvancePaymentDetail(accountId);
      } else {
        setAccountToVoucher(accountId);
      }
      selectTransactionType(accountId);
    }
  }, [accountId]);
  const device = localStorage.getItem('device_detect');

  const confirmPasswordHandler = async () => {
    setApiError('');
    if (transactionPasswordInput.length < 1) {
      setModalError(true);
      return;
    }
    await generateOtpForPayment();
  };

  const transacForgetPass = () => {
    setPaymentDialog(false);
    onClose();
    ShowTransForgPass();
  };

  return (
    <>
      <div style={{ display: 'none' }}>
        <form action={payUlink} method="post">
          <input type="hidden" name="key" value={payUDatas?.key} />
          <input type="hidden" name="txnid" value={payUDatas?.txn_id} />
          <input
            type="hidden"
            name="drop_category"
            value={payUDatas?.drop_category}
          />
          <input type="hidden" name="pg" value={payUDatas?.pg} />
          <input
            type="hidden"
            name="productinfo"
            value={payUDatas?.product_info}
          />
          <input type="hidden" name="amount" value={payUDatas?.amount} />
          <input type="hidden" name="email" value={payUDatas?.email} />
          <input type="hidden" name="firstname" value={payUDatas?.firstname} />
          {/* <!-- <input type="hidden" name="lastname" value="Kumar" /> --> */}
          <input type="hidden" name="surl" value={payUDatas?.surl} />
          <input type="hidden" name="furl" value={payUDatas?.furl} />
          <input type="hidden" name="phone" value={payUDatas?.phone} />
          <input type="hidden" name="hash" value={payUSha} />
          <input type="submit" value="submit" id="payUbtn" />{' '}
        </form>
      </div>
      <div className={css.proceedToPay}>
        {device === 'desktop' ? (
          <Mui.Stack style={{ alignItems: 'center', marginTop: '1rem' }}>
            <Mui.Typography className={css.heading}>
              Make Payment
            </Mui.Typography>
          </Mui.Stack>
        ) : (
          <div className={css.proceedpay_title}>
            <h6>PROCEED TO PAY</h6>
          </div>
        )}
        <div className={`${css.headerContainer} `}>
          <div className={css.headerLabel}>Payment Methods</div>
          <span className={css.headerUnderline} />
        </div>
        <Mui.Stack
          className={
            device === 'desktop' ? css.flowStackDesktop : css.flowStack
          }
        >
          <div className={css.connected_heading}>
            <div className={`${css.headerContainer} ${css.drawer}`}>
              <div className={css.headerLabel}>Connected Banking</div>
            </div>
            {bankAccounts?.connected_banking.length === 0 ? (
              <Mui.Typography>
                No Connected Bank Account is Added
              </Mui.Typography>
            ) : (
              <>
                {bankAccounts?.connected_banking &&
                  bankAccounts?.connected_banking.length > 0 &&
                  bankAccounts?.connected_banking.map((item) => {
                    return (
                      <div className={css.connected_row}>
                        <label htmlFor={item.id}>
                          <div className={css.body}>
                            <div className={css.billcontentrowinput}>
                              <div className={css.headerLabel}>{item.name}</div>
                              <input
                                type="radio"
                                name={item.name}
                                id={item.id}
                                value={item.id}
                                className={css.checkedRadio}
                                disabled={
                                  item.name === 'Effortless Virtual Account'
                                    ? false
                                    : Number(item.balance) < Number(paidAmount)
                                }
                                onChange={(e) => {
                                  setAccountId(e.target.value);
                                }}
                                checked={item.id === accountId}
                              />
                            </div>
                            <p className={css.totalBill}>
                              Balance: {FormattedAmount(item?.balance)}
                            </p>
                            {item.name === 'Effortless Virtual Account' &&
                              item.balance !== '0.0' &&
                              Number(item.balance) < Number(paidAmount) && (
                                <p className={css.error}>
                                  Use {FormattedAmount(item?.balance)} and add
                                  remaining{' '}
                                  {FormattedAmount(
                                    Number(paidAmount) - Number(item?.balance),
                                  )}{' '}
                                  from other bank account
                                </p>
                              )}
                            {item.name === 'Effortless Virtual Account' &&
                              item.balance === '0.0' && (
                                <p className={css.error}>
                                  Add {FormattedAmount(paidAmount)} From other
                                  Bank Account
                                </p>
                              )}
                          </div>
                        </label>
                      </div>
                    );
                  })}
              </>
            )}
          </div>
          {bankAccounts?.other_bank_accounts &&
            bankAccounts.other_bank_accounts.length > 0 && (
              <div className={css.connected_heading}>
                <div className={`${css.headerContainer} ${css.drawer}`}>
                  <div className={css.headerLabel}>Other Bank Acccounts</div>
                </div>
                {bankAccounts?.other_bank_accounts.length === 0 ? (
                  <Mui.Typography>
                    No Other Bank Account is Added
                  </Mui.Typography>
                ) : (
                  <>
                    {bankAccounts.other_bank_accounts.map((item) => {
                      return (
                        <div className={css.connected_row}>
                          <div className={css.body}>
                            <div className={css.billcontentrow}>
                              <div className={css.headerLabel}>{item.name}</div>
                              <span className={css.billName}>
                                {item.account_type} Account
                              </span>
                            </div>
                            <p className={css.totalBill}>
                              XX
                              {item?.account_number
                                ?.toString()
                                ?.substr(item?.account_number.length - 4, 4)}
                              : {FormattedAmount(item?.balance)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
        </Mui.Stack>
        {device === 'desktop' ? (
          <Mui.Stack>
            <PayNow
              active={accountId !== ''}
              title={payNow.title}
              subTitle={payNow.subTitle}
              handlePay={() => handlePay()}
              // handlePay={() =>
              //   setDrawer((d) => ({ ...d, paymentSuccess: true }))
              // }
              // handlePay={() => setPaymentDialog(true)}

              hasBalance={hasBalance}
              hidden
            />
          </Mui.Stack>
        ) : (
          <div className={css.payNow}>
            <PayNow
              active={accountId !== ''}
              title={payNow.title}
              subTitle={payNow.subTitle}
              handlePay={() => handlePay()}
              // handlePay={() => setPaymentDialog(true)}
              hasBalance={hasBalance}
              hidden
            />
          </div>
        )}
      </div>
      {/* {device === 'desktop' ? ( */}
      <Dialog
        // open={drawer.verifyPassword}
        open={paymentDialog}
        name="verifyPassword"
        // onClose={() => setDrawer(false)}
        onClose={() => setPaymentDialog(false)}
        styleDrawerMaxHeight="85vh"
        className={css.dialog}
      >
        <div
          className={css.paymentModal}
          style={{ width: device === 'desktop' ? '500px' : 'auto' }}
        >
          <div className={css.firstModalSection}>
            {!collapseFirstModalSection && (
              <>
                <p className={css.virtualAccountTitle}>
                  Effortless Virtual Account
                </p>
                <p className={css.modalSectionTitle}>Transaction Password</p>
                <p className={css.modalSectionSubTitle}>
                  Enter the Transaction Password to Activate the Payment Process
                </p>
                <label
                  className={`${css.paymentModalLabel} ${
                    apiError ? css.hasError : ''
                  }`}
                >
                  Enter Password
                  <input
                    id="transaction-password"
                    type={showPassword ? 'password' : 'text'}
                    value={transactionPasswordInput}
                    onChange={(e) =>
                      setTransactionPasswordInput(e.target.value)
                    }
                    autoComplete="new-password"
                  />
                  <Mui.IconButton
                    size="small"
                    style={{ color: '#000', position: 'absolute', right: 0 }}
                    onClick={handleClickShowPassword}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </Mui.IconButton>
                </label>
                {modalError && (
                  <p className={css.errorMessageModal}>Password is required</p>
                )}
                {apiError !== '' &&
                  (apiError === 'password' && errorMessage !== '' ? (
                    <p className={css.errorMessageModal}>{errorMessage}</p>
                  ) : (
                    <p className={css.errorMessageModal}>Invalid Password</p>
                  ))}
                <div className={css.forgetwrap}>
                  <Mui.Button
                    onClick={() => transacForgetPass()}
                    className={css.forgetPass}
                  >
                    {/* <p */}
                    {/* // className={css.forgetPass}
                    // onClick={() => transacForgetPass()}
                    // >  */}
                    Forgot Password
                    {/* </p> */}
                  </Mui.Button>
                </div>

                <div className={css.transactionPassBtnContainer}>
                  <button
                    type="button"
                    className={css.transactionPassBtn}
                    onClick={confirmPasswordHandler}
                  >
                    Confirm Password
                  </button>
                </div>
              </>
            )}
            {collapseFirstModalSection && (
              <div className={css.collapsedTransaction}>
                <p className={css.modalSectionTitle}>Transaction Password</p>
                <CheckCircleOutlineIcon
                  style={{ color: '#2F9682', fontSize: '40px' }}
                />
              </div>
            )}
          </div>
          <div className={css.secondModalSection}>
            {collapseFirstModalSection && (
              <>
                <p className={css.virtualAccountTitle}>
                  Effortless Virtual Account
                </p>
                <p className={css.modalSectionTitle}>Enter One-Time Password</p>
                <p className={css.modalSectionSubTitleOtp}>
                  Please enter the One-Time Password sent to{' '}
                  <span>{otpMobileNumber}</span>
                </p>
                <div
                // className={classes.otpSection}
                >
                  <VerificationCodeInput
                    paymentPage
                    length={VCODE_LENGTH}
                    onChange={onOtpComplete}
                  />
                </div>
                <p
                  className={css.resentOtp}
                  onClick={() => generateOtpForPayment()}
                  role="presentation"
                >
                  Resent OTP
                </p>
              </>
            )}
            {!collapseFirstModalSection && (
              <div className={css.collapsedOtp}>
                <p className={css.modalSectionTitle}>Enter One-Time Password</p>
              </div>
            )}
            {apiError !== '' && apiError === 'otp' && errorMessage !== '' && (
              <p className={css.errorMessageModal}>{errorMessage}</p>
            )}
          </div>
          <div className={css.thirdModalSection}>
            <button
              type="button"
              className={css.paymentModalButton}
              disabled={
                !collapseFirstModalSection || otpNumber.length !== VCODE_LENGTH
              }
              // onClick={() => setCompletedTransaction(true)}
              onClick={() => authenticatePayment(otpNumber)}
            >
              Complete Transaction
            </button>
          </div>
          {completedTransaction && (
            <div className={css.completedTransaction}>
              <p className={css.modalSectionTitle}>Done</p>
              <p className={css.paymentSuccess}>Payment Successful</p>
              <button
                className={css.transactionPassBtn}
                type="button"
                onClick={() => {
                  changeSubView('dashboard');
                  navigate('/dashboard');
                }}
              >
                Return to Dashboard
              </button>
              <button
                type="button"
                className={css.urlToPaymentDashboard}
                onClick={() => {
                  changeSubView('payment');
                  navigate('/payment');
                }}
              >
                Return to Payment Dashboard
              </button>
            </div>
          )}
        </div>
        {/* <div>Hey</div>
          <div>there</div> */}
        {/* <DialogContent>
            <form>
              <VerificationView
                otpMobileNumber={otpMobileNumber}
                successfullyPayment={handleVerify}
                resendOtp={generateOtpForPayment}
                hasTransactionPassword
                errorMessage={errorMessage}
                oneClickButton={oneClickButton}
              />
            </form>
          </DialogContent> */}
      </Dialog>
      <Mui.Dialog
        open={bankDetail?.open}
        onClose={() => setBankDetail((prev) => ({ ...prev, open: false }))}
        maxWidth="sm"
        fullWidth
      >
        <LoadWithDraw
          type={bankDetail?.type}
          // accounts={[...new Set([...bankDetail?.data?.connected_banking, ...bankListingDetails])]}
          accounts={bankAccounts?.connected_banking?.concat(bankListingDetails)}
          handleBottomSheet={async (bankId) => {
            setBankDetail((prev) => ({ ...prev, open: false, id: bankId }));
            if (bankDetail?.type === 'load') {
              await createPayment(bankId);
            }
          }}
        />
      </Mui.Dialog>
      <SelectBottomSheet
        name="congratsDrawer"
        triggerComponent={<div style={{ display: 'none' }} />}
        open={congratsDrawer}
        addNewSheet
        maxHeight="45vh"
      >
        {/* {Congrats()} */}
        {TransactionPassword(setCongratsDrawer)}
      </SelectBottomSheet>
    </>
  );
}

export default ProceedToPay;
