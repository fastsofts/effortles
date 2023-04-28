import React, { useState, useContext, memo } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { InputText } from '@components/Input/Input';
import {
  validateEmail,
  validateRequired,
  validateLength,
  validatePhone,
} from '@services/Validation';
import AppContext from '@root/AppContext';
import RestApi, { METHOD } from '@services/RestApi';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer';

import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { SelectField } from '../../../components/Select/Select';

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

const VALIDATION = {
  firstName: {
    errMsg: 'Please provide first name',
    test: (v) => validateRequired(v),
  },
  lastName: {
    errMsg: 'Name should be at-least 4 Characters',
    test: (v) => validateLength(v, 4, 20),
  },
  businessName: {
    errMsg: 'Please provide Business Name',
    test: (v) => validateRequired(v),
  },
  gender: {
    errMsg: 'Please provide gender',
    test: (v) => validateRequired(v),
  },
  email: {
    errMsg: 'Please provide valid email',
    test: validateEmail,
  },
  phone: {
    errMsg: 'Please provide valid mobile no.',
    test: validatePhone,
  },
  address1: {
    errMsg: 'Please provide Address Line 1',
    test: (v) => validateRequired(v),
  },
  address2: {
    errMsg: 'Please provide Address Line 2',
    test: (v) => validateRequired(v),
  },
  pincode: {
    errMsg: 'Please enter your pincode',
    test: (v) => validateRequired(v),
  },
  city: {
    errMsg: 'Please enter your City',
    test: (v) => validateRequired(v),
  },
  state: {
    errMsg: 'Please enter your State',
    test: (v) => validateRequired(v),
  },
  country: {
    errMsg: 'Please select your Country',
    test: (v) => validateRequired(v),
  },
  password: {
    errMsg: 'Please enter your password',
    test: (v) => validateLength(v, 8, 16),
  },
};

