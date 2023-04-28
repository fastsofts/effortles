import React, { useState, useContext } from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import { validateRequired, validateIfsc } from '@services/Validation';

import RestApi, { METHOD } from '@services/RestApi';
import AppContext from '@root/AppContext';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer';

import { InputText } from '../../../components/Input/Input';
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
      disabled
      theme="light"
      className={css.textfieldStyle}
    />
  );
};

const VALIDATIONBANK = {
  name: {
    errMsg: 'Enter valid Name',
    test: validateRequired,
  },
  bank_account_number: {
    errMsg: 'Enter valid Account Number',
    test: validateRequired,
  },
  bank_account_name: {
    errMsg: 'Enter valid Bank Name',
    test: validateRequired,
  },
  bank_ifsc_code: {
    errMsg: 'Enter valid IFSC Code',
    test: validateIfsc,
  },
  bank_branch: {
    errMsg: 'Enter valid Bank Branch Name',
    test: validateRequired,
  },
};

const EditIndividualAccount = ({ onClose, FetchBankAccounts, data }) => {
  const initalState = {
    name: data.account_holder_name,
    bank_account_number: data.bank_account_number,
    bank_account_name: data.account_name,
    bank_branch: data.bank_branch,
    bank_ifsc_code: data.ifsc_code,
    display_name: data.display_name,
  };

  const { organization, user, openSnackBar, enableLoading } =
    useContext(AppContext);

  const initialValidationErr = Object.keys(VALIDATIONBANK).map((k) => ({
    [k]: false,
  }));

  const [bankState, setBankState] = useState(initalState);
  const [validationErr, setValidationErr] = useState(initialValidationErr);

  const getEventNameValue = (ps) => {
    const name = ps?.target?.name;
    const value =
      ps?.target?.type === 'checkbox' ? ps?.target?.checked : ps?.target?.value;
    return [name, value];
  };

  const validateAllFields = (validationData) => {
    return Object.keys(validationData).reduce((a, v) => {
      a[v] = !validationData?.[v]?.test(bankState[v]);
      return a;
    }, {});
  };

  const reValidate = (ps) => {
    const [name, value] = getEventNameValue(ps);
    setValidationErr((v) => ({
      ...v,
      [name]: !VALIDATIONBANK?.[name]?.test?.(value),
    }));
  };

  const onInputChange = (ps) => {
    reValidate(ps);
    const [name, value] = getEventNameValue(ps);
    setBankState((s) => ({
      ...s,
      [name]: name === 'bank_ifsc_code' ? value?.toUpperCase() : value,
    }));
  };

  const submitBank = () => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/bank_accounts/${data.bank_account_id}`,
      {
        method: METHOD.PATCH,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
        payload: {
          display_name: bankState.display_name,
        },
      }
    )
      .then((res) => {
        enableLoading(false);
        if (res && !res.error && res.message !== 'Bank Account not found') {
          openSnackBar({
            message: 'Updated Successfully',
            type: MESSAGE_TYPE.INFO,
          });
          FetchBankAccounts();
        } else
          openSnackBar({
            message: res?.message || 'Something went wrong',
            type: MESSAGE_TYPE.ERROR,
          });

        onClose();
      })
      .catch((e) => {
        openSnackBar({
          message: Object.values(e.errors).join(),
          type: MESSAGE_TYPE.ERROR,
        });
        onClose();
        enableLoading(false);
      });
  };

  const OnSubmit = () => {
    const sectionValidation = {};
    Object.keys(VALIDATIONBANK).forEach((k) => {
      sectionValidation[k] = VALIDATIONBANK[k];
    });
    const v = validateAllFields(sectionValidation);
    const valid = Object.values(v).every((val) => !val);
    if (!valid) {
      setValidationErr((s) => ({ ...s, ...v }));
    }
    submitBank();
  };

  return (
    <Box className={css.formContainer}>
      <Typography variant="h4" className={css.fromContainer_header}>
        Edit Bank Account Details
      </Typography>
      <Typography className={css.fromContainer_subheader}>
        Modify this Bank Account&apos;s Details
      </Typography>
      <Stack>
        <TextfieldStyle
          label="Account Holder Name"
          name="name"
          className={css.textFieldSize}
          value={bankState?.name}
          error={validationErr.name}
          helperText={validationErr.name ? VALIDATIONBANK?.name?.errMsg : ''}
          onChange={onInputChange}
          onBlur={reValidate}
        />
        <TextfieldStyle
          label="Account Number"
          name="bank_account_number"
          type="number"
          className={css.textFieldSize}
          value={bankState?.bank_account_number}
          error={validationErr.bank_account_number}
          helperText={
            validationErr.bank_account_number
              ? VALIDATIONBANK?.bank_account_number?.errMsg
              : ''
          }
          onChange={onInputChange}
          onBlur={reValidate}
        />
        <TextfieldStyle
          label="Bank Name"
          name="bank_account_name"
          className={css.textFieldSize}
          value={bankState?.bank_account_name}
          error={validationErr.bank_account_name}
          helperText={
            validationErr.bank_account_name
              ? VALIDATIONBANK?.bank_account_name?.errMsg
              : ''
          }
          onChange={onInputChange}
          onBlur={reValidate}
        />
        <TextfieldStyle
          label="Bank IFSC Code"
          name="bank_ifsc_code"
          className={css.textFieldSize}
          value={bankState?.bank_ifsc_code}
          error={validationErr.bank_ifsc_code}
          helperText={
            validationErr.bank_ifsc_code
              ? VALIDATIONBANK?.bank_ifsc_code?.errMsg
              : ''
          }
          onChange={onInputChange}
          onBlur={reValidate}
        />
        <TextfieldStyle
          label="Branch Name"
          name="bank_branch"
          className={css.textFieldSize}
          value={bankState?.bank_branch}
          error={validationErr.bank_branch}
          helperText={
            validationErr.bank_branch ? VALIDATIONBANK?.bank_branch?.errMsg : ''
          }
          onChange={onInputChange}
          onBlur={reValidate}
        />

        <InputText
          label="Display Name"
          name="display_name"
          className={css.textfieldStyle}
          value={bankState?.display_name}
          onChange={onInputChange}
          variant="standard"
          InputLabelProps={{
            shrink: true,
          }}
          theme="light"
        />
        <Stack
          className={css.fromContainer_btnwrp}
          sx={{ marginTop: '24px' }}
          onClick={onClose}
        >
          <Button className={css.fromContainer_cancelbtn}>Cancel</Button>
          <Button className={css.fromContainer_successbtn} onClick={OnSubmit}>
            Update Bank Details
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default EditIndividualAccount;
