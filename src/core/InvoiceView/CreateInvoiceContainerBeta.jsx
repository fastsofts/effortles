/* @flow */
/**
 * @fileoverview  Create Edit Invoice Container
 */
/* eslint-disable no-lonely-if */

import React, { useState, useContext, useEffect } from 'react';
import moment from 'moment';
import { OnlyDatePicker } from '@components/DatePicker/DatePicker.jsx';
import Input from '@components/Input/Input.jsx';
import Button from '@material-ui/core/Button';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet.jsx';
import SelectCustomer from '@core/InvoiceView/SelectCustomer';
import SelectProductService from '@core/InvoiceView/SelectProductService';
import Checkbox from '@material-ui/core/Checkbox';
import { makeStyles, InputAdornment, Typography } from '@material-ui/core';
import {
  InvoiceIcon,
  LocationIcon,
  ClipboardIcon,
  TransportIcon,
  MapIcon,
  BikeIcon,
  RupeeInvoiceIcon,
  BankInvoiceIcon,
} from '@components/SvgIcons/SvgIcons.jsx';
import SearchIcon from '@material-ui/icons/Search';

import RestApi, { METHOD, BASE_URL } from '@services/RestApi.jsx';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer.jsx';
import { PermissionDialog } from '@components/Permissions/PermissionDialog.jsx';
import AppContext from '@root/AppContext.jsx';

import {
  validatePincode,
  validateAddress,
  validateRequired,
  validateOnlyText,
} from '@services/Validation.jsx';
import Grid from '@material-ui/core/Grid';
import * as Mui from '@mui/material';
import * as MuiIcon from '@mui/icons-material';
import InvoiceSuccess from '@assets/InvoiceSuccess.svg';
import Select from '@components/Select/Select.jsx';
import theme from '@root/theme.scss';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import * as Router from 'react-router-dom';
import { InvoiceCustomer } from '@components/Invoice/EditForm.jsx';
import PageTitle from '@core/DashboardView/PageTitle';
import cssDash from '@core/DashboardView/DashboardViewContainer.scss';
import { FormattedAmount } from '@components/formattedValue/FormattedValue';
import SelectBankAccount from './Components/SelectBankAccount';
import PaymentTerms from './PaymentTerms';
import CustomField from './CustomField';
import ReceivablesPopOver from '../Receivables/Components/ReceivablesPopover';
import Calender from './Calander';
import mainCss from '../../App.scss';
import InvoiceAndReason from './InvoiceAndReason';
import css from './CreateInvoiceContainer.scss';
import RecurringSheet from './RecurringSheet';
import SelectRightSheet from '../../components/SelectBottomSheet/SelectRightSheet';
import GenerateInvoicePdf from './GenerateInvoicePdf';

// let timer = 0;

const VALIDATOR = {
  organization_location_id: (v) => validateRequired(v),
  document_type: (v) => validateRequired(v),
  billing_party_location_id: (v) => validateRequired(v),
  delivery_party_location_id: (v) => validateRequired(v),
  place_of_supply: (v) => validateRequired(v),
  terms: (v) => validateRequired(v),
  address_line1: (v) => validateAddress(v),
  address_line2: (v) => validateAddress(v),
  addr_pincode: (v) => validatePincode(v),
  addr_city: (v) => validateOnlyText(v),
  addr_state: (v) => validateRequired(v),
};

const ValidationErrMsg = {
  organization_location_id: 'Choose Organization Location',
  document_type: 'Choose Invoice Type',
  billing_party_location_id: 'Choose Billing Address',
  delivery_party_location_id: 'Choose Delivery Address',
  place_of_supply: 'Choose place of supply',
  terms: 'Please fill Terms & Conditions',
  address_line1: 'Please enter valid Address',
  address_line2: 'Please enter valid Address',
  addr_city: 'Please enter valid City',
  addr_pincode: 'Please enter valid Pincode',
  addr_state: 'Please enter valid State',
};

const initialValidationErr = {
  organization_location_id: false,
  document_type: false,
  billing_party_location_id: false,
  place_of_supply: false,
  terms: false,
  address_line1: false,
  address_line2: false,
  addr_city: false,
  addr_pincode: false,
  addr_state: false,
};

const ITEM_CATEGORIES = ['products', 'services'];

// backend has to be consistent in properties
const mapLineItemProp = {
  invoices: 'invoice_items',
  customer_agreements: 'agreement_line_items',
  templates: 'template_line_items',
};

const useStyles = makeStyles(() => ({
  checked: {
    color: theme.colorLinks,
  },
}));

export const INVOICE_TYPES = [
  {
    text: 'Tax Invoice',
    payload: 'tax_invoice',
  },
  {
    text: 'Estimate',
    payload: 'estimate',
  },
  {
    text: 'Credit Note',
    payload: 'credit_note',
  },
  {
    text: 'Debit Note',
    payload: 'debit_note',
  },
];

