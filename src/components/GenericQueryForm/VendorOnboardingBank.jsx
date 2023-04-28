import React from 'react';
// import * as Router from 'react-router-dom';
import Input from '@components/Input/Input.jsx';
import * as Mui from '@mui/material';
import { makeStyles } from '@material-ui/core';
import themes from '@root/theme.scss';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer.jsx';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import AppContext from '@root/AppContext.jsx';
import { validateIfsc, validateRequired } from '@services/Validation.jsx';
import OnBoardingThanks from './OnBoardingThanks';
import css from './Onboarding.scss';

const useStyles = makeStyles(() => ({
  chips: {
    margin: '0 5px',
    '& .MuiChip-root': {
      background: 'white',
      border: '1px solid #f0f0f0',
      flexDirection: 'row !important',
    },
    '& .MuiChip-icon': {
      marginRight: '5px',
      marginLeft: '5px',
    },
  },
  searchInput: {
    margin: '0 20px',
    padding: '5px 10px 0 0',
    '& .MuiTextField-root': {
      paddingLeft: '8px',
      marginBottom: '8px',
      border: '1px solid rgb(180 175 174)',
    },
    '& .MuiInput-root': {
      height: '56px !important',
    },
  },
  checkbox: {
    padding: 0,
    paddingTop: 4,
    '& .MuiSvgIcon-root': {
      fontSize: '2.4rem',
      fill: 'transparent',
    },
  },
  selectedchips: {
    minWidth: '80px',
    margin: '0 6px 0 0',
    background: '#fdf1e6',
    color: themes.colorPrimaryButton,
    borderColor: themes.colorPrimaryButton,
  },
  root: {
    background: themes.colorInputBG,
    // border: '0.7px solid',
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
    '& .MuiInputBase-adornedEnd .MuiSvgIcon-root': {
      marginTop: '-10px',
    },
  },
}));

const VALIDATIONSHARE = {
  bankName: {
    errMsg: 'Please provide valid Name',
    test: validateRequired,
  },
  accNumber: {
    errMsg: 'Enter valid Account Number',
    test: validateRequired,
  },
  ifsc: {
    errMsg: 'Enter valid ifsc',
    test: validateIfsc,
  },
  bankBranch: {
    errMsg: 'Please provide valid Name',
    test: validateRequired,
  },
  holderName: {
    errMsg: 'Please provide valid Name',
    test: validateRequired,
  },
};

const VendorOnboarding = ({ titleHead }) => {
  // const classes = useStyles();
  const [viewFlow, setViewFlow] = React.useState({
    home: true,
    thanks: false,
  });

  return (
    <div className={css.vendorOnboarding}>
      <p className={css.TitleVendor}>{titleHead?.name}</p>
      {viewFlow?.home && (
        <VendorOnboardingBank setViewFlow={setViewFlow} titleHead={titleHead} />
      )}
      {viewFlow?.thanks && (
        <OnBoardingThanks
          supportMail={titleHead?.user_email}
          organizationName={titleHead?.organization_name}
        />
      )}
    </div>
  );
};
export default VendorOnboarding;

