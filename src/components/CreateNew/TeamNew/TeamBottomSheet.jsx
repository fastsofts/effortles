import * as React from 'react';
import Input from '@components/Input/Input.jsx';
import Select from '@components/Select/Select.jsx';
import * as Mui from '@mui/material';
import AppContext from '@root/AppContext.jsx';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer.jsx';
import {
  validateEmail,
  validatePhone,
  validateRequired,
  // validateIfsc,
} from '@services/Validation.jsx';
import { PermissionDialog } from '@components/Permissions/PermissionDialog.jsx';
import { makeStyles } from '@material-ui/core';
import themes from '@root/theme.scss';
import editIcon from '@assets/editYourBills.png';
import css from './TeamBottomSheet.scss';

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
    background: '#FFF',
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

const intialState = {
  firstName: '',
  // lastName: '',
  email: '',
  phone: '',
  role: 'Analyst',
  bank_account_number: '',
  bank_ifsc_code: '',
  bank_name: '',
  bank_branch_name: '',
  account_holder_name: '',
};
const VALIDATION = {
  firstName: {
    errMsg: 'Please provide first name',
    test: (v) => validateRequired(v),
  },
  // lastName: {
  //   errMsg: 'Please provide last name',
  //   test: (v) => validateRequired(v),
  // },

  email: {
    errMsg: 'Please provide valid email',
    test: validateEmail,
  },
  phone: {
    errMsg: 'Please provide valid mobile no.',
    test: validatePhone,
  },
  // bank_account_number: {
  //   errMsg: 'Enter valid Account Number',
  //   test: validateRequired,
  // },
  // bank_ifsc_code: {
  //   errMsg: 'Enter valid IFSC Code',
  //   test: validateIfsc,
  // },
  // bank_name: {
  //   errMsg: 'Enter valid Bank Name',
  //   test: validateRequired,
  // },
  // bank_branch_name: {
  //   errMsg: 'Enter valid Bank Branch Name',
  //   test: validateRequired,
  // },
  // account_holder_name: {
  //   errMsg: 'Enter valid Bank holder name',
  //   test: validateRequired,
  // },
};

const initialValidationErr = Object.keys(VALIDATION).map((k) => ({
  [k]: false,
}));

