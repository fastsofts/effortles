import React, { memo } from 'react';
import { Box, Stack, Button, Typography } from '@mui/material';

import VirtualAccount from '../../../assets/virtualaccountnotconnect.svg';
import css from './bankingnew.scss';

const CreateAccount = ({ show }) => {
  return (
    <Box className={css.vacontainer}>
      <Typography variant="h4" className={css.headertitle}>
        Effortless Bank Account
      </Typography>
      <Stack className={css.createaccwrp}>
        <Stack className={css.imgwrp}>
          <img
            src={VirtualAccount}
            alt="Not Connected"
            width="206px"
            height="261px"
          />
        </Stack>

        <Typography className={css.subtitle}>
          Banking that’s Designed for Business
        </Typography>
        <Typography className={css.description}>
          Effortless Banking is the fastest way to execute and implement your
          Business Transactions.
        </Typography>
        <Typography className={css.description}>
          Run all your Payment-related activites using your very own{' '}
          <span style={{ fontWeight: 'bold' }}>
            Effortless Virtual Account.
          </span>
        </Typography>
        <Typography className={css.description}>
          Registration and Setup are{' '}
          <span style={{ fontWeight: 'bold' }}>FREE.</span>
        </Typography>
        <Button className={css.creataccbtn} onClick={show}>
          Create Free Account
        </Button>
      </Stack>
    </Box>
  );
};

export default memo(CreateAccount);
