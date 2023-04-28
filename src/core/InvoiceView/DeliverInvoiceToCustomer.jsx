import additionalSettings from '@assets/add.svg';
import Input from '@components/Input/Input.jsx';
// import * as Mui from '@mui/material';
import Select, { MultipleSelect } from '@components/Select/Select.jsx';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer.jsx';
import { PermissionDialog } from '@components/Permissions/PermissionDialog.jsx';
import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CancelIcon from '@material-ui/icons/Cancel';
import OutlinedInput from '@mui/material/OutlinedInput';
import AppContext from '@root/AppContext.jsx';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import {
  validateEmail,
  validateName,
  validateRequired,
} from '@services/Validation.jsx';
import React from 'react';
import * as Router from 'react-router-dom';
import { TrixEditor } from 'react-trix';
import 'trix/dist/trix';
import 'trix/dist/trix.css';
import css from './DeliverInvoiceToCustomer.scss';

const VALIDATOR = {
  contactName: (v) => validateName(v),
  mobileNo: (v) => validateRequired(v),
  email: (v) => validateEmail(v),
};

const ValidationErrMsg = {
  contactName: 'Please provide valid name',
  mobileNo: 'Please provide valid Mobile no.',
  email: 'Please provide valid Email',
};

const initialValidationErr = {
  contactName: false,
  mobileNo: false,
  email: false,
};

// const ITEM_HEIGHT = 48;
// const ITEM_PADDING_TOP = 8;
// const MenuProps = {
//   PaperProps: {
//     style: {
//       marginTop: '10px',
//       maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
//       width: 250,
//     },
//   },
// };

