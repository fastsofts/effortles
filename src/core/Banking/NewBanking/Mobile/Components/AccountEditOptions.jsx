import React, { memo } from 'react';
import {
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from '@mui/material';

import css from '../bankingmobile.scss';

const AccountEditOptions = ({ HandleOption, Sync, Status, ubc }) => {
  return (
    <Stack className={css.bottommodalcontainer}>
      <Stack className={css.emptyBar} />

      <List sx={{ paddingTop: '0px', margin: '15px -20px 0 -20px' }}>
        <ListItem className={css.listitem} onClick={HandleOption('EAD')}>
          <ListItemButton className={css.ListButtons}>
            <ListItemText
              primary="Edit Account Details"
              className={css.listtext}
            />
          </ListItemButton>
        </ListItem>

        {ubc === 'true' && (
          <ListItem className={css.listitem} onClick={HandleOption('UBC')}>
            <ListItemButton className={css.ListButtons}>
              <ListItemText
                primary="Update Bank Credentials"
                className={css.listtext}
              />
            </ListItemButton>
          </ListItem>
        )}
        <ListItem className={css.listitem} onClick={HandleOption('DEBS')}>
          <ListItemButton className={css.ListButtons}>
            <ListItemText
              primary={`${Sync} Bank Sync`}
              className={css.listtext}
            />
          </ListItemButton>
        </ListItem>

        <ListItem className={css.listitem} onClick={HandleOption('DEA')}>
          <ListItemButton className={css.ListButtons}>
            <ListItemText
              primary={`${Status} Account`}
              className={css.listtext}
            />
          </ListItemButton>
        </ListItem>

        <ListItem className={css.listitem} onClick={HandleOption('DBA')}>
          <ListItemButton className={css.ListButtons}>
            <ListItemText
              primary="Delete Bank Account"
              className={css.listtext}
              sx={{
                '& .MuiListItemText-primary': {
                  color: '#FF0000 !important',
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Stack>
  );
};

export default memo(AccountEditOptions);