const CreateInvoiceContainerBeta = () => {
  const {
    organization,
    enableLoading,
    user,
    setActiveInvoiceId,
    changeSubView,
    changeView,
    openSnackBar,
    pageParams,
    setDates,
    userPermissions,
    setInvoiceCounts,
  } = useContext(AppContext);
  const initialState = {
    invoiceType: '',
    orgLocation: '',
    termsCondition: '',
    billBreakup: '',
  };

  const [taxType, setTaxType] = useState();
  const [taxValue, setTaxValue] = useState();
  const [html, sethtml] = useState();
  const [invoiceDate, setInvoiceDate] = useState('');
  const [customerList, setCustomerList] = useState([]);
  const [orgLocationList, setOrgLocationList] = useState([]);
  const [customerLocationList, setCustomerLocationList] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [customerLocationId, setCustomerLocationId] = useState('');
  const [customerDeliveryLocationId, setCustomerDeliveryLocationId] =
    useState('');
  const [isSameAsDelivery, setIsSameAsDelivery] = useState(true);
  const [itemList, setItemList] = useState([]);
  const [lineItems, setLineItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [placeOfSupply, setPlaceOfSupply] = useState();
  const [terms, setTerms] = useState('');
  const [orgLocationId, setOrgLocationId] = useState('');
  const [orgLocationValue, setOrgLocationValue] = useState('');
  const [initstate, setState] = useState(initialState);
  const [validationErr, setValidationErr] = useState(initialValidationErr);
  const [gstData, setGstData] = useState('');
  const [onLoadInvoiceView, setInvoiceView] = useState(true);
  const [pdfView, setPdfView] = useState(false);
  const [successView, setSuccessView] = useState(false);
  const [editCustomer, setEditCustomer] = useState({
    open: false,
    editValue: {},
  });
  const [custAddr1, setCustAddr1] = useState('');
  const [custAddr2, setCustAddr2] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrCustState, setAddrCustState] = useState('');
  const classes = useStyles();
  const [custAddrDeliver1, setCustAddrDeliver1] = useState('');
  const [custAddrDeliver2, setCustAddrDeliver2] = useState('');
  const [addrDeliverPincode, setAddrDeliverPincode] = useState('');
  const [addrDeliverCity, setAddrDeliverCity] = useState('');
  const [addrDeliverCustState, setAddrDeliverCustState] = useState('');
  const [estimatePDF, setEstimatePDF] = React.useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = useState(null);
  const navigate = Router.useNavigate();
  const { state } = Router.useLocation();
  const themes = Mui.useTheme();
  const desktopView = Mui.useMediaQuery(themes.breakpoints.up('sm'));
  const device = localStorage.getItem('device_detect');
  const [startDate, setStartDate] = useState(moment().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [remainder, setRemainder] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [searchPlace, setSearchPlace] = useState('');
  const [tempTerms, setTempTerms] = useState(terms);
  const [newItem, setNewItem] = useState('');
  const [currencyType, setCurrencyType] = useState('');
  const [CURRENCY_TYPE, setCURRENCY_TYPE] = useState([]);
  const [searchQuery, setSearchQuery] = React.useState({ currencySearch: '' });
  const [updatedDetails, setUpdatedDetails] = React.useState({
    customerDetails: {},
    lineItems: {},
  });
  const [pagination, setPagination] = React.useState({
    totalPage: 1,
    currentPage: 1,
  });
  const [thresholdLimit, setThresholdLimit] = React.useState(false);
  const [thresholdLimitPopup, setThresholdLimitPopup] = React.useState({
    open: false,
  });
  /**
      Template states
     */
  const [templateName, setTemplateName] = useState<string>('');
  const pathName = window.location.pathname;
  const [userRoles, setUserRoles] = React.useState({});
  const [userRolesPeople, setUserRolesPeople] = React.useState({});
  const [havePermission, setHavePermission] = React.useState({ open: false });
  const [noteTypeWithShow, setNoteTypeWithShow] = React.useState({
    show: false,
    note: '',
    customer: '',
    invoice: '',
  });

  React.useEffect(() => {
    if (Object.keys(userPermissions?.Invoicing || {})?.length > 0) {
      if (!userPermissions?.Invoicing?.Invoicing) {
        setHavePermission({
          open: true,
          back: () => {
            navigate('/dashboard');
            setHavePermission({ open: false });
          },
        });
      }
      setUserRoles({ ...userPermissions?.Invoicing });
    }
    setUserRolesPeople({ ...userPermissions?.People });
  }, [userPermissions]);

  React.useEffect(() => {
    if (pageParams === 'estimate') {
      setEstimatePDF(true);
    } else {
      setEstimatePDF(false);
    }
  }, [pageParams]);

  useEffect(() => {
    if (taxType === 'estimate') {
      changeSubView('estimateView', 'estimate');

      setTaxValue(
        INVOICE_TYPES.filter((ele) => ele.payload === 'estimate')[0].text,
      );
    } else if (
      taxType === 'tax_invoice' ||
      taxType === 'credit_note' ||
      taxType === 'debit_note'
    ) {
      if (
        state?.recuuringParam &&
        state?.recuuringParam?.type !== 'recurring'
      ) {
        changeSubView('invoiceCreateViewBeta', '');
        navigate('/invoice-new');
      }
      setTaxValue(
        INVOICE_TYPES.filter((ele) => ele.payload === taxType)[0].text,
      );
    }

    return () => {
      changeSubView('', '');
    };
  }, [taxType]);

  useEffect(() => {
    if (
      organization &&
      organization.orgId &&
      organization.activeInvoiceId &&
      desktopView
    ) {
      const myHeaders = new Headers();
      myHeaders.append('Authorization', user.activeToken);
      myHeaders.append(
        'Cookie',
        'ahoy_visit=81beb4a2-ae4e-4414-8e0c-6eddff401f95; ahoy_visitor=8aba61b6-caf3-4ef5-a0f8-4e9afc7d8d0f',
      );
      const requestOptions = {
        method: METHOD.GET,
        headers: myHeaders,
        redirect: 'follow',
      };

      fetch(
        `${BASE_URL}/organizations/${organization.orgId}/${organization.activeInvoiceSubject}/${organization.activeInvoiceId}.html`,
        requestOptions,
      )
        .then((response) => response.text())
        .then((result) => {
          sethtml(result);
        })
        .catch((error) => console.log('error', error));
      // };
    }
  }, [
    taxValue,
    invoiceDate,
    customerId,
    lineItems,
    placeOfSupply,
    terms,
    orgLocationList,
    organization?.activeInvoiceId,
    orgLocationId,
    currencyType,
    updatedDetails?.customerDetails?.custom_data,
  ]);
  const [drawer, setDrawer] = useState({
    date: false,
    invoiceType: false,
    orgLocation: false,
    termsCondition: false,
    billBreakup: false,
    shippingAdderss: false,
    billingAddress: false,
    placeOfSupplyDrawer: false,
    deletePopup: false,
    currencyType: false,
    BankList: false,
  });
  const [BankList, setBankList] = React.useState([]);
  const [SelectedBank, setSelectedBank] = React.useState({
    id: '',
    details: {},
  });

  React.useEffect(() => {
    if (
      taxType === 'credit_note' &&
      updatedDetails?.customerDetails?.customer_id &&
      updatedDetails?.customerDetails?.original_invoice_reference_number
    ) {
      setNoteTypeWithShow({
        show: false,
        note: taxType,
        customer: updatedDetails?.customerDetails?.customer_id,
        invoice:
          updatedDetails?.customerDetails?.original_invoice_reference_number,
      });
    } else if (
      taxType === 'credit_note' &&
      updatedDetails?.customerDetails?.customer_id
    ) {
      setNoteTypeWithShow((prev) => ({
        ...prev,
        show: true,
        note: taxType,
        customer: updatedDetails?.customerDetails?.customer_id,
      }));
    } else if (taxType === 'credit_note') {
      setNoteTypeWithShow((prev) => ({ ...prev, show: true, note: taxType }));
    } else {
      setNoteTypeWithShow({ show: false, note: '', customer: '', invoice: '' });
    }
  }, [
    taxType,
    updatedDetails?.customerDetails?.customer_id,
    updatedDetails?.customerDetails?.original_invoice_reference_number,
  ]);

  /**
      Recurring invoice states
     */

  const reValidate = (e) => {
    const name = e?.target?.name;
    if (!name) return;
    const value = e?.target?.value;
    setValidationErr((s) => ({ ...s, [name]: !VALIDATOR?.[name]?.(value) }));
  };

  const onInputChange = (setter, e) => {
    reValidate(e);
    setter(e.target.value);
  };

  const validateAddressFields = () => {
    return {
      address_line1: !VALIDATOR?.address_line1?.(custAddrDeliver1),
      address_line2: !VALIDATOR?.address_line2?.(custAddrDeliver2),
      addr_pincode: !VALIDATOR?.addr_pincode?.(addrDeliverPincode),
      addr_city: !VALIDATOR?.addr_city?.(addrDeliverCity),
      addr_state: !VALIDATOR?.addr_state?.(addrDeliverCustState),
    };
  };

  const invoiceParams = {
    document_type: taxType,
    customer_id: customerId,
    organization_location_id: orgLocationId,
    organization_id: organization.orgId,
    date: invoiceDate,
    delivery_party_location_id: isSameAsDelivery
      ? customerLocationId
      : customerDeliveryLocationId,
    billing_party_location_id: customerLocationId,
    place_of_supply: placeOfSupply,
    terms,
  };

  const updateInvoice = (obj) => {
    enableLoading(true);
    let params = {
      ...obj,
    };

    if (organization.activeInvoiceSubject === 'customer_agreements') {
      params = {
        ...params,
        start_date: startDate,
        end_date: endDate,
        day_of_creation: deliveryDate,
      };
    }

    if (organization.activeInvoiceSubject === 'templates') {
      params = {
        ...params,
        template_name: templateName,
      };
    }

    RestApi(
      `organizations/${organization.orgId}/${organization.activeInvoiceSubject}/${organization.activeInvoiceId}`,
      {
        method: METHOD.PATCH,
        payload: {
          ...params,
        },
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        enableLoading(false);
        if (res?.error || res?.message) {
          openSnackBar({
            message:
              res?.message || Object.values(res?.errors || {})?.join(','),
            type: MESSAGE_TYPE.WARNING,
          });
        } else if (res && !res?.error) {
          enableLoading(false);
          setUpdatedDetails((prev) => ({ ...prev, customerDetails: res }));
          setTaxValue(
            INVOICE_TYPES.filter((ele) => ele.payload === res.document_type)[0]
              .text,
          );
          setTaxType(res.document_type);
          setOrgLocationId(res?.organization_location_id);
          setCurrencyType(res?.currency_id);
          setSelectedBank((prev) => ({ ...prev, id: res?.bank_account_id }));
          if (res.customer_id) {
            setTerms(res.terms);
            setCustomerLocationId(res.billing_party_location_id);
            setCustomerDeliveryLocationId(res.delivery_party_location_id);
            setPlaceOfSupply(res.place_of_supply);
            setGstData(res?.billing_party_location_json?.gstin || '');
          }
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const onDateChange = (m) => {
    if (!m) {
      openSnackBar({
        message: `Date field cannot be empty`,
        type: MESSAGE_TYPE.ERROR,
      });
      setInvoiceDate(moment().format('DD MMM yyyy'));
      return;
    }
    setInvoiceDate(m.format('DD MMM yyyy'));
    if (m.format('DD MMM yyyy') !== 'Invalid date') {
      updateInvoice({
        ...invoiceParams,
        date: m.format('yyyy-MMM-DD'),
      });
    }
  };

  const onTermsChange = (e) => {
    e.persist();
    setTempTerms(e.target.value);
  };

  const onCheckBoxChange = () => {
    setIsSameAsDelivery(!isSameAsDelivery);
  };

  const createInvoiceId = (value) => {
    if (value === 'estimate') {
      if (!userRoles?.Estimate?.create_estimate) {
        setHavePermission({ open: true, back: () => navigate('/invoice') });
        return;
      }
    } else if (value === 'tax_invoice') {
      if (!userRoles?.['Tax Invoice']?.create_invoices) {
        setHavePermission({ open: true, back: () => navigate('/invoice') });
        return;
      }
    }
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/${
        organization?.activeInvoiceSubject || 'invoices'
      }`,
      {
        method: METHOD.POST,
        payload: {
          document_type: value,
        },
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error) {
        setUpdatedDetails((prev) => ({ ...prev, customerDetails: res }));
        setActiveInvoiceId({ activeInvoiceId: res.id });
        setTerms(res.terms);
        setTaxType(res.document_type);
        setTaxValue(
          INVOICE_TYPES.filter((ele) => ele.payload === res.document_type)[0]
            .text,
        );
        setSelectedItems(
          res[mapLineItemProp[organization.activeInvoiceSubject]]
            ? res[mapLineItemProp[organization.activeInvoiceSubject]].map(
                (i) => i.item_id,
              )
            : [],
        );
        setCurrencyType(res?.currency_id);
        setSelectedBank((prev) => ({ ...prev, id: res?.bank_account_id }));
        setThresholdLimit(res?.threshold_limit_crossed);
      }
      setCustomerId('');
    });
    enableLoading(false);
  };

  const getInvoice = () => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/customer_agreements/${state?.recuuringParam?.id}`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error) {
        setTerms(res.terms);
        setTaxType(
          res.document_type === null ? 'tax_invoice' : res.document_type,
        );
        setCurrencyType(res?.currency_id);
        setSelectedBank((prev) => ({ ...prev, id: res?.bank_account_id }));
        setInvoiceDate(
          res.start_date
            ? moment(new Date(res.start_date)).format('DD MMM yyyy')
            : moment().format('DD MMM yyyy'),
        );
        setCustomerLocationId(res.billing_party_location_id);
        setCustomerDeliveryLocationId(res.delivery_party_location_id);
        setPlaceOfSupply(res.place_of_supply);

        setSelectedItems(
          res[mapLineItemProp[organization.activeInvoiceSubject]]
            ? res[mapLineItemProp[organization.activeInvoiceSubject]].map(
                (i) => i.item_id,
              )
            : [],
        );

        setIsSameAsDelivery(
          res.billing_party_location_id === res.delivery_party_location_id,
        );
        setCustomerId(res.customer_id);

        if (organization.activeInvoiceSubject === 'customer_agreements') {
          setStartDate(res?.start_date);
          setEndDate(res?.end_date);
          setRemainder(res?.remainder_dates);
          setDeliveryDate(res?.day_of_creation);
          setGstData(res?.billing_party_location_json?.gstin || '');
        }

        if (organization.activeInvoiceSubject === 'templates') {
          setTemplateName(res.template_name);
        }
      }
    });
    enableLoading(false);
  };

  const updateRecurringInvoice = () => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/customer_agreements/${state?.recuuringParam?.id}`,
      {
        method: METHOD.PATCH,
        payload: {
          approved_invoice_id: organization.activeInvoiceId,
          start_date: startDate,
          end_date: endDate,
          day_of_creation: deliveryDate,
          schedule_type: 'monthly',
          remainder_dates: remainder,
          document_type: taxType,
        },
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error) {
        enableLoading(false);
        openSnackBar({
          message: 'Updated',
          type: MESSAGE_TYPE.INFO,
        });
        changeSubView('recurringInvoiceView');
        navigate('/invoice-recurring');
      } else if (res && res.error) {
        enableLoading(false);
        openSnackBar({
          message: Object.values(res.errors).join(', '),
          type: MESSAGE_TYPE.ERROR,
        });
      }
    });
  };

  const deleteRecurringInvoice = () => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/customer_agreements/${state?.recuuringParam?.id}`,
      {
        method: METHOD.DELETE,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error) {
        openSnackBar({
          message: 'Cancelled Successfully',
          type: MESSAGE_TYPE.INFO,
        });
        enableLoading(false);
        changeSubView('recurringInvoiceView');
        navigate('/invoice-recurring');
      } else if (res && res.error) {
        enableLoading(false);
        openSnackBar({
          message: Object.values(res.errors).join(', '),
          type: MESSAGE_TYPE.ERROR,
        });
      }
    });
  };

  const getInvoiceById = () => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/${organization.activeInvoiceSubject}/${organization.activeInvoiceId}`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error) {
        setTerms(res.terms);
        setTaxType(res.document_type);
        setInvoiceDate(
          res.date
            ? moment(new Date(res.date)).format('DD MMM yyyy')
            : moment().format('DD MMM yyyy'),
        );
        setCustomerLocationId(res.billing_party_location_id);
        setCustomerDeliveryLocationId(res.delivery_party_location_id);
        setPlaceOfSupply(res.place_of_supply);
        setSelectedItems(
          res[mapLineItemProp[organization.activeInvoiceSubject]]
            ? res[mapLineItemProp[organization.activeInvoiceSubject]].map(
                (i) => i.item_id,
              )
            : [],
        );

        setIsSameAsDelivery(
          res.billing_party_location_id === res.delivery_party_location_id,
        );
        setCustomerId(res.customer_id);
        setCurrencyType(res?.currency_id);
        setSelectedBank((prev) => ({ ...prev, id: res?.bank_account_id }));

        if (organization.activeInvoiceSubject === 'customer_agreements') {
          setStartDate(res.start_date);
          setEndDate(res.end_date);
          setRemainder(res.remainder_dates);
          setDeliveryDate(res.day_of_creation);
        }

        if (organization.activeInvoiceSubject === 'templates') {
          setTemplateName(res.template_name);
        }
      }
    });
    enableLoading(false);
  };

  const fetchCustomer = async (allParties, searchVal, pageNum) => {
    await enableLoading(true);
    await RestApi(
      !allParties
        ? `organizations/${
            organization.orgId
          }/entities?type[]=customer&location=true&search=${
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
        if (res && !res.error && res.data) {
          setPagination({ totalPage: res?.pages, currentPage: res?.page });
          if (pageNum === 1 || !pageNum) {
            setCustomerList(res?.data);
          } else {
            setCustomerList((prev) => [...prev, ...res?.data]);
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
    }).then((res) => {
      if (res && !res.error && res.data) {
        setOrgLocationList(
          res.data.map((l) => ({
            payload: l.id,
            text: `${l.address_line1},${l.address_line2},${l.city},${l.state},${l.pincode},${l.country}`,
          })),
        );
        if (res.data.length > 0) {
          setOrgLocationId(res.data?.find((val) => val.default).id || null);
          setOrgLocationValue(
            `${res.data.filter((e) => e.default)[0].city}, ${
              res.data.filter((e) => e.default)[0].country
            },`,
          );
        }
      }
    });
    enableLoading(false);
  };

  const fetchCustomerLocation = () => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/customers/${customerId}/locations`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error && res.data) {
        setCustomerLocationList(
          res.data.filter((ele) => ele.id === customerDeliveryLocationId),
        );
        enableLoading(false);
      }
    });
  };

  const fetchItems = (invoice_id) => {
    enableLoading(true);
    RestApi(
      invoice_id
        ? `organizations/${organization.orgId}/items?type=invoice&customer_id=${user.customerId}&invoice_id=${invoice_id}`
        : `organizations/${organization.orgId}/items?type=invoice&customer_id=${user.customerId}`,
      {
        method: METHOD.GET,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error) {
        setItemList([...res.data]);
      }
    });
    enableLoading(false);
  };

  const fetchLineItems = () => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/${organization.activeInvoiceSubject}/${organization.activeInvoiceId}/line_items`,
      {
        method: METHOD.GET,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error && res.data) {
        setLineItems(res.data.map((i) => i));
        setUpdatedDetails((prev) => ({
          ...prev,
          lineItems: res.data.map((i) => i),
        }));
      }
    });
    enableLoading(false);
  };

  const fetchCurrencyType = () => {
    enableLoading(true);
    RestApi(`currencies`, {
      method: METHOD.GET,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        setCURRENCY_TYPE(res?.data);
      })
      .catch((err) => {
        console.log(err);
      });
    enableLoading(false);
  };

  const FetchBankData = (search) => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/bank_accounts?search_text=${
        search || ''
      }`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        enableLoading(false);
        if (!res?.error) {
          setBankList(res?.data);
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

  const updatePaymentTerms = (val, from) => {
    updateInvoice({
      ...invoiceParams,
      ...val,
    });
    if (from?.name === 'invoiceReason') {
      fetchItems(from?.invoice_id);
    }
  };

  const createLineItem = (itemId, updatedLineItem) => {
    let itemData;
    if (itemId.payload) {
      itemData = itemId.payload;
    } else if (itemId.item_id) {
      itemData = itemId.item_id;
    } else {
      itemData = itemId.id;
    }
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/${organization.activeInvoiceSubject}/${organization.activeInvoiceId}/line_items`,
      {
        method: METHOD.POST,
        payload: {
          item_id: itemData,
          description: updatedLineItem.description,
          quantity: updatedLineItem.quantity,
          rate: updatedLineItem.price,
          amount: updatedLineItem.totalValue,
          discount: updatedLineItem.rateDiscount,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        if (res && !res.error) {
          fetchLineItems();
          enableLoading(false);
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const deleteLineItem = (lineItemId) => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/${organization.activeInvoiceSubject}/${organization.activeInvoiceId}/line_items/${lineItemId}`,
      {
        method: METHOD.DELETE,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error) {
        fetchLineItems();
      }
    });
    enableLoading(false);
  };

  const onTriggerDrawer = (name) => {
    setDrawer((d) => ({ ...d, [name]: true }));
    setSearchQuery((prev) => ({ ...prev, currencySearch: '' }));
  };

  const handleBottomSheet = (name, data) => {
    setDrawer((d) => ({ ...d, [name]: false }));
    if (data) setState((s) => ({ ...s, [name]: data }));
    if (initstate[name] && !data) return;
    reValidate({ target: { name, value: data } });
  };

  const termsCondition = async () => {
    if (tempTerms?.length > 0) {
      await updateInvoice({
        ...invoiceParams,
        terms: tempTerms,
      });
      setTimeout(() => setTerms(tempTerms), [1000]);
      handleBottomSheet('termsCondition');
    }
  };

  const onTaxTypeChange = async (e, element) => {
    await updateInvoice({
      ...invoiceParams,
      taxType: e.target.value || element.payload,
      document_type: e.target.value || element.payload,
    });
    if (element.payload === 'estimate') {
      navigate('/invoice-estimate');
    } else if (
      element.payload === 'tax_invoice' ||
      element.payload === 'credit_note' ||
      element.payload === 'debit_note'
    ) {
      changeSubView('invoiceCreateViewBeta', '');
      navigate('/invoice-new');
    }
    reValidate(e);
    fetchLineItems();
    handleBottomSheet('invoiceType');
  };

  const onCurrencyTypeChange = (ele) => {
    setCurrencyType(ele?.iso_code);
    updateInvoice({
      ...invoiceParams,
      currency_id: ele?.iso_code,
    });
    handleBottomSheet('currencyType');
  };

  React.useEffect(() => {
    if (SelectedBank?.id) {
      const temp = BankList?.find((val) => val?.id === SelectedBank?.id);
      setSelectedBank((prev) => ({ ...prev, details: temp }));
    }
  }, [BankList, SelectedBank?.id]);

  const onPlaceOfSupplyChange = (element) => {
    setCustomerDeliveryLocationId(element.payload);
    updateInvoice({
      ...invoiceParams,
      place_of_supply: element.payload,
    });
    window.setTimeout(() => {
      fetchLineItems();
    }, 1250);
    handleBottomSheet('placeOfSupplyDrawer');
  };

  const onProductSelect = async (e, itemListData, updatedItem) => {
    const value = e.target ? e.target.value : e;
    const toCheck = selectedItems[0].payload
      ? selectedItems.every((x) => value.includes(x.payload))
      : selectedItems.every((x) => value.includes(x.id));
    if (toCheck) {
      const newlyAddedItem = selectedItems[0].payload
        ? selectedItems.find((i) => value.includes(i.payload))
        : selectedItems.find((i) => value.includes(i.id));
      if (newlyAddedItem) {
        createLineItem(newlyAddedItem, updatedItem);
      }
    } else {
      const removedItem = value.find((i) => !selectedItems.includes(i));
      const lineItemToRemove = lineItems.find((l) => l.item_id === removedItem);
      if (lineItemToRemove) {
        deleteLineItem(lineItemToRemove.id);
      }
    }
  };

  const onProductUpdate = (lineItemId, valueObject) => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/${organization.activeInvoiceSubject}/${organization.activeInvoiceId}/line_items/${lineItemId}`,
      {
        method: METHOD.PATCH,
        payload: {
          description: valueObject.description,
          discount: valueObject.discount,
          quantity: valueObject.quantity,
          rate: valueObject.rate,
        },
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        if (res && !res.error) {
          fetchLineItems();
          enableLoading(false);
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const fetchAllStates = () => {
    enableLoading(true);
    RestApi(`states`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        if (res && !res.error) {
          setAllStates(
            res.data.map((l) => ({
              payload: l.state_name,
              text: l.state_name,
            })),
          );
          enableLoading(false);
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const onCreateCustomerLocation = (
    address1,
    address2,
    pincodeAddress,
    cityAddress,
    countryAddress,
    custStateAddress,
    drawerName,
  ) => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/customers/${customerId}/locations`,
      {
        method: METHOD.POST,
        payload: {
          address_line1: address1,
          address_line2: address2,
          city: cityAddress,
          state: custStateAddress,
          pincode: pincodeAddress,
          country: countryAddress,
        },
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error) {
        openSnackBar({
          message: `Billing address created successfully.`,
          type: MESSAGE_TYPE.INFO,
        });
        enableLoading(false);
        fetchCustomer();
        handleBottomSheet(drawerName);
      } else {
        const errorValues = Object.values(res.errors);
        openSnackBar({
          message: errorValues.join(', '),
          type: MESSAGE_TYPE.ERROR,
        });
      }
    });
  };

  const onValidateCustomerLocation = (drawerName) => {
    const v = validateAddressFields();
    const valid = Object.values(v).every((val) => !val);

    if (!valid) {
      setValidationErr((s) => ({ ...s, ...v }));
      return;
    }
    onCreateCustomerLocation(
      custAddr1,
      custAddr2,
      addrPincode,
      addrCity,
      'India',
      addrCustState,
      drawerName,
    );
  };

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
          const { city, state: stateRes } = res;

          setAddrCity(city);
          setAddrDeliverCity(city);
          setAddrCustState(stateRes);
          setAddrDeliverCustState(stateRes);
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

  const onCreateProduct = ({
    productName,
    itemType,
    hsnCode,
    desc,
    unit,
    price,
    quantity,
    item_id,
    from,
  }) => {
    enableLoading(true);
    RestApi(
      item_id
        ? `organizations/${organization.orgId}/items/${item_id}`
        : `organizations/${organization.orgId}/items`,
      {
        method: item_id ? METHOD.PATCH : METHOD.POST,
        payload: {
          name: productName,
          item_type: itemType,
          hsn_or_sac_code: hsnCode,
          default_description: desc,
          unit_of_measurement: unit,
          service_id: hsnCode,
          default_rate: price,
          default_quantity: quantity,
        },
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then(async (res) => {
        if (res && !res.error) {
          enableLoading(false);
          openSnackBar({
            message: item_id
              ? `${productName} - ${itemType} edited successfully.`
              : `${productName} - ${itemType} created successfully.`,
            type: MESSAGE_TYPE.INFO,
          });
          fetchItems();
          if (from?.name === 'modify') {
            await fetchLineItems();
            setTimeout(() => setNewItem({ ...res, fromModify: from }), 1000);
          } else {
            setNewItem(res);
          }
        }
        if (res.error) {
          const errorMessages = Object.values(res.errors);
          openSnackBar({
            message: errorMessages.join(', '),
            type: MESSAGE_TYPE.ERROR,
          });
          enableLoading(false);
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const getInvoiceAction = () => {
    RestApi(
      `organizations/${organization.orgId}/invoices/dashboard?date=${moment(
        new Date(),
      ).format('YYYY-MM-DD')}`,
      // `organizations/${organization.orgId}/receivables/ageing?date=19/03/2021`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    ).then((res) => {
      if (res && !res.error) {
        setInvoiceCounts(res?.invoice_action);
        // enableLoading(false);
      } else if (res.error) {
        // enableLoading(false);
        openSnackBar({
          message: res.message || 'Unknown error occured',
          type: MESSAGE_TYPE.ERROR,
        });
      }
    });
  };

  const onGenerateInvoice = () => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/invoices/${organization.activeInvoiceId}/generates`,
      {
        method: METHOD.POST,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        if (
          res &&
          !res.error &&
          (res.message === 'Invoice generated' ||
            res.message === 'Invoice updated')
        ) {
          getInvoiceAction();
          setPdfView(true);
          if (estimatePDF) {
            navigate(
              `/invoice-estimate-pdf?id=${organization?.activeInvoiceId}`,
              {
                state: {
                  type: 'estimate',
                  name: selectedCustomerName,
                  status: res?.status,
                },
              },
            );
          } else if (state?.type === 'draft') {
            navigate(`/invoice-draft-pdf?id=${organization?.activeInvoiceId}`, {
              state: {
                type: 'draft',
                name: selectedCustomerName,
                status: res?.status,
                documentType: INVOICE_TYPES.filter(
                  (ele) => ele.text === taxValue,
                )?.[0].payload,
              },
            });
          } else {
            if (state?.people || pathName.includes('people')) {
              navigate(
                `/people-invoice-new-pdf?id=${organization?.activeInvoiceId}`,
                {
                  state: {
                    type: 'create',
                    name: selectedCustomerName,
                    status: res?.status,
                    documentType: INVOICE_TYPES.filter(
                      (ele) => ele.text === taxValue,
                    )?.[0].payload,
                  },
                },
              );
            } else {
              navigate(`/invoice-new-pdf?id=${organization?.activeInvoiceId}`, {
                state: {
                  type: 'create',
                  name: selectedCustomerName,
                  status: res?.status,
                  documentType: INVOICE_TYPES.filter(
                    (ele) => ele.text === taxValue,
                  )?.[0].payload,
                },
              });
            }
          }
        }
        if (res.error) {
          const errorMessages = Object.values(res.errors);

          openSnackBar({
            message: errorMessages.join(', '),
            type: MESSAGE_TYPE.ERROR,
          });
        }
        enableLoading(false);
      })
      .catch((e) => {
        openSnackBar({
          message: e.error,
          type: MESSAGE_TYPE.ERROR,
        });
        enableLoading(false);
      });
  };

  useEffect(() => {
    if (pathName.includes('/invoice-new')) {
      setLineItems([]);
    } else if (pathName.includes('/invoice-estimate')) {
      setLineItems([]);
    } else if (pathName.includes('/invoice-recurring-edit')) {
      if (
        state?.recuuringParam &&
        state?.recuuringParam?.type === 'recurring' &&
        organization?.activeInvoiceId
      ) {
        console.log('Recuuring');
      } else {
        navigate('/invoice-recurring');
      }
    }
    setInvoiceView(true);
    setPdfView(true);
    setSuccessView(false);
    fetchOrgLocation();
    fetchCurrencyType();
    FetchBankData();
    if (state?.recuuringParam && state?.recuuringParam?.type === 'recurring') {
      getInvoice();
    } else if (organization.activeInvoiceId && state?.from !== 'pdf') {
      getInvoiceById();
    } else {
      if (
        Object.keys(userRoles?.Estimate || {})?.length > 0 &&
        Object.keys(userRoles?.['Tax Invoice'] || {})?.length > 0
      ) {
        createInvoiceId(
          pathName.includes('/invoice-estimate')
            ? 'estimate'
            : (device === 'desktop' && 'tax_invoice') ||
                INVOICE_TYPES.find(
                  (ele) => ele.payload === state?.typeOfInvoice,
                )?.payload,
        );
      }
    }
    fetchCustomer();
    fetchAllStates();
    fetchItems();
    setCustAddr1('');
    setCustAddr2('');
    setAddrPincode('');
    setAddrCity('');
    setAddrCustState('');
  }, [pathName, userRoles?.Estimate, userRoles?.['Tax Invoice']]);

  useEffect(() => {
    if (state?.from === 'editInvoice') {
      updateInvoice({
        ...invoiceParams,
        customer_id: state?.versionRes?.customer_id,
        billing_party_location_id: state?.versionRes?.billing_party_location_id,
        date: state?.versionRes?.date,
        delivery_party_location_id:
          state?.versionRes?.delivery_party_location_id,
        document_type: state?.versionRes?.document_type,
        organization_id: state?.versionRes?.organization_id,
        organization_location_id: state?.versionRes?.organization_location_id,
        place_of_supply: state?.versionRes?.place_of_supply,
        terms: state?.versionRes?.terms,
        bank_account_id: state?.versionRes?.bank_account_id,
      });
      user.customerId = state?.versionRes?.customer_id;
      fetchItems();
    } else if (customerId && state?.recuuringParam?.type !== 'recurring') {
      updateInvoice({
        ...invoiceParams,
        customer_id: customerId,
      });
      user.customerId = customerId;
      fetchItems();
    }
  }, [customerId]);

  useEffect(() => {
    if (selectedItems && selectedItems.length > 0) {
      fetchLineItems();
    }
  }, [selectedItems]);

  useEffect(() => {
    if (customerDeliveryLocationId && customerId) {
      fetchCustomerLocation();
    }
  }, [customerDeliveryLocationId, customerId]);

  useEffect(() => {
    if (customerLocationList && customerLocationList.length > 0) {
      setCustAddr1(customerLocationList[0].address_line1);
      setCustAddr2(customerLocationList[0].address_line2);
      setAddrPincode(customerLocationList[0].pincode);
      setAddrCity(customerLocationList[0].city);
      setAddrCustState(customerLocationList[0].state);
    }
  }, [customerLocationList]);

  useEffect(() => {
    if (
      organization.activeInvoiceId &&
      orgLocationId &&
      startDate &&
      endDate &&
      deliveryDate
    ) {
      updateInvoice({ ...invoiceParams });
    }
  }, [startDate, endDate, deliveryDate, templateName]);

  React.useEffect(() => {
    if (customerLocationId) {
      updateInvoice({
        ...invoiceParams,
        delivery_party_location_id: isSameAsDelivery
          ? customerLocationId
          : customerDeliveryLocationId,
        billing_party_location_id: customerLocationId,
      });
    }
  }, [customerLocationId]);

  const empty = () => {
    setCustAddr1('');
    setCustAddr2('');
    setAddrPincode('');
    setAddrCity('');
    setAddrCustState('');
    setCustAddrDeliver1('');
    setCustAddrDeliver2('');
    setAddrDeliverPincode('');
    setAddrDeliverCity('');
    setAddrDeliverCustState('');
    setIsSameAsDelivery(true);
  };

  const emptyForDeliver = () => {
    setCustAddrDeliver1('');
    setCustAddrDeliver2('');
    setAddrDeliverPincode('');
    setAddrDeliverCity('');
    setAddrDeliverCustState('');
    setDrawer((d) => ({ ...d, shippingAdderss: false }));
  };

  const handleBottomSheetForDelivery = () => {
    setDrawer((d) => ({ ...d, shippingAdderss: false }));
    emptyForDeliver();
  };

  React.useEffect(() => {
    setDates({ status: false });
  }, []);
  React.useEffect(() => {
    if (state?.from === 'pdf') {
      setActiveInvoiceId({
        activeInvoiceId: '',
      });
      if (!organization?.activeInvoiceId) {
        createInvoiceId(
          pathName.includes('/invoice-estimate')
            ? 'estimate'
            : (device === 'desktop' && 'tax_invoice') ||
                INVOICE_TYPES.find(
                  (ele) => ele.payload === state?.typeOfInvoice,
                )?.payload,
        );
      }
    }
    if (state?.people) {
      setTimeout(() => {
        setCustomerId(state?.people?.id);
      }, 2000);
    }
  }, [state]);

  const handleChangeDate = (val) => {
    setInvoiceDate(
      `${val.toLocaleString('en-US', { day: 'numeric' })}  ${val.toLocaleString(
        'en-US',
        { month: 'short', year: 'numeric' },
      )}`,
    );
    setDrawer((d) => ({ ...d, date: false }));

    updateInvoice({
      ...invoiceParams,
      date: moment(val).format('YYYY-MM-DD'),
    });
  };

  const CalendarSheet = () => {
    return (
      <>
        <OnlyDatePicker
          className={css.avatarForDate}
          selectedDate={invoiceDate || new Date()}
          onChange={onDateChange}
          color="#fefbf8d4"
          maxDate="none"
          minDate={1}
        />
      </>
    );
  };
  const TaxInvoiceSheet = () => {
    return (
      <SelectRightSheet
        name="invoiceType"
        onBlur={reValidate}
        error={validationErr.document_type}
        helperText={
          validationErr.document_type ? ValidationErrMsg.document_type : ''
        }
        label=" "
        open={drawer.invoiceType}
        onTrigger={onTriggerDrawer}
        onClose={handleBottomSheet}
      >
        {INVOICE_TYPES &&
          INVOICE_TYPES.map((element) => (
            <div
              className={css.valueWrapper}
              onClick={(e) => onTaxTypeChange(e, element)}
            >
              <span
                className={css.iconLabel}
                style={{
                  fontWeight: taxValue === element.text ? 900 : 400,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {element.text}
                {taxValue === element.text && (
                  <MuiIcon.Done style={{ color: '#ffbb00d1' }} />
                )}
              </span>
              <hr />
            </div>
          ))}
      </SelectRightSheet>
    );
  };

  const PlacesSheet = () => {
    return (
      <SelectRightSheet
        name="orgLocation"
        onBlur={reValidate}
        error={validationErr.organization_location_id}
        helperText={
          validationErr.organization_location_id
            ? ValidationErrMsg.organization_location_id
            : ''
        }
        open={drawer.orgLocation}
        onTrigger={onTriggerDrawer}
        onClose={handleBottomSheet}
      >
        <div className={css.valueHeader}>Organization Location</div>
        <div className={css.valueContainer}>
          {orgLocationList &&
            orgLocationList.map((element) => (
              <div
                className={css.valueWrapperOrg}
                onClick={async () => {
                  await updateInvoice({
                    ...invoiceParams,
                    organization_location_id: element.payload,
                  });
                  setOrgLocationValue(
                    `${
                      element.text.split(',')[
                        element.text.split(',').length - 4
                      ]
                    },${
                      element.text.split(',')[
                        element.text.split(',').length - 3
                      ]
                    }`,
                  );
                  handleBottomSheet('orgLocation');
                }}
                style={{
                  background:
                    orgLocationId === element?.payload
                      ? '#95929226'
                      : '#ededed26',
                  fontWeight: orgLocationId === element?.payload ? 600 : 400,
                }}
              >
                <span className={css.value}>{element.text}</span>
                <hr />
              </div>
            ))}
        </div>
      </SelectRightSheet>
    );
  };

  const TermsSheet = () => {
    return (
      <SelectRightSheet
        name="termsCondition"
        onBlur={reValidate}
        error={validationErr.organization_location_id}
        helperText={
          validationErr.organization_location_id
            ? ValidationErrMsg.organization_location_id
            : ''
        }
        open={drawer.termsCondition}
        onTrigger={onTriggerDrawer}
        onClose={handleBottomSheet}
      >
        <div className={css.valueHeader}>Terms &amp; Conditions</div>
        <div className={css.valueWrapper}>
          <div className={css.fieldRow}>
            <Input
              name="terms"
              onBlur={reValidate}
              error={validationErr.terms}
              helperText={validationErr.terms ? ValidationErrMsg.terms : ''}
              variant="standard"
              defaultValue={terms}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              onChange={onTermsChange}
              theme="light"
              multiline
              rows={8}
            />

            <Mui.Stack
              display="row"
              alignItems="flex-end"
              width="100%"
              margin="2% 0"
            >
              <Mui.Button
                disableFocusRipple
                disableElevation
                disableRipple
                disableTouchRipple
                className={css.GenerateBtnForTerms}
                disabled={tempTerms === ''}
                onClick={() => termsCondition()}
              >
                <Mui.Typography className={css.GenerateBtnText}>
                  Save
                </Mui.Typography>
              </Mui.Button>
            </Mui.Stack>
          </div>
        </div>
      </SelectRightSheet>
    );
  };

  const BillingAddress = () => {
    return (
      <SelectRightSheet
        name="billingAddress"
        open={drawer.billingAddress}
        onTrigger={onTriggerDrawer}
        onClose={handleBottomSheet}
        maxHeight="100%"
      >
        <div className={css.valueHeader}>Shipping Location</div>
        <div className={css.valueWrapper}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Input
                name="addr_pincode"
                label="Pincode"
                variant="standard"
                value={addrPincode}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                theme="light"
                rootStyle={{
                  border: '1px solid #A0A4AF',
                }}
                inputProps={{
                  type: 'tel',
                }}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <Input
                name="address_line1"
                value={custAddr1}
                label="Address 01"
                variant="standard"
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{ maxLength: 45 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end" className={mainCss.endInput}>
                      {`${custAddr1?.length}/45`}
                    </InputAdornment>
                  ),
                }}
                fullWidth
                theme="light"
                rootStyle={{
                  border: '1px solid #A0A4AF',
                }}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <Input
                name="address_line2"
                value={custAddr2}
                label="Address 02"
                variant="standard"
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{ maxLength: 45 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end" className={mainCss.endInput}>
                      {`${custAddr2?.length}/45`}
                    </InputAdornment>
                  ),
                }}
                fullWidth
                theme="light"
                rootStyle={{
                  border: '1px solid #A0A4AF',
                }}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <Input
                name="addr_city"
                label="Town/City"
                variant="standard"
                value={addrCity}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                theme="light"
                rootStyle={{
                  border: '1px solid #A0A4AF',
                }}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <Select
                name="addr_state"
                label="STATE"
                options={allStates}
                defaultValue={addrCustState}
                fullWidth
                disabled
              />
            </Grid>

            <div className={css.gstCheckBox}>
              <Checkbox
                checked={isSameAsDelivery}
                onChange={onCheckBoxChange}
                classes={{ checked: classes.checked }}
              />
              <span>Use the same location for Delivery Address</span>
            </div>
          </Grid>
        </div>
      </SelectRightSheet>
    );
  };
  const Pdfj = () => {
    const htmlFile = html;
    return (
      <iframe
        srcDoc={htmlFile?.replace(
          'div.nobreak{page-break-inside:avoid}',
          'div.nobreak{page-break-inside:avoid} ::-webkit-scrollbar {width:0px}',
        )}
        title="html"
        frameBorder="0"
        className={css.scrolling}
      />
    );
  };

  const InvoiceOnLoad = () => {
    return (
      <>
        {/* here */}
        {desktopView ? (
          <Mui.Stack
            direction="row"
            justifyContent="space-between"
            style={{ margin: '1rem' }}
          >
            <Mui.Stack className={css.createContainer}>
              {pdfView ? (
                <>
                  <Mui.Stack
                    style={{
                      backgroundColor: 'white',
                      margin: '1rem',
                      height: '100%',
                      borderRadius: '15px',
                    }}
                  >
                    {Pdfj()}
                  </Mui.Stack>
                </>
              ) : (
                <GenerateInvoicePdf />
              )}
            </Mui.Stack>
            <Mui.Stack className={css.createContainer1}>
              <Mui.Stack className={css.createMarginContainer}>
                <Mui.Stack>
                  {/* title */}
                  <Mui.Stack>
                    <Mui.Typography>
                      {state?.from === 'editInvoice'
                        ? 'Edit Invoice'
                        : 'Create Invoice'}
                    </Mui.Typography>
                    <Mui.Divider className={css.titleDivider} />
                  </Mui.Stack>
                  {/* iconrow */}
                  <Mui.Stack
                    direction="row"
                    justifyContent="space-between"
                    mt={2}
                    className={css.iconStackRow}
                  >
                    <Mui.Stack
                      className={
                        // state?.from === 'editInvoice'
                        //   ? css.iconStackForEdit
                        (state?.recuuringParam?.type === 'recurring' &&
                          css.iconStackForHide) ||
                        css.iconStack
                      }
                    >
                      <CalendarSheet />
                      <span className={css.iconLabel}>
                        {invoiceDate
                          ? moment(invoiceDate).format('DD MMM YYYY')
                          : moment().format('DD MMM YYYY')}
                      </span>
                    </Mui.Stack>

                    {/* tax invoice */}
                    <Mui.Stack>
                      <Mui.Stack
                        className={
                          state?.from === 'editInvoice' ||
                          state?.recuuringParam?.type === 'recurring'
                            ? css.iconStackForEdit
                            : css.iconStack
                        }
                      >
                        <Mui.Avatar
                          className={css.avatarForTop}
                          onClick={() => {
                            onTriggerDrawer('invoiceType');
                          }}
                        >
                          <InvoiceIcon />
                        </Mui.Avatar>
                        <TaxInvoiceSheet />

                        <span
                          className={css.iconLabel}
                          style={{ width: '40px' }}
                        >
                          {taxValue}
                        </span>
                      </Mui.Stack>
                    </Mui.Stack>

                    <SelectBottomSheet
                      name="currencyType"
                      onBlur={reValidate}
                      triggerComponent={
                        <Mui.Stack>
                          <Mui.Stack className={css.iconStack}>
                            <Mui.Avatar
                              className={css.avatarForTop}
                              onClick={() => {
                                onTriggerDrawer('currencyType');
                              }}
                            >
                              <RupeeInvoiceIcon />
                            </Mui.Avatar>
                            <span className={css.iconLabel}>
                              {
                                CURRENCY_TYPE?.find(
                                  (val) => val?.iso_code === currencyType,
                                )?.name
                              }
                            </span>
                          </Mui.Stack>
                        </Mui.Stack>
                      }
                      label=" "
                      open={drawer.currencyType}
                      onTrigger={onTriggerDrawer}
                      onClose={handleBottomSheet}
                      id="overFlowHidden"
                    >
                      <div style={{ height: '100%' }}>
                        <div
                          className={css.searchFilterFull}
                          // style={{ height: '10%' }}
                        >
                          <SearchIcon className={css.searchFilterIcon} />
                          <input
                            placeholder="Search Currency"
                            onChange={(event) => {
                              event.persist();
                              setSearchQuery((prev) => ({
                                ...prev,
                                currencySearch: event?.target?.value,
                              }));
                            }}
                            value={searchQuery?.currencySearch}
                            className={css.searchFilterInputBig}
                          />
                        </div>
                        <div style={{ height: '85%', overflow: 'auto' }}>
                          {CURRENCY_TYPE &&
                            CURRENCY_TYPE?.filter(
                              (val) =>
                                val?.name
                                  ?.toLocaleLowerCase()
                                  ?.includes(
                                    searchQuery?.currencySearch?.toLocaleLowerCase(),
                                  ) ||
                                val?.iso_code
                                  ?.toLocaleLowerCase()
                                  ?.includes(
                                    searchQuery?.currencySearch?.toLocaleLowerCase(),
                                  ),
                            )?.map((element) => (
                              <div
                                className={css.valueWrapper}
                                onClick={() => onCurrencyTypeChange(element)}
                              >
                                <span
                                  className={css.iconLabel}
                                  style={{
                                    fontWeight:
                                      currencyType === element?.iso_code
                                        ? 900
                                        : 400,
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {element?.name} ({element?.iso_code})
                                  {currencyType === element?.iso_code && (
                                    <MuiIcon.Done
                                      style={{ color: '#ffbb00d1' }}
                                    />
                                  )}
                                </span>
                                <hr />
                              </div>
                            ))}
                          {CURRENCY_TYPE?.filter(
                            (val) =>
                              val?.name
                                ?.toLocaleLowerCase()
                                ?.includes(
                                  searchQuery?.currencySearch?.toLocaleLowerCase(),
                                ) ||
                              val?.iso_code
                                ?.toLocaleLowerCase()
                                ?.includes(
                                  searchQuery?.currencySearch?.toLocaleLowerCase(),
                                ),
                          )?.length === 0 && (
                            <p className={css.noData}>No Data Found!!</p>
                          )}
                        </div>
                      </div>
                    </SelectBottomSheet>

                    <SelectBottomSheet
                      name="BankList"
                      onBlur={reValidate}
                      triggerComponent={
                        <Mui.Stack>
                          <Mui.Stack className={css.iconStack}>
                            <Mui.Avatar
                              className={css.avatarForTop}
                              onClick={() => {
                                onTriggerDrawer('BankList');
                              }}
                            >
                              <BankInvoiceIcon />
                            </Mui.Avatar>
                            <span
                              className={css.iconLabel}
                              style={{ width: '40px' }}
                            >
                              {SelectedBank?.id
                                ? SelectedBank?.details?.bank_account_name
                                : 'Bank Info'}
                            </span>
                          </Mui.Stack>
                        </Mui.Stack>
                      }
                      label=" "
                      open={drawer.BankList}
                      onTrigger={onTriggerDrawer}
                      onClose={handleBottomSheet}
                      id="overFlowHidden"
                    >
                      <SelectBankAccount
                        ParamBankList={BankList}
                        listFunction={(val) => FetchBankData(val)}
                        onclose={() => handleBottomSheet('BankList')}
                        callFunction={updatePaymentTerms}
                        ParamSelectedBank={SelectedBank?.id}
                      />
                    </SelectBottomSheet>
                    <Mui.Stack
                      className={
                        state?.from === 'editInvoice' ||
                        state?.recuuringParam?.type === 'recurring'
                          ? css.iconStackForEdit
                          : css.iconStack
                      }
                    >
                      <Mui.Avatar
                        className={css.avatarForTop}
                        onClick={() => {
                          onTriggerDrawer('orgLocation');
                        }}
                      >
                        <LocationIcon />
                      </Mui.Avatar>
                      <PlacesSheet />
                      <span className={css.iconLabel}>{orgLocationValue}</span>
                    </Mui.Stack>
                    <Mui.Stack className={css.iconStack}>
                      <Mui.Avatar
                        className={css.avatarForTop}
                        onClick={() => {
                          onTriggerDrawer('termsCondition');
                        }}
                      >
                        <ClipboardIcon />
                      </Mui.Avatar>
                      {TermsSheet()}
                      <span className={css.iconLabel}>Terms & Conditions</span>
                    </Mui.Stack>

                    {customerId && (
                      <Mui.Stack className={css.iconStack}>
                        <div className={css.iconWrapper}>
                          <SelectBottomSheet
                            name="placeOfSupplyDrawer"
                            label=" "
                            triggerComponent={
                              <Mui.Avatar
                                className={css.avatarForTop}
                                onClick={() => {
                                  setSearchPlace('');
                                  onTriggerDrawer('placeOfSupplyDrawer');
                                }}
                              >
                                <TransportIcon />
                              </Mui.Avatar>
                            }
                            open={drawer.placeOfSupplyDrawer}
                            onTrigger={onTriggerDrawer}
                            onClose={handleBottomSheet}
                          >
                            <div>
                              <div
                                className={css.searchFilter}
                                style={{ padding: '5px' }}
                              >
                                <input
                                  placeholder="Search Places"
                                  onChange={(event) =>
                                    setSearchPlace(event.target.value)
                                  }
                                  style={{ padding: '13px', width: '100%' }}
                                />
                              </div>

                              <div style={{ overflow: 'auto', height: '85vh' }}>
                                {allStates &&
                                  allStates
                                    .filter((val) =>
                                      val.text
                                        .toLocaleLowerCase()
                                        .includes(
                                          searchPlace.toLocaleLowerCase(),
                                        ),
                                    )
                                    .map((element) => (
                                      <div
                                        className={css.valueWrapper}
                                        onClick={() =>
                                          onPlaceOfSupplyChange(element)
                                        }
                                      >
                                        <span
                                          className={css.value}
                                          style={{
                                            fontWeight:
                                              placeOfSupply === element.text
                                                ? 900
                                                : 400,
                                            display: 'flex',
                                            alignItems: 'center',
                                          }}
                                        >
                                          {element.text}{' '}
                                          {placeOfSupply === element.text && (
                                            <MuiIcon.Done
                                              style={{ color: '#ffbb00d1' }}
                                            />
                                          )}
                                        </span>
                                        <hr />
                                      </div>
                                    ))}
                                {allStates.filter((val) =>
                                  val.text
                                    .toLocaleLowerCase()
                                    .includes(searchPlace.toLocaleLowerCase()),
                                )?.length === 0 && (
                                  <p className={css.noData}>No Data Found!!</p>
                                )}
                              </div>
                            </div>
                          </SelectBottomSheet>
                        </div>
                        <span className={css.iconLabel}>
                          {placeOfSupply || 'Place Of Supply'}
                        </span>
                      </Mui.Stack>
                    )}
                    {customerId && (
                      <Mui.Stack className={css.iconStack}>
                        <Mui.Avatar
                          className={css.avatarForTop}
                          onClick={() => {
                            onTriggerDrawer('billingAddress');
                          }}
                        >
                          <MapIcon />
                        </Mui.Avatar>
                        {BillingAddress()}
                        {addrCity === '' && addrCustState === '' ? (
                          <span className={css.iconLabel}>
                            {' '}
                            Shipping Location{' '}
                          </span>
                        ) : (
                          <span className={css.iconLabel}>
                            {addrCity}, {addrCustState}{' '}
                          </span>
                        )}
                      </Mui.Stack>
                    )}

                    {!isSameAsDelivery && (
                      <Mui.Stack className={css.iconStack}>
                        <div className={css.iconWrapper}>
                          <SelectBottomSheet
                            name="shippingAdderss"
                            triggerComponent={
                              <Mui.Avatar
                                className={css.avatarForTop}
                                onClick={() => {
                                  onTriggerDrawer('shippingAdderss');
                                }}
                              >
                                <BikeIcon />
                              </Mui.Avatar>
                            }
                            open={drawer.shippingAdderss}
                            value={orgLocationValue}
                            onTrigger={onTriggerDrawer}
                            onClose={handleBottomSheetForDelivery}
                            maxHeight="100%"
                          >
                            <div className={css.valueHeader}>
                              Delivery Location
                            </div>
                            <div className={css.valueWrapper}>
                              <Grid container spacing={3}>
                                <Grid item xs={12}>
                                  <Input
                                    name="addr_pincode"
                                    onBlur={reValidate}
                                    error={validationErr.addr_pincode}
                                    helperText={
                                      validationErr.addr_pincode
                                        ? ValidationErrMsg.addr_pincode
                                        : ''
                                    }
                                    label="Pincode"
                                    variant="standard"
                                    defaultValue={addrDeliverPincode}
                                    InputLabelProps={{
                                      shrink: true,
                                    }}
                                    fullWidth
                                    theme="light"
                                    rootStyle={{
                                      border: '1px solid #A0A4AF',
                                    }}
                                    inputProps={{
                                      type: 'tel',
                                    }}
                                    required
                                    onChange={(e) => {
                                      onInputChange(setAddrPincode, e);
                                      setAddrDeliverPincode(e.target.value);
                                      if (e.target?.value?.length === 6) {
                                        fetchPincodeDetails(e.target.value);
                                      }
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <Input
                                    name="address_line1"
                                    onBlur={reValidate}
                                    error={validationErr.address_line1}
                                    helperText={
                                      validationErr.address_line1
                                        ? ValidationErrMsg.address_line1
                                        : ''
                                    }
                                    defaultValue={custAddrDeliver1}
                                    onChange={(e) => {
                                      onInputChange(setCustAddr1, e);
                                      setCustAddrDeliver1(e.target.value);
                                    }}
                                    label="Address 01"
                                    variant="standard"
                                    InputLabelProps={{
                                      shrink: true,
                                    }}
                                    inputProps={{ maxLength: 45 }}
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment
                                          position="end"
                                          className={mainCss.endInput}
                                        >
                                          {`${custAddrDeliver1?.length}/45`}
                                        </InputAdornment>
                                      ),
                                    }}
                                    fullWidth
                                    theme="light"
                                    rootStyle={{
                                      border: '1px solid #A0A4AF',
                                    }}
                                    required
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <Input
                                    name="address_line2"
                                    onBlur={reValidate}
                                    error={validationErr.address_line2}
                                    helperText={
                                      validationErr.address_line2
                                        ? ValidationErrMsg.address_line2
                                        : ''
                                    }
                                    defaultValue={custAddrDeliver2}
                                    onChange={(e) => {
                                      onInputChange(setCustAddr2, e);
                                      setCustAddrDeliver2(e.target.value);
                                    }}
                                    label="Address 02"
                                    variant="standard"
                                    // defaultValue=""
                                    InputLabelProps={{
                                      shrink: true,
                                    }}
                                    inputProps={{ maxLength: 45 }}
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment
                                          position="end"
                                          className={mainCss.endInput}
                                        >
                                          {`${custAddrDeliver2?.length}/45`}
                                        </InputAdornment>
                                      ),
                                    }}
                                    fullWidth
                                    theme="light"
                                    rootStyle={{
                                      border: '1px solid #A0A4AF',
                                    }}
                                    required
                                  />
                                </Grid>
                                <Grid item xs={6}>
                                  <Input
                                    name="addr_city"
                                    onBlur={reValidate}
                                    error={validationErr.addr_city}
                                    helperText={
                                      validationErr.addr_city
                                        ? ValidationErrMsg.addr_city
                                        : ''
                                    }
                                    value={addrDeliverCity}
                                    onChange={(e) => {
                                      onInputChange(setAddrCity, e);
                                      setAddrDeliverCity(e.target.value);
                                    }}
                                    label="Town/City"
                                    variant="standard"
                                    InputLabelProps={{
                                      shrink: true,
                                    }}
                                    fullWidth
                                    theme="light"
                                    rootStyle={{
                                      border: '1px solid #A0A4AF',
                                    }}
                                    required
                                  />
                                </Grid>
                                <Grid item xs={6}>
                                  <Select
                                    name="addr_state"
                                    onBlur={reValidate}
                                    error={validationErr.addr_state}
                                    helperText={
                                      validationErr.addr_state
                                        ? ValidationErrMsg.addr_state
                                        : ''
                                    }
                                    label="STATE"
                                    options={allStates}
                                    defaultValue={addrDeliverCustState}
                                    onChange={(e) => {
                                      onInputChange(setAddrCustState, e);
                                      setAddrDeliverCustState(e.target.value);
                                    }}
                                    fullWidth
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <div className={css.addCustomerFooter}>
                                    <Button
                                      variant="contained"
                                      className={css.secondary}
                                      style={{
                                        padding: '15px 35px',
                                        textTransform: 'initial',
                                      }}
                                      onClick={() => {
                                        emptyForDeliver();
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="contained"
                                      className={`${css.primary}`}
                                      style={{
                                        padding: '15px',
                                        textTransform: 'initial',
                                      }}
                                      onClick={() => {
                                        onValidateCustomerLocation(
                                          'shippingAdderss',
                                        );
                                      }}
                                    >
                                      Set Delivery Address
                                    </Button>
                                  </div>
                                </Grid>
                              </Grid>
                            </div>
                          </SelectBottomSheet>
                        </div>
                        {addrDeliverCity === '' &&
                        addrDeliverCustState === '' ? (
                          <span className={css.iconLabel}>
                            {' '}
                            Delivery Location{' '}
                          </span>
                        ) : (
                          <span className={css.iconLabel}>
                            {addrDeliverCity}, {addrDeliverCustState}{' '}
                          </span>
                        )}
                      </Mui.Stack>
                    )}
                  </Mui.Stack>
                  <Mui.Stack className={css.fieldsB}>
                    <Mui.Stack className={css.fieldRowB}>
                      <SelectCustomer
                        customerListValue={customerList}
                        onCreateCustomer={async (cus_id) => {
                          await fetchCustomer();
                          setCustomerId(cus_id);
                        }}
                        setCustomerId={setCustomerId}
                        gstData={gstData}
                        HideExpandMoreIcon
                        customerId={customerId}
                        empty={empty}
                        setItemList={setItemList}
                        setCustName={setSelectedCustomerName}
                        desktop
                        hideChange={
                          state?.from === 'editInvoice' ||
                          state?.recuuringParam?.type === 'recurring'
                        }
                        callFunction={fetchCustomer}
                        setCustomerLocationId={setCustomerLocationId}
                        pagination={pagination}
                        setPagination={setPagination}
                        customerCreation={
                          userRolesPeople?.Customers?.create_customers
                        }
                      />
                    </Mui.Stack>
                  </Mui.Stack>

                  {(taxType === 'credit_note' || taxType === 'debit_note') && (
                    <div className={css.fieldsB}>
                      <div className={css.fieldRowB} style={{ width: '100%' }}>
                        <InvoiceAndReason
                          selectCustomer={updatedDetails?.customerDetails}
                          callFunction={updatePaymentTerms}
                        />
                      </div>
                    </div>
                  )}

                  <div className={css.fieldsB}>
                    <div className={css.fieldRowB}>
                      <SelectProductService
                        ITEM_CATEGORIES={ITEM_CATEGORIES}
                        itemList={itemList}
                        customerId={customerId}
                        setSelectedItems={setSelectedItems}
                        onProductSelect={onProductSelect}
                        onProductUpdate={onProductUpdate}
                        deleteLineItem={deleteLineItem}
                        fetchLineItems={fetchLineItems}
                        lineItems={lineItems}
                        selectedItems={selectedItems}
                        onCreateProduct={onCreateProduct}
                        newlyAddedItem={newItem}
                        HideExpandMoreIcon
                        taxType={taxType}
                        noteTypeWithShow={noteTypeWithShow}
                      />
                    </div>
                    <Mui.Stack
                      className={css.fieldRowGrandTotalB}
                      direction="row"
                    >
                      <SelectBottomSheet
                        name="billBreakup"
                        triggerComponent={
                          <Mui.Stack className={css.grandTotalTextB}>
                            <Mui.Typography className={css.text}>
                              GRAND TOTAL
                            </Mui.Typography>
                          </Mui.Stack>
                        }
                        open={drawer.billBreakup}
                        onTrigger={onTriggerDrawer}
                        onClose={handleBottomSheet}
                        maxHeight="45vh"
                      >
                        <div className={css.valueHeader}>Bill Details</div>
                        <div className={css.valueWrapper}>
                          {lineItems.length > 0 &&
                            lineItems.map((l) => (
                              <div
                                className={css.billDetailsContainerBeta}
                                key={`${l.id}`}
                              >
                                <span className={css.titleBeta}>
                                  HSN/SAC -1
                                </span>
                                <div className={css.billItemsBeta}>
                                  <span className={css.label}>
                                    Taxable Value
                                  </span>
                                  <span className={css.valueBeta}>
                                    {FormattedAmount(
                                      Number(l?.rate) * Number(l?.quantity),
                                    )}
                                  </span>
                                </div>

                                {l.invoice_tax_items &&
                                  l.invoice_tax_items.map((t) => (
                                    <div
                                      className={css.billItemsBeta}
                                      key={`tax${t.id}`}
                                    >
                                      <span
                                        className={css.label}
                                        style={{
                                          textTransform: 'uppercase',
                                        }}
                                      >
                                        {t.tax_id}
                                      </span>
                                      <span className={css.valueBeta}>
                                        {FormattedAmount(t?.amount)}
                                      </span>
                                    </div>
                                  ))}

                                <div className={`${css.billItemsBeta}`}>
                                  <span className={css.label}>Total</span>
                                  <span className={css.valueBeta}>
                                    {FormattedAmount(l?.total)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          <div className={css.billDetailsContainerBeta}>
                            <div
                              className={`${css.billItemsBeta} ${css.totalItemsBeta}`}
                            >
                              <span className={css.label}>Grand Total</span>
                              <span className={css.valueBeta}>
                                {lineItems.length > 0
                                  ? FormattedAmount(
                                      lineItems?.reduce(
                                        (acc, val) =>
                                          acc + parseInt(val?.total, 10),
                                        0,
                                      ),
                                    )
                                  : '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </SelectBottomSheet>
                      <Mui.Stack className={css.grandTotalAmtB}>
                        {lineItems.length > 0
                          ? FormattedAmount(
                              lineItems?.reduce(
                                (acc, val) => acc + parseInt(val?.total, 10),
                                0,
                              ),
                            )
                          : '-'}
                      </Mui.Stack>
                    </Mui.Stack>
                    {/* </div> */}
                  </div>

                  {taxType !== 'credit_note' && (
                    <div className={css.fieldsB} style={{ marginTop: 25 }}>
                      <div className={css.fieldRowB} style={{ width: '100%' }}>
                        <PaymentTerms
                          selectCustomer={updatedDetails?.customerDetails}
                          callFunction={updatePaymentTerms}
                          lineItems={updatedDetails?.lineItems}
                        />
                      </div>
                    </div>
                  )}

                  <div className={css.fieldsB} style={{ marginTop: 25 }}>
                    <div className={css.fieldRowB} style={{ width: '100%' }}>
                      <CustomField
                        selectCustomer={updatedDetails?.customerDetails}
                        callFunction={updatePaymentTerms}
                      />
                    </div>
                  </div>
                  {state?.recuuringParam &&
                  state?.recuuringParam?.type === 'recurring' &&
                  remainder !== '' &&
                  state?.from === 'edit' ? (
                    <div style={{ marginTop: '2rem' }}>
                      {' '}
                      <RecurringSheet
                        id="chats"
                        startDateData={startDate}
                        endDateData={endDate}
                        remainderData={remainder}
                        day={deliveryDate}
                        setStartDate={setStartDate}
                        setEndDate={setEndDate}
                        setRemainder={setRemainder}
                        setSendDate={setDeliveryDate}
                        custName={state?.name}
                      />{' '}
                      <div>
                        <Button
                          variant="contained"
                          className={
                            desktopView
                              ? css.submitEdit
                              : `${css.submitButton} ${css.borderRadius}`
                          }
                          fullWidth
                          onClick={() => {
                            updateRecurringInvoice();
                          }}
                          disabled={!(lineItems && lineItems.length > 0)}
                        >
                          Update Recurring Invoice
                        </Button>
                      </div>
                      <div>
                        <Button
                          variant="contained"
                          className={`${css.secondarySubmitBtn} ${css.borderRadius}`}
                          fullWidth
                          onClick={() => {
                            setDrawer((prev) => ({
                              ...prev,
                              deletePopup: true,
                            }));
                          }}
                          disabled={!(lineItems && lineItems.length > 0)}
                        >
                          Cancel Recurring Invoice
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Mui.Stack
                      style={{
                        marginTop: '20px',
                        width: '100%',
                        alignItems: 'center',
                      }}
                    >
                      <Mui.Button
                        variant="contained"
                        className={css.GenerateBtn}
                        fullWidth
                        onClick={() => {
                          if (thresholdLimit) {
                            setThresholdLimitPopup((prev) => ({
                              ...prev,
                              open: true,
                            }));
                          } else {
                            onGenerateInvoice();
                          }
                        }}
                        disabled={!(lineItems && lineItems.length > 0)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Mui.Typography className={css.GenerateBtnText}>
                          Generate
                        </Mui.Typography>
                      </Mui.Button>
                    </Mui.Stack>
                  )}
                </Mui.Stack>
              </Mui.Stack>
            </Mui.Stack>
          </Mui.Stack>
        ) : (
          //  here
          <div
            className={css.createInvoiceContainer}
            style={{ backgroundColor: '#F2F2F0' }}
          >
            <div className={css.fieldWrapper}>
              <div className={css.iconRow}>
                <div
                  className={
                    (state?.recuuringParam?.type === 'recurring' &&
                      css.iconStackForHide) ||
                    css.iconContainer
                  }
                >
                  <div
                    className={
                      // state?.from === 'editInvoice' ||
                      state?.recuuringParam?.type === 'recurring'
                        ? css.iconWrapperForEdit
                        : css.iconWrapper
                    }
                  >
                    <SelectBottomSheet
                      name="date"
                      triggerComponent={
                        <CalendarIcon
                          className={css.iconField}
                          onClick={() => {
                            onTriggerDrawer('date');
                          }}
                        />
                      }
                      open={drawer.date}
                      onTrigger={onTriggerDrawer}
                      onClose={handleBottomSheet}
                      addNewSheet
                    >
                      <Calender
                        head="Select Date"
                        button="Select"
                        handleDate={handleChangeDate}
                        max
                        min
                      />
                    </SelectBottomSheet>
                  </div>
                  <span className={css.iconLabel}>
                    {invoiceDate
                      ? moment(invoiceDate).format('DD MMM YYYY')
                      : moment().format('DD MMM YYYY')}
                  </span>
                </div>
                <div className={css.iconContainer}>
                  <div
                    className={
                      state?.from === 'editInvoice' ||
                      state?.recuuringParam?.type === 'recurring'
                        ? css.iconWrapperForEdit
                        : css.iconWrapper
                    }
                  >
                    <SelectBottomSheet
                      name="invoiceType"
                      onBlur={reValidate}
                      error={validationErr.document_type}
                      helperText={
                        validationErr.document_type
                          ? ValidationErrMsg.document_type
                          : ''
                      }
                      label=" "
                      addNewSheet
                      triggerComponent={
                        <InvoiceIcon
                          className={css.iconField}
                          onClick={() => {
                            onTriggerDrawer('invoiceType');
                          }}
                        />
                      }
                      open={drawer.invoiceType}
                      value={taxValue}
                      onTrigger={onTriggerDrawer}
                      onClose={handleBottomSheet}
                    >
                      {INVOICE_TYPES &&
                        INVOICE_TYPES.map((element) => (
                          <div
                            className={css.valueWrapper}
                            onClick={(e) => onTaxTypeChange(e, element)}
                          >
                            <span
                              className={css.value}
                              style={{
                                fontWeight:
                                  taxType === element?.payload ? 900 : 400,
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              {element.text}
                              {taxType === element?.payload && (
                                <MuiIcon.Done style={{ color: '#ffbb00d1' }} />
                              )}
                            </span>
                            <hr />
                          </div>
                        ))}
                    </SelectBottomSheet>
                  </div>
                  <span className={css.iconLabel}>{taxValue}</span>
                </div>
                <div className={css.iconContainer}>
                  <div className={css.iconWrapper}>
                    <SelectBottomSheet
                      name="currencyType"
                      onBlur={reValidate}
                      label=" "
                      addNewSheet
                      triggerComponent={
                        <RupeeInvoiceIcon
                          className={css.iconField}
                          onClick={() => {
                            onTriggerDrawer('currencyType');
                          }}
                        />
                      }
                      open={drawer.currencyType}
                      value={currencyType}
                      onTrigger={onTriggerDrawer}
                      onClose={handleBottomSheet}
                      id="overFlowHidden"
                    >
                      <div style={{ height: '75vh' }}>
                        <div
                          className={css.searchFilterFull}
                          // style={{ height: '10%' }}
                        >
                          <SearchIcon className={css.searchFilterIcon} />
                          <input
                            placeholder="Search Currency"
                            onChange={(event) => {
                              event.persist();
                              setSearchQuery((prev) => ({
                                ...prev,
                                currencySearch: event?.target?.value,
                              }));
                            }}
                            value={searchQuery?.currencySearch}
                            className={css.searchFilterInputBig}
                          />
                        </div>
                        <div style={{ height: '85%', overflow: 'auto' }}>
                          {CURRENCY_TYPE &&
                            CURRENCY_TYPE?.filter(
                              (val) =>
                                val?.name
                                  ?.toLocaleLowerCase()
                                  ?.includes(
                                    searchQuery?.currencySearch?.toLocaleLowerCase(),
                                  ) ||
                                val?.iso_code
                                  ?.toLocaleLowerCase()
                                  ?.includes(
                                    searchQuery?.currencySearch?.toLocaleLowerCase(),
                                  ),
                            )?.map((element) => (
                              <div
                                className={css.valueWrapper}
                                onClick={() => onCurrencyTypeChange(element)}
                              >
                                <span
                                  className={css.iconLabel}
                                  style={{
                                    fontWeight:
                                      currencyType === element?.iso_code
                                        ? 900
                                        : 400,
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  {element?.name} ({element?.iso_code})
                                  {currencyType === element?.iso_code && (
                                    <MuiIcon.Done
                                      style={{ color: '#ffbb00d1' }}
                                    />
                                  )}
                                </span>
                                <hr />
                              </div>
                            ))}
                          {CURRENCY_TYPE?.filter(
                            (val) =>
                              val?.name
                                ?.toLocaleLowerCase()
                                ?.includes(
                                  searchQuery?.currencySearch?.toLocaleLowerCase(),
                                ) ||
                              val?.iso_code
                                ?.toLocaleLowerCase()
                                ?.includes(
                                  searchQuery?.currencySearch?.toLocaleLowerCase(),
                                ),
                          )?.length === 0 && (
                            <p className={css.noData}>No Data Found!!</p>
                          )}
                        </div>
                      </div>
                    </SelectBottomSheet>
                  </div>
                  <span className={css.iconLabel}>
                    {
                      CURRENCY_TYPE?.find(
                        (val) => val?.iso_code === currencyType,
                      )?.name
                    }
                  </span>
                </div>

                <div className={css.iconContainer}>
                  <div className={css.iconWrapper}>
                    <SelectBottomSheet
                      name="BankList"
                      onBlur={reValidate}
                      label=" "
                      addNewSheet
                      triggerComponent={
                        <BankInvoiceIcon
                          className={css.iconField}
                          onClick={() => {
                            onTriggerDrawer('BankList');
                          }}
                        />
                      }
                      open={drawer.BankList}
                      // value={BankList}
                      onTrigger={onTriggerDrawer}
                      onClose={handleBottomSheet}
                      id="overFlowHidden"
                    >
                      <SelectBankAccount
                        ParamBankList={BankList}
                        listFunction={(val) => FetchBankData(val)}
                        onclose={() => handleBottomSheet('BankList')}
                        callFunction={updatePaymentTerms}
                        ParamSelectedBank={SelectedBank?.id}
                      />
                    </SelectBottomSheet>
                  </div>
                  <span className={css.iconLabel}>
                    {SelectedBank?.id
                      ? SelectedBank?.details?.bank_account_name
                      : 'Bank Info'}
                  </span>
                </div>

                <div className={css.iconContainer}>
                  <div
                    className={
                      state?.from === 'editInvoice' ||
                      state?.recuuringParam?.type === 'recurring'
                        ? css.iconWrapperForEdit
                        : css.iconWrapper
                    }
                  >
                    <SelectBottomSheet
                      name="orgLocation"
                      onBlur={reValidate}
                      error={validationErr.organization_location_id}
                      helperText={
                        validationErr.organization_location_id
                          ? ValidationErrMsg.organization_location_id
                          : ''
                      }
                      label="Organization Location"
                      triggerComponent={
                        <LocationIcon
                          className={css.iconField}
                          onClick={() => {
                            onTriggerDrawer('orgLocation');
                          }}
                        />
                      }
                      open={drawer.orgLocation}
                      value={orgLocationValue}
                      onTrigger={onTriggerDrawer}
                      onClose={handleBottomSheet}
                    >
                      <div className={css.valueHeader}>
                        Organization Location
                      </div>
                      <div className={css.valueContainer}>
                        {orgLocationList &&
                          orgLocationList.map((element) => (
                            <div
                              className={css.valueWrapperOrg}
                              onClick={async () => {
                                await updateInvoice({
                                  ...invoiceParams,
                                  organization_location_id: element.payload,
                                });
                                setOrgLocationId(element.payload);
                                setOrgLocationValue(
                                  `${
                                    element.text.split(',')[
                                      element.text.split(',').length - 4
                                    ]
                                  },${
                                    element.text.split(',')[
                                      element.text.split(',').length - 3
                                    ]
                                  }`,
                                );
                                handleBottomSheet('orgLocation');
                              }}
                              style={{
                                background:
                                  orgLocationId === element?.payload
                                    ? '#95929226'
                                    : '#ededed26',
                                fontWeight:
                                  orgLocationId === element?.payload
                                    ? 600
                                    : 400,
                              }}
                            >
                              <span className={css.value}>{element.text}</span>
                              <hr />
                            </div>
                          ))}
                      </div>
                    </SelectBottomSheet>
                  </div>
                  <Mui.Typography
                    align="center"
                    variant="body2"
                    className={css.iconLabel}
                  >
                    {orgLocationValue?.split(',').join('\n')}
                  </Mui.Typography>
                </div>

                <div className={css.iconContainer}>
                  <div className={css.iconWrapper}>
                    <SelectBottomSheet
                      name="termsCondition"
                      onBlur={reValidate}
                      error={validationErr.organization_location_id}
                      helperText={
                        validationErr.organization_location_id
                          ? ValidationErrMsg.organization_location_id
                          : ''
                      }
                      triggerComponent={
                        <ClipboardIcon
                          className={css.iconField}
                          onClick={() => {
                            onTriggerDrawer('termsCondition');
                          }}
                        />
                      }
                      open={drawer.termsCondition}
                      onTrigger={onTriggerDrawer}
                      onClose={handleBottomSheet}
                    >
                      <div className={css.valueHeader}>
                        Terms &amp; Conditions
                      </div>
                      <div className={css.valueWrapper}>
                        <div className={css.fieldRow}>
                          <Input
                            name="terms"
                            onBlur={reValidate}
                            error={validationErr.terms}
                            helperText={
                              validationErr.terms ? ValidationErrMsg.terms : ''
                            }
                            variant="standard"
                            defaultValue={terms}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            fullWidth
                            onChange={onTermsChange}
                            theme="light"
                            multiline
                            rows={8}
                          />
                          <Mui.Stack
                            display="row"
                            alignItems="flex-end"
                            width="100%"
                            margin="2% 0"
                          >
                            <Mui.Button
                              disableFocusRipple
                              disableElevation
                              disableRipple
                              disableTouchRipple
                              className={css.GenerateBtnForTerms}
                              disabled={tempTerms === ''}
                              onClick={() => termsCondition()}
                            >
                              <Mui.Typography className={css.GenerateBtnText}>
                                Save
                              </Mui.Typography>
                            </Mui.Button>
                          </Mui.Stack>
                        </div>
                      </div>
                    </SelectBottomSheet>
                  </div>
                  <span className={css.iconLabel}>Terms & Conditions</span>
                </div>

                {customerId && (
                  <div className={css.iconContainer}>
                    <div className={css.iconWrapper}>
                      <SelectBottomSheet
                        name="placeOfSupplyDrawer"
                        label=" "
                        triggerComponent={
                          <TransportIcon
                            className={css.iconField}
                            onClick={() => {
                              setSearchPlace('');
                              onTriggerDrawer('placeOfSupplyDrawer');
                            }}
                          />
                        }
                        open={drawer.placeOfSupplyDrawer}
                        onTrigger={onTriggerDrawer}
                        onClose={handleBottomSheet}
                        id="overflowhidden"
                        addNewSheet
                      >
                        <div style={{ height: '75vh' }}>
                          <div
                            className={css.searchFilter}
                            style={{
                              padding: '5px',
                              // height: '10%'
                            }}
                          >
                            <input
                              placeholder="Search Places"
                              onChange={(event) =>
                                setSearchPlace(event.target.value)
                              }
                              style={{ padding: '12px', width: '100%' }}
                            />
                          </div>

                          <div style={{ overflow: 'auto', height: '85%' }}>
                            {allStates &&
                              allStates
                                .filter((val) =>
                                  val.text
                                    .toLocaleLowerCase()
                                    .includes(searchPlace.toLocaleLowerCase()),
                                )
                                .map((element) => (
                                  <div
                                    className={css.valueWrapper}
                                    onClick={() =>
                                      onPlaceOfSupplyChange(element)
                                    }
                                  >
                                    <span
                                      className={css.value}
                                      style={{
                                        fontWeight:
                                          placeOfSupply === element.text
                                            ? 900
                                            : 400,
                                        display: 'flex',
                                        alignItems: 'center',
                                      }}
                                    >
                                      {element.text}
                                      {placeOfSupply === element.text && (
                                        <MuiIcon.Done
                                          style={{ color: '#ffbb00d1' }}
                                        />
                                      )}
                                    </span>
                                    <hr />
                                  </div>
                                ))}
                            {allStates.filter((val) =>
                              val.text
                                .toLocaleLowerCase()
                                .includes(searchPlace.toLocaleLowerCase()),
                            )?.length === 0 && (
                              <p className={css.noData}>No Data Found!!</p>
                            )}
                          </div>
                        </div>
                      </SelectBottomSheet>
                    </div>
                    <span className={css.iconLabel}>
                      {placeOfSupply || 'Place Of Supply'}
                    </span>
                  </div>
                )}

                {customerId && (
                  <div className={css.iconContainer}>
                    <div className={css.iconWrapper}>
                      <SelectBottomSheet
                        name="billingAddress"
                        triggerComponent={
                          <MapIcon
                            className={css.iconField}
                            onClick={() => {
                              onTriggerDrawer('billingAddress');
                            }}
                          />
                        }
                        open={drawer.billingAddress}
                        onTrigger={onTriggerDrawer}
                        onClose={handleBottomSheet}
                        maxHeight="100%"
                      >
                        <div className={css.valueHeader}>Shipping Location</div>
                        <div className={css.valueWrapper}>
                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <Input
                                name="addr_pincode"
                                label="Pincode"
                                variant="standard"
                                value={addrPincode}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth
                                theme="light"
                                rootStyle={{
                                  border: '1px solid #A0A4AF',
                                }}
                                inputProps={{
                                  type: 'tel',
                                }}
                                disabled
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Input
                                name="address_line1"
                                value={custAddr1}
                                label="Address 01"
                                variant="standard"
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                inputProps={{ maxLength: 45 }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment
                                      position="end"
                                      className={mainCss.endInput}
                                    >
                                      {`${custAddr1?.length}/45`}
                                    </InputAdornment>
                                  ),
                                }}
                                fullWidth
                                theme="light"
                                rootStyle={{
                                  border: '1px solid #A0A4AF',
                                }}
                                disabled
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Input
                                name="address_line2"
                                value={custAddr2}
                                label="Address 02"
                                variant="standard"
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                inputProps={{ maxLength: 45 }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment
                                      position="end"
                                      className={mainCss.endInput}
                                    >
                                      {`${custAddr2?.length}/45`}
                                    </InputAdornment>
                                  ),
                                }}
                                fullWidth
                                theme="light"
                                rootStyle={{
                                  border: '1px solid #A0A4AF',
                                }}
                                disabled
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Input
                                name="addr_city"
                                label="Town/City"
                                variant="standard"
                                value={addrCity}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth
                                theme="light"
                                rootStyle={{
                                  border: '1px solid #A0A4AF',
                                }}
                                disabled
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Select
                                name="addr_state"
                                label="STATE"
                                options={allStates}
                                defaultValue={addrCustState}
                                fullWidth
                                disabled
                              />
                            </Grid>

                            <div className={css.gstCheckBox}>
                              <Checkbox
                                checked={isSameAsDelivery}
                                onChange={onCheckBoxChange}
                                classes={{ checked: classes.checked }}
                              />
                              <span>
                                Use the same location for Delivery Address
                              </span>
                            </div>
                          </Grid>
                        </div>
                      </SelectBottomSheet>
                    </div>
                    {addrCity === '' && addrCustState === '' ? (
                      <span className={css.iconLabel}> Shipping Location </span>
                    ) : (
                      <span className={css.iconLabel}>
                        {addrCity}, {addrCustState}{' '}
                      </span>
                    )}
                  </div>
                )}

                {!isSameAsDelivery && (
                  <div className={css.iconContainer}>
                    <div className={css.iconWrapper}>
                      <SelectBottomSheet
                        name="shippingAdderss"
                        triggerComponent={
                          <BikeIcon
                            className={css.iconField}
                            onClick={() => {
                              onTriggerDrawer('shippingAdderss');
                            }}
                          />
                        }
                        open={drawer.shippingAdderss}
                        value={orgLocationValue}
                        onTrigger={onTriggerDrawer}
                        onClose={handleBottomSheetForDelivery}
                        maxHeight="100%"
                        addNewSheet
                      >
                        <div className={css.valueHeader}>Delivery Location</div>
                        <div className={css.valueWrapper}>
                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <Input
                                name="addr_pincode"
                                onBlur={reValidate}
                                error={validationErr.addr_pincode}
                                helperText={
                                  validationErr.addr_pincode
                                    ? ValidationErrMsg.addr_pincode
                                    : ''
                                }
                                label="Pincode"
                                variant="standard"
                                defaultValue={addrDeliverPincode}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth
                                theme="light"
                                rootStyle={{
                                  border: '1px solid #A0A4AF',
                                }}
                                inputProps={{
                                  type: 'tel',
                                }}
                                required
                                onChange={(e) => {
                                  onInputChange(setAddrPincode, e);
                                  setAddrDeliverPincode(e.target.value);
                                  if (e.target?.value?.length === 6) {
                                    fetchPincodeDetails(e.target.value);
                                  }
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Input
                                name="address_line1"
                                onBlur={reValidate}
                                error={validationErr.address_line1}
                                helperText={
                                  validationErr.address_line1
                                    ? ValidationErrMsg.address_line1
                                    : ''
                                }
                                defaultValue={custAddrDeliver1}
                                onChange={(e) => {
                                  onInputChange(setCustAddr1, e);
                                  setCustAddrDeliver1(e.target.value);
                                }}
                                label="Address 01"
                                variant="standard"
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                inputProps={{ maxLength: 45 }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment
                                      position="end"
                                      className={mainCss.endInput}
                                    >
                                      {`${custAddrDeliver1?.length}/45`}
                                    </InputAdornment>
                                  ),
                                }}
                                fullWidth
                                theme="light"
                                rootStyle={{
                                  border: '1px solid #A0A4AF',
                                }}
                                required
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Input
                                name="address_line2"
                                onBlur={reValidate}
                                error={validationErr.address_line2}
                                helperText={
                                  validationErr.address_line2
                                    ? ValidationErrMsg.address_line2
                                    : ''
                                }
                                defaultValue={custAddrDeliver2}
                                onChange={(e) => {
                                  onInputChange(setCustAddr2, e);
                                  // setCustAddr2(e.target.value);
                                  setCustAddrDeliver2(e.target.value);
                                }}
                                label="Address 02"
                                variant="standard"
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                inputProps={{ maxLength: 45 }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment
                                      position="end"
                                      className={mainCss.endInput}
                                    >
                                      {`${custAddrDeliver2?.length}/45`}
                                    </InputAdornment>
                                  ),
                                }}
                                fullWidth
                                theme="light"
                                rootStyle={{
                                  border: '1px solid #A0A4AF',
                                }}
                                required
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Input
                                name="addr_city"
                                onBlur={reValidate}
                                error={validationErr.addr_city}
                                helperText={
                                  validationErr.addr_city
                                    ? ValidationErrMsg.addr_city
                                    : ''
                                }
                                value={addrDeliverCity}
                                onChange={(e) => {
                                  onInputChange(setAddrCity, e);
                                  setAddrDeliverCity(e.target.value);
                                }}
                                label="Town/City"
                                variant="standard"
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth
                                theme="light"
                                rootStyle={{
                                  border: '1px solid #A0A4AF',
                                }}
                                required
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Select
                                name="addr_state"
                                onBlur={reValidate}
                                error={validationErr.addr_state}
                                helperText={
                                  validationErr.addr_state
                                    ? ValidationErrMsg.addr_state
                                    : ''
                                }
                                label="STATE"
                                options={allStates}
                                defaultValue={addrDeliverCustState}
                                onChange={(e) => {
                                  onInputChange(setAddrCustState, e);
                                  setAddrDeliverCustState(e.target.value);
                                }}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <div className={css.addCustomerFooter}>
                                <Button
                                  variant="contained"
                                  className={css.secondary}
                                  style={{
                                    padding: '15px 35px',
                                    textTransform: 'initial',
                                  }}
                                  onClick={() => {
                                    emptyForDeliver();
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="contained"
                                  className={`${css.primary}`}
                                  style={{
                                    padding: '15px',
                                    textTransform: 'initial',
                                  }}
                                  onClick={() => {
                                    onValidateCustomerLocation(
                                      'shippingAdderss',
                                    );
                                  }}
                                >
                                  Set Delivery Address
                                </Button>
                              </div>
                            </Grid>
                          </Grid>
                        </div>
                      </SelectBottomSheet>
                    </div>
                    {addrDeliverCity === '' && addrDeliverCustState === '' ? (
                      <span className={css.iconLabel}> Delivery Location </span>
                    ) : (
                      <span className={css.iconLabel}>
                        {addrDeliverCity}, {addrDeliverCustState}{' '}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div
                style={{
                  padding: '10px 15px 90px',
                  backgroundColor: '#F2F2F0',
                }}
              >
                <div className={css.fields}>
                  <div className={css.fieldRow}>
                    <SelectCustomer
                      customerListValue={customerList}
                      onCreateCustomer={async (cus_id) => {
                        await fetchCustomer();
                        setCustomerId(cus_id);
                      }}
                      setCustomerId={setCustomerId}
                      gstData={gstData}
                      HideExpandMoreIcon
                      customerId={customerId}
                      empty={empty}
                      setItemList={setItemList}
                      setCustName={setSelectedCustomerName}
                      hideChange={
                        state?.from === 'editInvoice' ||
                        state?.recuuringParam?.type === 'recurring'
                      }
                      callFunction={fetchCustomer}
                      setCustomerLocationId={setCustomerLocationId}
                      setEditCustomer={setEditCustomer}
                      setInvoiceView={setInvoiceView}
                      customerCreation={
                        userRolesPeople?.Customers?.create_customers
                      }
                    />
                  </div>
                </div>

                {(taxType === 'credit_note' || taxType === 'debit_note') && (
                  <div className={css.fields}>
                    <div style={{ width: '100%' }}>
                      <InvoiceAndReason
                        selectCustomer={updatedDetails?.customerDetails}
                        callFunction={updatePaymentTerms}
                      />
                    </div>
                  </div>
                )}

                <div
                  className={css.fields}
                  style={{
                    paddingBottom:
                      !state?.recuuringParam &&
                      state?.recuuringParam?.type !== 'recurring' &&
                      selectedItems.length > 0 &&
                      customerId
                        ? '30px'
                        : '0px',
                  }}
                >
                  <div className={css.fieldRow}>
                    <SelectProductService
                      ITEM_CATEGORIES={ITEM_CATEGORIES}
                      itemList={itemList}
                      customerId={customerId}
                      setSelectedItems={setSelectedItems}
                      onProductSelect={onProductSelect}
                      onProductUpdate={onProductUpdate}
                      deleteLineItem={deleteLineItem}
                      fetchLineItems={fetchLineItems}
                      lineItems={lineItems}
                      selectedItems={selectedItems}
                      onCreateProduct={onCreateProduct}
                      newlyAddedItem={newItem}
                      HideExpandMoreIcon
                      taxType={taxType}
                      noteTypeWithShow={noteTypeWithShow}
                    />
                  </div>
                  {state?.recuuringParam &&
                  state?.recuuringParam?.type === 'recurring' &&
                  remainder !== '' ? (
                    <div className={css.fieldRowGrandTotal}>
                      <SelectBottomSheet
                        name="billBreakup"
                        triggerComponent={
                          <div className={css.grandTotalText}>
                            <span className={css.text} style={{ margin: 10 }}>
                              GRAND TOTAL
                            </span>
                          </div>
                        }
                        open={drawer.billBreakup}
                        onTrigger={onTriggerDrawer}
                        onClose={handleBottomSheet}
                        maxHeight="45vh"
                      >
                        <div className={css.valueHeader}>Bill Details</div>
                        <div className={css.valueWrapper}>
                          {lineItems.length > 0 &&
                            lineItems.map((l) => (
                              <div
                                className={css.billDetailsContainerBeta}
                                key={`${l.id}`}
                              >
                                <span className={css.titleBeta}>
                                  HSN/SAC -1
                                </span>
                                <div className={css.billItemsBeta}>
                                  <span className={css.label}>
                                    Taxable Value
                                  </span>
                                  <span className={css.valueBeta}>
                                    {FormattedAmount(
                                      Number(l?.rate) * Number(l?.quantity),
                                    )}
                                  </span>
                                </div>
                                {l.invoice_tax_items &&
                                  l.invoice_tax_items.map((t) => (
                                    <div
                                      className={css.billItemsBeta}
                                      key={`tax${t.id}`}
                                    >
                                      <span
                                        className={css.label}
                                        style={{ textTransform: 'uppercase' }}
                                      >
                                        {t.tax_id}
                                      </span>
                                      <span className={css.valueBeta}>
                                        {FormattedAmount(t?.amount)}
                                      </span>
                                    </div>
                                  ))}

                                <div className={`${css.billItemsBeta}`}>
                                  <span className={css.label}>Total</span>
                                  <span className={css.valueBeta}>
                                    {FormattedAmount(l?.total)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          <div className={css.billDetailsContainerBeta}>
                            <div
                              className={`${css.billItemsBeta} ${css.totalItemsBeta}`}
                            >
                              <span className={css.label}>Grand Total</span>
                              <span className={css.valueBeta}>
                                {lineItems.length > 0
                                  ? FormattedAmount(
                                      lineItems?.reduce(
                                        (acc, val) =>
                                          acc + parseInt(val?.total, 10),
                                        0,
                                      ),
                                    )
                                  : '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </SelectBottomSheet>
                      <div className={css.grandTotalAmt}>
                        {lineItems.length > 0
                          ? FormattedAmount(
                              lineItems?.reduce(
                                (acc, val) => acc + parseInt(val?.total, 10),
                                0,
                              ),
                            )
                          : '-'}
                      </div>
                    </div>
                  ) : (
                    ''
                  )}
                </div>

                {taxType !== 'credit_note' && (
                  <div className={css.fields} style={{ marginTop: 25 }}>
                    <div style={{ width: '100%' }}>
                      <PaymentTerms
                        selectCustomer={updatedDetails?.customerDetails}
                        callFunction={updatePaymentTerms}
                        lineItems={updatedDetails?.lineItems}
                      />
                    </div>
                  </div>
                )}

                <div className={css.fields} style={{ marginTop: 25 }}>
                  <div style={{ width: '100%' }}>
                    <CustomField
                      selectCustomer={updatedDetails?.customerDetails}
                      callFunction={updatePaymentTerms}
                    />
                  </div>
                </div>
                {state?.recuuringParam &&
                state?.recuuringParam?.type === 'recurring' &&
                remainder !== '' ? (
                  <div style={{ marginTop: '2rem' }}>
                    {' '}
                    <RecurringSheet
                      id="chats"
                      startDateData={startDate}
                      endDateData={endDate}
                      remainderData={remainder}
                      day={deliveryDate}
                      setStartDate={setStartDate}
                      setEndDate={setEndDate}
                      setRemainder={setRemainder}
                      setSendDate={setDeliveryDate}
                      custName={state?.name}
                    />{' '}
                    <div>
                      <Button
                        variant="contained"
                        className={`${css.submitButton} ${css.borderRadius}`}
                        fullWidth
                        onClick={() => {
                          updateRecurringInvoice();
                        }}
                        disabled={!(lineItems && lineItems.length > 0)}
                      >
                        Update Recurring Invoice
                      </Button>
                    </div>
                    <div>
                      <Button
                        variant="contained"
                        className={`${css.secondarySubmitBtn} ${css.borderRadius}`}
                        fullWidth
                        onClick={() => {
                          setDrawer((prev) => ({ ...prev, deletePopup: true }));
                        }}
                        disabled={!(lineItems && lineItems.length > 0)}
                      >
                        Cancel Recurring Invoice
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{ position: 'fixed', bottom: '15px', width: '93%' }}
                  >
                    <div className={css.fieldRowGrandTotal}>
                      <SelectBottomSheet
                        name="billBreakup"
                        triggerComponent={
                          <div className={css.grandTotalText}>
                            <span className={css.text}>
                              {lineItems.length > 0
                                ? FormattedAmount(
                                    lineItems?.reduce(
                                      (acc, val) =>
                                        acc + parseInt(val?.total, 10),
                                      0,
                                    ),
                                  )
                                : '-'}
                            </span>
                            <span
                              className={`${css.text} ${css.updatedText}`}
                              style={{ marginTop: '5px' }}
                            >
                              Grand Total
                            </span>
                          </div>
                        }
                        open={drawer.billBreakup}
                        onTrigger={onTriggerDrawer}
                        onClose={handleBottomSheet}
                        maxHeight="45vh"
                      >
                        <div className={css.valueHeader}>Bill Details</div>
                        <div className={css.valueWrapper}>
                          {lineItems.length > 0 &&
                            lineItems.map((l) => (
                              <div
                                className={css.billDetailsContainerBeta}
                                key={`${l.id}`}
                              >
                                <span className={css.titleBeta}>
                                  HSN/SAC -1
                                </span>
                                <div className={css.billItemsBeta}>
                                  <span className={css.label}>
                                    Taxable Value
                                  </span>
                                  <span className={css.valueBeta}>
                                    {FormattedAmount(
                                      Number(l?.rate) * Number(l?.quantity),
                                    )}
                                  </span>
                                </div>
                                {l.invoice_tax_items &&
                                  l.invoice_tax_items.map((t) => (
                                    <div
                                      className={css.billItemsBeta}
                                      key={`tax${t.id}`}
                                    >
                                      <span
                                        className={css.label}
                                        style={{ textTransform: 'uppercase' }}
                                      >
                                        {t.tax_id}
                                      </span>
                                      <span className={css.valueBeta}>
                                        {FormattedAmount(t?.amount)}
                                      </span>
                                    </div>
                                  ))}

                                <div className={`${css.billItemsBeta}`}>
                                  <span className={css.label}>Total</span>
                                  <span className={css.valueBeta}>
                                    {FormattedAmount(l?.total)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          <div className={css.billDetailsContainerBeta}>
                            <div
                              className={`${css.billItemsBeta} ${css.totalItemsBeta}`}
                            >
                              <span className={css.label}>Grand Total</span>
                              <span className={css.valueBeta}>
                                {lineItems.length > 0
                                  ? FormattedAmount(
                                      lineItems?.reduce(
                                        (acc, val) =>
                                          acc + parseInt(val?.total, 10),
                                        0,
                                      ),
                                    )
                                  : '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </SelectBottomSheet>
                      <Button
                        className={css.grandTotalAmt}
                        onClick={() => {
                          if (thresholdLimit) {
                            setThresholdLimitPopup((prev) => ({
                              ...prev,
                              open: true,
                            }));
                          } else {
                            onGenerateInvoice();
                          }
                        }}
                        disabled={!(lineItems && lineItems.length > 0)}
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <ReceivablesPopOver
          open={drawer.deletePopup}
          handleClose={() =>
            setDrawer((prev) => ({ ...prev, deletePopup: false }))
          }
          position="center"
        >
          {/* deleteInvoice(activeItem.id) */}
          <div className={css.effortlessOptions}>
            <h3>Cancel this Invoice</h3>
            <p>Are you sure you want to Cancel this Invoice?</p>

            {/* </ul> */}
            <div
              className={css.addCustomerFooter}
              style={{ marginBottom: '10px' }}
            >
              <Button
                variant="contained"
                className={css.secondary}
                style={{
                  padding: '15px 35px',
                  textTransform: 'initial',
                }}
                onClick={() =>
                  setDrawer((prev) => ({ ...prev, deletePopup: false }))
                }
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                className={`${css.primary}`}
                style={{
                  padding: '15px 35px',
                  textTransform: 'initial',
                  width: 'auto',
                }}
                onClick={() => {
                  deleteRecurringInvoice();
                }}
              >
                &nbsp; OK &nbsp;
              </Button>
            </div>
          </div>
        </ReceivablesPopOver>
        <Mui.Dialog
          open={thresholdLimitPopup?.open}
          onClose={() =>
            setThresholdLimitPopup((prev) => ({ ...prev, open: false }))
          }
          maxWidth="sm"
          fullWidth
          PaperProps={{
            elevation: 3,
            style: {
              overflow: 'visible',
              borderRadius: 16,
            },
          }}
        >
          <div className={css.thresholdContainer}>
            <div className={css.header}>
              <p>GST Registration</p>
            </div>
            <div className={css.body}>
              <p>
                Dear Customer, <br /> <br />
                Your turnover is about to cross the GST registration limit of
                20/40 lakhs. <br /> <br />
                Do you want to opt for a voluntary registration?
              </p>
            </div>
            <div className={css.footer}>
              <Button
                variant="contained"
                className={css.secondary}
                style={{
                  padding: '15px 35px',
                  textTransform: 'initial',
                }}
                onClick={() => {
                  setThresholdLimitPopup((prev) => ({ ...prev, open: false }));
                  onGenerateInvoice();
                }}
              >
                No
              </Button>
              <Button
                variant="contained"
                className={`${css.primary}`}
                style={{
                  padding: '15px 35px',
                  textTransform: 'initial',
                  width: 'auto',
                }}
                onClick={() => {
                  setThresholdLimitPopup((prev) => ({ ...prev, open: false }));
                  onGenerateInvoice();
                }}
              >
                &nbsp; Yes &nbsp;
              </Button>
            </div>
          </div>
        </Mui.Dialog>
        {havePermission.open && (
          <PermissionDialog onClose={() => havePermission.back()} />
        )}
      </>
    );
  };

  const SuccessPage = () => {
    return (
      <div
        className={css.createInvoiceContainer}
        style={{ display: successView ? 'flex' : 'none' }}
      >
        <div className={css.fieldWrapper}>
          <div className={css.fields}>
            <div className={css.fieldRow}>
              <Grid container spacing={2} className={css.successPage}>
                <Grid item xs={12}>
                  <Typography
                    variant="h4"
                    align="center"
                    className={css.successTitle}
                  >
                    Well Done !
                  </Typography>
                </Grid>
                <Grid item xs={12} className={css.successPageCenterd}>
                  <img src={InvoiceSuccess} alt="Well Done" />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" align="center">
                    Your Invoice has been sent for approval.
                  </Typography>
                  <br />
                  <Typography variant="body2" align="center">
                    After the Approval Process is completed, you can deliver the
                    Invoice to your Client
                  </Typography>
                </Grid>
                <Grid item xs={12} className={css.successPageCenterd}>
                  {/* <input type="button" value="Return to your Dashboard" className={css.primary} onClick={() => { }} /> */}
                  <Button
                    variant="contained"
                    className={css.primary}
                    onClick={() => {
                      changeView('dashboard');
                      changeSubView('');
                    }}
                  >
                    Return to your Dashboard
                  </Button>
                </Grid>
              </Grid>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const heading = [
    { title: 'New Invoice', path: '/invoice-new', back: '/invoice' },
    {
      title: 'Draft Invoice',
      path: '/invoice-draft-new',
      back: '/invoice-draft',
    },
    {
      title: 'Recurring Invoice',
      path: '/invoice-recurring-edit',
      back: '/invoice-recurring',
    },
    { title: 'Estimate', path: '/invoice-estimate', back: '/invoice' },
    { title: 'New Invoice', path: '/people-invoice-new', back: '/people' },
  ];

  return (
    <>
      <PageTitle
        title={heading?.find((val) => val?.path === pathName)?.title}
        onClick={() => {
          setActiveInvoiceId({
            activeInvoiceId: '',
          });
          if (device === 'desktop') {
            navigate(heading?.find((val) => val?.path === pathName)?.back);
          }
          if (device === 'mobile') {
            if (editCustomer?.open) {
              setEditCustomer({ open: false, editValue: {} });
              setInvoiceView(true);
            } else {
              navigate(heading?.find((val) => val?.path === pathName)?.back);
            }
          }
        }}
      />
      <div
        className={
          device === 'mobile'
            ? cssDash.dashboardBodyContainerhideNavBar
            : cssDash.dashboardBodyContainerDesktop
        }
      >
        <div style={{ width: '100%' }}>
          {successView && SuccessPage()}
          {onLoadInvoiceView && InvoiceOnLoad()}
          {editCustomer.open && (
            <>
              <div className={css.headerContainer} style={{ margin: '1rem' }}>
                <div className={css.headerLabel}>
                  {editCustomer?.editValue?.name}
                </div>
                <span className={css.headerUnderline} />
              </div>
              <InvoiceCustomer
                showValue={editCustomer.editValue}
                handleBottomSheet={() => {
                  setEditCustomer({ open: false, editValue: {} });
                  setInvoiceView(true);
                }}
                type="customers"
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateInvoiceContainerBeta;
