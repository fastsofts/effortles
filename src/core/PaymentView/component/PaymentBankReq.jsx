import React from 'react';
import * as Mui from '@mui/material';
import Input from '@components/Input/Input.jsx';
import AppContext from '@root/AppContext.jsx';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import { validateIfsc, validateRequired } from '@services/Validation.jsx';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer.jsx';
import * as css from '../Payments.scss';

const VALIDATION = {
  accNum: {
    errMsg: 'Enter valid Account Number',
    test: validateRequired,
  },
  ifsc: {
    errMsg: 'Enter valid ifsc',
    test: validateIfsc,
  },
  holderName: {
    errMsg: 'Enter Holder Name',
    test: validateRequired,
  },
  bankName: {
    errMsg: 'Enter valid Bank Name',
    test: validateRequired,
  },
  bankBranch: {
    errMsg: 'Enter valid Bank Branch Name',
    test: validateRequired,
  },
};

const PaymentBankReq = ({ handleBottomSheet, vendorId }) => {
  const { organization, enableLoading, user, openSnackBar } =
    React.useContext(AppContext);
  const [checkId, setCheckId] = React.useState(false);
  const [mainState, setMainState] = React.useState({
    bankBranch: '',
    bankName: '',
    holderName: '',
    accNum: '',
    ifsc: '',
  });
  const initialValidationErr = Object.keys(VALIDATION).map((k) => ({
    [k]: false,
  }));
  const [validationErr, setValidationErr] =
    React.useState(initialValidationErr);
  const device = localStorage.getItem('device_detect');

  const paymentBankReg = async () => {
    enableLoading(true);

    await RestApi(
      `organizations/${organization.orgId}/vendors/${vendorId}/bank_details`,
      {
        method: METHOD.POST,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
        payload: {
          bank_name: mainState?.bankName,
          bank_branch_name: mainState?.bankBranch,
          bank_account_number: mainState?.accNum,
          bank_ifsc_code: mainState?.ifsc,
          account_holder_name: mainState?.holderName,
        },
      },
    )
      .then((res) => {
        enableLoading(false);
        if (res && !res.error) {
          openSnackBar({
            message: 'Registered Successfully',
            type: MESSAGE_TYPE.INFO,
          });
          handleBottomSheet();
        } else {
          openSnackBar({
            message: res.message || 'Error Occured',
            type: MESSAGE_TYPE.WARNING,
          });
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const validateBankAccount = () => {
    const payload = {
      ifsc: mainState?.ifsc,
      account_number: mainState?.accNum,
      name: mainState?.holderName,
      // mobile: mainState.contactPhone,
      organization_id: organization.orgId,
    };
    RestApi(`bank_details_verifications`, {
      method: METHOD.POST,
      payload,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    }).then((res) => {
      if (res && !res.error && res.verified) {
        openSnackBar({
          message: 'Verification Successful',
          type: MESSAGE_TYPE.INFO,
        });
      } else {
        openSnackBar({
          message: res.message || 'Verification Not Successful',
          type: MESSAGE_TYPE.WARNING,
        });
      }
    });
  };

  const getEventNameValue = (ps) => {
    const name = ps?.target?.name;
    const value = ps?.target?.value;
    return [name, value];
  };

  const reValidate = (ps) => {
    const [name, value] = getEventNameValue(ps);
    setValidationErr((v) => ({
      ...v,
      [name]: !VALIDATION?.[name]?.test?.(value),
    }));
  };

  const getBankDetails = (code) => {
    enableLoading(true);
    RestApi(`ifsc?ifsc=${code}`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        enableLoading(false);
        if (res && !res.error) {
          const { BANK: bankName, BRANCH: bankBranch } = res;
          setMainState((s) => ({
            ...s,
            bankName,
            bankBranch,
          }));
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const onInputChange = (ps) => {
    reValidate(ps);
    const [name, value] = getEventNameValue(ps);
    setMainState((s) => ({
      ...s,
      [name]: value,
    }));
    if (name === 'ifsc' && value?.length === 11) {
      getBankDetails(value);
    }
  };

  const validateAllFields = (validationData) => {
    return Object.keys(validationData).reduce((a, v) => {
      // eslint-disable-next-line no-param-reassign
      a[v] = !validationData?.[v]?.test(mainState[v]);
      return a;
    }, {});
  };

  const submit = () => {
    const sectionValidation = {};
    Object.keys(VALIDATION).forEach((k) => {
      sectionValidation[k] = VALIDATION[k];
    });
    const g = validateAllFields(sectionValidation);
    const valid = Object.values(g).every((val) => !val);

    if (!valid) {
      setValidationErr((s) => ({ ...s, ...g }));
    } else {
      paymentBankReg();
    }
  };
  const submitForBank = (check) => {
    const sectionValidation = {};
    Object.keys(VALIDATION).forEach((k) => {
      sectionValidation[k] = VALIDATION[k];
    });
    const g = validateAllFields(sectionValidation);
    const valid = Object.values(g).every((val) => !val);

    if (!valid) {
      setValidationErr((s) => ({ ...s, ...g }));
    } else if (check) {
      validateBankAccount();
      setCheckId(check);
    } else {
      setCheckId(check);
    }
  };
  return (
    <div
      className={css.effortlessPayment}
      style={{ padding: device === 'mobile' ? '10px' : '15px 85px' }}
    >
      <div>
        <p className={css.title}>Effortless Payments</p>
      </div>
      <div>
        <p className={css.holdOn}>Hold On!</p>
      </div>

      <div>
        <p className={css.para}>
          Bank Account Details for the Vendor you <br /> have selected are
          missing. Please add <br /> them and proceed to payment:
        </p>
      </div>

      <Mui.Grid container spacing={3} mt={1}>
        <Mui.Grid item xs={12}>
          <Input
            name="accNum"
            label="Account No."
            variant="standard"
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            theme="light"
            rootStyle={{
              border: '1px solid #A0A4AF',
            }}
            onBlur={reValidate}
            error={validationErr.accNum}
            helperText={validationErr.accNum ? VALIDATION?.accNum?.errMsg : ''}
            onChange={onInputChange}
            value={mainState?.accNum}
            required
          />
        </Mui.Grid>
        <Mui.Grid item xs={12}>
          <Input
            name="ifsc"
            label="IFSC Code"
            variant="standard"
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            theme="light"
            rootStyle={{
              border: '1px solid #A0A4AF',
            }}
            onBlur={reValidate}
            error={validationErr.ifsc}
            helperText={validationErr.ifsc ? VALIDATION?.ifsc?.errMsg : ''}
            onChange={onInputChange}
            value={mainState?.ifsc?.toUpperCase()}
            required
          />
        </Mui.Grid>
        <Mui.Grid item xs={12}>
          <Input
            name="holderName"
            label="Account Holder’s Name"
            variant="standard"
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            theme="light"
            rootStyle={{
              border: '1px solid #A0A4AF',
            }}
            onBlur={reValidate}
            error={validationErr.holderName}
            helperText={
              validationErr.holderName ? VALIDATION?.holderName?.errMsg : ''
            }
            onChange={onInputChange}
            value={mainState?.holderName}
            required
          />
        </Mui.Grid>
        <Mui.Grid item xs={12}>
          <Input
            name="bankName"
            label="Bank Name"
            variant="standard"
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            theme="light"
            rootStyle={{
              border: '1px solid #A0A4AF',
            }}
            onBlur={reValidate}
            error={validationErr.bankName}
            helperText={
              validationErr.bankName ? VALIDATION?.bankName?.errMsg : ''
            }
            onChange={onInputChange}
            value={mainState?.bankName}
            required
          />
        </Mui.Grid>
        <Mui.Grid item xs={12}>
          <Input
            name="bankBranch"
            label="Bank Branch"
            variant="standard"
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            theme="light"
            rootStyle={{
              border: '1px solid #A0A4AF',
            }}
            onBlur={reValidate}
            error={validationErr.bankBranch}
            helperText={
              validationErr.bankBranch ? VALIDATION?.bankBranch?.errMsg : ''
            }
            onChange={onInputChange}
            value={mainState?.bankBranch}
            required
          />
        </Mui.Grid>
        <Mui.Grid item xs={12}>
          <Mui.FormControlLabel
            control={
              <Mui.Checkbox
                checked={checkId}
                onChange={(e) => {
                  submitForBank(e?.target?.checked);
                }}
              />
            }
            label={
              <Mui.ListItemText
                primary={<p className={css.topText}>Validate Bank Account</p>}
                secondary={
                  <p className={css.bottomText}>
                    On checking the box, Re. 1 will be deducted for validation
                    purposes
                  </p>
                }
              />
            }
          />
        </Mui.Grid>
        <Mui.Grid item xs={12}>
          <Mui.Button className={css.primaryButton} onClick={() => submit()}>
            Save Bank Details
          </Mui.Button>
        </Mui.Grid>
      </Mui.Grid>
    </div>
  );
};

export default PaymentBankReq;
