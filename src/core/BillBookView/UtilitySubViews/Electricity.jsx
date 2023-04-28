import React, { useState, useContext, useEffect } from 'react';
import AppContext from '@root/AppContext.jsx';
import Input from '@components/Input/Input.jsx';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet';
import {
  validateOnlyText,
  validateAddress,
  validatePincode,
  validateWholeNum,
  validateRequired,
} from '@services/Validation.jsx';
import { Button, makeStyles } from '@material-ui/core';
import themes from '@root/theme.scss';
import css from './Rent.scss';
import SuccessView from '../shared/SuccessView';
import VerificationDialog from '../shared/VerificationDialog';

const useStyles = makeStyles(() => ({
  root: {
    background: themes.colorInputBG,
    borderColor: themes.colorInputBorder,
    borderRadius: '8px',
    margin: '0px !important',
    '& .MuiInputLabel-root': {
      margin: '0px',
      color: `${themes.colorInputLabel} !important`,
    },
    '& .MuiInput-root': {
      marginTop: '24px',
    },
    '& .MuiInput-multiline': {
      paddingTop: '10px',
    },
    '& .MuiSelect-icon': {
      color: `${themes.colorInputLabel} !important`,
    },
    '& .MuiSelect-select': {
      borderColor: themes.colorInputBorder,
    },
  },
}));

export const recurringPayment = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
];

export const settlementMode = [
  { id: 'Automatic', label: 'Automatic' },
  { id: 'Manual', label: 'Manual' },
];

export const bankAccount = [
  { id: '1', label: 'HDFC - XXXXXXXXXXXX0394' },
  { id: '2', label: 'HDFC - XXXXXXXXXXXX8945' },
];

const VALIDATION = {
  billingUnit: {
    errMsg: 'Please provide valid Billing Unit',
    test: validateRequired,
    page: 1,
  },
  consumerNo: {
    errMsg: 'Please provide valid Consumer No.',
    test: validateWholeNum,
    page: 1,
  },
  recurringPayment: {
    errMsg: 'Please choose payment method',
    test: validateRequired,
    page: 1,
  },
  address: {
    errMsg: 'Please provide valid Address',
    test: validateAddress,
    page: 2,
  },
  city: {
    errMsg: 'Please provide valid City',
    test: validateOnlyText,
    page: 2,
  },
  pincode: {
    errMsg: 'Please provide valid Pincode',
    test: validatePincode,
    page: 2,
  },
  bankAccount: {
    errMsg: 'Please provide valid bank account',
    test: validateRequired,
    page: 3,
  },
  settlementMode: {
    errMsg: 'Please choose settlement mode',
    test: validateRequired,
    page: 3,
  },
};

const initialState = {
  billingUnit: '',
  consumerNo: '',
  recurringPayment: '',
  address: '',
  city: '',
  pincode: '',
  bankAccount: '',
  settlementMode: '',
  uptoLimit: '',
};

