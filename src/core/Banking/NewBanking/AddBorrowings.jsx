import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { InputText } from '@components/Input/Input';
import { SelectField, SelectAutoComplete } from '@components/Select/Select';
import PopperComp from '@components/Popper/PopperComp';
import SearchIcon from '@assets/search.svg';

import css from './bankingnew.scss';

const TextfieldStyle = (props) => {
  return (
    <InputText
      {...props}
      variant="standard"
      InputLabelProps={{
        shrink: true,
      }}
      required
      theme="light"
      className={css.textfieldStyle}
    />
  );
};

const AddBorrowings = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [Lender, setLender] = useState('');

  const LenderOnchange = (val) => () => {
    setLender(val);
    setAnchorEl(null);
  };
  return (
    <Box className={css.formContainer}>
      <PopperComp
        openProps={open}
        anchorElProps={anchorEl}
        onClose={() => {
          setAnchorEl(null);
        }}
        className={css.popOver}
        subClass={css.popOverBox}
      >
        <Stack>
          <Stack className={css.searchInputwrp}>
            <IconButton className={css.searchicon}>
              <img src={SearchIcon} alt="Seach Icons" width={16} height={16} />
            </IconButton>
            <input
              placeholder="Search a Lender"
              className={css.searchInput}
              autoFocus
            />
          </Stack>
          <List className={css.menulist}>
            {[
              'Innbuilt Technologies Private Limited',
              'Aqueasy Innovations Private Limited',
              'Vayujal Technologies Private Limited',
              'First Insight Technologies India Private Limited',
            ].map((val) => (
              <ListItem className={css.listitems} onClick={LenderOnchange(val)}>
                <ListItemText primary={val} className={css.ListItemText} />
              </ListItem>
            ))}
            <ListItem className={`${css.listitems} ${css.addlist}`}>
              <ListItemIcon className={css.listicons}>
                <AddRoundedIcon sx={{ height: '20px', width: '20px' }} />
              </ListItemIcon>
              <ListItemText
                primary="Add New Lender"
                className={`${css.ListItemText} ${css.addlisttext}`}
              />
            </ListItem>
          </List>
        </Stack>
      </PopperComp>
      <Typography variant="h4" className={css.fromContainer_header}>
        Add Borrowing
      </Typography>
      <Stack>
        <SelectField
          label="Select Category"
          name="category"
          //   value={state.gender}
          required
          options={[
            {
              payload: 'male',
              text: 'Male',
            },
            {
              payload: 'female',
              text: 'Female',
            },
          ]}
          //   error={validationErr.gender}
          //   helperText={validationErr.gender ? VALIDATION?.gender?.errMsg : ''}
          //   onBlur={reValidate}
          //   onChange={onInputChange}
        />

        <SelectAutoComplete
          label="Select Lender"
          name="Lender"
          required
          value={Lender}
          onClick={(event) => {
            setAnchorEl(event.currentTarget);
          }}
          // options={[
          //   {
          //     payload: 'male',
          //     text: 'Male',
          //   },
          //   {
          //     payload: 'female',
          //     text: 'Female',
          //   },
          // ]}
        />
        {/* <TextfieldStyle
          label="Lender Name"
          name="lenderName"
          className={css.textFieldSize}
        />
        <TextfieldStyle
          label="Address"
          name="Address"
          className={css.textFieldSize}
        />
        <Box sx={{ display: 'flex', gap: '24px' }}>
          <TextfieldStyle
            label="Pin Code"
            name="pincode"
            type="number"
            className={css.textFieldSize}
          />
          <TextfieldStyle
            label="City/Town"
            name="city"
            className={css.textFieldSize}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: '24px' }}>
          <TextfieldStyle
            label="State"
            name="state"
            className={css.textFieldSize}
          />
          <SelectField
            label="Country"
            name="country"
            required
            options={[
              {
                payload: 'male',
                text: 'Male',
              },
              {
                payload: 'female',
                text: 'Female',
              },
            ]}
          />
        </Box>
        <TextfieldStyle
          label="Contact Name"
          name="contactName"
          className={css.textFieldSize}
        />

        <InputText
          label="Contact Phone Number"
          name="contactPhoneNumber"
          variant="standard"
          InputLabelProps={{
            shrink: true,
          }}
          theme="light"
          className={css.textfieldStyle}
        />
        <InputText
          label="Contact Email Id"
          name="contactEmail"
          variant="standard"
          InputLabelProps={{
            shrink: true,
          }}
          theme="light"
          className={css.textfieldStyle}
        /> */}
        <TextfieldStyle
          label="Purpose"
          name="purpose"
          className={css.textFieldSize}
        />

        <Typography className={css.fileuploadlabel}>
          Upload EMI Schedule
        </Typography>
        <input
          label="Purpose"
          name="purpose"
          type="file"
          size="104px"
          className={css.fileinput}
        />
        <Stack className={css.fromContainer_btnwrp}>
          <Button className={css.fromContainer_cancelbtn}>Cancel</Button>
          <Button className={css.fromContainer_successbtn}>
            Send to SuperAccountant
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default AddBorrowings;
