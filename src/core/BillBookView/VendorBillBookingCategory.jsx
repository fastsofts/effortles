/* eslint-disable no-unused-vars */
/* @flow */
/**
 * @fileoverview  Add Vendor
 */

import React, { useState, useContext } from 'react';
import Input from '@components/Input/Input.jsx';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import { makeStyles, Divider } from '@material-ui/core';
import * as Mui from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import themes from '@root/theme.scss';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer.jsx';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import Select from '@components/Select/Select.jsx';
import { ContactIcon, CheckCircle } from '@components/SvgIcons/SvgIcons.jsx';
import JSBridge from '@nativeBridge/jsbridge';
// import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet.jsx';

import AppContext from '@root/AppContext.jsx';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateGst,
  validateAccountNumber,
  validateIfsc,
  validatePincode,
  validateAddress,
  validateNoSymbol,
  validateRequired,
} from '@services/Validation.jsx';
import css from './VendorBillBookingCategory.scss';

const useStyles = makeStyles(() => ({
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

const VALIDATION = {
  documentNumber: {
    errMsg: 'Please provide valid documentNumber',
    test: validateGst,
    page: 1,
  },
  documentDate: {
    errMsg: 'Please provide valid documentDate',
    test: validateGst,
    page: 1,
  },
  dueDate: {
    errMsg: 'Please provide valid DueDate',
    test: validateGst,
    page: 1,
  },
  expenseCategory: {
    errMsg: 'Please provide valid Expense Category',
    test: validateGst,
    page: 1,
  },
  taxableValue: {
    errMsg: 'Please provide valid Taxable Value',
    test: validateGst,
    page: 1,
  },
  cgst: {
    errMsg: 'Please provide valid CGST credit',
    test: validateGst,
    page: 1,
  },
  igst: {
    errMsg: 'Please provide valid IGST credit',
    test: validateGst,
    page: 1,
  },
  gst: {
    errMsg: 'Please provide valid GST',
    test: validateGst,
    page: 1,
  },
  pincode: {
    errMsg: 'Enter valid Pincode',
    test: validatePincode,
    page: 1,
  },
  address1: {
    errMsg: 'Enter valid Address',
    test: validateAddress,
    page: 1,
  },
  city: {
    errMsg: 'Enter valid City',
    test: validateNoSymbol,
    page: 1,
  },
  state: {
    errMsg: 'Enter valid State',
    test: validateRequired,
    page: 1,
  },
  country: {
    errMsg: 'Enter valid State',
    test: validateRequired,
    page: 1,
  },
  vendorName: {
    errMsg: 'Enter valid State',
    test: validateRequired,
    page: 1,
  },
  contactName: {
    errMsg: 'Please provide valid Name',
    test: validateName,
    page: 2,
  },
  contactPhone: {
    errMsg: 'Please provide valid Phone',
    test: validatePhone,
    page: 2,
  },
  contactEmail: {
    errMsg: 'Please provide valid Email',
    test: validateEmail,
    page: 2,
  },
  accountNo: {
    errMsg: 'Enter valid Account',
    test: validateAccountNumber,
    page: 3,
  },
  ifsc: {
    errMsg: 'Enter valid IFSC',
    test: validateIfsc,
    page: 3,
  },
};

const initialState = {
  // page 1 - GSTIN
  gst: '',
  noGst: false,
  address1: '',
  pincode: '',
  city: '',
  state: '',
  country: '',
  vendorName: '',
  // Page 2 - Details
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  // Page 3 - Banking
  accountNo: '',
  ifsc: '',
  //  validateBankAccount: false,
};

const VendorBillBookingCategory = ({
  handleClose2,
  addVendorComplete,
  onCancel,
  handleParent2,
}) => {
  console.log('handleClosehandleClose', handleClose2);

  const classes = useStyles();
  const {
    organization,
    enableLoading,
    user,
    registerEventListeners,
    deRegisterEventListener,
    changeSubView,
    openSnackBar,
  } = useContext(AppContext);
  const initialValidationErr = Object.keys(VALIDATION).map((k) => ({
    [k]: false,
  }));
  const [state, setState] = useState(initialState);
  const [page, setPage] = useState(1);
  const [validationErr, setValidationErr] = useState(initialValidationErr);
  const [vendorAvailable, setVendorAvailable] = useState('');
  // const [contactDetails, setContactDetails] = useState();
  // const [drawer, setDrawer] = useState({
  //   contact: false,
  // });
  // const [query, setQuery] = useState('');

  //  const showError = (message) => {
  //    openSnackBar({
  //      message: message || 'Unknown error occured',
  //      type: MESSAGE_TYPE.ERROR,
  //    });
  //  };

  //  const showSuccess = (message) => {
  //    openSnackBar({
  //      message: message || 'Last operation was successful',
  //      type: MESSAGE_TYPE.INFO,
  //    });
  //  };

  //  const existingVendorFlow = () => {
  //    addVendorComplete('exists');
  //  };

  const addVendor = () => {
    enableLoading(true);

    // TODO - kbt - Call POST /vendor
    const payload = {
      name: state.vendorName,
      // pan_number: state.pan,
      contacts: [
        {
          name: state.contactName,
          mobile_number: state.contactPhone,
          email: state.contactEmail,
        },
      ],
      location: {
        address_line1: state.address1,
        city: state.city,
        gstin: state.gst,
        pincode: state.pincode,
        state: state.state,
        country: state.country,
      },

      //  bank_details: [
      //    {
      //      bank_name: state.bankName,
      //      bank_account_number: state.accountNo,
      //      bank_branch_name: state.bankBranch,
      //      bank_ifsc_code: state.ifsc,
      //      beneficiary_mobile: state.contactPhone,
      //      account_holder_name: state.contactName,
      //    },
      //  ],
    };
    RestApi(`organizations/${organization.orgId}/customers`, {
      method: METHOD.POST,
      payload,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        if (res) {
          //  addVendorComplete('success', res);
          console.log('satisfieed');
          // showSuccess("Customer successfully created");
          handleClose2(false);
        } else {
          const msg = res?.message || Object.values(res?.errors)?.join(',');
          if (!res.id) {
            //  showError(msg);
          }
        }
        enableLoading(false);
      })
      .catch((e) => {
        openSnackBar({
          message: Object.values(e.errors).join(),
          type: MESSAGE_TYPE.ERROR,
        });
        enableLoading(false);
      });
  };

  //
  const getGstAddress = (gstin) => {
    enableLoading(true);
    RestApi(`gstins`, {
      method: METHOD.POST,
      payload: {
        organization_id: organization.orgId,
        gstin: gstin.toUpperCase(),
        gstin_type: 'Customer',
      },
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        enableLoading(false);
        if (res && !res.error) {
          const {
            address_line1: address1,
            city,
            state: stateRes,
            pincode,
            country,
            customer_name: vendorName,
          } = res;
          setState((s) => ({
            ...s,
            address1,
            city,
            state: stateRes,
            pincode,
            vendorName,
            country,
          }));
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const existingVendorFlow = () => {
    addVendorComplete('exists');
  };

  // all states
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  const fetchCountries = () => {
    RestApi('countries', {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    }).then((res) => {
      if (res && !res.error) {
        setCountries(
          res.data.map((c) => ({
            payload: c.name,
            text: c.name,
          })),
        );
      }
    });
  };
  const fetchStates = () => {
    RestApi('states', {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    }).then((res) => {
      if (res && !res.error) {
        setStates(
          res.data.map((c) => ({
            payload: c.state_name,
            text: c.state_name,
          })),
        );
      }
    });
  };

  React.useEffect(() => {
    fetchCountries();
    fetchStates();
  }, []);
  console.log('vendorCustomerCategory', vendorAvailable);

  // const getGstAddress = () => {
  //   enableLoading(true);
  //   RestApi(`gstins`, {
  //     method: METHOD.POST,
  //     payload: {
  //       organization_id: organization.orgId,
  //       gstin: state.gst,
  //     },
  //     headers: {
  //       Authorization: `Bearer ${user.activeToken}`,
  //     },
  //   })
  //     .then((res) => {
  //       enableLoading(false);
  //       if (res && !res.error) {
  //         const {
  //           address_line1: address1,
  //           city,
  //           state: stateResp,
  //           pincode,
  //         } = res;
  //         setState((s) => ({
  //           ...s,
  //           address1,
  //           city,
  //           state: stateResp,
  //           pincode,
  //         }));
  //       }
  //     })
  //     .catch(() => {
  //       enableLoading(false);
  //     });
  // };

  const validateAllFields = (validationData) => {
    return Object.keys(validationData).reduce((a, v) => {
      // eslint-disable-next-line no-param-reassign
      a[v] = !validationData?.[v]?.test(state[v]);
      return a;
    }, {});
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
    // No validation if checkbox ticked in page 1
    const bypass = page === 1 && state.noGst;
    if (!bypass && !valid) {
      setValidationErr((s) => ({ ...s, ...v }));
      return;
    }
    // if (page === 1 && !state.noGst && state.gst) getGstAddress();
    if (page < 2) setPage((p) => p + 1);
    if (page === 2) addVendor();
  };

  const onPagePrev = () => {
    if (page > 1) setPage((p) => p - 1);
    if (page === 1) onCancel();
  };

  const getEventNameValue = (ps) => {
    const name = ps?.target?.name;
    const value =
      ps?.target?.type === 'checkbox' ? ps?.target?.checked : ps?.target?.value;
    return [name, value];
  };

  const reValidate = (ps) => {
    const [name, value] = getEventNameValue(ps);
    const bypass = name === 'gst' && state.noGst;
    setValidationErr((v) => ({
      ...v,
      [name]: !bypass && !VALIDATION?.[name]?.test?.(value),
    }));
  };

  const checkVendorExistence = (gstin) => {
    const payload = {
      gstin: gstin.toUpperCase(),
      organization_id: organization.orgId,
      gstin_type: 'Customer',
    };
    RestApi(`gstins`, {
      method: METHOD.POST,
      payload,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    }).then((res) => {
      if (res && res.customer_id) {
        setVendorAvailable(res);
      } else {
        setVendorAvailable('');
      }
    });
  };

  //  const validateBankAccount = () => {
  //    const payload = {
  //      ifsc: state.ifsc,
  //      account_number: state.accountNo,
  //      name: state.beneficiaryName,
  //      mobile: state.contactPhone,
  //      organization_id: organization.orgId,
  //    };
  //    RestApi(`bank_details_verifications`, {
  //      method: METHOD.POST,
  //      payload,
  //      headers: {
  //        Authorization: `Bearer ${user.activeToken}`,
  //      },
  //    }).then((res) => {
  //      if (res && !res.error && res.verified) {
  //        showSuccess('Verification Successful');
  //      } else {
  //        showError(res?.message || 'Verification Not Successful');
  //      }
  //    });
  //  };

  const fetchPincodeDetails = (code) => {
    enableLoading(true);
    RestApi(`pincode_lookups?pincode=${code}`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        if (res && !res.error) {
          const { city, state: stateRes, country } = res;

          setState((s) => ({
            ...s,
            city,
            state: stateRes,
            country,
          }));
        }
        enableLoading(false);
      })
      .catch(() => {
        enableLoading(false);
        openSnackBar({
          message: `Pincode error`,
          type: MESSAGE_TYPE.INFO,
        });
      });
  };

  const onInputChange = (ps) => {
    reValidate(ps);
    const [name, value] = getEventNameValue(ps);
    if (name === 'noGst' && value) {
      setValidationErr((s) => ({ ...s, gst: false }));
    }
    setState((s) => ({ ...s, [name]: value }));
    if (name === 'gst' && value.length === 15) {
      checkVendorExistence(value);
      getGstAddress(value);
    }
    if (name === 'copyContactNameAsVendor' && value)
      setState((s) => ({ ...s, vendorName: s.contactName }));
    //  if (name === 'validateBankAccount' && value) validateBankAccount();
    if (name === 'pincode' && value.length === 6) {
      fetchPincodeDetails(value);
    }
  };
  // const onTriggerDrawer = (name) => {
  //   setDrawer((d) => ({ ...d, [name]: true }));
  // };
  // const handleBottomSheet1 = (name) => {
  //   setDrawer((d) => ({ ...d, [name]: false }));
  // };
  const handleCustomer = (ele) => {
    setTimeout(() => {
      console.log(ele);

      setState((s) => ({
        ...s,
        contactName: ele.Name,
        contactPhone: ele.phone,
        contactEmail: ele.email,
      }));
      // setIndividualName(ele.Name);
      // setMobileNo(ele.Phoneno);
    }, 100);
    // handleBottomSheet1('contact');
  };
  const getContacts = () => {
    // enableLoading(true);
    JSBridge.getContactsVendor();
    // onTriggerDrawer('contact');
    // setContactDetails(JSON.parse(localStorage.getItem('contact_details')));
  };

  const setContacts = (response) => {
    // JSBridge.getContacts();
    // onTriggerDrawer('contact');
    handleCustomer(JSON.parse(response.detail.value));
    // enableLoading(false);
  };

  React.useEffect(() => {
    registerEventListeners({
      name: 'contactDetailsDataVendor',
      method: setContacts,
    });
    return () =>
      deRegisterEventListener({
        name: 'contactDetailsDataVendor',
        method: setContacts,
      });
  }, []);
  const titles = ['Date', 'Area', 'Money'];

  return (
    <div className={css.magicLinkContainer}>
      <div className={css.headerContainer}>
        <div className={css.headerLabel}>Agrya Consulting Private Limited </div>
        <span className={css.header2}>Business Consulting Services</span>
      </div>
      <Divider className={css.dividerHR} width="100%" />
      <div className={css.inputContainer}>
        <Mui.Typography>Basic Info</Mui.Typography>
        <>
          <Mui.Stack direction="row" className={css.stackForInput}>
            <Input
              required
              name="VendorName"
              disabled={state.noGst}
              onBlur={reValidate}
              error={validationErr.gst}
              helperText={validationErr.gst ? VALIDATION?.gst?.errMsg : ''}
              className={`${css.greyBorder} ${classes.root}`}
              label="Vendor Name"
              variant="standard"
              value={state.gst}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                type: 'text',
                endAdornment: vendorAvailable ? <CheckCircle /> : null,
              }}
              fullWidth
              onChange={onInputChange}
              theme="light"
            />
            <Mui.Grid item xs={12} className={css.createNewVendor}>
              Add this Vendor
            </Mui.Grid>
            <KeyboardArrowDownIcon className={css.dropdownArrow} />
          </Mui.Stack>
          <Mui.Stack className={css.stackForInput}>
            <Input
              required
              name="gst"
              disabled={state.noGst}
              onBlur={reValidate}
              error={validationErr.gst}
              helperText={validationErr.gst ? VALIDATION?.gst?.errMsg : ''}
              className={`${css.greyBorder} ${classes.root}`}
              label="Vendor GSTIN"
              variant="standard"
              value={state.gst}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                type: 'text',
                endAdornment: vendorAvailable ? <CheckCircle /> : null,
              }}
              fullWidth
              onChange={onInputChange}
              theme="light"
            />
            <KeyboardArrowDownIcon className={css.dropdownArrow} />
          </Mui.Stack>
          <Mui.Stack className={css.stackForInput}>
            <Input
              required
              name="DocumentNumber"
              disabled={state.noGst}
              onBlur={reValidate}
              error={validationErr.gst}
              helperText={validationErr.gst ? VALIDATION?.gst?.errMsg : ''}
              className={`${css.greyBorder} ${classes.root}`}
              label="Document Number"
              variant="standard"
              value={state.gst}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                type: 'text',
                endAdornment: vendorAvailable ? <CheckCircle /> : null,
              }}
              fullWidth
              onChange={onInputChange}
              theme="light"
            />
            <KeyboardArrowDownIcon className={css.dropdownArrow} />
          </Mui.Stack>
          <Input
            required
            name="documentDate"
            disabled={state.noGst}
            onBlur={reValidate}
            error={validationErr.gst}
            helperText={validationErr.gst ? VALIDATION?.gst?.errMsg : ''}
            className={`${css.greyBorder} ${classes.root}`}
            label="Document Date"
            variant="standard"
            value={state.gst}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              type: 'text',
              endAdornment: vendorAvailable ? <CheckCircle /> : null,
            }}
            fullWidth
            onChange={onInputChange}
            theme="light"
          />
          <Input
            required
            name="dueDate"
            disabled={state.noGst}
            onBlur={reValidate}
            error={validationErr.gst}
            helperText={validationErr.gst ? VALIDATION?.gst?.errMsg : ''}
            className={`${css.greyBorder} ${classes.root}`}
            label="Due Date"
            variant="standard"
            value={state.gst}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              type: 'text',
              endAdornment: vendorAvailable ? <CheckCircle /> : null,
            }}
            fullWidth
            onChange={onInputChange}
            theme="light"
          />
        </>
        <Divider
          style={{ backgroundColor: '#DCDCDC' }}
          className={css.dividerHR}
          width="100%"
        />
        <Mui.Typography>Accounting</Mui.Typography>
        <Input
          required
          name="expenseCategory"
          disabled={state.noGst}
          onBlur={reValidate}
          error={validationErr.gst}
          helperText={validationErr.gst ? VALIDATION?.gst?.errMsg : ''}
          className={`${css.greyBorder} ${classes.root}`}
          label="Expense Category"
          variant="standard"
          value={state.gst}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            type: 'text',
            endAdornment: vendorAvailable ? <CheckCircle /> : null,
          }}
          fullWidth
          onChange={onInputChange}
          theme="light"
        />
        <Input
          required
          name="taxableValue"
          disabled={state.noGst}
          onBlur={reValidate}
          error={validationErr.gst}
          helperText={validationErr.gst ? VALIDATION?.gst?.errMsg : ''}
          className={`${css.greyBorder} ${classes.root}`}
          label="Taxable Value"
          variant="standard"
          value={state.gst}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            type: 'text',
            endAdornment: vendorAvailable ? <CheckCircle /> : null,
          }}
          fullWidth
          onChange={onInputChange}
          theme="light"
        />
        <Input
          required
          name="cgst"
          disabled={state.noGst}
          onBlur={reValidate}
          error={validationErr.gst}
          helperText={validationErr.gst ? VALIDATION?.gst?.errMsg : ''}
          className={`${css.greyBorder} ${classes.root}`}
          label="CGST credit"
          variant="standard"
          value={state.gst}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            type: 'text',
            endAdornment: vendorAvailable ? <CheckCircle /> : null,
          }}
          fullWidth
          onChange={onInputChange}
          theme="light"
        />
        <Input
          name="igst"
          required
          disabled={state.noGst}
          onBlur={reValidate}
          error={validationErr.gst}
          helperText={validationErr.gst ? VALIDATION?.gst?.errMsg : ''}
          className={`${css.greyBorder} ${classes.root}`}
          label="IGST credit"
          variant="standard"
          value={state.gst}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            type: 'text',
            endAdornment: vendorAvailable ? <CheckCircle /> : null,
          }}
          fullWidth
          onChange={onInputChange}
          theme="light"
        />
        <Mui.Stack className={css.billBookingPanel}>
          <Mui.Grid item xs={3} className={css.billBookingTds}>
            TDS
          </Mui.Grid>

          <Mui.Grid container className={css.gridDivider}>
            <Mui.Grid item xs={3} className={css.billBookingOptions}>
              sec
            </Mui.Grid>
            <Mui.Grid item xs={3} className={css.billBookingOptions}>
              194c
            </Mui.Grid>
            <Mui.Grid item xs={3} className={css.billBookingOptions}>
              2%
            </Mui.Grid>
            <Mui.Grid item xs={3} className={css.billBookingOptions1}>
              <Input
                required
                style={{
                  justifyContent: 'center',
                  border: 'none',
                  minHeight: ' 0px',
                  height: '19px',
                  fontSize: '12px',
                }}
                name="Amount"
                disabled={state.noGst}
                onBlur={reValidate}
                error={validationErr.gst}
                helperText={validationErr.gst ? VALIDATION?.gst?.errMsg : ''}
                className={`${css.greyBorder}`}
                placeholder="Amount"
                variant="standard"
                value={state.gst}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  type: 'text',
                  endAdornment: vendorAvailable ? <CheckCircle /> : null,
                }}
                fullWidth
                onChange={onInputChange}
                theme="light"
              />{' '}
            </Mui.Grid>
          </Mui.Grid>
        </Mui.Stack>
        <Input
          required
          name="netPayable"
          disabled={state.noGst}
          onBlur={reValidate}
          error={validationErr.gst}
          helperText={validationErr.gst ? VALIDATION?.gst?.errMsg : ''}
          className={`${css.greyBorder} ${classes.root}`}
          label="Net Payable"
          variant="standard"
          value={state.gst}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            type: 'text',
            endAdornment: vendorAvailable ? <CheckCircle /> : null,
          }}
          fullWidth
          onChange={onInputChange}
          theme="light"
        />
        <Input
          reuired
          name="paymentStatus"
          disabled={state.noGst}
          onBlur={reValidate}
          error={validationErr.gst}
          helperText={validationErr.gst ? VALIDATION?.gst?.errMsg : ''}
          className={`${css.greyBorder} ${classes.root}`}
          label="Payment Status"
          variant="standard"
          value={state.gst}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            type: 'text',
            endAdornment: vendorAvailable ? <CheckCircle /> : null,
          }}
          fullWidth
          onChange={onInputChange}
          theme="light"
        />
        <Divider
          style={{ backgroundColor: '#DCDCDC' }}
          className={css.dividerHR}
          width="100%"
        />{' '}
        <Mui.Typography>Advances To Adjust</Mui.Typography>
        <Mui.TableContainer
          sx={{
            borderRadius: 5,
            // minHeight: 600,
            maxHeight: '59vh',
          }}
          className={css.tableDiv}
        >
          <Mui.Table stickyHeader size="medium" style={{ background: '#ffff' }}>
            <Mui.TableHead
              sx={{
                bgcolor: '#0000',
                fontSize: '13px',
                borderColor: (theme) => theme.palette.grey[100],
              }}
            >
              {/* <Mui.TableCell>
                    <Mui.Typography
                      
                      variant="body2"
                      color="text.secondary"
                    >
                      {' '}
                    </Mui.Typography>
                  </Mui.TableCell> */}
              {titles?.map((title) => (
                <Mui.TableCell>
                  <Mui.Typography className={css.tableHead}>
                    {title}
                  </Mui.Typography>
                </Mui.TableCell>
              ))}
            </Mui.TableHead>

            {/* {yourBills.length > 0 &&
                yourBills
                  .filter((y) => (draft ? y.status === 'draft' : true))
                  .map((item) => {
                    return ( */}
            <Mui.TableBody>
              {/* {customerData?.map((value) => ( */}
              <Mui.TableRow
                sx={{
                  borderColor: (theme) => theme.palette.grey[100],
                }}
              >
                <>
                  {/* <Mui.TableCell >
                            <Mui.Typography  variant="body2">
                              <Mui.Avatar>
                                s
                              </Mui.Avatar>{' '}
                            </Mui.Typography>
                          </Mui.TableCell> */}
                  <Mui.TableCell className={css.tableCell}>
                    <Mui.Typography
                      nowrap
                      variant="body2"
                      className={css.tableBillNumber}
                    >
                      23 Mar 2022
                    </Mui.Typography>
                  </Mui.TableCell>
                  <Mui.TableCell className={css.tableCell}>
                    <Mui.Typography variant="body2" className={css.tableFont}>
                      ADV-123354
                    </Mui.Typography>
                    {/* <Mui.TableCell> */}
                    <Mui.Typography variant="body2" className={css.tableFontSm}>
                      Advance paid for civil works in Area 57
                    </Mui.Typography>
                    {/* </Mui.TableCell> */}
                  </Mui.TableCell>
                  {/* <Mui.TableCell>
                                <Mui.Typography  variant="body2">
                                  {item.name}
                                </Mui.Typography>
                              </Mui.TableCell> */}
                  <Mui.TableCell className={css.tableCell}>
                    <Mui.Typography
                      nowrap
                      variant="body2"
                      className={css.tableBillNumber2}
                    >
                      Rs 9,000
                    </Mui.Typography>
                  </Mui.TableCell>
                </>
              </Mui.TableRow>
              {/* ))} */}
            </Mui.TableBody>
            {/* );
                  })} */}
          </Mui.Table>
        </Mui.TableContainer>
        <Divider
          style={{ backgroundColor: '#DCDCDC' }}
          className={css.dividerHR}
          width="100%"
        />
        <Mui.Typography>Internal Notes</Mui.Typography>
        <Mui.Grid className={css.notes}>
          <Mui.Typography className={css.notesHead}>Note</Mui.Typography>
          <Mui.Typography className={css.noteContent}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt
            ipsum vestibulum sollicitudin turpis ornare augue arcu, scelerisque.
            Odio vitae at quis ullamcorper egestas at nibh bibendum tortor.{' '}
          </Mui.Typography>
        </Mui.Grid>
        <Mui.Stack className={css.buttons}>
          <Mui.Grid item xs={12} className={css.button1}>
            Record and Proceed to next bill
          </Mui.Grid>
        </Mui.Stack>
      </div>

      {vendorAvailable && (
        <div className={css.vendorAvailable}>
          <p>{vendorAvailable.customer_name} is already a part of your list</p>
          <p>Would you like to record a bill?</p>
          <Button
            onClick={() =>
              handleParent2({
                id: vendorAvailable.customer_id,
                name: vendorAvailable.customer_name,
              })
            }
            size="medium"
            className={css.submitButton}
          >
            Record and Proceed to next Bill
          </Button>
        </div>
      )}
    </div>
  );
};

export default VendorBillBookingCategory;
