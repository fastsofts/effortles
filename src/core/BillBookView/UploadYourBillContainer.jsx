/* eslint-disable no-use-before-define */
/* eslint-disable no-unreachable */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable no-else-return */
/* eslint-disable no-useless-return */
/* eslint-disable no-lonely-if */
/* eslint-disable no-multi-assign */

/* @flow */
/**
 * @fileoverview  Create Edit Invoice Container
 */

import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import JSBridge from '@nativeBridge/jsbridge';
import Checkbox from '@material-ui/core/Checkbox';
import Input, { AmountFormatCustom } from '@components/Input/Input.jsx';
// import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet.jsx';
import Button from '@material-ui/core/Button';
import CloudUpload from '@material-ui/icons/CloudUpload';
import { DirectUpload } from '@rails/activestorage';
import * as Mui from '@mui/material';
import alert from '@assets/warning.svg';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import rightArrow from '@assets/chevron-right.svg';
import RestApi, { METHOD, BASE_URL } from '@services/RestApi.jsx';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer';
import { PermissionDialog } from '@components/Permissions/PermissionDialog.jsx';

import AppContext from '@root/AppContext.jsx';
import { makeStyles, Drawer, styled } from '@material-ui/core';
import themes from '@root/theme.scss';
import VendorList from '@components/Vendor/VendorList';
import * as Router from 'react-router-dom';
import * as MuiIcon from '@mui/icons-material';
import {
  validatePrice,
  validateRequired,
  validateInvoice,
  validateNum,
} from '@services/Validation.jsx';
import moment from 'moment';
// import { toInr } from '@services/Utils.js';
import Calender from '@core/InvoiceView/Calander';
import CustomSearch from '@components/SearchSheet/CustomSearch.jsx';
import { InvoiceCustomer } from '@components/Invoice/EditForm.jsx';
import ReceivablesPopOver from '@core/Receivables/Components/ReceivablesPopover';
import { FormattedAmount } from '@components/formattedValue/FormattedValue';
import PageTitle from '@core/DashboardView/PageTitle';
import CircularProgress from '@mui/material/CircularProgress';
import cssDash from '@core/DashboardView/DashboardViewContainer.scss';
import useDebounce from '@components/Debounce/Debounce.jsx';
import { EmployeeList } from './components/EmployeeList';
import PaymentTerms from '../InvoiceView/PaymentTerms';
import SuperAccUpload from './components/SuperAccUploadBillContainer';
import ExpenseCategoryList from './shared/ExpenseCategoryList';
import css from './UploadYourBillContainer.scss';
import AddNewVendor from './shared/AddVendor';
import SuccessView from './shared/SuccessView';
import PreviewContent from './shared/PreviewContent';
import featherupload from '../../assets/featherupload.svg';

function useStateCallback(initialState) {
  const [state, setState] = useState(initialState);
  const cbRef = useRef(null); // init mutable ref container for callbacks

  const setStateCallback = useCallback((stateParameter, cb) => {
    cbRef.current = cb; // store current, passed callback in ref
    setState(stateParameter);
  }, []); // keep object reference stable, exactly like `useState`

  useEffect(() => {
    // cb.current is `null` on initial render,
    // so we only invoke callback on state *updates*
    if (cbRef.current) {
      cbRef.current(state);
      cbRef.current = null; // reset callback after execution
    }
  }, [state]);

  return [state, setStateCallback];
}

const PriceCustom = React.forwardRef(function PriceCustom(props) {
  const { ...other } = props;
  return (
    <AmountFormatCustom
      {...other}
      decimalScale={2}
      type="text"
      valueIsNumericString={true}
    />
  );
});

