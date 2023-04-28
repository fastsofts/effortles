import React, { memo } from 'react';
import moment from 'moment';

import { Stack, Typography, IconButton, Button } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import css from '../bankingmobile.scss';

const StatusComponent = {
  categorized: (
    <div
      style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
    >
      <div className={css.active}>
        <div className={css.activeinline} />
      </div>
      <Typography className={css.actstatus}>Categorized</Typography>
    </div>
  ),
  uncategorized: (
    <div
      style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
    >
      <div className={css.disable}>
        <div className={css.disableinline} />
      </div>
      <Typography className={css.diablestatus}>Uncategorized</Typography>
    </div>
  ),
  suberaccount: (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div className={css.fetching}>
        <div className={css.fetchinginline} />
      </div>
      <Typography className={css.fetchingstatus}>
        Pending with SuperAccountant
      </Typography>
    </div>
  ),
};

const TransactionDetails = ({ title, onClose, data }) => {
  const TranStatus = (st) => {
    let Status;
    if (st === 'uncategorized') Status = StatusComponent.uncategorized;
    else if (st === 'categorized') Status = StatusComponent.categorized;
    else Status = StatusComponent.suberaccount;
    return Status;
  };
  return (
    <Stack className={css.bottommodalcontainer}>
      <Stack className={css.emptyBar} />
      <Stack className={css.headerWrp}>
        <Typography variant="h4" className={css.accpreftitle}>
          {title}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseRoundedIcon sx={{ width: '16px', height: '16px' }} />
        </IconButton>
      </Stack>
      <Stack>
        <Stack className={css.trandetailcontainer}>
          <Typography className={css.label}>Date</Typography>
          <Typography className={css.space}>-</Typography>
          <Typography className={css.date}>
            {moment(data.date).format('DD MMM YYYY')}
          </Typography>
        </Stack>

        <Stack className={css.trandetailcontainer}>
          <Typography className={css.label}>Descriptions</Typography>
          <Typography className={css.space}>-</Typography>
          <Typography className={css.desc}>
            <span>Bank Account Fixed Deposit-</span>
            <br />
            <span>xxxxxxxxxx2242 with account number</span>
          </Typography>
        </Stack>
        {data.txn_category === 'business' && (
          <Stack className={css.trandetailcontainer}>
            <Typography className={css.label}>Status</Typography>
            <Typography className={css.space}>-</Typography>
            <Typography className={css.status}>
              {TranStatus(data.status)}
            </Typography>
          </Stack>
        )}
        {data.categorized && (
          <Stack className={css.trandetailcontainer}>
            <Typography className={css.label}>Doc.No</Typography>
            <Typography className={css.space}>-</Typography>
            <Typography className={css.docno}>INV- 00120</Typography>
          </Stack>
        )}
        <Stack className={css.trandetailcontainer}>
          <Typography className={css.label}>Party</Typography>
          <Typography className={css.space}>-</Typography>
          <Typography className={css.purposeparty}>
            {data.party_name || '-'}
          </Typography>
        </Stack>
        <Stack className={css.trandetailcontainer}>
          <Typography className={css.label}>Purpose</Typography>
          <Typography className={css.space}>-</Typography>
          <Typography className={css.purposeparty}>
            {data.purpose || '-'}
          </Typography>
        </Stack>
        <Stack className={css.trandetailcontainer}>
          <Typography className={css.label}>Cash Flow</Typography>
          <Typography className={css.space}>-</Typography>
          <Typography
            className={Number(data.amount) > 0 ? css.inflow : css.outflow}
          >
            {`₹.${data.formatted_amount}`}
          </Typography>
        </Stack>
        <Stack className={css.trandetailcontainer}>
          <Typography className={css.label}>Balance</Typography>
          <Typography className={css.space}>-</Typography>
          <Typography className={css.balance}>
            {`₹.${data.formatted_running_balance}`}
          </Typography>
        </Stack>
      </Stack>
      <Stack sx={{ alignItems: 'center' }}>
        <Button className={css.catetorizebtn}>View Categorization</Button>
      </Stack>
    </Stack>
  );
};

export default memo(TransactionDetails);