export const Electricity = () => {
  const classes = useStyles();
  const { changeSubView } = useContext(AppContext);
  const initialValidationErr = Object.keys(VALIDATION).map((k) => ({
    [k]: false,
  }));
  const [state, setState] = useState(initialState);
  const [validationErr, setValidationErr] = useState(initialValidationErr);
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState({
    vendor: false,
    recurringPayment: false,
    bankAccount: false,
  });
  const [verificationDialog, setVerificationDialog] = useState(false);

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

  const onInputChange = (ps) => {
    reValidate(ps);
    const [name, value] = getEventNameValue(ps);
    setState((s) => ({ ...s, [name]: value }));
  };

  const onTriggerDrawer = (name) => {
    setDrawer((d) => ({ ...d, [name]: true }));
  };

  const handleBottomSheet = (name, data) => {
    setDrawer((d) => ({ ...d, [name]: false }));
    if (data) setState((s) => ({ ...s, [name]: data }));
    if (state[name] && !data) return;
    reValidate({ target: { name, value: data } });
  };

  const validateAllFields = (validationData) => {
    return Object.keys(validationData).reduce((a, v) => {
      // eslint-disable-next-line no-param-reassign
      a[v] = !validationData?.[v]?.test(state[v]);
      return a;
    }, {});
  };

  const onProceedDialog = () => {
    setVerificationDialog(false);
    setPage(4);
  };

  const onPageNext = () => {
    const sectionValidation = {};
    Object.keys(VALIDATION).forEach((k) => {
      if (VALIDATION[k]?.page === page) {
        sectionValidation[k] = VALIDATION[k];
      }
    });
    const v = validateAllFields(sectionValidation);
    const valid = Object.values(v).every((val) => !val);
    if (!valid) {
      setValidationErr((s) => ({ ...s, ...v }));
      return;
    }
    if (page === 3) {
      if (state.settlementMode?.id === 'Automatic') {
        setVerificationDialog(true);
        return;
      }
    }
    if (page < 4) setPage((p) => p + 1);
  };

  const onPagePrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  useEffect(() => {
    // TODO: Fetch Bank Details here once API is available
  }, []);

  return (
    <div className={css.rentContainer}>
      <div className={css.headerContainer}>
        <div className={css.headerLabel}>
          {/* {view === VIEW.MAIN && 'Record an Expense'}
          {view === VIEW.VENDOR && 'Add New Vendor'}
          {view === VIEW.DONE && 'Expense Saved'} */}
          Setup Your Electricity Bill
        </div>
        <span className={css.headerUnderline} />
      </div>
      <div className={css.inputContainer}>
        {page === 1 && (
          <>
            <Input
              name="billingUnit"
              onBlur={reValidate}
              error={validationErr.billingUnit}
              helperText={
                validationErr.billingUnit ? VALIDATION?.billingUnit?.errMsg : ''
              }
              className={`${css.greyBorder} ${classes.root}`}
              label="Billing Unit"
              variant="standard"
              value={state.billingUnit}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              onChange={onInputChange}
              theme="light"
            />
            <Input
              name="consumerNo"
              onBlur={reValidate}
              error={validationErr.consumerNo}
              helperText={
                validationErr.consumerNo ? VALIDATION?.consumerNo?.errMsg : ''
              }
              className={`${css.greyBorder} ${classes.root}`}
              label="Consumer No"
              variant="standard"
              value={state.consumerNo}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                type: 'tel',
              }}
              fullWidth
              onChange={onInputChange}
              theme="light"
            />
            <SelectBottomSheet
              name="recurringPayment"
              onBlur={reValidate}
              error={validationErr.recurringPayment}
              helperText={
                validationErr.recurringPayment
                  ? VALIDATION?.recurringPayment?.errMsg
                  : ''
              }
              label="Recurring Payment"
              open={drawer.recurringPayment}
              value={state.recurringPayment?.label}
              onTrigger={onTriggerDrawer}
              onClose={handleBottomSheet}
            >
              {recurringPayment.map((ps) => (
                <div
                  key={ps.id}
                  className={css.categoryOptions}
                  onClick={() => handleBottomSheet('recurringPayment', ps)}
                  role="menuitem"
                >
                  {ps.label}
                </div>
              ))}
            </SelectBottomSheet>
          </>
        )}
        {page === 2 && (
          <>
            <Input
              name="address"
              onBlur={reValidate}
              error={validationErr.address}
              helperText={
                validationErr.address ? VALIDATION?.address?.errMsg : ''
              }
              value={state.address}
              className={`${css.greyBorder} ${classes.root}`}
              label="No/Building Name/Street"
              variant="standard"
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              onChange={onInputChange}
              theme="light"
              multiline
              rows={4}
            />
            <Input
              name="city"
              onBlur={reValidate}
              error={validationErr.city}
              helperText={validationErr.city ? VALIDATION?.city?.errMsg : ''}
              value={state.city}
              className={`${css.greyBorder} ${classes.root}`}
              label="City"
              variant="standard"
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              onChange={onInputChange}
              theme="light"
            />
            <Input
              name="pincode"
              onBlur={reValidate}
              error={validationErr.pincode}
              helperText={
                validationErr.pincode ? VALIDATION?.pincode?.errMsg : ''
              }
              value={state.pincode}
              label="Postal Code"
              variant="standard"
              className={`${css.greyBorder} ${classes.root}`}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              onChange={onInputChange}
              theme="light"
            />
          </>
        )}
        {page === 3 && (
          <>
            <SelectBottomSheet
              name="bankAccount"
              onBlur={reValidate}
              error={validationErr.bankAccount}
              helperText={
                validationErr.bankAccount ? VALIDATION?.bankAccount?.errMsg : ''
              }
              label="Bank Account"
              open={drawer.bankAccount}
              value={state.bankAccount?.label}
              onTrigger={onTriggerDrawer}
              onClose={handleBottomSheet}
            >
              {bankAccount.map((ps) => (
                <div
                  key={ps.id}
                  className={css.categoryOptions}
                  onClick={() => handleBottomSheet('bankAccount', ps)}
                  role="menuitem"
                >
                  {ps.label}
                </div>
              ))}
            </SelectBottomSheet>
            <SelectBottomSheet
              name="settlementMode"
              onBlur={reValidate}
              error={validationErr.settlementMode}
              helperText={
                validationErr.settlementMode
                  ? VALIDATION?.settlementMode?.errMsg
                  : ''
              }
              label="Settlement Mode"
              open={drawer.settlementMode}
              value={state.settlementMode?.label}
              onTrigger={onTriggerDrawer}
              onClose={handleBottomSheet}
            >
              {settlementMode.map((ps) => (
                <div
                  key={ps.id}
                  className={css.categoryOptions}
                  onClick={() => handleBottomSheet('settlementMode', ps)}
                  role="menuitem"
                >
                  {ps.label}
                </div>
              ))}
            </SelectBottomSheet>
            {state.settlementMode.id === 'Automatic' && (
              <Input
                name="uptoLimit"
                onBlur={reValidate}
                error={validationErr.uptoLimit}
                helperText={
                  validationErr.uptoLimit ? VALIDATION?.uptoLimit?.errMsg : ''
                }
                className={`${css.greyBorder} ${classes.root}`}
                label="Upto Limit"
                variant="standard"
                value={state.uptoLimit}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  type: 'tel',
                }}
                fullWidth
                onChange={onInputChange}
                theme="light"
              />
            )}
          </>
        )}
        {page === 4 && (
          <SuccessView
            title="Subscription Created"
            description="Your Electricity Bill has been recorded"
            btnTitle="Visit Payment"
            onClick={() => {
              changeSubView('billbookView');
            }}
          />
        )}
      </div>
      {page !== 4 && (
        <div className={css.actionContainer}>
          {page === 1 ? (
            <div />
          ) : (
            <Button
              variant="outlined"
              className={css.outlineButton}
              onClick={() => onPagePrev()}
              size="medium"
            >
              Back
            </Button>
          )}
          <Button
            onClick={() => onPageNext()}
            size="medium"
            className={css.submitButton}
          >
            {page === 3 ? 'Add' : 'Next'}
          </Button>
        </div>
      )}
      <VerificationDialog open={verificationDialog} onSave={onProceedDialog} />
    </div>
  );
};
