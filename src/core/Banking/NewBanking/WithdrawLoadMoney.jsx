import React, { useState, useContext, useEffect, useMemo, memo } from 'react';
import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
  Radio,
  FormControlLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from '@mui/material';
import { Dialog } from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';
import { styled } from '@mui/material/styles';

import {
  VerificationCodeInput,
  VCODE_LENGTH,
} from '@core/LoginContainer/VerificationCodeContainer';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';

import AppContext from '@root/AppContext';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer';
import RestApi, { METHOD } from '@services/RestApi';

import IppoPay from './Ippopay';
import { InputText } from '../../../components/Input/Input';
import Searchicon from '../../../assets/search_1.svg';
import icici from '../../../assets/BankLogo/icicilogo.svg';
import css from './bankingnew.scss';
import css_ from '../../PaymentView/shared/ProceedToPay.scss';

const TextfieldStyle = (props) => {
  return (
    <InputText
      {...props}
      variant="standard"
      InputLabelProps={{
        shrink: true,
        className: css.amountlabel,
      }}
      //   required
      theme="light"
      className={css.textfieldStyle}
    />
  );
};

const BpIcon = styled('span')(({ theme }) => ({
  borderRadius: '50%',
  width: 16,
  height: 16,

  backgroundColor: '#FFFFFF',
  border: '1px solid #F08B32',
  backgroundImage:
    theme.palette.mode === 'dark'
      ? 'linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))'
      : 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
  padding: 0,
  '.Mui-focusVisible &': {
    outline: '2px auto rgba(19,124,189,.6)',
    outlineOffset: 2,
  },
  'input:hover ~ &': {
    backgroundColor: '#FFFFFF',
    border: '1px solid #F08B32',
  },
  'input:disabled ~ &': {
    boxShadow: 'none',
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(57,75,89,.5)'
        : 'rgba(206,217,224,.5)',
  },
}));

const BpCheckedIcon = styled(BpIcon)({
  backgroundColor: '#F08B32',

  backgroundImage:
    'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
  '&:before': {
    display: 'block',
    width: 16,
    height: 16,
    backgroundImage: 'radial-gradient(#fff,#fff 28%,transparent 32%)',
    content: '""',
  },
  'input:hover ~ &': {
    backgroundColor: '#F08B32',
  },
});

const BpRadio = (props) => {
  return (
    <Radio
      disableRipple
      color="default"
      checkedIcon={<BpCheckedIcon />}
      icon={<BpIcon />}
      {...props}
    />
  );
};

const useStyles = makeStyles(() => ({
  root: {
    '&:hover': {
      backgroundColor: 'transparant',
    },
    '& .MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded': {
      borderRadius: '18px',
      maxWidth: 500,
    },
  },
  RadioRoot: {
    padding: 0,
    marginRight: '20px !important',

    '& .MuiRadio-root': {
      padding: 0,
    },
  },
  listitemRoot: {
    padding: '0px !important',
    marginBottom: '30px',

    '& :lastchild': {
      marginBottom: 0,
    },

    '& .MuiListItemSecondaryAction-root': {
      right: 0,
    },
  },
  AccountText: {
    '& .MuiListItemText-primary': {
      fontWeight: 400,
      fontSize: '13px',
      lineHeight: '16px',
      color: '#2E3A59',
    },
    '& .MuiListItemText-secondary': {
      fontWeight: 300,
      fontSize: '12px',
      lineHeight: '15px',
      color: '#6E6E6E',
    },
  },
}));

