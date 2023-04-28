import React, { useState, useEffect, useContext, memo } from 'react';
import { Stack, Typography, Link, Button } from '@mui/material';

import AppContext from '@root/AppContext';
import RestApi, { METHOD } from '@services/RestApi';

import Input from '../../../components/Input/Input';
import css from './TransactionForgetPassword.scss';

const SecurityQuestion = ({ onSubmit, btnDisable }) => {
  const InitialState = {
    SecQuestion: '',
    SecAnswer: '',
    showPassword: false,
  };

  const { organization, user } = useContext(AppContext);
  const [SecQuestionState, setSecQuestionState] = useState(InitialState);

  const HandleChange = (e) => {
    setSecQuestionState({ ...SecQuestionState, SecAnswer: e.target.value });
  };

  const GetSecurityQuestion = async () => {
    await RestApi(`organizations/${organization.orgId}/current_user_details`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        setSecQuestionState({
          ...SecQuestionState,
          SecQuestion: res.security_question,
        });
      })
      .catch((e) => {
        console.log(e.message);
      });
  };
  useEffect(() => {
    GetSecurityQuestion();
  }, []);

  return (
    <Stack>
      <Typography className={css.subtitle}>Security Question</Typography>
      <Stack>
        <Stack>
          <Input
            name="question"
            label="Your Security Question"
            variant="standard"
            InputLabelProps={{
              shrink: true,
            }}
            value={SecQuestionState.SecQuestion}
            InputProps={{
              readOnly: true,
            }}
            fullWidth
            className={css.inputElement}
            autoComplete="off"
          />
        </Stack>
        <Stack>
          <Input
            id="Input"
            name="password"
            label="Your Answer"
            variant="standard"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              type: 'text',
              className: 'PasswordInput',
              onChange: HandleChange,
            }}
            fullWidth
            className={`${css.inputElement} ${css.passinputElement}`}
            autoComplete="off"
          />
        </Stack>
        <Link href="#Input" className={css.contactsupport}>
          Contact Support
        </Link>
        <Stack className={css.proceedbtnwrap}>
          <Button
            className={css.proceedbtn}
            onClick={() => onSubmit(SecQuestionState.SecAnswer, 'security')}
            disabled={btnDisable}
          >
            Proceed
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default memo(SecurityQuestion);
