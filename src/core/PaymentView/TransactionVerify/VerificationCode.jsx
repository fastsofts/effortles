import React, { useState, useContext, memo } from 'react';
import OTPInput from 'react-otp-input';
import { Stack, Typography, Button } from '@mui/material';
import AppContext from '@root/AppContext';
import RestApi, { METHOD } from '@services/RestApi';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer';

import css from './TransactionForgetPassword.scss';

const VerificationCode = ({ onSubmit, Mobile, btnDisable }) => {
  const { user, openSnackBar } = useContext(AppContext);

  const [OTP, setOTP] = useState();

  const HandleOTPChange = (value) => {
    setOTP(value);
  };

  const resendOTP = async () => {
    await RestApi(`users/transaction_passwords/otp`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        if (res)
          openSnackBar({
            message: res?.message,
            type: MESSAGE_TYPE.INFO,
          });
      })
      .catch((e) => {
        console.log(e.message);
      });
  };
  return (
    <Stack>
      <Typography className={`${css.subtitle} ${css.verifyotp}`}>
        Verification Code
      </Typography>
      <Stack>
        <Stack className={css.verifymobilenumber}>
          <Typography>Please enter the verification code sent to</Typography>
          <Typography>{`+91 ${Mobile.substring(0, 5)} ${Mobile.substring(
            5,
            10,
          )}`}</Typography>
        </Stack>
        <Stack sx={{ marginBottom: 5 }}>
          <OTPInput
            onChange={HandleOTPChange}
            value={OTP}
            inputStyle={css.inputStyle}
            numInputs={6}
            separator={<span />}
            isInputNum
            shouldAutoFocus
          />
        </Stack>
        <Button
          onClick={resendOTP}
          className={`${css.contactsupport} ${css.otpresend}`}
        >
          Resend OTP
        </Button>
        <Stack className={css.proceedbtnwrap}>
          <Button
            className={css.proceedbtn}
            onClick={() => onSubmit(OTP, 'verifycode')}
            disabled={btnDisable}
          >
            Done
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default memo(VerificationCode);
