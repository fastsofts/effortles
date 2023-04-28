import React, { memo, useContext, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import AppContext from '@root/AppContext';
import RestApi, { METHOD } from '@services/RestApi';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer';

import SecurityQuestion from './SecurityQuestion';
import VerificationCode from './VerificationCode';
import SetNewPassword from './SetNewPassword';
import css from './TransactionForgetPassword.scss';

const TransactionForgetPassword = ({ onClose }) => {
  const InitialState = {
    MobileNo: '',
    ShowComp: 'Security',
    btnDisable: false,
  };
  const { user, openSnackBar } = useContext(AppContext);
  const [TranState, setTranState] = useState(InitialState);

  const onSubmit = async (data, type) => {
    setTranState({
      ...TranState,
      btnDisable: true,
    });
    if (type === 'security') {
      await RestApi(`users/transaction_passwords/validate_security_question`, {
        method: METHOD.POST,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
        payload: {
          security_answer: data,
        },
      })
        .then((res) => {
          if (res && res.error) {
            openSnackBar({
              message: res?.message,
              type: MESSAGE_TYPE.ERROR,
            });
            setTranState({
              ...TranState,
              btnDisable: false,
            });
          } else {
            openSnackBar({
              message: res?.message,
              type: MESSAGE_TYPE.INFO,
            });
            setTranState({
              ...TranState,
              MobileNo: res?.mobile_number,
              ShowComp: 'VerifyCode',
              btnDisable: false,
            });
          }
        })
        .catch(() => {
          setTranState({
            ...TranState,
            btnDisable: false,
          });
        });
    } else if (type === 'verifycode') {
      await RestApi(`users/transaction_passwords/verify_otp`, {
        method: METHOD.POST,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
        payload: {
          transaction_otp: data,
        },
      })
        .then((res) => {
          if (res && res?.error) {
            openSnackBar({
              message: res?.message,
              type: MESSAGE_TYPE.ERROR,
            });
            setTranState({
              ...TranState,
              btnDisable: false,
            });
            return;
          }
          if (res && res.message === 'OTP verified') {
            openSnackBar({
              message: res?.message,
              type: MESSAGE_TYPE.INFO,
            });
            setTranState({
              ...TranState,
              MobileNo: res?.mobile_number,
              ShowComp: 'SetPassword',
              btnDisable: false,
            });
          }
        })
        .catch(() => {
          setTranState({
            ...TranState,
            btnDisable: false,
          });
        });
    } else if (type === 'setpassword') {
      await RestApi(`users/transaction_passwords`, {
        method: METHOD.PATCH,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
        payload: {
          transaction_password: data.pass,
          confirm_transaction_password: data.confpass,
          type: 'forgot_password',
        },
      })
        .then((res) => {
          if (res && res.error) {
            openSnackBar({
              message: res?.message,
              type: MESSAGE_TYPE.ERROR,
            });
            setTranState({
              ...TranState,
              btnDisable: false,
            });
          } else {
            openSnackBar({
              message: res?.message,
              type: MESSAGE_TYPE.INFO,
            });
            onClose();
          }
        })
        .catch(() => {
          setTranState({
            ...TranState,
            btnDisable: false,
          });
        });
    }
  };

  return (
    <Stack className={css.container}>
      <Typography className={css.title}>Forgot Transaction Password</Typography>
      {TranState.ShowComp === 'Security' && (
        <SecurityQuestion
          onSubmit={onSubmit}
          btnDisable={TranState.btnDisable}
        />
      )}
      {TranState.ShowComp === 'VerifyCode' && (
        <VerificationCode
          onSubmit={onSubmit}
          Mobile={TranState.MobileNo}
          btnDisable={TranState.btnDisable}
        />
      )}
      {TranState.ShowComp === 'SetPassword' && (
        <SetNewPassword onSubmit={onSubmit} btnDisable={TranState.btnDisable} />
      )}
    </Stack>
  );
};

export default memo(TransactionForgetPassword);
