import React from 'react';
import { Stack, Typography, IconButton, Button } from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import css from '../bankingmobile.scss';

const BusinessAccountConnect = ({ onClose, AddICICI, AddOther }) => {
  return (
    <Stack className={css.bottommodalcontainer}>
      <Stack className={css.emptyBar} />
      <Stack className={css.headerWrp}>
        <Typography variant="h4" className={css.accpreftitle}>
          Business Account
        </Typography>
        <IconButton onClick={onClose}>
          <CloseRoundedIcon sx={{ width: '16px', height: '16px' }} />
        </IconButton>
      </Stack>
      <Stack>
        <Button
          className={css.conectaccbtns}
          onClick={() => {
            AddICICI(true);
            onClose();
          }}
        >
          Add ICICI Bank Account
        </Button>
        <Button
          className={css.conectaccbtns}
          onClick={() => {
            AddOther({
              fastLinkConfig: 'add_bank',
              fastLinkConfigLocal: 'add_bank',
              bankAccountType: 'company',
            });
            onClose();
          }}
        >
          Add Other Bank Account
        </Button>
      </Stack>
    </Stack>
  );
};

export default BusinessAccountConnect;