const TeamBottomSheet = (props) => {
  const {
    sheetType,
    showData,
    deactivate,
    handleBottomSheetClose,
    editClick,
    listCall,
  } = props;
  const classes = useStyles();
  const {
    organization,
    user,
    enableLoading,
    openSnackBar,
    currentUserInfo,
    getCurrentUser,
    validateSession,
    // loading,
    userPermissions,
  } = React.useContext(AppContext);
  const [validationErr, setValidationErr] =
    React.useState(initialValidationErr);
  const [viewSheet, setViewSheet] = React.useState({
    view: false,
    edit: false,
    new: false,
  });
  const [mainState, setMainState] = React.useState(intialState);
  const [userRoles, setUserRoles] = React.useState({});
  const [havePermission, setHavePermission] = React.useState({ open: false });
  const [RoleList, setRoleList] = React.useState([]);

  const FetchRoleData = () => {
    enableLoading(true);
    RestApi(`organizations/${organization.orgId}/roles`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        enableLoading(false);
        if (!res?.error) {
          res?.data?.map((val) =>
            setRoleList((prev) => [
              ...prev,
              { payload: val?.name, text: val?.name, id_s: val?.id },
            ]),
          );
        } else {
          openSnackBar({
            message: res?.message || 'Unknown Error occured',
            type: MESSAGE_TYPE.ERROR,
          });
        }
      })
      .catch((res) => {
        enableLoading(false);
        openSnackBar({
          message: res?.message || 'Unknown Error occured',
          type: MESSAGE_TYPE.ERROR,
        });
      });
  };

  React.useEffect(() => {
    FetchRoleData();
  }, []);

  React.useEffect(() => {
    if (Object.keys(userPermissions?.People || {})?.length > 0) {
      setUserRoles({ ...userPermissions?.People });
    }
  }, [userPermissions]);

  const device = localStorage.getItem('device_detect');

  const CreateMember = () => {
    const role_id = RoleList?.find(
      (val) => val.payload === mainState?.role,
    )?.id_s;
    RestApi(
      mainState?.id
        ? `organizations/${organization.orgId}/members/${mainState?.id}`
        : `organizations/${organization.orgId}/members`,
      {
        method: mainState?.id ? METHOD.PATCH : METHOD.POST,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
        payload: {
          name: mainState.firstName,
          email: mainState.email,
          mobile_number: mainState.phone,
          // role: mainState?.role,
          role_id,
          id: mainState?.id || undefined,
          bank_account_number: mainState?.bank_account_number,
          bank_ifsc_code: mainState?.bank_ifsc_code,
          bank_name: mainState?.bank_name,
          bank_branch_name: mainState?.bank_branch_name,
          account_holder_name: mainState?.account_holder_name,
        },
      },
    )
      .then(async (res) => {
        if (res && res.error) {
          openSnackBar({
            message: res?.message || 'Unknown Error Occured',
            type: MESSAGE_TYPE.ERROR,
          });
        } else if (res && !res.error) {
          const organizationProps = JSON.parse(
            localStorage.getItem('selected_organization'),
          );

          if (currentUserInfo?.id === res?.id) {
            if (organizationProps) {
              await validateSession(user?.activeToken, organizationProps);
            }
            await getCurrentUser(organization.orgId);
          }
          handleBottomSheetClose();
          setMainState(intialState);
          // setDrawer((prev) => ({ ...prev, teamDrawer: false }));
          listCall();
          setTimeout(() => {
            openSnackBar({
              message: res?.message || 'Member Added Successfully',
              type: MESSAGE_TYPE.INFO,
            });
          }, 500);
        }
      })
      .catch((res) => {
        console.log(res);
        openSnackBar({
          message: res?.message,
          type: MESSAGE_TYPE.ERROR,
        });
      });
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
          const { BANK: bank_name, BRANCH: bank_branch_name } = res;
          setMainState((s) => ({
            ...s,
            bank_name,
            bank_branch_name,
          }));
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const fetchAllBank = () => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/vendors/${showData?.entity_id}/bank_details`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        if (res && !res.error) {
          const tempBank = res?.data;
          if (tempBank?.length > 0) {
            setMainState((prev) => ({
              ...prev,
              bank_account_number: tempBank?.[0]?.bank_account_number,
              bank_ifsc_code: tempBank?.[0]?.bank_ifsc_code,
              bank_name: tempBank?.[0]?.bank_name,
              bank_branch_name: tempBank?.[0]?.bank_branch_name,
              account_holder_name: tempBank?.[0]?.account_holder_name,
            }));
          } else if (tempBank?.length === 0) {
            setMainState((prev) => ({
              ...prev,
              bank_account_number: '',
              bank_ifsc_code: '',
              bank_name: '',
              bank_branch_name: '',
              account_holder_name: '',
            }));
          }
          enableLoading(false);
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  React.useEffect(() => {
    setViewSheet((prev) => ({ ...prev, [sheetType]: true }));
  }, [sheetType]);

  React.useEffect(() => {
    console.log(showData);
    if (sheetType === 'edit' || sheetType === 'view') {
      setMainState({
        firstName: showData?.name,
        phone: showData?.mobile_number,
        email: showData?.email,
        role: showData?.role,
        id: showData?.user_id || undefined,
        // bank_account_number: '',
        // bank_ifsc_code: '',
        // bank_name: '',
        // bank_branch_name: '',
        // account_holder_name: '',
      });
      if (showData?.bank_detail) {
        fetchAllBank();
      }
    }
  }, [showData]);

  const validateAllFields = (stateParam) => {
    const stateData = stateParam || mainState;
    return Object.keys(VALIDATION).reduce((a, v) => {
      const paramValue = a;
      paramValue[v] = !VALIDATION?.[v]?.test(stateData[v]);
      return paramValue;
    }, {});
  };
  const closePopover = () => {
    const v = validateAllFields();
    const valid = Object.values(v).every((val) => !val);
    if (!valid) {
      setValidationErr((s) => ({ ...s, ...v }));
      return;
    }
    CreateMember();
    // setShowDrawer(false);
    // setPopover(true);
  };
  const reValidate = (name, value) => {
    setValidationErr((v) => ({
      ...v,
      [name]: !VALIDATION?.[name]?.test?.(value),
    }));
  };
  const onInputChange = (e) => {
    const name = e?.target?.name;
    const value = e?.target?.value;
    reValidate(name, value);
    setMainState((s) => ({
      ...s,
      [name]: name === 'bank_ifsc_code' ? value?.toUpperCase() : value,
    }));
    if (name === 'bank_ifsc_code' && value.length === 11) {
      getBankDetails(value);
    }
  };

  const EditEmployee = () => {
    if (!userRoles?.Employees?.edit_employees) {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
      return;
    }
    setViewSheet({
      new: false,
      view: false,
      edit: true,
    });
    if (device === 'mobile') {
      editClick();
    }
  };

  const DeleteEmployee = () => {
    if (!userRoles?.Employees?.delete_employees) {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
      return;
    }
    deactivate();
  };
  return (
    <>
      <div style={{ padding: '20px 30px 0' }} className={css.memberAddSheet}>
        {(device === 'desktop' || viewSheet?.view || viewSheet?.new) && (
          <div className={css.topHeader}>
            <div className={css.headerContainer}>
              <p className={css.headerLabelForEdit}>
                {viewSheet?.edit && 'Edit'}
                {viewSheet?.view && mainState?.firstName}
                {viewSheet?.new && 'Add a New Employee'}
              </p>
            </div>
            {viewSheet?.view && (
              <Mui.IconButton
                onClick={() => {
                  EditEmployee();
                }}
              >
                <img src={editIcon} style={{ width: 25 }} alt="editYourBills" />
              </Mui.IconButton>
            )}
          </div>
        )}
        <div
          style={{
            height: device === 'mobile' ? 'auto' : '85vh',
            overflow: 'auto',
            padding: '20px 0',
          }}
        >
          <div className={css.inputContain}>
            <Input
              required
              className={`${css.greyBorder} ${classes.root}`}
              label="Member Name"
              variant="standard"
              name="firstName"
              onChange={!viewSheet?.view && onInputChange}
              value={mainState.firstName}
              onBlur={reValidate}
              error={validationErr.firstName}
              helperText={
                validationErr.firstName ? VALIDATION?.firstName?.errMsg : ''
              }
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              theme="light"
              disabled={viewSheet?.view}
            />
          </div>
          <div className={css.inputContain}>
            <Input
              required
              onChange={!viewSheet?.view && onInputChange}
              value={mainState.phone}
              name="phone"
              onBlur={reValidate}
              error={validationErr.phone}
              helperText={validationErr.phone ? VALIDATION?.phone?.errMsg : ''}
              className={`${css.greyBorder} ${classes.root}`}
              label="Phone Number"
              variant="standard"
              // value={state.gst}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              theme="light"
              disabled={viewSheet?.view}
            />
          </div>
          <div className={css.inputContain}>
            <Input
              required
              onChange={!viewSheet?.view && onInputChange}
              value={mainState.email}
              name="email"
              onBlur={reValidate}
              error={validationErr.email}
              helperText={validationErr.email ? VALIDATION?.email?.errMsg : ''}
              className={`${css.greyBorder} ${classes.root}`}
              label="Email Id"
              variant="standard"
              // value={state.gst}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              theme="light"
              disabled={viewSheet?.view}
            />
          </div>

          <div>
            <Select
              name="role"
              onBlur={reValidate}
              error={validationErr.role}
              helperText={validationErr.role ? VALIDATION?.role?.errMsg : ''}
              className={`${css.greyBorder} ${classes.root}`}
              label="Select Role"
              variant="standard"
              options={RoleList}
              defaultValue={mainState.role}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              onChange={!viewSheet?.view && onInputChange}
              theme="light"
              disabled={viewSheet?.view}
            />
          </div>

          <p className={css.bankDetail}>Bank Details</p>
          <Mui.Grid
            container
            mb={2}
            className={device === 'mobile' && css.businessAddress}
          >
            <Mui.Grid item xs={12}>
              <Input
                name="bank_account_number"
                label="Bank Account No."
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
                error={validationErr.bank_account_number}
                className={`${css.greyBorder} ${classes.root}`}
                helperText={
                  validationErr.bank_account_number
                    ? VALIDATION?.bank_account_number?.errMsg
                    : ''
                }
                onChange={!viewSheet?.view && onInputChange}
                value={mainState?.bank_account_number}
                // required
                disabled={viewSheet?.view}
              />
            </Mui.Grid>

            <Mui.Grid item xs={12} mt={2}>
              <Input
                name="bank_ifsc_code"
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
                error={validationErr.bank_ifsc_code}
                className={`${css.greyBorder} ${classes.root}`}
                helperText={
                  validationErr.bank_ifsc_code
                    ? VALIDATION?.bank_ifsc_code?.errMsg
                    : ''
                }
                onChange={!viewSheet?.view && onInputChange}
                value={mainState?.bank_ifsc_code}
                // required
                disabled={viewSheet?.view}
              />
            </Mui.Grid>

            <Mui.Grid item xs={12} mt={2}>
              <Input
                name="bank_name"
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
                error={validationErr.bank_name}
                helperText={
                  validationErr.bank_name ? VALIDATION?.bank_name?.errMsg : ''
                }
                onChange={!viewSheet?.view && onInputChange}
                className={`${css.greyBorder} ${classes.root}`}
                value={mainState?.bank_name}
                // required
                disabled={viewSheet?.view}
              />
            </Mui.Grid>

            <Mui.Grid item xs={12} mt={2}>
              <Input
                name="bank_branch_name"
                label="Branch"
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
                error={validationErr.bank_branch_name}
                className={`${css.greyBorder} ${classes.root}`}
                helperText={
                  validationErr.bank_branch_name
                    ? VALIDATION?.bank_branch_name?.errMsg
                    : ''
                }
                onChange={!viewSheet?.view && onInputChange}
                value={mainState?.bank_branch_name}
                // required
                disabled={viewSheet?.view}
              />
            </Mui.Grid>

            <Mui.Grid item xs={12} mt={2}>
              <Input
                name="account_holder_name"
                label="Account Holder's Name"
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
                error={validationErr.account_holder_name}
                className={`${css.greyBorder} ${classes.root}`}
                helperText={
                  validationErr.account_holder_name
                    ? VALIDATION?.account_holder_name?.errMsg
                    : ''
                }
                onChange={!viewSheet?.view && onInputChange}
                value={mainState?.account_holder_name}
                // required
                disabled={viewSheet?.view}
              />
            </Mui.Grid>
          </Mui.Grid>

          {!viewSheet?.view && (
            <>
              <div className={css.lastButton}>
                <Mui.Button
                  variant="outLined"
                  className={css.outlinedButton}
                  onClick={() => {
                    handleBottomSheetClose();
                  }}
                >
                  Back
                </Mui.Button>
                <Mui.Button
                  variant="contained"
                  className={css.containedButton}
                  onClick={() => {
                    closePopover();
                  }}
                >
                  {viewSheet?.edit
                    ? 'Save Member Profile'
                    : 'Save And Continue'}
                </Mui.Button>
              </div>
              {viewSheet?.edit && (
                <Mui.Button
                  variant="contained"
                  className={css.deactivateButton}
                  onClick={() => {
                    DeleteEmployee();
                  }}
                >
                  Deactivate Member
                </Mui.Button>
              )}
            </>
          )}
        </div>
      </div>
      {havePermission.open && (
        <PermissionDialog onClose={() => havePermission.back()} />
      )}
    </>
  );
};

export default TeamBottomSheet;