const WithdrawLoadMoney = ({ onClose, actionType }) => {
  const { organization, user, enableLoading, openSnackBar } =
    useContext(AppContext);

  const [Amount, setAmount] = useState('');
  const [btnutils, setbtnutils] = useState({
    title: '',
    desc: '',
    btntext: '',
  });

  const [bankDetail, setBankDetail] = useState([]);
  const [limitedBank, setlimitedBank] = useState([]);
  const [selectedBank, setselectedBank] = useState('');
  const [error, setError] = useState({ error: false, msg: '' });
  const [action, setaction] = useState('amount');
  const [Search, setSearch] = useState('');
  const [actionHandler, setactionHandler] = useState(false);
  const classes = useStyles();

  // Ippo Pay //

  const [paymentResponse, setPaymentResponse] = useState();
  const [ippoPayModal, setIppopayModal] = useState(false);

  // Ippo Pay //

  // Transaction PassWord //
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [collapseFirstModalSection, setCollapseFirstModalSection] =
    useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [transactionPasswordInput, setTransactionPasswordInput] = useState('');
  const [apiError] = useState('');
  const [modalError] = useState(false);
  const [errorMessage] = useState('');
  const [otpMobileNumber, setOtpMobileNumber] = useState('');
  const [otpNumber, setOtpNumber] = useState('');

  // Transaction PassWord //

  const onOtpComplete = (val) => setOtpNumber(val);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const OnInputChange = (e) => {
    if (e.target.value === '')
      setError({ ...error, error: true, msg: 'Please enter the valid amout' });
    else setError({ ...error, error: false, msg: '' });
    setAmount(e.target.value);
  };

  const verifyAmount = async () => {
    // setaction('account');
    // setbtnutils({
    //   ...btnutils,
    //   title: 'Choose Account To Withdraw Money',
    //   desc: 'Withdraw Money to your Effortless Virtual Account',
    //   btntext: `Withdraw Rs. ${Amount}`,
    // });
    enableLoading(true);
    await RestApi(
      `organizations/${organization?.orgId}/withdraw_money/withdraw_request`,
      {
        method: METHOD.POST,
        headers: {
          Authorization: `Bearer ${user?.activeToken}`,
        },
        payload: {
          amount: Number(Amount),
        },
      }
    )
      .then((res) => {
        enableLoading(false);

        if (res && !res.error && res.message === 'Select Bank Account') {
          setaction('account');
          setbtnutils({
            ...btnutils,
            title: 'Choose Account To Withdraw Money',
            desc: 'Withdraw Money to your Effortless Virtual Account',
            btntext: `Withdraw Rs. ${Amount}`,
          });
        } else {
          openSnackBar({
            message: res.message || res.error || 'Sorry, Something went wrong',
            type: MESSAGE_TYPE.ERROR,
          });
        }
      })
      .catch((e) => {
        openSnackBar({
          message: e.message || e.error || 'Sorry, Something went wrong',
          type: MESSAGE_TYPE.ERROR,
        });
        enableLoading(false);
      });
  };

  const amountSubmit = () => {
    if (Number(Amount) === 0 || Amount === '') {
      setError({
        ...error,
        error: true,
        msg: 'Please enter the valid amout',
      });
      return;
    }
    if (Number(Amount) < 51) {
      setError({
        ...error,
        error: true,
        msg: 'Minumum Net Banking Amount Rs. 51',
      });
      return;
    }
    if (actionType === 'load_money') {
      setaction('account');
      setbtnutils({
        ...btnutils,
        title: 'Choose Account To Load Money',
        desc: 'Load Money to your Effortless Virtual Account',
        btntext: `Load Rs. ${Amount}`,
      });
    } else verifyAmount();
  };

  const Proceed = async () => {
    if (actionType === 'load_money')
      await RestApi(
        `organizations/${organization?.orgId}/effortless_virtual_accounts/create_payment`,
        {
          method: METHOD.POST,
          headers: {
            Authorization: `Bearer ${user?.activeToken}`,
          },
          payload: {
            amount: Amount,
            bank_account_id: selectedBank,
          },
        }
      )
        .then((res) => {
          if (res && !res.error) {
            if (res?.collection_service_provider === 'ippopay')
              setPaymentResponse(res);
            else window.alert('Other GateWay');
            //     return;
            //   }
          } else if (res.error) {
            openSnackBar({
              message:
                res.error || res.message || 'Sorry, Something went wrong',
              type: MESSAGE_TYPE.ERROR,
            });
          }
        })
        .catch((e) => {
          console.log('PayU error', e);
          enableLoading(false);
        });
    else {
      setPaymentDialog(true);
      setaction('ippopay');
    }
  };

  const AccountConfirmation = () => {
    onClose();
    console.log('accconform');
  };

  //   const debounce = (func) => {
  //     let timer;
  //     return function (...args) {
  //       const context = this;
  //       if (timer) clearTimeout(timer);
  //       timer = setTimeout(() => {
  //         timer = null;
  //         func.apply(context, args);
  //       }, 500);
  //     };
  //   };

  const FilterBank = () => {
    const filteredBanks = bankDetail.filter((item) =>
      item.bank_account_name.toLowerCase().includes(Search.toLowerCase())
    );
    setlimitedBank(filteredBanks);
  };

  const FetchConnectedBank = async () => {
    enableLoading(true);
    await RestApi(
      `organizations/${organization?.orgId}/vendor_bills/connected_banking_list`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      }
    )
      .then((res) => {
        if (res && !res.error) {
          setBankDetail(res?.data);
          setlimitedBank(res?.data);
        }
        enableLoading(false);
      })
      .catch((e) => {
        openSnackBar({
          message: Object.values(e.errors).join(),
          type: MESSAGE_TYPE.ERROR,
        });

        enableLoading(false);
      });
  };

  const conformTransactionPassword = async () => {
    enableLoading(true);
    await RestApi(
      `organizations/${organization?.orgId}/withdraw_money/generate_otp`,
      {
        method: METHOD.POST,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
        payload: {
          amount: Amount,
          transaction_password: transactionPasswordInput,
          bank_account_id: selectedBank,
        },
      }
    )
      .then((res) => {
        if (res && !res.error) {
          openSnackBar({
            message: res.message,
            type: MESSAGE_TYPE.INFO,
          });
          setCollapseFirstModalSection(true);
          setOtpMobileNumber(res.mobile_number);
        } else {
          openSnackBar({
            message: res.message,
            type: MESSAGE_TYPE.ERROR,
          });
        }
        enableLoading(false);
      })
      .catch((e) => {
        openSnackBar({
          message: Object.values(e.errors).join(),
          type: MESSAGE_TYPE.ERROR,
        });

        enableLoading(false);
      });
  };

  const resentOtpWithdrawMoney = async () => {
    await RestApi(
      `organizations/${organization?.orgId}/withdraw_money/resend_otp`,
      {
        method: METHOD.POST,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
        payload: {
          amount: Amount,
          bank_account_id: selectedBank,
        },
      }
    )
      .then((res) => {
        if (res && !res.error)
          openSnackBar({
            message: res.message,
            type: MESSAGE_TYPE.INFO,
          });

        enableLoading(false);
      })
      .catch((e) => {
        openSnackBar({
          message: Object.values(e.errors).join(),
          type: MESSAGE_TYPE.ERROR,
        });

        enableLoading(false);
      });
  };

  const authenticatePayment = async () => {
    enableLoading(true);
    await RestApi(
      `organizations/${organization?.orgId}/withdraw_money/validate_otp`,
      {
        method: METHOD.POST,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
        payload: {
          amount: Amount,
          otp: otpNumber,
          bank_account_id: selectedBank,
        },
      }
    )
      .then((res) => {
        if (res && !res.error) {
          openSnackBar({
            message: res.message,
            type: MESSAGE_TYPE.INFO,
          });
        } else {
          openSnackBar({
            message: res.message || res.error.errors,
            type: MESSAGE_TYPE.ERROR,
          });
        }
        setPaymentDialog(false);
        enableLoading(false);
        onClose();
      })
      .catch((e) => {
        openSnackBar({
          message: Object.values(e.errors).join(),
          type: MESSAGE_TYPE.ERROR,
        });

        enableLoading(false);
      });
  };

  // Ippo Pay Succes & Error Handler //

  const ippopayHandler = (e) => {
    if (e.data.status === 'success') {
      setaction('account');
      setbtnutils({
        ...btnutils,
        title: 'Account confirmation',
        desc: 'Choose the Account',
        btntext: 'Confirm Account',
      });
      setactionHandler(true);
    }
    if (e.data.status === 'failure') {
      console.log('failure', e.data);
    }
    if (e.data.status === 'closed') {
      console.log('closed', e.data);
      onClose();
    }
    setIppopayModal(false);
  };

  // Ippo Pay Succes & Error Handler //

  //   const optimizedFn = useCallback(debounce(FilterBank), []);
  useMemo(() => {
    if (paymentResponse?.collection_service_provider === 'ippopay') {
      setIppopayModal(true);
      setaction('ippopay');
    } else {
      setIppopayModal(false);
    }
  }, [paymentResponse]);

  useEffect(() => {
    FetchConnectedBank();

    if (actionType === 'load_money')
      setbtnutils({
        ...btnutils,
        title: 'Load Money',
        desc: 'Select an amount to add your Effortless Virtual Account',
      });
    else
      setbtnutils({
        ...btnutils,
        title: 'Withdraw Money',
        desc: 'Select an amount to withdraw from your Effortless Virtual Account',
      });
  }, []);

  useEffect(() => {
    FilterBank();
  }, [Search]);

  return (
    <>
      {action !== 'ippopay' && (
        <Box className={css.wlcontainer}>
          <Stack className={css.headerwrp}>
            <Typography className={css.headertext}>{btnutils.title}</Typography>
            <IconButton sx={{ padding: 0 }} onClick={onClose}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
          <Stack>
            <Typography className={css.typedesc}>{btnutils.desc}</Typography>
            {action === 'amount' && (
              <>
                <TextfieldStyle
                  name="amount"
                  label="Amount"
                  type="number"
                  className={css.amtinput}
                  error={error.error}
                  helperText={error.msg}
                  value={Amount}
                  onChange={OnInputChange}
                />
                <Stack className={css.amtbtnwrp}>
                  <Button
                    className={css.amountbtn}
                    onClick={() => {
                      setAmount((prev) => Number(prev) + 2000);
                      setError({ ...error, error: false, msg: '' });
                    }}
                  >
                    &#8377;&nbsp;&nbsp;2,000
                  </Button>
                  <Button
                    className={css.amountbtn}
                    onClick={() => {
                      setAmount((prev) => Number(prev) + 5000);
                      setError({ ...error, error: false, msg: '' });
                    }}
                  >
                    &#8377;&nbsp;&nbsp;5,000
                  </Button>
                  <Button
                    className={css.amountbtn}
                    onClick={() => {
                      setAmount((prev) => Number(prev) + 10000);
                      setError({ ...error, error: false, msg: '' });
                    }}
                  >
                    &#8377;&nbsp;&nbsp;10,000
                  </Button>
                </Stack>
                <Button className={css.submit_btn} onClick={amountSubmit}>
                  Select Bank Account
                </Button>
              </>
            )}
            {action === 'account' && (
              <>
                {bankDetail?.length > 5 && (
                  <Stack className={css.searchwrp}>
                    <img src={Searchicon} alt="search" />
                    <input
                      type="search"
                      className={css.searchinput}
                      placeholder="Search a Bank Account"
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </Stack>
                )}
                <Stack>
                  <List
                    dense
                    sx={{
                      width: '100%',
                      bgcolor: 'background.paper',
                      padding: 0,
                    }}
                  >
                    {limitedBank.length > 0 ? (
                      <>
                        {limitedBank.slice(0, 5)?.map((val) => (
                          <ListItem
                            secondaryAction={
                              <Typography
                                className={
                                  val.bank_account_type === 'company'
                                    ? css.bankaccbusiness
                                    : css.bankaccpersonal
                                }
                              >
                                {val.bank_account_type === 'company'
                                  ? 'Business'
                                  : 'Personal'}
                              </Typography>
                            }
                            sx={{
                              padding: 0,
                            }}
                            className={classes.listitemRoot}
                            key={val.id}
                            onClick={() => setselectedBank(val.id)}
                          >
                            <ListItemButton
                              sx={{ padding: '0 0 0 11px' }}
                              className={css.listitembtn}
                            >
                              <FormControlLabel
                                value="bank_account"
                                className={classes.RadioRoot}
                                control={
                                  <BpRadio
                                    name="selectedBank"
                                    checked={selectedBank === val.id}
                                    onChange={() => setselectedBank(val.id)}
                                  />
                                }
                              />

                              <ListItemAvatar>
                                <Avatar alt="Avatar" src={icici} />
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  val.bank_account_name.length > 20
                                    ? `${val.bank_account_name?.slice(
                                        0,
                                        20
                                      )}...`
                                    : val.bank_account_name || ''
                                }
                                secondary={
                                  val?.bank_account_number
                                    ? `xx ${val?.bank_account_number?.substr(
                                        -4
                                      )}`
                                    : ''
                                }
                                className={classes.AccountText}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </>
                    ) : (
                      <ListItem>
                        <ListItemText primary="No bank found." />
                      </ListItem>
                    )}
                  </List>
                  <Button
                    className={
                      selectedBank === ''
                        ? `${css.submit_btn} ${css.opacitybtn}`
                        : css.submit_btn
                    }
                    sx={selectedBank === '' && { opacity: 0.5 }}
                    onClick={actionHandler ? AccountConfirmation : Proceed}
                    disabled={selectedBank === ''}
                  >
                    {btnutils.btntext}
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </Box>
      )}
      {ippoPayModal && (
        <IppoPay
          orderId={paymentResponse?.order_id}
          publicKey={paymentResponse?.public_key}
          ippopayHandler={ippopayHandler}
        />
      )}

      <Dialog
        open={paymentDialog}
        name="verifyPassword"
        onClose={() => setPaymentDialog(false)}
        styleDrawerMaxHeight="85vh"
        className={css_.dialog}
      >
        <div className={css_.paymentModal} style={{ width: '500px' }}>
          <div className={css_.firstModalSection}>
            {!collapseFirstModalSection && (
              <>
                <p className={css_.virtualAccountTitle}>
                  Effortless Virtual Account
                </p>
                <p className={css_.modalSectionTitle}>Transaction Password</p>
                <p className={css_.modalSectionSubTitle}>
                  Enter the Transaction Password to Activate the Payment Process
                </p>
                <label
                  className={`${css_.paymentModalLabel} ${
                    apiError ? css_.hasError : ''
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
                  <IconButton
                    size="small"
                    style={{ color: '#000', position: 'absolute', right: 0 }}
                    onClick={handleClickShowPassword}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </label>
                {modalError && (
                  <p className={css_.errorMessageModal}>Password is required</p>
                )}
                {apiError !== '' &&
                  (apiError === 'password' && errorMessage !== '' ? (
                    <p className={css_.errorMessageModal}>{errorMessage}</p>
                  ) : (
                    <p className={css_.errorMessageModal}>Invalid Password</p>
                  ))}
                {/* <div className={css_.forgetwrap}>
                  <Button
                    onClick={() => transacForgetPass()}
                    className={css_.forgetPass}
                  >
                    <p
                 className={css.forgetPass}
                    onClick={() => transacForgetPass()}
                     >  
                    Forgot Password
                    </p>
                  </Button>
                </div> */}

                <div className={css_.transactionPassBtnContainer}>
                  <button
                    type="button"
                    className={css_.transactionPassBtn}
                    onClick={conformTransactionPassword}
                  >
                    Confirm Password
                  </button>
                </div>
              </>
            )}
            {collapseFirstModalSection && (
              <div className={css_.collapsedTransaction}>
                <p className={css_.modalSectionTitle}>Transaction Password</p>
                <CheckCircleOutlineIcon
                  style={{ color: '#2F9682', fontSize: '40px' }}
                />
              </div>
            )}
          </div>
          <div className={css_.secondModalSection}>
            {collapseFirstModalSection && (
              <>
                <p className={css_.virtualAccountTitle}>
                  Effortless Virtual Account
                </p>
                <p className={css_.modalSectionTitle}>
                  Enter One-Time Password
                </p>
                <p className={css_.modalSectionSubTitleOtp}>
                  Please enter the One-Time Password sent to
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
                  className={css_.resentOtp}
                  onClick={() => resentOtpWithdrawMoney()}
                  role="presentation"
                >
                  Resent OTP
                </p>
              </>
            )}
            {!collapseFirstModalSection && (
              <div className={css_.collapsedOtp}>
                <p className={css_.modalSectionTitle}>
                  Enter One-Time Password
                </p>
              </div>
            )}
            {apiError !== '' && apiError === 'otp' && errorMessage !== '' && (
              <p className={css_.errorMessageModal}>{errorMessage}</p>
            )}
          </div>
          <div className={css_.thirdModalSection}>
            <button
              type="button"
              className={css_.paymentModalButton}
              disabled={
                !collapseFirstModalSection || otpNumber.length !== VCODE_LENGTH
              }
              // onClick={() => setCompletedTransaction(true)}
              onClick={() => authenticatePayment()}
            >
              Complete Transaction
            </button>
          </div>
          {/* {completedTransaction && (
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
          )} */}
        </div>
      </Dialog>
    </>
  );
};

export default memo(WithdrawLoadMoney);
