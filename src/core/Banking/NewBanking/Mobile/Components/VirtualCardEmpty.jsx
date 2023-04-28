import React, { memo } from 'react';
import { Stack, Typography, Button } from '@mui/material';
import VirtualAccount from '../../../../../assets/virtualaccountnotconnect.svg';

import css from '../bankingmobile.scss';

const VirtualCardEmpty = ({ addEffortless }) => {
  return (
    <Stack className={css.virtual_acc_create}>
      <img src={VirtualAccount} alt="logo" className={css.virtualemptylogo} />
      <Typography variant="h4" className={css.title}>
        Choose Effortless banking
      </Typography>
      <Typography className={css.description}>
        Effortless Banking is the Fastest Way to run your business transactions.
        It is powered by your Effortless Virtual Account.
      </Typography>
      <Typography className={css.description}>
        Registration and Setup are
        <span style={{ fontWeight: 400 }}> FREE.</span>
      </Typography>
      <Button className={css.creataccbtn} onClick={addEffortless}>
        Create Free Account
      </Button>
    </Stack>
  );
};

export default memo(VirtualCardEmpty);
