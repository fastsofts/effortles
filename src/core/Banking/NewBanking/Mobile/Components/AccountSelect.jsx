import React, { memo, useState, useEffect } from 'react';
import {
  Stack,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { makeStyles } from '@material-ui/core/styles';

import { AccountTypeMobile } from '../../Statement/util';
import Searchicon from '../../../../../assets/search_1.svg';
import HDFC from '../../../../../assets/BankLogo/dropDown/hdfc.svg';

import css from '../bankingmobile.scss';

const useStyles = makeStyles(() => ({
  listitemRoot: {
    padding: '0px !important',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',

    '& :lastchild': {
      marginBottom: 0,
      borderBottom: 'none',
    },

    '& .MuiListItemSecondaryAction-root': {
      right: 0,
    },
  },

  listTextRoot: {
    marginTop: '0px !important',
    marginBottom: '0px !important',

    '& .MuiListItemText-primary': {
      fontWeight: 200,
      fontSize: '13px',
      lineHeight: '16px',
      color: '#2E3A59',
    },

    '& .MuiListItemText-secondary': {
      fontWeight: 200,
      fontSize: '12px',
      lineHeight: '15px',
      color: '#6E6E6E',
    },
  },
}));

const AccountSelect = ({
  title,
  onClose,
  handleAccountSelect,
  bankListingDetails,
  intialAccButton,
  acctbtnVal,
}) => {
  const classes = useStyles();

  const [search, setSearch] = useState('');
  const [filteredBanks, setfilteredBanks] = useState(bankListingDetails);
  const [accountsLength, setAccountsLength] = useState('');

  const dropDownAccountFilter = () => {
    let type;
    if (acctbtnVal === intialAccButton.business) type = 'company';
    else if (acctbtnVal === intialAccButton.founder) type = 'founder';
    else type = 'virtual';

    if (type === 'company' || type === 'founder') {
      const filteredRow = bankListingDetails.filter(
        (row) =>
          row.bank_account_type === type &&
          row.account_name !== 'Effortless Virtual Account' &&
          row.bank_name.toLowerCase().includes(search.toLowerCase())
      );

      // const len = bankListingDetails.filter(
      //   (row) =>
      //     row.bank_account_type === type &&
      //     row.account_name !== 'Effortless Virtual Account'
      // );
      setfilteredBanks(filteredRow);
    }
  };

  const dropDownAccountFilterLength = () => {
    let type;
    if (acctbtnVal === intialAccButton.business) type = 'company';
    else if (acctbtnVal === intialAccButton.founder) type = 'founder';
    else type = 'virtual';

    if (type === 'company' || type === 'founder') {
      const filteredRow = bankListingDetails.filter(
        (row) =>
          row.bank_account_type === type &&
          row.account_name !== 'Effortless Virtual Account' &&
          row.bank_name.toLowerCase().includes(search.toLowerCase())
      );
      setAccountsLength(filteredRow?.length);
    }
  };

  useEffect(() => {
    dropDownAccountFilterLength();
  }, []);

  useEffect(() => {
    dropDownAccountFilter();
  }, [search, acctbtnVal]);

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
      {accountsLength > 5 && (
        <Stack
          className={css.searchwrp_select}
          sx={{ margin: '0 0 4px 0 !important' }}
        >
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
          {filteredBanks?.slice(0, 5)?.map((row) => (
            <ListItem
              secondaryAction={
                (row.account_type === 'CURRENT' && AccountTypeMobile.CA) ||
                (row.account_type === 'SAVINGS' && AccountTypeMobile.SA) ||
                (row.account_type === 'CREDIT' && AccountTypeMobile.CC)
              }
              className={classes.listitemRoot}
              key={row.bank_account_id}
              onClick={handleAccountSelect(row)}
            >
              <ListItemButton
                sx={{ padding: '12px 0 !important' }}
                className={css.listitembtn}
              >
                <ListItemAvatar
                  sx={{
                    minWidth: '8px !important',
                    marginRight: '8px !important',
                  }}
                >
                  <Avatar
                    alt="Avatar"
                    src={HDFC}
                    sx={{ width: '24px', height: '24px' }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={row.bank_name || '-s'}
                  secondary={`xxxx ${row.bank_account_number.slice(-4)}` || '-'}
                  className={classes.listTextRoot}
                />
              </ListItemButton>
            </ListItem>
          ))}

          {/* ))}
                      </>
                    ) : (
                      <ListItem>
                        <ListItemText primary="No bank found." />
                      </ListItem>
                    )} */}
        </List>
      </Stack>
    </Stack>
  );
};

export default memo(AccountSelect);