const VendorOnboardingBank = ({ setViewFlow, titleHead }) => {
  const { enableLoading, openSnackBar } = React.useContext(AppContext);
  const classes = useStyles();
  const [mainState, setMainState] = React.useState({
    bankName: '',
    bankBranch: '',
    holderName: '',

    accNumber: '',
    ifsc: '',
  });
  const initialValidationErr = Object.keys(VALIDATIONSHARE).map((k) => ({
    [k]: false,
  }));
  const [validationErr, setValidationErr] =
    React.useState(initialValidationErr);

  // const getBankDetails = (code) => {
  //   enableLoading(true);
  //   RestApi(`ifsc?ifsc=${code}`, {
  //     method: METHOD.GET,
  //     headers: {
  //       Authorization: `Bearer ${user.activeToken}`,
  //     },
  //   })
  //     .then((res) => {
  //       enableLoading(false);
  //       if (res && !res.error) {
  //         const { BANK: bankName, BRANCH: bankBranch } = res;
  //         setMainState((s) => ({
  //           ...s,
  //           bankName,
  //           bankBranch,
  //         }));
  //       }
  //     })
  //     .catch(() => {
  //       enableLoading(false);
  //     });
  // };

  const getEventNameValue = (ps) => {
    const name = ps?.target?.name;
    const value = ps?.target?.value;
    return [name, value];
  };

  const reValidate = (ps) => {
    const [name, value] = getEventNameValue(ps);
    setValidationErr((v) => ({
      ...v,
      [name]: !VALIDATIONSHARE?.[name]?.test?.(value),
    }));
  };

  const onInputChange = (ps) => {
    reValidate(ps);
    const [name, value] = getEventNameValue(ps);
    setMainState((s) => ({
      ...s,
      [name]: value,
    }));
  };

  const validateAllFields = (validationData) => {
    return Object.keys(validationData).reduce((a, v) => {
      // eslint-disable-next-line no-param-reassign
      a[v] = !validationData?.[v]?.test(mainState[v]);
      return a;
    }, {});
  };

  const submitBank = () => {
    // const { id, ...param } = mainState;
    enableLoading(true);
    RestApi(
      `organizations/${titleHead?.organization_id}/bank_approvals${titleHead?.search_param}`,
      {
        method: METHOD.POST,
        // headers: {
        //   Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NzA1NzQzNjMsInVzZXJfaWQiOiI3NjAzMjZlNC1iYTY1LTQ5NmEtYWE2Ny02MGY2ODQwNDQ0YmEiLCJuYW1lIjoic2l2YSBiYWxhIiwiZW1haWwiOiJzaXZhYmFsYW5AMDAwLmNvbSIsInVpZCI6ImVhNzQ5MjMzLTJhODktNGM3Ny04NTA5LTBlOTYzYzNmMDY3NCJ9.ntbKRnmGxniRkirYpl0D6OD3p6eiqYSR7IgRHi7cgZk`,
        // },
        payload: {
          bank_name: mainState?.bankName,
          bank_branch_name: mainState?.bankBranch,
          bank_account_number: mainState?.accNumber?.toLocaleUpperCase(),
          bank_ifsc_code: mainState?.ifsc?.toLocaleUpperCase(),
          account_holder_name: mainState?.holderName,
        },
      },
    )
      .then((res) => {
        if (res && !res.error) {
          openSnackBar({
            message: res?.message,
            type: MESSAGE_TYPE.INFO,
          });
          setViewFlow({ home: false, thanks: true });
        }
        if (res?.error) {
          openSnackBar({
            message: res?.message || 'Unknown Error Occured',
            type: MESSAGE_TYPE.ERROR,
          });
        }
        enableLoading(false);
      })
      .catch((res) => {
        openSnackBar({
          message: res?.message || 'Unknown Error Occured',
          type: MESSAGE_TYPE.ERROR,
        });
        enableLoading(false);
      });
  };

  const submit = () => {
    const sectionValidation = {};
    Object.keys(VALIDATIONSHARE).forEach((k) => {
      sectionValidation[k] = VALIDATIONSHARE[k];
    });
    const g = validateAllFields(sectionValidation);
    const valid = Object.values(g).every((val) => !val);

    if (!valid) {
      setValidationErr((s) => ({ ...s, ...g }));
    } else {
      setValidationErr((s) => ({ ...s, ...g }));
      submitBank();
      // setViewFlow({ home: false, thanks: true });
    }
    console.log(g);
  };

  return (
    <section>
      <div>
        <Mui.Stack direction="column" className={css.vendorFields}>
          <div>
            <p className={css.subTitleVendor}>
              Share your Bank Details with {titleHead?.organization_name} for
              Quick Payouts <sup style={{ color: '#ff1a1a' }}>*</sup>
            </p>
          </div>
          <Input
            required
            className={`${css.greyBorder} ${classes.root}`}
            label="Bank Account Number"
            variant="standard"
            name="accNumber"
            onChange={onInputChange}
            value={mainState.accNumber?.toLocaleUpperCase()}
            onBlur={reValidate}
            error={validationErr.accNumber}
            helperText={
              validationErr.accNumber ? VALIDATIONSHARE?.accNumber?.errMsg : ''
            }
            InputLabelProps={{
              shrink: true,
            }}
            type="number"
            fullWidth
            theme="light"
          />
        </Mui.Stack>

        <Mui.Stack direction="row" className={css.vendorFields}>
          <Input
            required
            className={`${css.greyBorder} ${classes.root}`}
            label="Bank IFSC Code"
            variant="standard"
            name="ifsc"
            onChange={onInputChange}
            value={mainState.ifsc?.toLocaleUpperCase()}
            onBlur={reValidate}
            error={validationErr.ifsc}
            helperText={validationErr.ifsc ? VALIDATIONSHARE?.ifsc?.errMsg : ''}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            theme="light"
          />
        </Mui.Stack>

        <Mui.Stack direction="row" className={css.vendorFields}>
          <Input
            required
            className={`${css.greyBorder} ${classes.root}`}
            label="Bank Name"
            variant="standard"
            name="bankName"
            onChange={onInputChange}
            value={mainState.bankName}
            onBlur={reValidate}
            error={validationErr.bankName}
            helperText={
              validationErr.bankName ? VALIDATIONSHARE?.bankName?.errMsg : ''
            }
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            theme="light"
          />
        </Mui.Stack>

        <Mui.Stack direction="row" className={css.vendorFields}>
          <Input
            required
            className={`${css.greyBorder} ${classes.root}`}
            label="Bank Branch"
            variant="standard"
            name="bankBranch"
            onChange={onInputChange}
            value={mainState.bankBranch}
            onBlur={reValidate}
            error={validationErr.bankBranch}
            helperText={
              validationErr.bankBranch
                ? VALIDATIONSHARE?.bankBranch?.errMsg
                : ''
            }
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            theme="light"
          />
        </Mui.Stack>

        <Mui.Stack direction="row" className={css.vendorFields}>
          <Input
            required
            className={`${css.greyBorder} ${classes.root}`}
            label="Account Holder’s Name"
            variant="standard"
            name="holderName"
            onChange={onInputChange}
            value={mainState.holderName}
            onBlur={reValidate}
            error={validationErr.holderName}
            helperText={
              validationErr.holderName
                ? VALIDATIONSHARE?.holderName?.errMsg
                : ''
            }
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            theme="light"
          />
        </Mui.Stack>

        <Mui.Stack
          direction="row"
          justifyContent="center"
          className={css.vendorFields}
        >
          <Mui.Button
            variant="contained"
            className={css.containedButton}
            onClick={() => {
              submit();
            }}
          >
            Submit
          </Mui.Button>
        </Mui.Stack>
      </div>
    </section>
  );
};
