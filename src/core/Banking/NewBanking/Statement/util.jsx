import React from 'react';
import { Typography, Menu, styled, alpha } from '@mui/material';
import css from '../bankingnew.scss';

export const StatusComponent = {
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

export const AccountType = {
  CA: (
    <>
      <Typography className={css.savings}>CA</Typography>
    </>
  ),
  SA: (
    <>
      <Typography className={css.current}>SA</Typography>
    </>
  ),
  CC: (
    <>
      <Typography className={css.corporate}>CC</Typography>
    </>
  ),
};

export const AccountTypeMobile = {
  SA: (
    <>
      <Typography className={css.savingsdropdown}>SA</Typography>
    </>
  ),
  CA: (
    <>
      <Typography className={css.currentdropdown}>CA</Typography>
    </>
  ),
  CC: (
    <>
      <Typography className={css.corporatedropdown}>CC</Typography>
    </>
  ),
};

export const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme, listwidth }) => ({
  '& .MuiPaper-root': {
    borderRadius: 8,
    marginTop: theme.spacing(1),
    width: listwidth,
    minWidth: 170,
    background: '#FFFFFF',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: '0px 0px 16px rgba(0, 0, 0, 0.2)',
    padding: '6px 0',

    '& .MuiMenu-list': {
      padding: '0',
    },

    '& .MuiMenuItem-root': {
      padding: '8px 12px',
      borderBottom: '0.5px solid #c7c7c7',
      marginBottom: 6,
      fontFamily: "'Lexend', sans-serif !important",
      fontWeight: 300,
      fontSize: '14px',
      lineHeight: '16px',
      color: '#414141',

      '&:last-child': {
        borderBottom: 'none',
        marginBottom: '0px !important',
      },

      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },

    '& .MuiMenuItem-root.Mui-selected': {
      color: '#f08b32 !important',
      background: 'none !important',
    },
  },
}));

export const DateListItem = [
  'Today',
  'Yesterday',
  'This Week',
  'This Month',
  'This Year',
  'This Quarter',
];

export const TranStatus = (st) => {
  let Status;
  if (st === 'uncategorized') Status = StatusComponent.uncategorized;
  else if (st === 'categorized') Status = StatusComponent.categorized;
  else Status = StatusComponent.suberaccount;
  return Status;
};