const CreateVirtualAccount = ({
  TransactionPassword,
  FetchBankAccounts,
  onClose,
}) => {
  const { organization, currentUserInfo, openSnackBar, user, enableLoading } =
    useContext(AppContext);

  const initialValidationErr = Object.keys(VALIDATION).map((k) => ({
    [k]: false,
  }));

  const initialState = {
    firstName: currentUserInfo?.name,
    lastName: '',
    businessName: organization?.name,
    gender: '',
    email: currentUserInfo?.email,
    phone: currentUserInfo?.mobileNumber,
    address1: '',
    address2: '',
    pincode: '',
    city: '',
    state: '',
    country: '',
    password: '',
  };

  const [showPassword, setshowPassword] = useState(false);
  // const [btnDisable, setbtnDisable] = useState(false);
  const [state, setState] = useState(initialState);
  const [validationErr, setValidationErr] = useState(initialValidationErr);
  // const [countryList, setCountryList] = useState([]);

  const getEventNameValue = (ps, val) => {
    const name = !val ? ps?.target?.name : ps;

    // if (name === 'gender' || name === '') {
    //   const value = ps?.target?.value.toUpperCase();
    //   return [name, value];
    // }
    const value = !val ? ps?.target?.value : val;
    return [name, value];
  };

  const reValidate = (ps, val) => {
    const [name, value] = getEventNameValue(ps, val);
    // if (device === 'mobile') {
    //   setValidationErr((v) => ({
    //     ...v,
    //     [name]: !VALIDATION?.[name]?.test?.(value),
    //   }));
    // } else {
    setValidationErr((v) => ({
      ...v,
      [name]: !VALIDATION?.[name]?.test?.(value),
    }));
    // }
  };

  const validateAllFields = (stateParam) => {
    const stateData = stateParam || state;
    return Object.keys(VALIDATION).reduce((a, v) => {
      const paramValue = a;
      paramValue[v] = !VALIDATION?.[v]?.test(stateData[v]);
      return paramValue;
    }, {});
  };

  const Valid = () => {
    const v = validateAllFields();
    const valid = Object.values(v).every((val) => !val);
    if (!valid) {
      setValidationErr((s) => ({ ...s, ...v }));
      return false;
    }
    return true;
  };

  const onInputChange = (ps) => {
    reValidate(ps);
    const [name, value] = getEventNameValue(ps);
    setState((s) => ({ ...s, [name]: value }));
  };

  const SubmitDetails = async () => {
    if (Valid()) {
      enableLoading(true);
      await RestApi(
        `organizations/${organization.orgId}/effortless_virtual_accounts`,
        {
          method: METHOD.POST,
          headers: {
            Authorization: `Bearer ${user.activeToken}`,
          },
          payload: {
            first_name: state?.firstName,
            last_name: state?.lastName,
            business_name: state?.businessName,
            gender: state?.gender?.toUpperCase(),
            mobile_number: state?.phone,
            email: state?.email,
            address_line1: state?.address1,
            address_line2: state?.address2,
            city: state?.city,
            state: state?.state,
            country: state?.country,
            pincode: state?.pincode,
            password: state?.password,
          },
        }
      )
        .then((res) => {
          enableLoading(false);

          if (res && !res.error) {
            // if (res.message === 'Organization location is not present') {
            //   openSnackBar({
            //     message: res.message,
            //     type: MESSAGE_TYPE.ERROR,
            //   });
            // } else {
            FetchBankAccounts();
            RestApi(
              `organizations/${organization.orgId}/effortless_virtual_accounts/${res?.id}/register`,
              {
                method: METHOD.POST,
                headers: {
                  Authorization: `Bearer ${user.activeToken}`,
                },
              }
            ).then((response) => {
              if (response && !response.error) {
                TransactionPassword(true);
              }
            });
            // }
          } else {
            // if (res.message === 'Organization location is not present') {
            //   openSnackBar({
            //     message: res.message,
            //     type: MESSAGE_TYPE.ERROR,
            //   });
            // } else {
            openSnackBar({
              message: Object.values(res.errors).join(),
              type: MESSAGE_TYPE.ERROR,
            });
            // }
          }
        })
        .catch(() => {
          openSnackBar({
            message: 'Sorry, Unknown error occured',
            type: MESSAGE_TYPE.ERROR,
          });
        });
    }
  };

  // const getCountry = () => {
  //   RestApi(`countries`, {
  //     method: METHOD.GET,
  //     headers: {
  //       Authorization: `Bearer ${user.activeToken}`,
  //     },
  //   })
  //     .then((res) => {
  //       setCountryList(res);
  //     })
  //     .catch(() => {
  //       openSnackBar({
  //         message: 'Sorry, Unknown error occured',
  //         type: MESSAGE_TYPE.ERROR,
  //       });
  //     });
  // };

  // useEffect(() => {
  //   getCountry();
  // }, []);

  return (
    <Box className={css.formContainer}>
      <Typography variant="h4" className={css.fromContainer_header}>
        Basic Details
      </Typography>
      <TextfieldStyle
        label="First Name"
        name="firstName"
        className={css.textFieldSize}
        defaultValue={
          state.firstName === '' ? currentUserInfo?.name : state?.firstName
        }
        error={validationErr.firstName}
        helperText={
          validationErr.firstName ? VALIDATION?.firstName?.errMsg : ''
        }
        onBlur={reValidate}
        onChange={onInputChange}
      />

      <TextfieldStyle
        label="Last Name"
        name="lastName"
        className={css.textFieldSize}
        value={state.lastName}
        error={validationErr.lastName}
        helperText={validationErr.lastName ? VALIDATION?.lastName?.errMsg : ''}
        onBlur={reValidate}
        onChange={onInputChange}
      />

      <TextfieldStyle
        label="Business Name"
        name="businessName"
        className={css.textFieldSize}
        defaultValue={
          state.phone === ''
            ? currentUserInfo?.BusinessName
            : state?.businessName
        }
        error={validationErr.businessName}
        helperText={
          validationErr.businessName ? VALIDATION?.businessName?.errMsg : ''
        }
        onBlur={reValidate}
        onChange={onInputChange}
      />
      <SelectField
        label="Select Gender"
        name="gender"
        value={state.gender}
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
        error={validationErr.gender}
        helperText={validationErr.gender ? VALIDATION?.gender?.errMsg : ''}
        onBlur={reValidate}
        onChange={onInputChange}
      />

      <TextfieldStyle
        label="Email Id"
        name="email"
        className={css.textFieldSize}
        defaultValue={
          state?.email === '' ? currentUserInfo?.email : state?.email
        }
        error={validationErr.email}
        helperText={validationErr.email ? VALIDATION?.email?.errMsg : ''}
        onBlur={reValidate}
        onChange={onInputChange}
      />
      <TextfieldStyle
        label="Mobile Number"
        name="phone"
        type="number"
        className={css.textFieldSize}
        error={validationErr.phone}
        helperText={validationErr.phone ? VALIDATION?.phone?.errMsg : ''}
        defaultValue={
          state.phone === '' ? currentUserInfo?.mobileNumber : state?.phone
        }
        onChange={onInputChange}
      />

      <TextfieldStyle
        label="Address 1"
        name="address1"
        inputProps={{ maxLength: 45 }}
        value={state?.address1}
        className={css.textFieldSize}
        error={validationErr.address1}
        helperText={validationErr.address1 ? VALIDATION?.address1?.errMsg : ''}
        onBlur={reValidate}
        onChange={onInputChange}
      />

      <TextfieldStyle
        label="Address 2"
        name="address2"
        inputProps={{ maxLength: 45 }}
        value={state?.address2}
        className={css.textFieldSize}
        error={validationErr.address2}
        helperText={validationErr.address2 ? VALIDATION?.address2?.errMsg : ''}
        onBlur={reValidate}
        onChange={onInputChange}
      />
      <Box sx={{ display: 'flex', gap: '24px' }}>
        <TextfieldStyle
          label="Pin Code"
          name="pincode"
          type="number"
          value={state?.pincode}
          className={css.textFieldSize}
          sx={{ marginRight: '5px' }}
          error={validationErr.pincode}
          helperText={validationErr.pincode ? VALIDATION?.pincode?.errMsg : ''}
          onBlur={reValidate}
          onChange={onInputChange}
        />
        <TextfieldStyle
          label="City/Town"
          name="city"
          value={state?.city}
          className={css.textFieldSize}
          error={validationErr.city}
          helperText={validationErr.city ? VALIDATION?.city?.errMsg : ''}
          onBlur={reValidate}
          onChange={onInputChange}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: '24px' }}>
        <TextfieldStyle
          label="State"
          name="state"
          value={state?.state}
          className={css.textFieldSize}
          error={validationErr.state}
          helperText={validationErr.state ? VALIDATION?.state?.errMsg : ''}
          onBlur={reValidate}
          onChange={onInputChange}
        />
        <SelectField
          label="Country"
          name="country"
          value={state.country}
          required
          options={[
            { payload: 'IN', text: 'India' },
            { payload: 'AD', text: 'Andorra' },
            { payload: 'AE', text: 'United Arab Emirates' },
            { payload: 'AF', text: 'Afghanistan' },
            { payload: 'AG', text: 'Antigua and Barbuda' },
            { payload: 'AI', text: 'Anguilla' },
          ]}
          error={validationErr.country}
          helperText={validationErr.country ? VALIDATION?.country?.errMsg : ''}
          onBlur={reValidate}
          onChange={onInputChange}
        />
      </Box>
      <TextfieldStyle
        label="Password"
        type="password"
        name="password"
        value={state.password}
        className={css.textFieldSize}
        inputProps={{
          type: showPassword ? 'text' : 'password',
        }}
        autoComplete="new-password"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setshowPassword((p) => !p)}
                edge="end"
                style={{
                  color: '#283049',
                  padding: '4px',
                  marginTop: '-32px',
                }}
              >
                {showPassword ? (
                  <VisibilityOffOutlinedIcon style={{ fontSize: '18px' }} />
                ) : (
                  <RemoveRedEyeOutlinedIcon style={{ fontSize: '18px' }} />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
        error={validationErr.password}
        helperText={validationErr.password ? VALIDATION?.password?.errMsg : ''}
        onBlur={reValidate}
        onChange={onInputChange}
      />
      <Stack className={css.fromContainer_btnwrp}>
        <Button className={css.fromContainer_cancelbtn} onClick={onClose}>
          Cancel
        </Button>
        <Button
          className={css.fromContainer_successbtn}
          onClick={SubmitDetails}
          // disabled={btnDisable}
        >
          Proceed To Create
        </Button>
      </Stack>
    </Box>
  );
};

export default memo(CreateVirtualAccount);