function DeliverInvoiceToCustomer({ fromSheet }) {
  const {
    organization,
    user,
    enableLoading,
    openSnackBar,
    currentUserInfo,
    userPermissions,
  } = React.useContext(AppContext);

  const [values, setValues] = React.useState({
    to: '',
    cc: '',
    subject: '',
    body: null,
    PDF: false,
    name: '',
  });

  const [sendTo, setSendTo] = React.useState([]);
  const [contactName, setContactName] = React.useState('');
  const [mobileNo, setMobileNo] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [validationErr, setValidationErr] =
    React.useState(initialValidationErr);
  const [sendToAddrList, setSendToAddrList] = React.useState([]);
  const [template, setTemplate] = React.useState({ list: [], selected: {} });
  const [drawer, setDrawer] = React.useState({
    addContact: false,
  });
  const navigate = Router.useNavigate();
  const { state } = Router.useLocation();
  const [sendToErr, setSendToErr] = React.useState([
    {
      error: false,
      validation: validateRequired,
      errorText: 'Please select email',
    },
  ]);

  const [userRolesInvoicing, setUserRolesInvoicing] = React.useState({});
  const [havePermission, setHavePermission] = React.useState({ open: false });

  React.useEffect(() => {
    if (Object.keys(userPermissions?.People || {})?.length > 0) {
      if (!userPermissions?.People?.People) {
        setHavePermission({
          open: true,
          back: () => {
            navigate('/dashboard');
            setHavePermission({ open: false });
          },
        });
      }
      setUserRolesInvoicing({ ...userPermissions?.Invoicing });
    }
  }, [userPermissions]);

  const validateAllFields = () => {
    return {
      contactName: !VALIDATOR?.contactName?.(contactName),
      mobileNo: !VALIDATOR?.mobileNo?.(mobileNo),
      email: !VALIDATOR?.email?.(email),
    };
  };

  const reValidate = (e) => {
    const name = e?.target?.name;
    const value = e?.target?.value;
    setValidationErr((s) => ({ ...s, [name]: !VALIDATOR?.[name]?.(value) }));
  };

  const onInputChange = (setter) => (e) => {
    if (setter === setSendTo) {
      setSendToErr([
        {
          error: false,
          validation: validateRequired,
          errorText: 'Please select email',
        },
      ]);
    }
    reValidate(e);
    setter(e.target.value);
  };

  const onTriggerDrawer = (name) => {
    setDrawer((d) => ({ ...d, [name]: true }));
  };

  const handleBottomSheet = (name) => {
    setDrawer((d) => ({ ...d, [name]: false }));
  };

  const fetchContactByCustomer = (s_ids) => {
    enableLoading(true);

    RestApi(
      `organizations/${organization.orgId}/customers/${
        user.customerId === undefined ? state?.id : user.customerId
      }/contacts`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error) {
        setSendToAddrList(
          res?.data?.map((s) => ({
            payload: s.email,
            text: s.email,
          })),
        );
        if (!s_ids) {
          setSendTo(res?.data?.map((s) => s.email));
        }
        if (s_ids) {
          setSendTo((prev) => [
            ...prev,
            res?.data?.find((s) => s.id === s_ids)?.email,
          ]);
        }
        setValues((prev) => ({
          ...prev,
          cc: currentUserInfo?.email,
          name: res?.data?.[0]?.name,
        }));
      }
      enableLoading(false);
    });
    enableLoading(false);
  };

  const resetValue = () => {
    setContactName('');
    setMobileNo('');
    setEmail('');
  };
  const createCustomerContact = () => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/customers/${user.customerId}/contacts`,
      {
        method: METHOD.POST,
        payload: {
          name: contactName,
          email,
          mobile_number: mobileNo,
        },
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        if (res && !res.error) {
          fetchContactByCustomer(res?.id);
          handleBottomSheet('addContact');
          resetValue();
          openSnackBar({
            message: `${res?.name} added Successfully`,
            type: MESSAGE_TYPE.INFO,
          });
        } else if (res.errors) {
          openSnackBar({
            message: Object.values(res.errors).join(),
            type: MESSAGE_TYPE.ERROR,
          });
        }
        enableLoading(false);
      })
      .catch((e) => {
        openSnackBar({
          message: Object.values(e.errors).join(),
          type: MESSAGE_TYPE.ERROR,
        });
      });
    enableLoading(false);
  };

  React.useEffect(() => {
    if (
      organization?.activeInvoiceId &&
      organization?.activeInvoiceId?.length > 0
    ) {
      fetchContactByCustomer();
    } else {
      navigate('/invoice');
    }
  }, []);

  const submitForm = () => {
    const v = sendToErr[0].validation(sendTo?.[0] || '');
    if (!v) {
      setSendToErr([
        {
          error: true,
          validation: validateRequired,
          errorText: 'Please select email',
        },
      ]);
    }
    if (v) {
      enableLoading(true);
      RestApi(
        `organizations/${organization.orgId}/document_email_notifications`,
        {
          method: METHOD.POST,
          payload: {
            reply_to_email: sendTo,
            invoice_id: organization.activeInvoiceId,
            subject: values.subject,
            body: values.body,
            cc: values?.cc?.split(' ').join(''),
          },
          headers: {
            Authorization: `Bearer ${user.activeToken}`,
          },
        },
      ).then((res) => {
        if (!res.errors) {
          if (fromSheet) {
            fromSheet(false);
          }
          openSnackBar({
            message: `Your Invoices was delivered to ${values?.name}`,
            type: MESSAGE_TYPE.INFO,
          });
          if (!fromSheet) {
            const pathName = window.location.pathname;
            if (pathName.includes('people')) {
              navigate('/people');
            } else {
              navigate('/invoice');
            }
          }
        } else if (res && res.errors) {
          openSnackBar({
            message: Object.values(res.errors).join(),
            type: 'ERRORINVOICE',
          });
        } else {
          openSnackBar({
            message: `We were unable to deliver your invoice to  ${values?.name}.`,
            type: 'ERRORINVOICE',
          });
        }
        enableLoading(false);
      });
    }
  };

  React.useEffect(() => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/email_templates?mail_type=${
        state?.documentType === 'estimate' ? 'Estimate' : 'Invoice'
      }&show_default=true`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((response) => {
      if (!response?.errors) {
        const res = response?.data?.filter((s) => s?.active);
        setTemplate({
          list: res?.map((val) => ({
            payload: val?.name,
            text: val?.name,
          })),
          selected: res?.[0]?.name,
          response: res,
        });
      } else {
        openSnackBar({
          message: response?.message || 'Body Null',
          type: MESSAGE_TYPE.ERROR,
        });
      }
      enableLoading(false);
    });
  }, []);

  React.useEffect(() => {
    const element = document.querySelector('trix-editor');
    element.editor.setSelectedRange([0, values?.body?.length]);
    element.editor.deleteInDirection('forward');

    const temp = template?.response?.find(
      (val) => val?.name === template?.selected,
    );
    setValues((prev) => ({
      ...prev,
      subject: temp?.subject,
      body: temp?.body,
    }));
    element.editor.insertHTML(temp?.body);
    if (
      Object?.keys(userRolesInvoicing?.['Email Subject & Body'] || {})?.length >
        0 &&
      !userRolesInvoicing?.['Email Subject & Body']?.edit_email_templates
    ) {
      element.editor.element.setAttribute('contentEditable', false);
    }
  }, [
    template?.selected,
    userRolesInvoicing?.['Email Subject & Body']?.edit_email_templates,
  ]);

  const handleChange = (e) => {
    setValues((prev) => ({
      ...prev,
      body: e,
    }));
  };

  const handleDelete = (value) => {
    const filteredArray = sendTo?.filter((item) => item !== value);
    setSendTo([...filteredArray]);
  };

  return (
    <div className={css.deliveryToCustomerContainer}>
      <section className={css.header}>
        <div className={css.valueHeader}>Deliver to Customer</div>
        {/* <div className={css.headerUnderline} /> */}
      </section>
      <section className={css.card}>
        <Grid container>
          <Grid item xs={12} className={css.gridDeliver}>
            <MultipleSelect
              label="Send To"
              options={sendToAddrList}
              defaultValue={sendTo}
              error={sendToErr[0].error}
              helperText={sendToErr[0].error ? sendToErr[0].errorText : ''}
              onChange={onInputChange(setSendTo)}
              fullWidth
              theme="light"
              input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
              variant="standard"
              rootStyle={{
                border: '1px solid #A0A4AF',
              }}
              onClose
              multiple
              open
              value={sendTo}
              renderValue={(selected) => (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                    zIndex: 99999,
                    mt: '20px',
                  }}
                >
                  {selected.map((value) => (
                    <Chip
                      deleteIcon={
                        <CancelIcon
                          onMouseDown={(event) => event.stopPropagation()}
                        />
                      }
                      key={value}
                      label={value}
                      onDelete={() => handleDelete(value)}
                    />
                  ))}
                </Box>
              )}
              IconComponent={() => <></>}
              required
              disabled={
                !userRolesInvoicing?.['Email Subject & Body']
                  ?.edit_email_templates
              }
            />
            <SelectBottomSheet
              name="addContact"
              triggerComponent={
                <input
                  type="image"
                  src={additionalSettings}
                  alt="settings"
                  className={css.addIcon}
                  style={{
                    pointerEvents: userRolesInvoicing?.['Email Subject & Body']
                      ?.edit_email_templates
                      ? ''
                      : 'none',
                  }}
                  onClick={() => {
                    resetValue();
                    onTriggerDrawer('addContact');
                  }}
                />
              }
              open={drawer.addContact}
              onTrigger={onTriggerDrawer}
              onClose={handleBottomSheet}
              maxHeight="45vh"
              addNewSheet
            >
              <div className={css.CreateCustomerDialogContainer}>
                <div className={css.valueHeader}>Add New Contact</div>

                <div className={css.addCustomerContainerNew}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} style={{ position: 'relative' }}>
                      <Input
                        name="contactName"
                        onBlur={reValidate}
                        error={validationErr.contactName}
                        helperText={
                          validationErr.contactName
                            ? ValidationErrMsg.contactName
                            : ''
                        }
                        label="Contact Name"
                        variant="standard"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        rootStyle={{
                          border: '1px solid #A0A4AF',
                        }}
                        fullWidth
                        onChange={onInputChange(setContactName)}
                        theme="light"
                        value={contactName}
                        required
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Input
                        name="mobileNo"
                        onBlur={reValidate}
                        error={validationErr.mobileNo}
                        helperText={
                          validationErr.mobileNo
                            ? ValidationErrMsg.mobileNo
                            : ''
                        }
                        label="Contact Phone Number"
                        variant="standard"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        rootStyle={{ border: '1px solid #A0A4AF' }}
                        inputProps={{
                          type: 'tel',
                        }}
                        fullWidth
                        onChange={onInputChange(setMobileNo)}
                        theme="light"
                        value={mobileNo}
                        required
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Input
                        name="email"
                        onBlur={reValidate}
                        error={validationErr.email}
                        helperText={
                          validationErr.email ? ValidationErrMsg.email : ''
                        }
                        label="Contact Email ID"
                        variant="standard"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        rootStyle={{
                          border: '1px solid #A0A4AF',
                        }}
                        fullWidth
                        onChange={onInputChange(setEmail)}
                        theme="light"
                        value={email}
                        required
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <div className={css.addCustomerFooter}>
                        <Button
                          variant="contained"
                          className={css.primary}
                          style={{ padding: 15, textTransform: 'initial' }}
                          onClick={() => {
                            const v = validateAllFields();
                            const valid = Object.values(v).every((val) => !val);

                            if (!valid) {
                              setValidationErr((s) => ({ ...s, ...v }));
                              return false;
                            }
                            createCustomerContact();
                            return true;
                          }}
                        >
                          Save and Finish
                        </Button>
                      </div>
                    </Grid>
                  </Grid>
                </div>
              </div>
            </SelectBottomSheet>
          </Grid>

          <Grid item xs={12} className={css.gridDeliver}>
            <Input
              name="cc"
              type="email"
              label="Cc"
              variant="standard"
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              onChange={(e) => {
                setValues((prev) => ({ ...prev, cc: e?.target?.value }));
              }}
              theme="light"
              rootStyle={{
                border: '1px solid #A0A4AF',
              }}
              required
              value={values.cc}
              disabled={
                !userRolesInvoicing?.['Email Subject & Body']
                  ?.edit_email_templates
              }
            />
            <p style={{ margin: '5px 5px 0', fontSize: 10 }}>
              Note: User needs to add comma (,) to Type a New Email ID
            </p>
          </Grid>
          <Grid item xs={12} className={css.gridDeliver}>
            <Select
              label="Select Template"
              options={template?.list}
              defaultValue={template?.selected || ''}
              onChange={(e) =>
                setTemplate((prev) => ({ ...prev, selected: e?.target?.value }))
              }
              fullWidth
              theme="light"
              variant="standard"
              rootStyle={{
                border: '1px solid #A0A4AF',
              }}
              disabled={
                !userRolesInvoicing?.['Email Subject & Body']
                  ?.edit_email_templates
              }
            />
          </Grid>
          <Grid item xs={12} className={css.gridDeliver}>
            <Input
              name="subject"
              type="text"
              label="Subject"
              variant="standard"
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              onChange={(e) => {
                setValues((prev) => ({ ...prev, subject: e?.target?.value }));
              }}
              theme="light"
              rootStyle={{
                border: '1px solid #A0A4AF',
              }}
              value={values.subject}
              required
              disabled={
                !userRolesInvoicing?.['Email Subject & Body']
                  ?.edit_email_templates
              }
            />
          </Grid>

          <Grid
            item
            xs={12}
            className={
              userRolesInvoicing?.['Email Subject & Body']?.edit_email_templates
                ? `${css.gridDeliver} ${css.bodyDeliver}`
                : `${css.gridDeliver} ${css.bodyDeliver} ${css.disableDeliver}`
            }
          >
            <p className={css.paraDeliver}>
              Body<span className={css.spanDeliver}>*</span>
            </p>

            <TrixEditor
              id="trixEditor"
              className={css.trixEditor}
              // autoFocus={true}
              placeholder="Body Content"
              value={values.body !== null ? values?.body : ''}
              // uploadURL="https://domain.com/imgupload/receiving/post"
              // uploadData={{ key1: "value", key2: "value" }}
              // mergeTags={mergeTags}
              onChange={handleChange}
              // onEditorReady={handleEditorReady}
            />
          </Grid>
          {/* <div>
            <Typography variant="caption" color="red">{errorMsg.bodyErr}</Typography>
          </div> */}
        </Grid>
        <div className={css.buttonContainer}>
          <Button
            fullWidth
            variant="contained"
            className={css.primary}
            onClick={() => {
              submitForm();
            }}
            style={{ textTransform: 'capitalize' }}
          >
            Deliver Now
          </Button>
        </div>
      </section>
      {havePermission.open && (
        <PermissionDialog onClose={() => havePermission.back()} />
      )}
    </div>
  );
}

export default DeliverInvoiceToCustomer;