const useStyles = makeStyles(() => ({
  root: {
    background: themes.colorInputBG,
    borderColor: themes.colorInputBorder,
    borderRadius: '8px',
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
  btnDisabled: {
    opacity: '0.65',
  },
}));

export const paymentStatusListWithBill = [
  { id: 'company_cash', label: 'Paid with Company Cash' },
  { id: 'paid_as_advance', label: 'Paid as Advance' },
  { id: 'personal', label: 'Paid By', icon: true },
  { id: 'to_pay', label: 'To Pay' },
  { id: 'company_card', label: 'Paid with Company Card' },
  // { id: 'personal', label: 'Paid Personally' },
  { id: 'company_account', label: 'Paid with Company Account' },
];

export const paymentStatusListWithoutBill = [
  { id: 'company_cash', label: 'Paid with Company Cash' },
  { id: 'company_card', label: 'Paid with Company Card' },
  { id: 'personal', label: 'Paid Personally' },
];

const initialState = {
  name: '',
  amount: '',
  invoiceNo: '',
  showReloadBtn: '',
  gst: '',
  date: new Date(),
  dueDate: new Date(),
  expenseCategory: '',
  description: '',
  location: '',
  paymentStatus: '',
  vendor: '',
  doNotTrack: false,
  igst: '',
  cgst: '',
  taxAmount: '',
  creditPeriod: 0,
  payer_id: {},
};

const initialCalCAmt = {
  taxAmount: '',
  cgst: '',
  sgst: '',
  igst: '',
};

const VIEW = {
  MAIN: 'main',
  VENDOR: 'vendor',
  DONE: 'done',
  EDIT: 'edit',
  SUPER: 'superAcc',
};

const StyledDrawer = styled(Drawer)(() => ({
  '& .MuiPaper-root': {
    minHeight: '20vh',
    maxHeight: '80vh',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
  },
}));

const Puller = styled(Mui.Box)(() => ({
  width: '50px',
  height: 6,
  backgroundColor: '#C4C4C4',
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
}));

const UploadYourBillContainer = ({
  haveBill: withhBill,
  pageParams,
  heading,
  categorizationvendordetails,
  selectedTransaction,
}) => {
  const { state } = Router.useLocation();
  const deviceOut = localStorage.getItem('device_detect');
  const VALIDATION =
    deviceOut === 'desktop'
      ? {
          vendor: {
            errMsg: 'Please choose Vendor',
            test: (v) =>
              !localState.doNotTrack
                ? validateRequired(v?.name ? v.name : v)
                : true,
          },

          date: {
            errMsg: 'Please provide valid date',
            test: validateRequired,
          },
          dueDate: {
            errMsg: 'Please provide valid date',
            test: () => (haveBill ? validateRequired : true),
          },
          expenseCategory: {
            errMsg: 'Choose category',
            test: (v) => validateRequired(v?.name),
          },

          amount: {
            errMsg: 'Please provide valid amount',
            test: validatePrice,
          },
          invoiceNo: {
            errMsg: 'Please provide valid invoice no',
            test: () => (haveBill ? validateInvoice : true),
          },

          taxAmount: {
            errMsg: 'Please provide valid amount',
            test: (v) => {
              let results;
              if (Number(v) === 0) {
                results = false;
              } else {
                if (v.toString()?.includes(',')) {
                  if (v.toString().includes('.')) {
                    results = validatePrice(
                      Number(Number(v.replaceAll(',', '')).toFixed(2)),
                    );
                  } else {
                    results = validateNum(Number(v.replaceAll(',', '')));
                  }
                } else {
                  if (v.toString().includes('.')) {
                    results = validatePrice(Number(Number(v).toFixed(2)));
                  } else {
                    results = validateNum(v);
                  }
                }
              }
              return results;
            },
          },
          cgst: {
            errMsg: 'Please provide valid amount',
            test: (v) => {
              let results;
              if (hasNoGstin) {
                results = true;
              } else {
                if (haveBill && calcAmount?.igst) {
                  results = true;
                } else if (calcAmount?.igst) {
                  results = true;
                } else {
                  if (v === 0) {
                    results = validateNum(v);
                  } else {
                    if (v?.toString()?.includes(',')) {
                      if (v?.toString()?.includes('.')) {
                        results = validatePrice(
                          Number(Number(v.replaceAll(',', '')).toFixed(2)),
                        );
                      } else {
                        results = validateNum(Number(v.replaceAll(',', '')));
                      }
                    } else {
                      if (v?.toString()?.includes('.')) {
                        results = validatePrice(Number(Number(v).toFixed(2)));
                      } else {
                        results = validateNum(v);
                      }
                    }
                  }
                }
              }

              return results;
            },
          },
          igst: {
            errMsg: 'Please provide valid amount',
            test: (v) => {
              let results;
              if (hasNoGstin) {
                results = true;
              } else {
                if (haveBill && calcAmount?.cgst) {
                  results = true;
                } else if (calcAmount?.cgst) {
                  results = true;
                } else {
                  if (v === 0) {
                    results = validateNum(v);
                  } else {
                    if (v?.toString()?.includes(',')) {
                      if (v?.toString()?.includes('.')) {
                        results = validatePrice(
                          Number(Number(v.replaceAll(',', '')).toFixed(2)),
                        );
                      } else {
                        results = validateNum(Number(v.replaceAll(',', '')));
                      }
                    } else {
                      if (v?.toString()?.includes('.')) {
                        results = validatePrice(Number(Number(v).toFixed(2)));
                      } else {
                        results = validateNum(v);
                      }
                    }
                  }
                }
              }

              return results;
            },
          },
          paymentStatus: {
            errMsg: 'Please choose Payment Status',
            test: (v) => validateRequired(v?.label),
          },
          description: {
            errMsg: 'Please provide description',
            test: () => true,
          },

          doNotTrack: {
            errMsg: '',
            test: () => true,
          },
        }
      : {
          expenseCategory: {
            errMsg: 'Choose category',
            test: (v) => validateRequired(v?.name),
          },
          vendor: {
            errMsg: 'Please choose Vendor',
            test: (v) =>
              !localState.doNotTrack
                ? validateRequired(v?.name ? v.name : v)
                : true,
          },

          amount: {
            errMsg: 'Please provide valid amount',
            test: validatePrice,
          },
          invoiceNo: {
            errMsg: 'Please provide valid invoice no',
            test: () => (haveBill ? validateInvoice : true),
          },
          date: {
            errMsg: 'Please provide valid date',
            test: validateRequired,
          },
          paymentStatus: {
            errMsg: 'Please choose Payment Status',
            test: (v) => validateRequired(v?.label),
          },
          description: {
            errMsg: 'Please provide description',
            test: () => true,
          },

          doNotTrack: {
            errMsg: '',
            test: () => true,
          },
        };

  const initialValidationErr = Object.keys(VALIDATION).map((k) => ({
    [k]: false,
  }));
  const classes = useStyles();
  const {
    organization,
    enableLoading,
    user,
    openSnackBar,
    closeSnackBar,
    registerEventListeners,
    deRegisterEventListener,
    userPermissions,
  } = useContext(AppContext);
  const fileref = useRef();
  const dragfropref = useRef();
  const [expenseCategoryList, setExpenseCategoryList] = useState([]);
  const [assetCategoryList, setAssetCategoryList] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [haveBill, setHaveBill] = useState(withhBill);
  const [vendorsUnsettledList, setVendorsUnsettledList] = useState([]);
  const [orgLocationId, setOrgLocationId] = useState('');
  const [localState, setLocalState] = useStateCallback(initialState);
  const [validationErr, setValidationErr] = useState(initialValidationErr);
  const [advancesData, setAdvancesData] = useState([]);
  const [drawer, setDrawer] = useState({
    expenseCategory: false,
    paymentStatus: false,
    paidAdvance: false,
    date: false,
    dueDate: false,
    vendor: false,
    amount: false,
    preview: false,
    edit: false,
  });
  const [filename, setFilename] = useState('');
  const [view, setView] = useState(VIEW.MAIN);
  // eslint-disable-next-line no-unused-vars
  const [base64, setBase64] = useState('');
  const [billId, setBillId] = useState();
  const [selected, setSelected] = useState(false);
  const [unselect, setUnselect] = useState(true);
  const [calcAmount, setCalcAmount] = useState(initialCalCAmt);
  const [formattedCalcAmount, setFormattedCalcAmount] =
    useState(initialCalCAmt);
  const [billValue, setBillValue] = useState(0);
  const [tds, setTds] = useState(0);
  const [amountPayable, setAmountPayable] = useState(0);
  const [dntCheckbox, setDntCheckbox] = useState();
  const [trigger, setTrigger] = useState('list');
  const [pdfUrl, setPdfUrl] = useState();
  const navigate = Router.useNavigate();
  const [isVendorAvailable, setIsVendorAvailable] = useState(false);
  const [typeImage, setTypeImage] = React.useState();
  const [fetchDetails, setFetchDetails] = useState();
  const [response, setResponse] = React.useState();
  const device = localStorage.getItem('device_detect');
  const [editConfirm, setEditConfirm] = React.useState({
    open: false,
    name: '',
    data: '',
  });
  const [editValue, setEditValue] = useState({});
  const [newLoader, setNewLoader] = React.useState({
    loader: false,
    val: 0,
    fileId: '',
    continueFlow: false,
    superAccount: false,
    superAccountSec: false,
    superAccountThrid: false,
    assigned: false,
  });
  const [hasNoGstin, setHasNoGstin] = React.useState(false);
  const debouncedForAmt = useDebounce(calcAmount?.taxAmount);
  const debouncedForCgst = useDebounce(calcAmount?.cgst);
  const debouncedForIgst = useDebounce(calcAmount?.igst);
  const debouncedForDescription = useDebounce(localState?.description, 2000);
  const debouncedForInvoiceNo = useDebounce(localState?.invoiceNo);
  const [toShowBtn, setToShowBtn] = React.useState(false);
  const [donePage, setDonePage] = React.useState(false);
  const [pagination, setPagination] = React.useState({
    totalPage: 1,
    currentPage: 1,
  });
  const [partLoad, setPartLoad] = React.useState(false);
  const [Employee, setEmployee] = React.useState({ open: false });

  const [userRoles, setUserRoles] = React.useState({});
  const [userRolesPeople, setUserRolesPeople] = React.useState({});
  const [havePermission, setHavePermission] = React.useState({ open: false });

  React.useEffect(() => {
    if (Object.keys(userPermissions?.Expense || {})?.length > 0) {
      if (!userPermissions?.Expense?.Expense) {
        setHavePermission({
          open: true,
          back: () => {
            navigate('/dashboard');
            setHavePermission({ open: false });
          },
        });
      }
      setUserRoles({ ...userPermissions?.Expense });
      setUserRolesPeople({ ...userPermissions?.People });
    }
  }, [userPermissions]);

  React.useEffect(() => {
    if (Object.keys(userRoles?.['Bill Booking'] || {})?.length > 0) {
      if (!userRoles?.['Bill Booking']?.create_bills) {
        setHavePermission({
          open: true,
          back: () => {
            navigate('/bill');
            setHavePermission({ open: false });
          },
        });
      }
    }
  }, [userRoles]);

  useEffect(() => {
    dragfropref?.current?.addEventListener('dragover', HandleFileDrag);
    dragfropref?.current?.addEventListener('drop', HandleFileDrop);
    return () => {
      dragfropref?.current?.removeEventListener('dragover', HandleFileDrag);
      dragfropref?.current?.removeEventListener('drop', HandleFileDrop);
    };
  }, [dragfropref?.current]);

  React.useEffect(() => {
    setHaveBill(true);
  }, []);

  const getEventNameValue = (ps) => {
    const name = ps?.target?.name;
    const value = ps?.target?.value;
    return [name, value];
  };

  const validateAllFields = (stateParam) => {
    const stateData = stateParam || localState;
    if (device === 'desktop') {
      Object.assign(stateData, { taxAmount: stateData?.amount });
    }
    // console.log('STATE', state);
    return Object.keys(VALIDATION).reduce((a, v) => {
      a[v] = !VALIDATION?.[v]?.test(stateData[v]);
      return a;
    }, {});
  };

  const reValidate = (ps) => {
    const [name, value] = getEventNameValue(ps);
    setValidationErr((v) => ({
      ...v,
      [name]: !VALIDATION?.[name]?.test?.(value),
    }));
  };

  const handleDate = (val) => {
    handleBottomSheet('date', val);
  };

  const handleChange = () => {
    if (haveBill) {
      setHasNoGstin(false);
      setSelected(true);
      setUnselect(true);
      setHaveBill(false);
      if (state?.people) {
        setTimeout(() => {
          const vendorData = {
            id: state?.people?.id,
            name: state?.people?.name,
          };
          fetchAllAddress(vendorData?.id);
          setLocalState((s) => ({ ...s, vendor: vendorData }));
          setIsVendorAvailable(true);
        }, 1000);
      }
    } else if (!haveBill) {
      setSelected(false);
      setUnselect(true);
      setHaveBill(true);
    }
  };
  const hangleChecked = (data) => {
    if (advancesData.indexOf(data) < 0) {
      setAdvancesData((previous) => [...previous, data]);
    } else {
      setAdvancesData((previous) => [
        ...previous.filter((val) => val !== data),
      ]);
    }
  };
  const onInputChange = async (ps) => {
    reValidate(ps);
    const [name, value] = getEventNameValue(ps);
    setLocalState((s) => ({ ...s, [name]: value }));
  };

  const getExpenseCategory = async () => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/accounts?category_type=expense_category`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        enableLoading(false);
        if (res && !res.error) {
          setExpenseCategoryList(res.data);
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const getAssetCategory = async () => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/accounts?category_type=asset`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        enableLoading(false);
        if (res && !res.error) {
          setAssetCategoryList(res.data);
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const getVendorUnsettled = async () => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/vendor_unsettled?unsettled_advance=true&vendor_id=${localState.vendor?.id}`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        enableLoading(false);
        if (res && !res.error) {
          setVendorsUnsettledList(res?.data);
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const getVendor = async (allParties, searchVal, pageNum) => {
    await enableLoading(true);
    await RestApi(
      !allParties
        ? `organizations/${organization.orgId}/entities?type[]=vendor&search=${
            searchVal || ''
          }&page=${pageNum || 1}`
        : `organizations/${organization.orgId}/entities?search=${
            searchVal || ''
          }&page=${pageNum || 1}`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        enableLoading(false);
        if (res && !res.error && res.data) {
          setPagination({ totalPage: res?.pages, currentPage: res?.page });
          if (pageNum === 1 || !pageNum) {
            setVendorList(res?.data);
          } else {
            setVendorList((prev) => [...prev, ...res?.data]);
          }
        }
      })
      .catch((err) => {
        console.log(err);
        enableLoading(false);
      });
    enableLoading(false);
  };

  const fetchOrgLocation = () => {
    enableLoading(true);
    RestApi(`organizations/${organization.orgId}/locations`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        enableLoading(false);
        if (res && !res.error && res.data) {
          if (!orgLocationId && res.data.length > 0) {
            setOrgLocationId(res.data[0].id);
          }
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const fetchAllAddress = (id) => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/vendors/${id}/locations?show=all`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then(async (res) => {
        if (res && !res.error) {
          enableLoading(false);
          const tempAddr = res?.data?.filter((val) => val?.active);
          const responseForGst = tempAddr?.filter((v) => v?.gstin?.length > 0);
          if (responseForGst?.length > 0) {
            setHasNoGstin(false);
          } else if (responseForGst?.length === 0) {
            setHasNoGstin(true);
          }
          // await saveBills(true, {
          //   vendor_id: id,
          //   id: billId,
          // });
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const fillOcrData = async (res) => {
    // console.log('LOOPCHECK fillOcrData');
    const {
      id,
      name,
      // document_details: docDetails,
      payment_mode: paymentId,
      vendor_id: vendorId,
      location,
      description,
      amount,
      document_number: invoiceNo,
      document_date: date,
      cgst_amount: cgst,
      sgst_amount: sgst,
      igst_amount: igst,
      expense_account: expenseAccount,
    } = res;
    if (vendorId) await fetchAllAddress(vendorId);
    const vendor = localState?.vendor?.id
      ? localState?.vendor
      : (vendorId && res?.vendor) || res?.new_vendor;
    // const newVendor = localState?.vendor?.id ? localState?.vendor : res?.new_vendor;
    const gstNo = localState?.vendor?.id ? '' : res?.new_vendor?.gstin;
    const paymentStatus = localState?.paymentStatus?.id
      ? localState?.paymentStatus
      : paymentStatusListWithBill.find((v) => v.id === paymentId);
    // console.time('setLocalState');
    setBillId(id);
    setLocalState(
      (s) => ({
        ...s,
        name: name || '',
        amount: amount || '',
        invoiceNo: invoiceNo || '',
        date: (Number(moment(date).format('YYYY')) > 1970 && date) || '',
        description: description || '',
        location: location || '',
        paymentStatus: paymentStatus || '',
        vendor: vendor?.name ? vendor : '',
        gst: gstNo || '',
        showReloadBtn: res.vendor_id || false,
        expenseCategory: localState?.expenseCategory?.id
          ? localState?.expenseCategory
          : expenseAccount || '',
        cgst,
        sgst,
        igst,
        taxAmount: amount,
      }),
      (e) => {
        const v = validateAllFields(e);
        const valid = Object.values(v).every((val) => !val);

        if (!valid) {
          setValidationErr((s) => ({ ...s, ...v }));
        }
      },
    );
    setCalcAmount((s) => ({
      ...s,
      taxAmount: amount,
      cgst,
      sgst,
      igst,
    }));
    setFormattedCalcAmount((s) => ({
      ...s,
      taxAmount: amount,
      cgst,
      sgst,
      igst,
    }));
    if (vendorId || localState?.vendor?.id) {
      setIsVendorAvailable(true);
    } else {
      setIsVendorAvailable(false);
    }
    if (categorizationvendordetails?.id) {
      setLocalState((s) => ({ ...s, vendor: categorizationvendordetails }));
      setLocalState((s) => ({
        ...s,
        paymentStatus: { id: 'company_account', label: 'Paid' },
      }));
    }
    await saveBills(true, {
      name,
      document_date: date,
      document_number: invoiceNo,
      description,
      igst_amount: igst,
      sgst_amount: sgst,
      cgst_amount: cgst,
      amount,
      payment_mode: paymentStatus?.id,
      vendor_id: vendor?.id,
      id,
    });
    setPartLoad(false);
  };

  const fetchOcrDetails = (id) => {
    if (!newLoader?.continueFlow || device === 'mobile') {
      setPartLoad(true);
      // enableLoading(true, 'Please wait until we are getting the data');
    }
    if (newLoader?.continueFlow && device === 'desktop') {
      setNewLoader((prev) => ({ ...prev, loader: true }));
    }
    RestApi(`organizations/${organization.orgId}/vendor_bills/${id}`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        // console.log('LOOPCHECK getOcrData .then func');
        if (res && !res.error) {
          setPdfUrl(res?.file_url);
          if (res?.ocr_processing) {
            setTimeout(() => {
              setNewLoader((prev) => ({
                ...prev,
                val: prev.val + 1,
                fileId: res?.id,
              }));
              // fetchOcrDetails(res.id);
            }, 5000);
          } else {
            console.log(res);
            setFetchDetails(res);
            fillOcrData(res);
            // setPdfUrl(res.file_url);
            // if (device === 'mobile') {
            enableLoading(false);
            // }
            setNewLoader((prev) => ({ ...prev, loader: false }));
          }
        } else {
          // if (device === 'mobile') {
          enableLoading(false);
          // }
          setNewLoader((prev) => ({ ...prev, loader: false }));
          const errorValues = Object.values(res.errors);
          openSnackBar({ message: errorValues.join(', '), type: 'error' });
        }
      })
      .catch((e) => {
        console.log('fetchOcrDetailsError', e);
        openSnackBar({ message: 'Unknown error occured', type: 'error' });
        // if (device === 'mobile') {
        enableLoading(false);
        // }
        setNewLoader((prev) => ({ ...prev, loader: false }));
      });
  };

  React.useEffect(() => {
    if (newLoader?.continueFlow && !newLoader?.assigned) {
      fetchOcrDetails(newLoader?.fileId);
    }
    if (
      newLoader?.val >= 1 &&
      newLoader?.val <= 3 &&
      !newLoader?.continueFlow &&
      newLoader?.fileId &&
      !newLoader?.assigned
    ) {
      fetchOcrDetails(newLoader?.fileId);
    } else if (
      newLoader?.val === 4 &&
      !newLoader?.continueFlow &&
      !newLoader?.superAccountSec &&
      !newLoader?.assigned
    ) {
      // if (device === 'mobile') {
      enableLoading(false);
      // }
      setNewLoader((prev) => ({ ...prev, superAccount: true }));
    } else if (newLoader?.assigned) {
      enableLoading(false);
    }
  }, [newLoader?.val, newLoader?.continueFlow, newLoader?.assigned]);

  const getOcrData = (id) => {
    // console.log('LOOPCHECK getOcrData');
    const Param = billId ? { id: billId, file: id } : { file: id };
    enableLoading(true);
    RestApi(
      billId
        ? `organizations/${organization.orgId}/vendor_bills/${billId}?ocr=true`
        : `organizations/${organization.orgId}/vendor_bills?ocr=true`,
      {
        method: billId ? METHOD.PATCH : METHOD.POST,
        payload: Param,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        // console.log('LOOPCHECK getOcrData .then func');
        if (res && !res.error) {
          setBillId(res?.id);
          if (res.ocr_processing) {
            setPdfUrl(res?.file_url);
            enableLoading(false);
            setPartLoad(true);
            // enableLoading(true, 'Please wait until we are getting the data');
            setTimeout(() => {
              enableLoading(false);
              fetchOcrDetails(res.id);
            }, 5000);
          } else {
            setFetchDetails(res);
            fillOcrData(res);
            setPdfUrl(res.file_url);
            enableLoading(false);
          }
        } else {
          enableLoading(false);
          const errorValues = Object.values(res.errors);
          openSnackBar({ message: errorValues.join(', '), type: 'error' });
          setFilename('');
        }
      })
      .catch((e) => {
        console.log('getOcrDataError', e);
        openSnackBar({ message: 'Unknown error occured', type: 'error' });
        setFilename('');
        enableLoading(false);
      });
  };

  const onFileUpload = (e, directFile) => {
    setNewLoader({
      loader: false,
      val: 0,
      fileId: '',
      continueFlow: false,
      superAccount: false,
      superAccountSec: false,
      superAccountThrid: false,
    });
    // console.log('LOOPCHECK if onFileUpload e, directFile', e, directFile);
    const file = directFile ? e : e?.target?.files?.[0];
    const url = `${BASE_URL}/direct_uploads`;
    const upload = new DirectUpload(file, url);
    enableLoading(true);
    upload.create((error, blob) => {
      // console.log('LOOPCHECK upload.create', blob);
      enableLoading(false);
      if (error) {
        openSnackBar(error);
      } else {
        const id = blob?.signed_id;
        const name = blob?.filename;
        const type = blob?.content_type;
        setFilename(name);
        setLocalState((s) => ({ ...s, file: id }));
        setTypeImage(type);
        getOcrData(id);
      }
    });
  };

  const HandleFileDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const HandleFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    onFileUpload(file, true);
  };

  const fillOcrByFirebaseML = async (res) => {
    const resp = JSON.parse(res.detail.value);
    // console.log('LOOPCHECK fillOcrByFirebaseML');
    const {
      // name,
      // amount,
      // invoiceNo,
      // date,
      // description,
      // location,
      // paymentStatus,
      // vendor,
      // isOnline,
      base64: base64Arg,
      filename: filenameArg,
      idDocType: fileType,
    } = resp;

    setFilename(filenameArg);
    setBase64(base64Arg);

    // if (!isOnline) {
    //   setLocalState((s) => {
    //     const newState = {
    //       ...s,
    //       name,
    //       amount,
    //       invoiceNo,
    //       date,
    //       description,
    //       location,
    //       paymentStatus,
    //       vendor,
    //     };
    //     return newState;
    //   });
    //   return;
    // }

    // Call ML API OCR Data while getting base64 from native

    if (base64Arg) {
      const base64Str = `data:${fileType};base64,${base64Arg}`;
      const fetchRes = await fetch(base64Str);
      const blob = await fetchRes.blob();
      // eslint-disable-next-line no-undef
      const file = new File([blob], filenameArg, { type: fileType });
      // console.log(
      //   '🚀 ~ file: UploadYourBillContainer.jsx ~ line 433 ~ saveBills ~ file',
      //   file,
      // );
      // console.log('LOOPCHECK if base64Arg');
      onFileUpload(file, true);
      // fileSignedId = await fileUploadOnSave(file);
    }
  };

  const ocrByScan = () => {
    JSBridge.ocrByScan();
  };

  const ocrByBrowse = () => {
    JSBridge.ocrByBrowse();
  };

  const onAddAnotherBill = () => {
    setPartLoad(false);
    setFetchDetails();
    setBillId('');
    setLocalState(initialState);
    setCalcAmount(initialCalCAmt);
    setFormattedCalcAmount(initialCalCAmt);
    setValidationErr(initialValidationErr);
    setHasNoGstin(false);
    setBillValue(0);
    setAmountPayable(0);
    setTds(0);
    setView(VIEW.MAIN);
    setFilename('');
    setSelected(false);
    setHaveBill(true);
    setPdfUrl();
    setFilename('');
    setResponse();
    // navigate('/bill-upload');
    setNewLoader({
      loader: false,
      val: 0,
      fileId: '',
      continueFlow: false,
      superAccount: false,
      superAccountSec: false,
      superAccountThrid: false,
    });
    setDntCheckbox(false);
    setDonePage(false);
  };

  const saveBills = async (draftStatus, obj) => {
    let params = categorizationvendordetails?.id
      ? {
          id: billId || undefined,
          name: localState.name,
          document_date: moment(localState.date).format('YYYY-MM-DD'),
          due_date:
            device === 'mobile' || !haveBill
              ? undefined
              : moment(localState.dueDate).format('YYYY-MM-DD'),
          document_number: !haveBill ? undefined : localState.invoiceNo,
          description: localState.description,
          expense_account_id: localState.expenseCategory?.id,
          payment_mode: localState.paymentStatus?.id,
          vendor_id: dntCheckbox ? null : localState.vendor?.id,
          file: state?.selected?.file_url ? undefined : localState.file,
          status: draftStatus ? undefined : 'accounted',
          advances: advancesData,
          igst_amount: hasNoGstin ? 0 : calcAmount?.igst,
          sgst_amount: hasNoGstin ? 0 : calcAmount?.cgst,
          cgst_amount: hasNoGstin ? 0 : calcAmount?.cgst,
          amount: calcAmount.taxAmount,
          // file_url: !haveBill ? '' : undefined
          bank_txn_id: draftStatus ? undefined : selectedTransaction?.id,
          credit_period: localState?.creditPeriod || 0,
          payer_id:
            localState.paymentStatus?.id === 'personal'
              ? localState?.payer_id?.id
              : undefined,
        }
      : {
          id: billId || undefined,
          name: localState.name,
          document_date: moment(localState.date).format('YYYY-MM-DD'),
          due_date:
            device === 'mobile' || !haveBill
              ? undefined
              : moment(localState.dueDate).format('YYYY-MM-DD'),
          document_number: !haveBill ? undefined : localState.invoiceNo,
          description: localState.description,
          expense_account_id: localState.expenseCategory?.id,
          payment_mode: localState.paymentStatus?.id,
          vendor_id: dntCheckbox ? null : localState.vendor?.id,
          file: state?.selected?.file_url ? undefined : localState.file,
          status: draftStatus ? undefined : 'accounted',
          advances: advancesData,
          igst_amount: hasNoGstin ? 0 : calcAmount?.igst,
          sgst_amount: hasNoGstin ? 0 : calcAmount?.cgst,
          cgst_amount: hasNoGstin ? 0 : calcAmount?.cgst,
          amount: calcAmount.taxAmount,
          credit_period: localState?.creditPeriod || 0,
          payer_id:
            localState.paymentStatus?.id === 'personal'
              ? localState?.payer_id?.id
              : undefined,
        };

    params = { ...params, ...obj };

    setDrawer((s) => ({ ...s, preview: false }));
    // enableLoading(true);

    RestApi(
      params?.id
        ? `organizations/${organization.orgId}/vendor_bills/${params?.id}`
        : `organizations/${organization.orgId}/vendor_bills`,
      {
        method: params?.id ? METHOD.PATCH : METHOD.POST,
        payload: params,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        // console.log(localState.vendor?.id);

        if (res && !res.error) {
          setBillId(res?.id);
          if (draftStatus) {
            setBillValue(res?.bill_amount || 0);
            setTds(res?.tds_amount || 0);
            setAmountPayable(res?.total_amount || 0);
          } else if (!draftStatus) {
            setResponse(res);
            // navigate('/bill-upload-done');
            setView(VIEW.DONE);
            setNewLoader((prev) => ({
              ...prev,
              superAccount: false,
              continueFlow: false,
              assigned: true,
            }));
          }
        } else {
          const errorValues = Object.values(res.errors);
          openSnackBar({ message: errorValues.join(', '), type: 'error' });
        }
        enableLoading(false);
      })
      .catch((e) => {
        openSnackBar({
          message: e?.message || 'Unknown error occured',
          type: 'error',
        });
        enableLoading(false);
      });
  };

  //   const callback = () => {
  //     setOpen(false);
  // };

  const onRecordBill = async () => {
    let loopBreak = false;
    const v = validateAllFields();
    const valid = Object.values(v).every((val) => !val);

    if (!valid) {
      setValidationErr((s) => ({ ...s, ...v }));
      const err = Object.keys(v);
      if (err.length) {
        err.forEach((key) => {
          let input;
          if (v[key] && !loopBreak) {
            if (key === 'vendor') {
              input = document.querySelector(`#recordBillVendor`);
            } else if (key === 'expenseCategory') {
              input = document.querySelector(`.expenseCategoryClass`);
            } else if (key === 'paymentStatus') {
              input = document.querySelector(`.PaymentStatusClass`);
            } else {
              input = document.querySelector(`input[name=${key}]`);
            }
            input.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'start',
            });
            loopBreak = true;
            return;
          }
        });
      }
      return;
    }
    if (haveBill && !filename) {
      openSnackBar({ message: 'Please upload your bill', type: 'error' });
      setTimeout(() => {
        closeSnackBar();
      }, 3000);
      return;
    }
    if (
      haveBill &&
      !isVendorAvailable &&
      localState?.vendor !== 'Do not track'
    ) {
      const input = document.querySelector(`#recordBillVendor`);
      input.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'start',
      });
      setValidationErr((s) => ({ ...s, vendor: true }));
      return;
    }
    await saveBills();
    // setNameDialog(true);
  };

  const fetchGSTDetails = async (Gst_No) => {
    enableLoading(true);
    const pattern =
      /^([0][1-9]|[1-2][0-9]|[3][0-5])([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$/;

    if (!pattern.test(Gst_No)) {
      openSnackBar({
        message: 'GST Number is not valid. Please add manually Vendor Name.',
        type: MESSAGE_TYPE.ERROR,
      });
      enableLoading(false);
      return;
    }
    await RestApi('gstins', {
      method: METHOD.POST,
      payload: {
        gstin: Gst_No.toUpperCase(),
        organization_id: organization.orgId,
        // gstin_type: 'Vendor',
      },
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        const details__ = { new_vendor: { ...res } };
        setFetchDetails(details__);
        setLocalState((s) => ({
          ...s,
          vendor: res?.name || '',
        }));
        enableLoading(false);
      })
      .catch((e) => {
        openSnackBar({
          message: e?.message || 'Unknown error occured',
          type: 'error',
        });
        enableLoading(false);
      });
  };
  const onTriggerDrawer = (name) => {
    let sheetName = name;
    if (!userRolesPeople?.Vendors?.create_vendors && name === 'addManually') {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
      return;
    }
    if (name === 'vendor') {
      getVendor();
    }

    if (name === 'reload') {
      fetchGSTDetails(localState.gst);
    }

    if (name === 'addManually' || name === 'list') {
      setTrigger(name);
      sheetName = 'vendor';
    } else if (localState?.vendor?.id) {
      setTrigger('list');
      sheetName = 'vendor';
    }
    setDrawer((d) => ({ ...d, [sheetName]: true }));
  };

  const handleBottomSheet = async (name, data, from) => {
    setDrawer((d) => ({ ...d, [name]: false }));
    if (name === 'expenseCategory') {
      await saveBills(true, { expense_account_id: data?.id });
    }
    if (name === 'creditPeriod') {
      const date = new Date();
      const tempDate = date?.getTime() + Number(data) * 24 * 60 * 60 * 1000;
      await saveBills(true, {
        credit_period: data,
        due_date: moment(tempDate)?.format('YYYY-MM-DD'),
      });

      setLocalState((s) => ({ ...s, dueDate: new Date(tempDate) }));
    }
    if (name === 'paymentStatus') {
      if (data?.id === 'personal') {
        setEmployee({ open: true });
        return;
      }
      await saveBills(true, { payment_mode: data?.id });
    }
    if (name === 'payer_id') {
      setEmployee({ open: false });
      await saveBills(true, {
        payment_mode: data?.payment_mode?.id,
        payer_id: data?.payer_id?.id,
      });
      setLocalState((s) => ({
        ...s,
        paymentStatus: data?.payment_mode,
        payer_id: data?.payer_id,
      }));
      return;
    }
    if (name === 'vendor') {
      reValidate({ target: { name, value: data } });

      if (data?.id) {
        fetchAllAddress(data?.id);
      }
      if (data === 'Do not track') {
        setLocalState((s) => ({ ...s, paymentStatus: '', [name]: data }));
        await saveBills(true, { vendor_id: data?.id, payment_mode: '' });
      } else {
        setLocalState((s) => ({ ...s, [name]: data }));
        await saveBills(true, { vendor_id: data?.id });
      }
      setIsVendorAvailable(data?.id ? true : false);

      return;
    }
    if (name === 'date') {
      await saveBills(true, {
        document_date: moment(data).format('YYYY-MM-DD'),
      });
    }
    if (name === 'dueDate') {
      await saveBills(true, { due_date: moment(data).format('YYYY-MM-DD') });
    }
    if (name === 'paidAdvance') {
      await saveBills(true, { payment_mode: 'paid_as_advance' });
    }
    if (state?.selected && name === 'vendor' && !from) {
      setEditConfirm({ open: true, name, data });
      return;
    }
    if (data) setLocalState((s) => ({ ...s, [name]: data }));

    if (data && data.id && name === 'vendor') {
      setLocalState((s) => ({ ...s, [name]: data }));
      setIsVendorAvailable(true);
      reValidate({ target: { name, value: data } });
    }
    if (data === '' && name === 'vendor') {
      setLocalState((s) => ({ ...s, [name]: data }));
      reValidate({ target: { name, value: data } });
    }
    if (localState[name] && !data) return;
    reValidate({ target: { name, value: data } });
  };
  const handleDoNotTrackVendor = async (data) => {
    setHasNoGstin(data);
    const stateName = 'doNotTrack';
    const validationName = 'vendor';
    setValidationErr((v) => ({
      ...v,
      [validationName]: false,
    }));
    setLocalState((s) => ({ ...s, [stateName]: data }));
    setDntCheckbox(data);
    handleBottomSheet('vendor', data ? 'Do not track' : '');
    if (data) {
      await saveBills(true, {
        vendor_id: null,
        id: billId,
      });
    }
  };
  const handleNextBottomSheet = (name, next, data) => {
    if (data) setLocalState((s) => ({ ...s, [name]: data }));
    if (localState[name] && !data) return;
    reValidate({ target: { name, value: data } });
    setDrawer((d) => ({ ...d, [name]: false }));
    setDrawer((d) => ({ ...d, [next]: true }));
  };
  const onCloseVendor = (vendor) => {
    setLocalState((s) => ({ ...s, vendor }));
    setDrawer((d) => ({ ...d, vendor: false }));
    setView(VIEW.MAIN);
  };

  const preparePreviewData = () => {
    const data = [
      { label: 'Vendor', value: localState.vendor?.name },
      { label: 'Amount', value: `Rs. ${localState.amount}` },
      { label: 'Expense Category', value: localState.expenseCategory?.name },
      { label: 'Payment Mode', value: localState.paymentStatus?.label },
      { label: 'Description', value: localState.description },
    ];
    return data;
  };

  useEffect(() => {
    if (pageParams?.id) {
      const {
        name,
        amount,
        document_number: invoiceNo,
        document_date: date,
        expense_category: expenseCategory,
        payment_mode: paymentMode,
        vendor,
        description,
        id,
      } = pageParams;
      const paymentStatus = paymentStatusListWithBill.find(
        (ps) => ps.id === paymentMode,
      );
      setLocalState({
        name,
        amount,
        invoiceNo,
        date: moment(date).format('YYYY-MM-DD'),
        expenseCategory,
        description,
        paymentStatus,
        vendor,
        doNotTrack: false,
      });
      setBillId(id);
      setFilename(id);
    }
  }, [pageParams]);

  const pathName = window.location.pathname;

  React.useEffect(() => {
    if (!haveBill) {
      if (categorizationvendordetails?.id) {
        setLocalState((s) => ({ ...s, vendor: categorizationvendordetails }));
        setLocalState((s) => ({
          ...s,
          paymentStatus: { id: 'company_account', label: 'Paid' },
        }));
        setIsVendorAvailable(
          categorizationvendordetails?.id !== null ||
            categorizationvendordetails?.id !== undefined ||
            categorizationvendordetails?.id !== '',
        );
      }
    }
  }, [haveBill]);

  useEffect(() => {
    if (pathName === '/bill-upload-done' && view === VIEW.MAIN) {
      navigate('/bill-upload');
    }
  }, [pathName]);

  useEffect(() => {
    getExpenseCategory();
    getAssetCategory();
    getVendor();
    fetchOrgLocation();

    if (state?.selected && Object.keys(state?.selected).length !== 0) {
      // editbill(state?.selected?.id);
      setView(VIEW.MAIN);

      // setHaveBill(state?.selected?.vendor_id !== null);

      setBillId(state?.selected?.id);

      setPdfUrl(state?.selected?.file_url);
      if (state?.selected?.vendor_id !== null) setDntCheckbox(false);
      else setDntCheckbox(true);
      const temp = state?.selected?.file_url?.split('.');
      if (state?.selected?.vendor_id !== null && temp) {
        setHaveBill(true);

        setTypeImage(
          temp &&
            (temp[temp?.length - 1] === 'jpeg' ||
              temp[temp?.length - 1] === 'jpg' ||
              temp[temp?.length - 1] === 'png')
            ? 'image/jpeg'
            : 'image/pdf',
        );
      } else {
        setHaveBill(false);
      }
      setIsVendorAvailable(state?.selected?.vendor_id !== null);
      setFilename(' ');
      handleChange();
      setLocalState({
        ...initialState,
        name: state?.selected?.name,
        vendor:
          state?.selected?.vendor_id !== null
            ? state?.selected?.vendor
            : state?.selected?.new_vendor,
        invoiceNo: state?.selected?.document_number,
        date: state?.selected?.document_date,
        dueDate: state?.selected?.due_date || undefined,
        expenseCategory: state?.selected?.expense_account,
        paymentStatus: {
          label: paymentStatusListWithBill?.find(
            (v) => v.id === state?.selected?.payment_mode,
          ).label,
          id: state?.selected?.payment_mode,
        },
        description: state?.selected?.description,
        igst: state?.selected?.igst_amount,
        cgst: state?.selected?.cgst_amount,
        taxAmount: state?.selected?.amount,
        creditPeriod: state?.selected?.credit_period,
      });
      setCalcAmount({
        sgst: state?.selected?.sgst_amount,
        igst: state?.selected?.igst_amount,
        cgst: state?.selected?.cgst_amount,
        taxAmount: state?.selected?.amount,
      });
      setFormattedCalcAmount({
        sgst: state?.selected?.sgst_amount,
        igst: state?.selected?.igst_amount,
        cgst: state?.selected?.cgst_amount,
        taxAmount: state?.selected?.amount,
      });
      // setAmountPayable(state?.selected?.amount);
      setTds(state?.selected?.tds_amount);
      saveBills(true, {
        name: state?.selected?.name,
        document_date: state?.selected?.document_date,
        due_date: state?.selected?.due_date,
        document_number: state?.selected?.document_number,
        description: state?.selected?.description,
        igst_amount: state?.selected?.igst_amount,
        sgst_amount: state?.selected?.sgst_amount,
        cgst_amount: state?.selected?.cgst_amount,
        amount: state?.selected?.amount,
        payment_mode: state?.selected?.payment_mode,
        vendor_id: state?.selected?.vendor_id,
        expense_account_id: state?.selected?.expense_account_id,
        id: state?.selected?.id,
      });
    }

    registerEventListeners({ name: 'ocrDetails', method: fillOcrByFirebaseML });
    return () =>
      deRegisterEventListener({
        name: 'ocrDetails',
        method: fillOcrByFirebaseML,
      });
  }, []);

  useEffect(() => {
    if (localState.expenseCategory) {
      getExpenseCategory();
      getAssetCategory();
    }
  }, [localState.expenseCategory]);

  React.useMemo(async () => {
    // if (
    //   debouncedForAmt ||
    //   debouncedForCgst ||
    //   debouncedForIgst ||
    //   debouncedForDescription ||
    //   debouncedForInvoiceNo
    // ) {
    await saveBills(true, {
      amount: debouncedForAmt,
      sgst_amount: hasNoGstin ? 0 : debouncedForCgst,
      cgst_amount: hasNoGstin ? 0 : debouncedForCgst,
      igst_amount: hasNoGstin ? 0 : debouncedForIgst,
      description: debouncedForDescription,
      document_number: debouncedForInvoiceNo,
    });
    // }
  }, [
    debouncedForAmt,
    debouncedForCgst,
    debouncedForIgst,
    debouncedForDescription,
    debouncedForInvoiceNo,
  ]);

  const handleAmountChange = (e) => {
    reValidate(e);
    const name = e?.target?.name;
    const value = e?.target?.value;
    const formattedValue = e?.target?.formattedValue;
    if (e && e.target) setCalcAmount((prev) => ({ ...prev, [name]: value }));
    if (e && e.target) setLocalState((prev) => ({ ...prev, [name]: value }));
    if (e && e.target && formattedValue)
      setFormattedCalcAmount((prev) => ({ ...prev, [name]: formattedValue }));
  };

  useEffect(() => {
    setLocalState((s) => ({ ...s, amount: amountPayable }));
  }, [amountPayable]);

  React.useEffect(() => {
    if (
      localState?.paymentStatus?.id === 'paid_as_advance' &&
      localState.vendor?.id
    ) {
      getVendorUnsettled();
    }
  }, [localState.vendor?.id, localState?.paymentStatus?.id]);

  const handleWithLocation = (element, locationId) => {
    console.log(locationId);
    handleBottomSheet('vendor', element);
    console.log(locationId);
  };
  const onTriggerDrawerForEdit = (name, element) => {
    setEditValue(element);
    setDrawer((d) => ({ ...d, vendor: false }));
    if (device === 'desktop') {
      setDrawer((d) => ({ ...d, [name]: true }));
    }
    if (device === 'mobile') {
      setView(VIEW.EDIT);
    }
  };

  React.useMemo(() => {
    if (dntCheckbox) {
      setToShowBtn(true);
    } else {
      setToShowBtn(isVendorAvailable);
    }
  }, [isVendorAvailable, dntCheckbox]);

  return (
    <>
      {heading && heading === 'no' ? (
        ''
      ) : (
        <PageTitle
          title="Bill Booking"
          onClick={() => {
            if (device === 'desktop') {
              if (state?.people) {
                navigate('/people', { state: { choose: state?.people?.from } });
              } else {
                navigate(-1);
              }
            }
            if (device === 'mobile') {
              if (state?.people) {
                navigate('/people', { state: { choose: state?.people?.from } });
              } else if (view === VIEW.EDIT) {
                setView(VIEW.MAIN);
              } else if (view === VIEW.SUPER) {
                if (newLoader?.fileId) {
                  setNewLoader((prev) => ({
                    ...prev,
                    continueFlow: true,
                    superAccountSec: false,
                  }));
                }
                setView(VIEW.MAIN);
              } else if (view === VIEW.DONE) {
                setView(VIEW.MAIN);
                onAddAnotherBill();
              } else {
                navigate('/bill');
              }
            }
          }}
        />
      )}
      <div
        className={
          device === 'mobile'
            ? cssDash.dashboardBodyContainerhideNavBar
            : cssDash.dashboardBodyContainerDesktop
        }
      >
        {device === 'desktop' ? (
          <Mui.Stack
            flexDirection={{ xs: 'column', md: 'row' }}
            overflow="auto"
            width="100%"
            justifyContent="space-around"
            height={{ xs: 'auto', md: '95%' }}
          >
            {view === VIEW.MAIN && (
              <>
                <Mui.Stack
                  className={
                    pdfUrl &&
                    filename !== '' &&
                    !newLoader?.continueFlow &&
                    partLoad
                      ? `${css.recordAnExpenseContainerDesktop} ${css.newBackDrop}`
                      : `${css.recordAnExpenseContainerDesktop}`
                  }
                  margin={{ xs: '0 0 5% 0', md: '0 5% 0 0' }}
                  width={{
                    xs: '100%',
                    md: filename === '' && haveBill ? '100%' : '50%',
                  }}
                  height="100%"
                >
                  <div className={css.loaderWithHead}>
                    <Mui.Typography
                      className={
                        categorizationvendordetails &&
                        categorizationvendordetails.name
                          ? css.recordAnExpenseHeadingexternal
                          : css.recordAnExpenseHeading
                      }
                    >
                      Record a Bill
                    </Mui.Typography>
                    {newLoader.loader && <div className={css.loader07} />}
                  </div>
                  {haveBill ? (
                    <>
                      {!pdfUrl && filename === '' && (
                        <Mui.Stack className={css.uploadStackMain}>
                          <input
                            type="file"
                            ref={fileref}
                            name="file"
                            id="file"
                            className="inputfile"
                            accept="image/png, image/jpeg, application/pdf"
                            onChange={onFileUpload}
                            hidden
                          />

                          <label htmlFor="file">
                            <Mui.Stack
                              className={
                                categorizationvendordetails &&
                                categorizationvendordetails.name
                                  ? css.uploadStackexternal
                                  : css.uploadStack
                              }
                              ref={dragfropref}
                            >
                              <Mui.Stack className={css.centerStack}>
                                <img
                                  src={featherupload}
                                  alt="upload"
                                  style={{ width: '120px' }}
                                />
                                <Mui.Typography className={css.text1}>
                                  upload your bills here
                                </Mui.Typography>
                                <Mui.Typography className={css.text2}>
                                  JPG, PNG or PDF
                                </Mui.Typography>

                                <Mui.Stack className={css.button}>
                                  <Mui.Typography className={css.buttontxt}>
                                    Browse
                                  </Mui.Typography>
                                </Mui.Stack>

                                <Mui.Stack
                                  direction="row"
                                  onClick={() => {
                                    handleChange();
                                    setDntCheckbox(false);
                                  }}
                                >
                                  <Mui.Checkbox
                                    checked={selected}
                                    style={{ color: '#A0A4AF' }}
                                    onClick={() => {
                                      handleChange();
                                      setDntCheckbox(false);
                                    }}
                                    value="withoutBill"
                                  />
                                  <Mui.Typography className={css.text3}>
                                    Record Expense Without Bill{' '}
                                  </Mui.Typography>
                                </Mui.Stack>
                              </Mui.Stack>
                            </Mui.Stack>
                          </label>
                        </Mui.Stack>
                      )}
                      {pdfUrl && filename !== '' && (
                        <Mui.Stack className={css.mainView}>
                          {!newLoader?.continueFlow && partLoad && (
                            <div className={css.circularProgress}>
                              <CircularProgress style={{ color: '#F08B32' }} />
                              <p className={css.loaderP}>
                                Please wait until we are getting the data
                              </p>
                            </div>
                          )}
                          <Mui.Stack className={css.imageView}>
                            {typeImage === 'image/jpeg' ||
                            typeImage === 'image/png' ? (
                              <TransformWrapper>
                                <TransformComponent>
                                  <img
                                    src={pdfUrl}
                                    alt="upload"
                                    style={{ width: '100%' }}
                                  />
                                </TransformComponent>
                              </TransformWrapper>
                            ) : (
                              <iframe
                                src={pdfUrl}
                                title="pdf"
                                frameBorder="0"
                                scrolling="no"
                                seamless="seamless"
                                className={css.scrolling}
                                // alt='uploadImg'
                              />
                            )}
                          </Mui.Stack>
                        </Mui.Stack>
                      )}
                    </>
                  ) : (
                    <div className={css.uploadContainerForDesktop}>
                      <div
                        style={{
                          height: 136,
                          width: 141,
                        }}
                      >
                        <img
                          src={alert}
                          alt="alert"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div
                        style={{
                          color: '#6E6E6E',
                          fontSize: '20px',
                          lineHeight: '20px',
                          marginBottom: '5px',
                          textAlign: 'center',
                        }}
                      >
                        It is recommended to always upload a bill especially for
                        any transction above Rs. 2000 for Tax Purposes
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          pointerEvents: state?.selected ? 'none' : '',
                        }}
                        onClick={handleChange}
                      >
                        <Mui.Checkbox
                          checked={unselect}
                          style={{ color: '#A0A4AF', cursor: 'pointer' }}
                          onClick={handleChange}
                          value="withBill"
                        />
                        <div
                          style={{
                            color: '#6E6E6E',
                            fontSize: '16px',
                            lineHeight: '15px',
                            cursor: 'pointer',
                            // fontWeight: 'bold',
                          }}
                        >
                          Record Expense Without Bill{' '}
                        </div>
                      </div>
                    </div>
                  )}
                </Mui.Stack>

                {(!haveBill || filename !== '') && (
                  <Mui.Stack
                    className={css.recordAnExpenseContainerDesktop}
                    width={{
                      xs: '100%',
                      md: '45%',
                    }}
                    height="100%"
                  >
                    <Mui.Stack className={css.mainView}>
                      <Mui.Stack className={css.RecordExp}>
                        <Mui.Typography>Record an Expense</Mui.Typography>
                        <Button
                          onClick={() => {
                            setLocalState(initialState);
                            setCalcAmount(initialCalCAmt);
                            setFormattedCalcAmount(initialCalCAmt);
                            setBillValue(0);
                            setTds(0);
                            setAmountPayable(0);
                            setValidationErr(initialValidationErr);
                          }}
                        >
                          Clear all
                        </Button>
                      </Mui.Stack>
                      <div className={css.inputContainerDesktop}>
                        <Mui.Typography>Basic Info</Mui.Typography>
                        <>
                          <>
                            <SelectBottomSheet
                              id="recordBillVendor"
                              name="vendor"
                              onBlur={(e) => {
                                if (!dntCheckbox) reValidate(e);
                              }}
                              error={validationErr.vendor}
                              helperText={
                                validationErr.vendor
                                  ? (!isVendorAvailable &&
                                      (localState.vendor?.name ||
                                        localState.vendor) &&
                                      'Add This vendor to the list') ||
                                    VALIDATION?.vendor?.errMsg
                                  : ''
                              }
                              Vendor_id={localState?.showReloadBtn}
                              showAddText={
                                !isVendorAvailable &&
                                (localState.vendor?.name || localState.vendor)
                                  ? 'Add This Vendor'
                                  : 'Add Vendor'
                              }
                              label="Vendor"
                              open={drawer.vendor}
                              value={
                                localState.vendor?.name
                                  ? localState.vendor?.name
                                  : localState.vendor
                              }
                              toShow={toShowBtn}
                              onTrigger={onTriggerDrawer}
                              onClose={() => {
                                if (dntCheckbox) {
                                  handleBottomSheet('vendor', 'Do not track');
                                } else {
                                  handleBottomSheet('vendor');
                                }
                                setPagination({
                                  totalPage: 1,
                                  currentPage: 1,
                                });
                              }}
                              required={!dntCheckbox}
                              disabled={categorizationvendordetails?.id}
                              classNames="vendorSelection"
                            >
                              {trigger === 'addManually' && (
                                <VendorList
                                  trigger={trigger}
                                  vendorList={vendorList}
                                  setIsVendorAvailable={setIsVendorAvailable}
                                  valOfSelection={handleBottomSheet}
                                  onClick={(ps) => {
                                    handleBottomSheet('vendor', ps);
                                  }}
                                  onDoNotTrackVendor={(ps) =>
                                    handleDoNotTrackVendor(ps)
                                  }
                                  dntCheckbox={dntCheckbox}
                                  // setDntCheckbox={setDntCheckbox}
                                  continueFlow={() =>
                                    setDrawer((d) => ({
                                      ...d,
                                      vendor: false,
                                    }))
                                  }
                                  updateVendorList={getVendor}
                                  details={fetchDetails}
                                  closeAddVendor={() =>
                                    setDrawer((d) => ({
                                      ...d,
                                      vendor: false,
                                    }))
                                  }
                                  panEnable
                                />
                              )}
                              {trigger === 'list' && (
                                <CustomSearch
                                  showType="Vendor"
                                  customerList={vendorList}
                                  callFunction={getVendor}
                                  handleLocationParties={handleWithLocation}
                                  handleAllParties={(ps) =>
                                    handleBottomSheet('vendor', ps)
                                  }
                                  addNewOne={() => setTrigger('addManually')}
                                  openDrawer={onTriggerDrawerForEdit}
                                  dntCheckbox={dntCheckbox}
                                  onDoNotTrackVendor={(ps) =>
                                    handleDoNotTrackVendor(ps)
                                  }
                                  details={fetchDetails}
                                  from="billBooking"
                                  hideLocation
                                  pagination={pagination}
                                  setPagination={setPagination}
                                />
                              )}
                            </SelectBottomSheet>

                            <SelectBottomSheet
                              name="edit"
                              triggerComponent={
                                <div style={{ display: 'none' }} />
                              }
                              open={drawer.edit}
                              onTrigger={onTriggerDrawer}
                              onClose={handleBottomSheet}
                              maxHeight="45vh"
                            >
                              <div style={{ padding: '15px' }}>
                                {device === 'mobile' && <Puller />}
                                <div
                                  style={{ padding: '5px 0' }}
                                  className={css.headerContainer}
                                >
                                  <p className={css.headerLabel}>
                                    {editValue?.name}
                                  </p>
                                  <span className={css.headerUnderline} />
                                </div>
                                <InvoiceCustomer
                                  showValue={editValue}
                                  handleBottomSheet={handleBottomSheet}
                                  type="vendors"
                                  openFrom="billBooking"
                                />
                              </div>
                            </SelectBottomSheet>
                            {haveBill && (
                              <Input
                                required
                                name="invoiceNo"
                                error={validationErr.invoiceNo}
                                helperText={
                                  validationErr.invoiceNo
                                    ? VALIDATION?.invoiceNo?.errMsg
                                    : ''
                                }
                                onBlur={reValidate}
                                className={`${css.greyBorder} ${classes.root}`}
                                label="Document Number"
                                variant="standard"
                                value={localState.invoiceNo}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                InputProps={{
                                  type: 'text',
                                  // endAdornment: vendorAvailable ? <CheckCircle /> : null,
                                }}
                                fullWidth
                                onChange={onInputChange}
                                theme="light"
                              />
                            )}
                          </>
                          <SelectBottomSheet
                            name="date"
                            id="dateForDesktop"
                            onBlur={reValidate}
                            error={validationErr.date}
                            helperText={
                              validationErr.date ? VALIDATION?.date?.errMsg : ''
                            }
                            label="Document Date"
                            value={
                              localState.date === ''
                                ? ''
                                : moment(localState.date).format('DD-MM-YYYY')
                            }
                            required
                            dateChange={handleBottomSheet}
                            selectedDate={localState.date}
                          />
                          <SelectBottomSheet
                            name="dueDate"
                            id="dueDateForDesktop"
                            onBlur={reValidate}
                            label="Due Date"
                            value={
                              localState.dueDate === ''
                                ? ''
                                : moment(localState.dueDate).format(
                                    'DD-MM-YYYY',
                                  )
                            }
                            required
                            dateChange={handleBottomSheet}
                            selectedDate={localState.dueDate}
                          />
                        </>

                        <Mui.Divider
                          style={{ backgroundColor: '#DCDCDC' }}
                          className={css.dividerHR}
                          width="100%"
                        />

                        <Mui.Typography>Accounting</Mui.Typography>
                        <>
                          <SelectBottomSheet
                            name="expenseCategory"
                            onBlur={reValidate}
                            error={validationErr.expenseCategory}
                            helperText={
                              validationErr.expenseCategory
                                ? VALIDATION?.expenseCategory?.errMsg
                                : ''
                            }
                            label="Select Category"
                            open={drawer.expenseCategory}
                            value={localState.expenseCategory?.name}
                            onTrigger={onTriggerDrawer}
                            onClose={handleBottomSheet}
                            required
                            id="overFlowHidden"
                            classNames="expenseCategoryClass"
                          >
                            <ExpenseCategoryList
                              expenseCategoryList={expenseCategoryList}
                              assetCategoryList={assetCategoryList}
                              onClick={(ps) =>
                                handleBottomSheet('expenseCategory', ps)
                              }
                              hasTDSCategory={false}
                              categoryListOpen={drawer.expenseCategory}
                            />
                          </SelectBottomSheet>

                          <Input
                            required
                            name="taxAmount"
                            // disabled={localState.noGst}
                            onBlur={reValidate}
                            error={validationErr.taxAmount}
                            helperText={
                              validationErr.taxAmount
                                ? VALIDATION?.taxAmount?.errMsg
                                : ''
                            }
                            className={`${css.greyBorder} ${classes.root}`}
                            label="Taxable Value"
                            variant="standard"
                            InputLabelProps={{
                              shrink: true,
                            }}
                            InputProps={{
                              inputComponent: PriceCustom,
                              // endAdornment: vendorAvailable ? <CheckCircle /> : null,
                            }}
                            fullWidth
                            value={calcAmount?.taxAmount}
                            onChange={(event) => handleAmountChange(event)}
                            theme="light"
                          />
                          {!hasNoGstin && (
                            <Input
                              required
                              name="cgst"
                              // disabled={localState.noGst}
                              onBlur={reValidate}
                              error={validationErr.cgst}
                              helperText={
                                validationErr.cgst
                                  ? VALIDATION?.cgst?.errMsg
                                  : ''
                              }
                              className={`${css.greyBorder} ${classes.root}`}
                              label="CGST credit"
                              variant="standard"
                              InputLabelProps={{
                                shrink: true,
                              }}
                              InputProps={{
                                inputComponent: PriceCustom,
                                // endAdornment: vendorAvailable ? <CheckCircle /> : null,
                              }}
                              fullWidth
                              value={calcAmount?.cgst}
                              onChange={(event) => handleAmountChange(event)}
                              theme="light"
                              disabled={calcAmount?.igst > 0}
                            />
                          )}
                          {!hasNoGstin && (
                            <Input
                              required
                              name="cgst"
                              // disabled={localState.noGst}
                              onBlur={reValidate}
                              error={validationErr.cgst}
                              helperText={
                                validationErr.cgst
                                  ? VALIDATION?.cgst?.errMsg
                                  : ''
                              }
                              className={`${css.greyBorder} ${classes.root}`}
                              label="SGST credit"
                              variant="standard"
                              InputLabelProps={{
                                shrink: true,
                              }}
                              InputProps={{
                                inputComponent: PriceCustom,
                                // endAdornment: vendorAvailable ? <CheckCircle /> : null,
                              }}
                              fullWidth
                              value={calcAmount?.cgst}
                              onChange={(event) => handleAmountChange(event)}
                              theme="light"
                              disabled={calcAmount?.igst > 0}
                            />
                          )}
                          {!hasNoGstin && (
                            <Input
                              name="igst"
                              required
                              // disabled={localState.noGst}
                              onBlur={reValidate}
                              error={validationErr.igst}
                              helperText={
                                validationErr.igst
                                  ? VALIDATION?.igst?.errMsg
                                  : ''
                              }
                              className={`${css.greyBorder} ${classes.root}`}
                              label="IGST credit"
                              variant="standard"
                              InputLabelProps={{
                                shrink: true,
                              }}
                              InputProps={{
                                inputComponent: PriceCustom,
                                // endAdornment: vendorAvailable ? <CheckCircle /> : null,
                              }}
                              fullWidth
                              value={calcAmount?.igst}
                              onChange={(event) => handleAmountChange(event)}
                              theme="light"
                              disabled={calcAmount?.cgst > 0}
                            />
                          )}

                          <Input
                            name="billValue"
                            className={`${css.yBorder} ${classes.root}`}
                            label="Bill Value"
                            variant="standard"
                            value={billValue}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            InputProps={{
                              inputComponent: PriceCustom,
                              // endAdornment: vendorAvailable ? <CheckCircle /> : null,
                            }}
                            fullWidth
                            // onChange={onInputChange}
                            theme="light"
                            style={{
                              background: '#EDEDED',
                              PointerEvent: 'none',
                            }}
                            disabled
                          />

                          <Input
                            name="tds"
                            className={`${css.greyBorder} ${classes.root}`}
                            label="TDS"
                            variant="standard"
                            value={billValue > 0 ? tds : 0}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            InputProps={{
                              inputComponent: PriceCustom,
                              // endAdornment: vendorAvailable ? <CheckCircle /> : null,
                            }}
                            fullWidth
                            // onChange={onInputChange}
                            theme="light"
                            style={{
                              background: '#EDEDED',
                              PointerEvent: 'none',
                            }}
                            disabled
                          />

                          <Input
                            required
                            name="amount"
                            className={`${css.greyBorder} ${classes.root}`}
                            label="Net Payable"
                            variant="standard"
                            value={billValue > 0 ? amountPayable : 0}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            InputProps={{
                              inputComponent: PriceCustom,
                              // endAdornment: vendorAvailable ? <CheckCircle /> : null,
                            }}
                            fullWidth
                            // onChange={onInputChange}
                            theme="light"
                            style={{
                              background: '#EDEDED',
                              PointerEvent: 'none',
                            }}
                            disabled
                          />
                          {
                            <SelectBottomSheet
                              name="paymentStatus"
                              onBlur={reValidate}
                              error={validationErr.paymentStatus}
                              helperText={
                                validationErr.paymentStatus
                                  ? VALIDATION?.paymentStatus?.errMsg
                                  : ''
                              }
                              label="Payment Status"
                              open={drawer.paymentStatus}
                              value={
                                localState.paymentStatus?.id === 'personal'
                                  ? `${localState.paymentStatus?.label} - ${localState?.payer_id?.name}`
                                  : localState.paymentStatus?.label
                              }
                              onTrigger={onTriggerDrawer}
                              onClose={handleBottomSheet}
                              required
                              disabled={categorizationvendordetails?.id}
                              classNames="PaymentStatusClass"
                            >
                              {!dntCheckbox
                                ? paymentStatusListWithBill.map((ps) => (
                                    <div
                                      className={css.categoryOptions}
                                      key={ps.id}
                                      role="menuitem"
                                    >
                                      {ps.id === 'paid_as_advance' ? (
                                        <div
                                          style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                          }}
                                          onClick={() => {
                                            handleNextBottomSheet(
                                              'paymentStatus',
                                              'paidAdvance',
                                              ps,
                                            );
                                            // getVendorUnsettled();
                                          }}
                                        >
                                          <div>{ps.label}</div>
                                          <div
                                            style={{
                                              height: '18px',
                                              width: '10px',
                                              marginLeft: '13.42px',
                                              display: 'flex',
                                              alignItems: 'center',
                                            }}
                                          >
                                            <img
                                              src={rightArrow}
                                              alt="right-arrow"
                                              style={{
                                                height: '100%',
                                                width: '100%',
                                                objectFit: 'contain',
                                              }}
                                            />
                                            {localState?.paymentStatus?.id ===
                                              ps.id && (
                                              <MuiIcon.Done
                                                style={{ color: '#f08b32' }}
                                              />
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        <div
                                          onClick={() =>
                                            handleBottomSheet(
                                              'paymentStatus',
                                              ps,
                                            )
                                          }
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                          }}
                                        >
                                          {ps.label}
                                          {ps?.icon && (
                                            <img
                                              src={rightArrow}
                                              alt="right-arrow"
                                              style={{ margin: '0 10px' }}
                                            />
                                          )}
                                          {localState?.paymentStatus?.id ===
                                            ps.id && (
                                            <MuiIcon.Done
                                              style={{ color: '#f08b32' }}
                                            />
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))
                                : paymentStatusListWithoutBill.map((ps) => (
                                    <div
                                      className={css.categoryOptions}
                                      key={ps.id}
                                      role="menuitem"
                                    >
                                      <div
                                        onClick={() =>
                                          handleBottomSheet('paymentStatus', ps)
                                        }
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                        }}
                                      >
                                        {ps.label}
                                        {localState?.paymentStatus?.id ===
                                          ps.id && (
                                          <MuiIcon.Done
                                            style={{ color: '#f08b32' }}
                                          />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                            </SelectBottomSheet>
                          }
                        </>

                        {localState?.paymentStatus?.id ===
                          'paid_as_advance' && (
                          <>
                            <Mui.Divider
                              style={{ backgroundColor: '#DCDCDC' }}
                              className={css.dividerHR}
                              width="100%"
                            />
                            <Mui.Typography>Advances To Adjust</Mui.Typography>
                            <Mui.TableContainer
                              style={{
                                borderRadius: 30,
                                // maxHeight: '59vh',
                                height: 'max-content',
                              }}
                              className={css.tableDiv}
                            >
                              <Mui.Table
                                stickyHeader
                                size="medium"
                                style={{ background: '#ffff' }}
                              >
                                <Mui.TableHead
                                  sx={{
                                    bgcolor: '#0000',
                                    fontSize: '13px',
                                    borderColor: (theme) =>
                                      theme.palette.grey[100],
                                  }}
                                >
                                  {['Date', 'Area', 'Money'].map((title) => (
                                    <Mui.TableCell>
                                      <Mui.Typography className={css.tableHead}>
                                        {title}
                                      </Mui.Typography>
                                    </Mui.TableCell>
                                  ))}
                                </Mui.TableHead>

                                <Mui.TableBody>
                                  {/* {customerData?.map((value) => ( */}
                                  {vendorsUnsettledList &&
                                  vendorsUnsettledList.length > 0 ? (
                                    vendorsUnsettledList.map((item) => (
                                      <Mui.TableRow
                                        sx={{
                                          borderColor: (theme) =>
                                            theme.palette.grey[100],
                                        }}
                                      >
                                        <>
                                          <Mui.TableCell
                                            className={css.tableCell}
                                          >
                                            <Mui.Typography
                                              nowrap
                                              variant="body2"
                                              className={css.tableBillNumber}
                                              noWrap
                                            >
                                              <Checkbox
                                                onClick={() =>
                                                  hangleChecked(item.id)
                                                }
                                                inputProps={{
                                                  'aria-label': 'controlled',
                                                }}
                                                value={item}
                                              />
                                              {moment(item?.date).format(
                                                'DD-MM-YYYY',
                                              )}
                                            </Mui.Typography>
                                          </Mui.TableCell>
                                          <Mui.TableCell
                                            className={css.tableCell}
                                          >
                                            <Mui.Typography
                                              variant="body2"
                                              className={css.tableFont}
                                            >
                                              {item?.document_number}
                                            </Mui.Typography>
                                            {/* <Mui.TableCell> */}
                                            <Mui.Typography
                                              variant="body2"
                                              className={css.tableFontSm}
                                            >
                                              {item?.narration}
                                            </Mui.Typography>
                                            {/* </Mui.TableCell> */}
                                          </Mui.TableCell>
                                          <Mui.TableCell
                                            className={css.tableCell}
                                          >
                                            <Mui.Typography
                                              nowrap
                                              variant="body2"
                                              className={css.tableBillNumber2}
                                              noWrap
                                            >
                                              {FormattedAmount(
                                                item?.net_balance,
                                              )}
                                            </Mui.Typography>
                                          </Mui.TableCell>
                                        </>
                                      </Mui.TableRow>
                                    ))
                                  ) : (
                                    <Mui.TableRow
                                      sx={{
                                        borderColor: (theme) =>
                                          theme.palette.grey[100],
                                      }}
                                    >
                                      <Mui.TableCell
                                        className={css.tableCell}
                                        colSpan={3}
                                      >
                                        <Mui.Typography
                                          nowrap
                                          variant="body2"
                                          className={css.tableNoBill}
                                          align="center"
                                        >
                                          No Advance Bill
                                        </Mui.Typography>
                                      </Mui.TableCell>
                                    </Mui.TableRow>
                                  )}
                                </Mui.TableBody>
                              </Mui.Table>
                            </Mui.TableContainer>
                          </>
                        )}
                        {localState?.paymentStatus?.id === 'to_pay' && (
                          <PaymentTerms
                            fromBill={true}
                            callFunction={(val) =>
                              handleBottomSheet(
                                'creditPeriod',
                                val?.credit_period,
                              )
                            }
                            selectCustomer={{
                              credit_period: localState?.creditPeriod || 0,
                            }}
                          />
                        )}

                        <Mui.Divider
                          style={{ backgroundColor: '#DCDCDC' }}
                          className={css.dividerHR}
                          width="100%"
                        />

                        <Mui.Typography>Internal Notes</Mui.Typography>
                        <>
                          <Input
                            name="description"
                            onBlur={reValidate}
                            error={validationErr.description}
                            helperText={
                              validationErr.description
                                ? VALIDATION?.description?.errMsg
                                : ''
                            }
                            label="Note"
                            placeholder="what's this for"
                            variant="standard"
                            className={`${css.greyBorder} ${classes.root}`}
                            value={localState.description}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            fullWidth
                            onChange={(event) => onInputChange(event)}
                            theme="light"
                            multiline
                            rows={4}
                          />
                        </>

                        <Mui.Stack className={css.buttons}>
                          <Mui.Grid
                            item
                            xs={12}
                            display="flex"
                            justifyContent="center"
                          >
                            <input
                              type="button"
                              className={css.button0}
                              onClick={() => {
                                onRecordBill();
                              }}
                              value="Record and Proceed to next bill"
                            />
                          </Mui.Grid>
                          {haveBill && (
                            <Mui.Grid
                              item
                              xs={12}
                              display="flex"
                              justifyContent="center"
                              mb="15px"
                            >
                              <Mui.Button
                                variant="contained"
                                style={{
                                  boxShadow: 'none',
                                  textTransform: 'initial',
                                  backgroundColor: '#fff',
                                  color: '#f08b32',
                                  border: '1px solid #f08b32',
                                  borderRadius: '18px',
                                  fontSize: '13px',
                                  width: '90%',
                                }}
                                onClick={() => {
                                  setNewLoader((prev) => ({
                                    ...prev,
                                    superAccount: true,
                                  }));
                                }}
                              >
                                Assign to SuperAccountant
                              </Mui.Button>
                            </Mui.Grid>
                          )}
                        </Mui.Stack>
                      </div>
                      {/* </div> */}
                    </Mui.Stack>
                  </Mui.Stack>
                )}
              </>
            )}
            {view === VIEW.DONE && (
              <SuccessView
                title="Done"
                description={`${response?.expense_account?.name} ${
                  response?.status
                } ${
                  response?.vendor?.name ? `to ${response?.vendor?.name}` : ''
                } for Rs. ${response?.amount} has been recorded`}
                onClick={onAddAnotherBill}
              />
            )}
          </Mui.Stack>
        ) : (
          <>
            <div
              className={css.recordAnExpenseContainer}
              style={{
                padding:
                  view === VIEW.EDIT
                    ? '20px 10px'
                    : (view === VIEW.SUPER && '5%') || '20px',
                overflow: view === VIEW.SUPER ? 'unset' : 'auto',
                width: view === VIEW.SUPER && '90%',
              }}
            >
              <div className={css.headerContainer}>
                <div className={css.headerLabel}>
                  {view === VIEW.MAIN && 'Record an Expense'}
                  {view === VIEW.VENDOR && 'Add New Vendor'}
                  {view === VIEW.DONE && 'Bill Status'}
                  {view === VIEW.EDIT && editValue?.name}
                  {view === VIEW.SUPER && 'Assign to SuperAccountant'}
                </div>
                <span className={css.headerUnderline} />
              </div>
              {view === VIEW.MAIN && (
                <>
                  <div className={css.inputContainer}>
                    {haveBill ? (
                      <div
                        className={
                          pdfUrl && filename !== '' && partLoad
                            ? `${css.uploadContainer} ${css.newBackDropMob}`
                            : `${css.uploadContainer}`
                        }
                      >
                        {pdfUrl && filename !== '' && partLoad && (
                          <div className={css.circularProgress}>
                            <CircularProgress style={{ color: '#F08B32' }} />
                            <p className={css.loaderP}>
                              Please wait until we are getting the data
                            </p>
                          </div>
                        )}
                        {filename !== '' && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '0',
                              left: '0',
                              right: '0',
                              bottom: '0',
                              width: '100%',
                              height: '100%',
                              background: '#000000',
                              opacity: '.3',
                            }}
                          />
                        )}
                        {!partLoad && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 5,
                              width: '90%',
                            }}
                          >
                            <input
                              id="upload"
                              name="avatar"
                              type="file"
                              accept="image/png, image/jpeg, application/pdf"
                              onChange={onFileUpload}
                            />
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                width: '100%',
                              }}
                            >
                              <CloudUpload className={css.icon} />
                              <div className={css.title}>
                                {filename || 'Upload your bills here'}
                              </div>
                            </div>
                            <div className={css.uploadActionContainer}>
                              {window.isDevice() === true ? (
                                <Button
                                  className={`${css.submitButton}`}
                                  onClick={() => {
                                    ocrByScan();
                                  }}
                                >
                                  Scan
                                </Button>
                              ) : (
                                <label
                                  className={`${css.submitButton}`}
                                  htmlFor="upload"
                                  style={{
                                    pointerEvents: state?.selected
                                      ? 'none'
                                      : '',
                                  }}
                                >
                                  Scan
                                </label>
                              )}

                              {window.isDevice() === true ? (
                                <Button
                                  className={`${css.submitButton}`}
                                  onClick={() => {
                                    ocrByBrowse();
                                  }}
                                >
                                  Browse
                                </Button>
                              ) : (
                                <label
                                  className={`${css.submitButton}`}
                                  htmlFor="upload"
                                  style={{
                                    pointerEvents: state?.selected
                                      ? 'none'
                                      : '',
                                  }}
                                >
                                  Browse
                                </label>
                              )}
                            </div>
                            <div
                              style={{
                                height: '3px',
                                width: '100%',
                                backgroundColor: '#000000',
                              }}
                            />
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: state?.selected ? 'none' : '',
                              }}
                              onClick={handleChange}
                            >
                              <Mui.Checkbox
                                checked={selected}
                                style={{ color: '#A0A4AF' }}
                                onClick={handleChange}
                                value="withoutBill"
                              />
                              <div>Record Expense Without Bill </div>
                            </div>
                          </div>
                        )}

                        {filename !== '' && (
                          <iframe
                            src={pdfUrl}
                            title="pdf"
                            frameBorder="0"
                            scrolling="no"
                            seamless="seamless"
                            className={css.scrolling}
                          />
                        )}
                      </div>
                    ) : (
                      <div className={css.uploadContainer}>
                        <div
                          style={{
                            height: '80px',
                            width: '89px',
                            marginBottom: '23px',
                            paddingTop: '5px',
                          }}
                        >
                          <img
                            src={alert}
                            alt="alert"
                            style={{ height: '100%', width: '100%' }}
                          />
                        </div>
                        <div
                          style={{
                            color: '#6E6E6E',
                            fontSize: '12px',
                            lineHeight: '15px',
                            marginBottom: '5px',
                            textAlign: 'center',
                          }}
                        >
                          It is recommended to always upload a bill especially
                          for any transction above Rs. 2000 for Tax Purposes
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: state?.selected ? 'none' : '',
                          }}
                          onClick={handleChange}
                        >
                          <Mui.Checkbox
                            checked={unselect}
                            style={{ color: '#A0A4AF' }}
                            onClick={handleChange}
                            value="withBill"
                          />
                          <div
                            style={{
                              color: '#6E6E6E',
                              fontSize: '16px',
                              lineHeight: '15px',
                              // fontWeight: 'bold',
                            }}
                          >
                            Record Expense Without Bill{' '}
                          </div>
                        </div>
                      </div>
                    )}
                    <SelectBottomSheet
                      name="expenseCategory"
                      onBlur={reValidate}
                      error={validationErr.expenseCategory}
                      helperText={
                        validationErr.expenseCategory
                          ? VALIDATION?.expenseCategory?.errMsg
                          : ''
                      }
                      label="Select Category"
                      open={drawer.expenseCategory}
                      value={localState.expenseCategory?.name}
                      onTrigger={onTriggerDrawer}
                      onClose={handleBottomSheet}
                      required
                      id="overFlowHidden"
                      classNames="expenseCategoryClass"
                    >
                      <ExpenseCategoryList
                        expenseCategoryList={expenseCategoryList}
                        assetCategoryList={assetCategoryList}
                        onClick={(ps) =>
                          handleBottomSheet('expenseCategory', ps)
                        }
                        hasTDSCategory={false}
                        categoryListOpen={drawer.expenseCategory}
                      />
                    </SelectBottomSheet>
                    <SelectBottomSheet
                      id="recordBillVendor"
                      name="vendor"
                      onBlur={(e) => {
                        if (!dntCheckbox) reValidate(e);
                      }}
                      error={validationErr.vendor}
                      helperText={
                        validationErr.vendor
                          ? (!isVendorAvailable &&
                              (localState.vendor?.name || localState.vendor) &&
                              'Add This vendor to the list') ||
                            VALIDATION?.vendor?.errMsg
                          : ''
                      }
                      Vendor_id={localState?.showReloadBtn}
                      label="Vendor"
                      open={drawer.vendor}
                      value={
                        localState.vendor?.name
                          ? localState.vendor?.name
                          : localState.vendor
                      }
                      toShow={toShowBtn}
                      onTrigger={onTriggerDrawer}
                      onClose={() => {
                        if (dntCheckbox) {
                          handleBottomSheet('vendor', 'Do not track');
                        } else {
                          handleBottomSheet('vendor');
                        }
                        setPagination({
                          totalPage: 1,
                          currentPage: 1,
                        });
                      }}
                      required={!dntCheckbox}
                      addNewSheet={!(trigger === 'list')}
                      showAddText={
                        !isVendorAvailable &&
                        (localState.vendor?.name || localState.vendor)
                          ? 'Add This Vendor'
                          : 'Add Vendor'
                      }
                      disabled={categorizationvendordetails?.id}
                      classNames="vendorSelection"
                    >
                      {trigger === 'addManually' && (
                        <VendorList
                          trigger={trigger}
                          vendorList={vendorList}
                          valOfSelection={handleBottomSheet}
                          onClick={(ps) => handleBottomSheet('vendor', ps)}
                          onDoNotTrackVendor={(ps) =>
                            handleDoNotTrackVendor(ps)
                          }
                          dntCheckbox={dntCheckbox}
                          // setDntCheckbox={setDntCheckbox}
                          continueFlow={() =>
                            setDrawer((d) => ({ ...d, vendor: false }))
                          }
                          updateVendorList={getVendor}
                          details={fetchDetails}
                          panEnable
                        />
                      )}
                      {trigger === 'list' && (
                        <CustomSearch
                          showType="Vendor"
                          customerList={vendorList}
                          callFunction={getVendor}
                          handleLocationParties={handleWithLocation}
                          handleAllParties={(ps) =>
                            handleBottomSheet('vendor', ps)
                          }
                          addNewOne={() => setTrigger('addManually')}
                          openDrawer={onTriggerDrawerForEdit}
                          dntCheckbox={dntCheckbox}
                          onDoNotTrackVendor={(ps) =>
                            handleDoNotTrackVendor(ps)
                          }
                          details={fetchDetails}
                          from="billBooking"
                          pagination={pagination}
                          setPagination={setPagination}
                        />
                      )}
                    </SelectBottomSheet>
                    {/* )} */}
                    <SelectBottomSheet
                      name="amount"
                      onBlur={reValidate}
                      error={validationErr.amount}
                      helperText={
                        validationErr.amount ? VALIDATION?.amount?.errMsg : ''
                      }
                      className={`${css.greyBorder} ${classes.root}`}
                      label="Amount Payable"
                      open={drawer.amount}
                      value={billValue > 0 ? FormattedAmount(amountPayable) : 0}
                      onTrigger={onTriggerDrawer}
                      onClose={handleBottomSheet}
                      required
                      addNewSheet
                    >
                      <div className={css.amountPayable}>
                        <div className={css.header}>
                          <div className={css.valueHeader}>
                            Amount Payable Details
                          </div>
                          <div className={css.headerUnderline} />
                        </div>
                        <div className={css.row}>
                          <div className={css.lable}> Taxable Amount </div>
                          <div className={css.inputFieldWrapper}>
                            <AmountFormatCustom
                              align="right"
                              className={css.inputField}
                              name="taxAmount"
                              value={formattedCalcAmount?.taxAmount}
                              onChange={(event) => handleAmountChange(event)}
                              id="taxAmount"
                              onFocus={(e) => {
                                setTimeout(function () {
                                  e.target.selectionStart =
                                    e.target.selectionEnd =
                                      e?.target?.value?.length;
                                }, 0);
                              }}
                            />
                          </div>
                        </div>
                        {!hasNoGstin && (
                          <div className={css.row}>
                            <div className={css.lable}> CGST </div>
                            <div
                              className={
                                calcAmount?.igst > 0
                                  ? css.inputHidden
                                  : css.inputFieldWrapper
                              }
                            >
                              <AmountFormatCustom
                                align="right"
                                className={css.inputField}
                                name="cgst"
                                value={formattedCalcAmount?.cgst}
                                onChange={(event) => handleAmountChange(event)}
                                id="cgst"
                                onFocus={(e) => {
                                  setTimeout(function () {
                                    e.target.selectionStart =
                                      e.target.selectionEnd =
                                        e?.target?.value?.length;
                                  }, 0);
                                }}
                              />
                            </div>
                          </div>
                        )}
                        {!hasNoGstin && (
                          <div className={css.row}>
                            <div className={css.lable}> SGST</div>
                            <div
                              className={
                                calcAmount?.igst > 0
                                  ? css.inputHidden
                                  : css.inputFieldWrapper
                              }
                            >
                              <AmountFormatCustom
                                align="right"
                                className={css.inputField}
                                name="cgst"
                                value={formattedCalcAmount?.cgst}
                                onChange={(event) => handleAmountChange(event)}
                                id="sgst"
                                onFocus={(e) => {
                                  setTimeout(function () {
                                    e.target.selectionStart =
                                      e.target.selectionEnd =
                                        e?.target?.value?.length;
                                  }, 0);
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {!hasNoGstin && (
                          <div className={css.row}>
                            <div className={css.lable}> IGST </div>
                            <div
                              className={
                                calcAmount?.cgst > 0
                                  ? css.inputHidden
                                  : css.inputFieldWrapper
                              }
                            >
                              <AmountFormatCustom
                                align="right"
                                className={css.inputField}
                                name="igst"
                                value={formattedCalcAmount?.igst}
                                onChange={(event) => handleAmountChange(event)}
                                id="igst"
                                onFocus={(e) => {
                                  setTimeout(function () {
                                    e.target.selectionStart =
                                      e.target.selectionEnd =
                                        e?.target?.value?.length;
                                  }, 0);
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <div className={css.row}>
                          <div className={css.lable}>Bill Value </div>
                          <input
                            className={css.autoFillDetails}
                            // type="number"
                            value={FormattedAmount(billValue)}
                          />
                        </div>
                        <div className={css.row}>
                          <div className={css.lable}>TDS</div>
                          <input
                            className={css.autoFillDetails}
                            // type="number"
                            value={billValue > 0 ? FormattedAmount(tds) : 0}
                          />
                        </div>
                        <div className={css.row}>
                          <div className={css.lable}>Amount Payable</div>
                          <input
                            className={css.autoFillDetails}
                            // type="number"
                            value={
                              billValue > 0 ? FormattedAmount(amountPayable) : 0
                            }
                          />
                        </div>
                        <div className={css.buttonContainer}>
                          <Button
                            className={css.submitButton}
                            onClick={() => {
                              handleBottomSheet('amount', amountPayable);
                            }}
                          >
                            Save Details
                          </Button>
                        </div>
                      </div>
                    </SelectBottomSheet>
                    {haveBill && (
                      <Input
                        name="invoiceNo"
                        onBlur={reValidate}
                        error={validationErr.invoiceNo}
                        helperText={
                          validationErr.invoiceNo
                            ? VALIDATION?.invoiceNo?.errMsg
                            : ''
                        }
                        className={`${css.greyBorder} ${classes.root}`}
                        label="Invoice No"
                        variant="standard"
                        value={localState.invoiceNo}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        fullWidth
                        onChange={onInputChange}
                        theme="light"
                        required={haveBill}
                      />
                    )}
                    <SelectBottomSheet
                      name="date"
                      onBlur={reValidate}
                      error={validationErr.date}
                      helperText={
                        validationErr.date ? VALIDATION?.date?.errMsg : ''
                      }
                      label="Date"
                      open={drawer.date}
                      value={
                        localState.date === ''
                          ? 'dd-mm-yyyy'
                          : moment(localState.date).format('DD-MM-YYYY')
                      }
                      onTrigger={onTriggerDrawer}
                      onClose={handleBottomSheet}
                      required
                      addNewSheet
                    >
                      <Calender
                        head="Choose Date"
                        button="Select"
                        handleDate={handleDate}
                      />
                    </SelectBottomSheet>
                    <SelectBottomSheet
                      name="paymentStatus"
                      onBlur={reValidate}
                      error={validationErr.paymentStatus}
                      helperText={
                        validationErr.paymentStatus
                          ? VALIDATION?.paymentStatus?.errMsg
                          : ''
                      }
                      label="Payment Status"
                      open={drawer.paymentStatus}
                      value={
                        localState.paymentStatus?.id === 'personal'
                          ? `${localState.paymentStatus?.label} - ${localState?.payer_id?.name}`
                          : localState.paymentStatus?.label
                      }
                      onTrigger={onTriggerDrawer}
                      onClose={handleBottomSheet}
                      required
                      addNewSheet
                      disabled={categorizationvendordetails?.id}
                      classNames="PaymentStatusClass"
                    >
                      {!dntCheckbox
                        ? paymentStatusListWithBill.map((ps) => (
                            <div
                              className={css.categoryOptions}
                              key={ps.id}
                              role="menuitem"
                            >
                              {ps.id === 'paid_as_advance' ? (
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}
                                  onClick={() => {
                                    handleNextBottomSheet(
                                      'paymentStatus',
                                      'paidAdvance',
                                      ps,
                                    );
                                    // getVendorUnsettled();
                                  }}
                                >
                                  <div>{ps.label}</div>
                                  <div
                                    style={{
                                      height: '18px',
                                      width: '10px',
                                      marginLeft: '13.42px',
                                      display: 'flex',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <img
                                      src={rightArrow}
                                      alt="right-arrow"
                                      style={{
                                        height: '100%',
                                        width: '100%',
                                        objectFit: 'contain',
                                      }}
                                    />
                                    {localState?.paymentStatus?.id ===
                                      ps.id && (
                                      <MuiIcon.Done
                                        style={{ color: '#f08b32' }}
                                      />
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div
                                  onClick={() =>
                                    handleBottomSheet('paymentStatus', ps)
                                  }
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  {ps.label}
                                  {ps?.icon && (
                                    <img
                                      src={rightArrow}
                                      alt="right-arrow"
                                      style={{ margin: '0 10px' }}
                                    />
                                  )}
                                  {localState?.paymentStatus?.id === ps.id && (
                                    <MuiIcon.Done
                                      style={{ color: '#f08b32' }}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        : paymentStatusListWithoutBill.map((ps) => (
                            <div
                              className={css.categoryOptions}
                              key={ps.id}
                              role="menuitem"
                            >
                              <div
                                onClick={() =>
                                  handleBottomSheet('paymentStatus', ps)
                                }
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                {ps.label}
                                {localState?.paymentStatus?.id === ps.id && (
                                  <MuiIcon.Done style={{ color: '#f08b32' }} />
                                )}
                              </div>
                            </div>
                          ))}
                    </SelectBottomSheet>

                    {localState?.paymentStatus?.id === 'to_pay' && (
                      <PaymentTerms
                        fromBill={true}
                        callFunction={(val) =>
                          handleBottomSheet('creditPeriod', val?.credit_period)
                        }
                        selectCustomer={{
                          credit_period: localState?.creditPeriod || 0,
                        }}
                      />
                    )}

                    <Input
                      name="description"
                      onBlur={reValidate}
                      error={validationErr.description}
                      helperText={
                        validationErr.description
                          ? VALIDATION?.description?.errMsg
                          : ''
                      }
                      label="Note"
                      placeholder="what's this for"
                      variant="standard"
                      className={`${css.greyBorder} ${classes.root}`}
                      value={localState.description}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                      onChange={(event) => onInputChange(event)}
                      theme="light"
                      multiline
                      rows={4}
                    />
                  </div>
                  <div
                    className={
                      categorizationvendordetails &&
                      categorizationvendordetails.name
                        ? css.actionContainerexternal
                        : css.actionContainer
                    }
                  >
                    <SelectBottomSheet
                      name="preview"
                      triggerComponent={
                        <Button
                          variant="contained"
                          className={`${css.submitButton}`}
                          onClick={() => {
                            onRecordBill();
                          }}
                          size="medium"
                        >
                          Record Bills
                        </Button>
                      }
                      open={drawer.preview}
                      onClose={handleBottomSheet}
                    >
                      <PreviewContent
                        title={localState.name}
                        data={preparePreviewData()}
                        onProceed={saveBills}
                      />
                    </SelectBottomSheet>

                    {haveBill && (
                      <Mui.Button
                        variant="contained"
                        style={{
                          // padding: '15px 35px',
                          textTransform: 'initial',
                          backgroundColor: '#fff',
                          color: '#f08b32',
                          border: '1px solid #f08b32',
                          borderRadius: '18px',
                        }}
                        onClick={() => {
                          setNewLoader((prev) => ({
                            ...prev,
                            superAccount: true,
                          }));
                        }}
                      >
                        Assign to SuperAccountant
                      </Mui.Button>
                    )}
                  </div>
                </>
              )}
              {/* <NameDialog
        open={nameDialog}
        onCancel={onCancelDialog}
        onSave={onSaveDialog}
      /> */}
              {view === VIEW.VENDOR && (
                <AddNewVendor onCloseVendor={onCloseVendor} />
              )}
              {view === VIEW.EDIT && (
                <InvoiceCustomer
                  showValue={editValue}
                  handleBottomSheet={() => setView(VIEW.MAIN)}
                  type="vendors"
                  openFrom="billBooking"
                />
              )}
              {view === VIEW.DONE && (
                <SuccessView
                  title="Done"
                  description={
                    response
                      ? `${response?.expense_account?.name} ${
                          response?.status
                        } to ${
                          response?.vendor?.name ? response?.vendor?.name : ''
                        } for Rs. ${response?.amount} has been recorded`
                      : 'Your Bill has been sent to your SuperAccountant. Please expect a speedy Bill Booking experience.'
                  }
                  onClick={onAddAnotherBill}
                />
              )}

              {view === VIEW.SUPER && (
                <SuperAccUpload
                  typeOfImage={typeImage}
                  // haveBillSuper={haveBill}
                  uploadPDF={pdfUrl}
                  uploadFlieName={filename}
                  uploadId={localState?.file || ''}
                  successView={(val) => setView(val)}
                  setSuperEditValue={setEditValue}
                  vendorSuper={
                    () => {
                      if (categorizationvendordetails?.id) {
                        return categorizationvendordetails;
                      } else {
                        return localState?.vendor;
                      }
                    }
                    // localState?.vendor?.id ? localState?.vendor : false
                  }
                  paymentStatusSuper={
                    localState?.paymentStatus
                      ? localState?.paymentStatus
                      : false
                  }
                  categorySuper={
                    localState?.expenseCategory
                      ? localState?.expenseCategory
                      : false
                  }
                  doNotTrackCheck={dntCheckbox}
                  categorizationvendordetails={categorizationvendordetails}
                  selectedTransaction={selectedTransaction}
                  isVendorPresent={isVendorAvailable}
                  venFetchDetails={fetchDetails}
                />
              )}

              <StyledDrawer
                anchor="bottom"
                variant="temporary"
                open={drawer.paidAdvance}
                onClose={() => {
                  handleBottomSheet('paidAdvance', 'test');
                }}
              >
                <div className={css.advancePaid}>
                  <div className={css.handle} />
                  <div className={css.header}>
                    <div className={css.valueHeader}>
                      Select Advances to Adjust
                    </div>
                    <div className={css.headerUnderline} />
                  </div>
                  <div className={css.childContainer}>
                    {vendorsUnsettledList && vendorsUnsettledList.length > 0
                      ? vendorsUnsettledList.map((item, index) => {
                          return (
                            <div>
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Checkbox
                                  onClick={() => hangleChecked(item.id)}
                                  inputProps={{ 'aria-label': 'controlled' }}
                                  value={item}
                                />
                                <div style={{ flex: 1 }}>
                                  <div
                                    style={{
                                      color: '#283049',
                                      fontSize: '16px',
                                      lineHeight: '20px',
                                      marginBottom: '7px',
                                    }}
                                  >
                                    {item.document_number}
                                  </div>
                                  <div
                                    style={{
                                      color: '#283049',
                                      fontSize: '14px',
                                      lineHeight: '17.5px',
                                    }}
                                  >
                                    {`paid on ${moment(item.date).format(
                                      'DD MMM YYYY',
                                    )}`}
                                  </div>
                                </div>
                                <div
                                  style={{
                                    color: '#283049',
                                    fontSize: '16px',
                                    lineHeight: '20px',
                                  }}
                                >
                                  {FormattedAmount(item?.net_balance)}
                                </div>
                              </div>
                              {index + 1 !== vendorsUnsettledList.length && (
                                <div
                                  style={{
                                    height: '1px',
                                    backgroundColor: '#999999',
                                    marginTop: '9px',
                                    marginBottom: '9px',
                                  }}
                                />
                              )}
                            </div>
                          );
                        })
                      : 'No Advance bill'}
                  </div>
                  <div
                    onClick={() => handleBottomSheet('paidAdvance')}
                    style={{
                      backgroundColor: '#00A676',
                      padding: '13px',
                      borderRadius: '10px',
                      marginLeft: '10px',
                      marginRight: '10px',
                      marginBottom: '30px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '14px',
                        lineHeight: '17.5px',
                        color: '#FFFFFF',
                        textAlign: 'center',
                      }}
                    >
                      Confirm Adjustment
                    </div>
                  </div>
                </div>
              </StyledDrawer>
            </div>
          </>
        )}
        <ReceivablesPopOver
          open={editConfirm.open}
          handleClose={() =>
            setEditConfirm((prev) => ({ ...prev, open: false }))
          }
          position="center"
        >
          <div className={css.effortlessOptionsPop}>
            <h3>Heads Up!</h3>
            <p>Are you sure you want to Change The Vendor</p>

            {/* </ul> */}
            <div
              className={css.addCustomerFooter}
              style={{ marginBottom: '10px' }}
            >
              <Mui.Button
                disableElevation
                disableFocusRipple
                disableTouchRipple
                variant="contained"
                className={css.secondary}
                style={{
                  // padding: '15px 35px',
                  textTransform: 'initial',
                  backgroundColor: '#fff',
                }}
                onClick={() =>
                  setEditConfirm((prev) => ({ ...prev, open: false }))
                }
              >
                Cancel
              </Mui.Button>
              <Mui.Button
                disableElevation
                disableFocusRipple
                disableTouchRipple
                variant="contained"
                className={`${css.primary}`}
                style={{
                  // padding: '15px 35px',
                  textTransform: 'initial',
                  width: 'auto',
                  backgroundColor: '#f08b32',
                }}
                onClick={() => {
                  handleBottomSheet(
                    editConfirm.name,
                    editConfirm.data,
                    'fromState',
                  );
                  setEditConfirm({ open: false, name: '', data: '' });
                }}
              >
                &nbsp; Confirm &nbsp;
              </Mui.Button>
            </div>
          </div>
        </ReceivablesPopOver>

        <SelectBottomSheet
          open={newLoader.superAccount && deviceOut === 'mobile'}
          triggerComponent={<></>}
          onClose={() => {
            if (newLoader?.fileId === '') {
              setNewLoader((prev) => ({ ...prev, superAccount: false }));
            } else if (newLoader?.fileId) {
              setNewLoader((prev) => ({
                ...prev,
                superAccount: false,
                continueFlow: true,
              }));
            }
          }}
          addNewSheet
        >
          <SuperAccountantFirst
            setNewLoader={setNewLoader}
            newLoader={newLoader}
            setView={setView}
            categorizationvendordetails={categorizationvendordetails}
            setLocalState={setLocalState}
          />
        </SelectBottomSheet>

        <Mui.Dialog
          open={newLoader.superAccount && deviceOut === 'desktop'}
          onClose={() => {
            if (newLoader?.fileId === '') {
              setNewLoader((prev) => ({ ...prev, superAccount: false }));
            } else if (newLoader?.fileId) {
              setNewLoader((prev) => ({
                ...prev,
                superAccount: false,
                continueFlow: true,
              }));
            }
          }}
        >
          <SuperAccountantFirst
            setNewLoader={setNewLoader}
            newLoader={newLoader}
            categorizationvendordetails={categorizationvendordetails}
            setLocalState={setLocalState}
          />
        </Mui.Dialog>

        <Mui.Dialog
          open={newLoader.superAccountSec && deviceOut === 'desktop'}
          onClose={() => {
            if (donePage) {
              setNewLoader((prev) => ({
                ...prev,
                loader: false,
                superAccountSec: false,
                // continueFlow: true,
              }));
              onAddAnotherBill();
            } else if (!donePage) {
              if (newLoader?.fileId === '') {
                setNewLoader((prev) => ({ ...prev, superAccountSec: false }));
              } else if (newLoader?.fileId) {
                setNewLoader((prev) => ({
                  ...prev,
                  superAccountSec: false,
                  continueFlow: true,
                }));
              }
            }
          }}
        >
          <div>
            <SuperAccUpload
              typeOfImage={typeImage}
              uploadPDF={pdfUrl}
              // haveBillSuper={haveBill}
              uploadFlieName={filename}
              uploadId={localState?.file || ''}
              handleBottomSheetForSuper={() => {
                if (newLoader?.fileId === '') {
                  setNewLoader((prev) => ({ ...prev, superAccountSec: false }));
                } else if (newLoader?.fileId) {
                  setNewLoader((prev) => ({
                    ...prev,
                    superAccountSec: false,
                    continueFlow: true,
                  }));
                }
              }}
              handleBottomSheetForSuperDone={async () => {
                setNewLoader((prev) => ({
                  ...prev,
                  loader: false,
                  superAccountSec: false,
                  // continueFlow: true,
                }));
                await onAddAnotherBill();
              }}
              // onAddAnotherBill={onAddAnotherBill}
              vendorSuper={() => {
                if (categorizationvendordetails?.id) {
                  return categorizationvendordetails;
                } else {
                  return localState?.vendor;
                }
              }}
              paymentStatusSuper={
                localState?.paymentStatus ? localState?.paymentStatus : false
              }
              categorySuper={
                localState?.expenseCategory
                  ? localState?.expenseCategory
                  : false
              }
              setDonePageBill={setDonePage}
              doNotTrackCheck={dntCheckbox}
              categorizationvendordetails={categorizationvendordetails}
              selectedTransaction={selectedTransaction}
              isVendorPresent={isVendorAvailable}
              venFetchDetails={fetchDetails}
            />
          </div>
        </Mui.Dialog>
      </div>
      {havePermission.open && (
        <PermissionDialog onClose={() => havePermission.back()} />
      )}
      <SelectBottomSheet
        open={Employee?.open}
        onClose={() => setEmployee((prev) => ({ ...prev, open: false }))}
        triggerComponent={<></>}
        addNewSheet
      >
        <EmployeeList
          handleClick={(val) => {
            handleBottomSheet('payer_id', {
              payment_mode: { id: 'personal', label: 'Paid By' },
              payer_id: val,
            });
          }}
        />
      </SelectBottomSheet>
    </>
  );
};

export default UploadYourBillContainer;

const SuperAccountantFirst = ({
  newLoader,
  setNewLoader,
  setView,
  categorizationvendordetails,
  setLocalState,
}) => {
  const device = localStorage.getItem('device_detect');

  return (
    <div className={css.effortlessOptionsPop}>
      <div
        style={{ padding: '5px 0', margin: '1rem 0' }}
        className={css.headerContainer}
      >
        <p className={`${css.headerLabel} ${css.headerLabelForClose}`}>
          Your SuperAccountant is there for you{' '}
          {device === 'desktop' && (
            <span
              className={css.closeDialog}
              onClick={() => {
                if (newLoader?.fileId === '') {
                  setNewLoader((prev) => ({ ...prev, superAccount: false }));
                } else if (newLoader?.fileId) {
                  setNewLoader((prev) => ({
                    ...prev,
                    superAccount: false,
                    continueFlow: true,
                  }));
                }
              }}
            >
              X
            </span>
          )}
        </p>
        <span className={css.headerUnderline} />
        <p className={css.headerSubLabel}>
          Would you like to assign recording this expense to your
          SuperAccountant?
        </p>
      </div>

      {/* </ul> */}
      <div className={css.addCustomerFooter} style={{ marginBottom: '10px' }}>
        <Mui.Button
          disableElevation
          disableFocusRipple
          disableTouchRipple
          variant="contained"
          className={css.secondary}
          style={{
            // padding: '15px 35px',
            textTransform: 'initial',
            backgroundColor: '#fff',
          }}
          onClick={() => {
            if (newLoader?.fileId === '') {
              setNewLoader((prev) => ({ ...prev, superAccount: false }));
            } else if (newLoader?.fileId) {
              setNewLoader((prev) => ({
                ...prev,
                superAccount: false,
                continueFlow: true,
              }));
            }
          }}
        >
          No
        </Mui.Button>
        <Mui.Button
          disableElevation
          disableFocusRipple
          disableTouchRipple
          variant="contained"
          className={`${css.primary}`}
          style={{
            // padding: '15px 35px',
            textTransform: 'initial',
            backgroundColor: '#f08b32',
          }}
          onClick={() => {
            setNewLoader((prev) => ({
              ...prev,
              superAccount: false,
              superAccountSec: true,
              continueFlow: false,
            }));
            if (device === 'mobile') setView(VIEW.SUPER);
            if (categorizationvendordetails?.id) {
              setLocalState((s) => ({
                ...s,
                vendor: categorizationvendordetails,
              }));
              setLocalState((s) => ({
                ...s,
                paymentStatus: { id: 'company_account', label: 'Paid' },
              }));
            }
          }}
        >
          &nbsp; Yes &nbsp;
        </Mui.Button>
      </div>
    </div>
  );
};
