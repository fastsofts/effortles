/* eslint-disable no-unused-expressions */
/* eslint-disable no-lone-blocks */
/* eslint-disable camelcase */
/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable no-plusplus */

import React, { useState, useContext, useEffect, useRef, useMemo } from 'react';

import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import PageTitle from '@core/DashboardView/PageTitle';
import cssDash from '@core/DashboardView/DashboardViewContainer.scss';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet';
import SuccessView from '@core/BillBookView/shared/SuccessView';
import { PermissionDialog } from '@components/Permissions/PermissionDialog.jsx';
import BillItem from '@core/PaymentView/shared/Bill';
import * as Mui from '@mui/material';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer.jsx';
import { FormattedAmount } from '@components/formattedValue/FormattedValue';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import AppContext from '@root/AppContext.jsx';
import { Tab, Tabs, InputBase } from '@material-ui/core';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import * as Router from 'react-router-dom';
import UploadBankDetails from '@components/UploadBankDetails';
// import UploadBankDetailsMobile from '@components/UploadBankDetails/Mobile';

import alertIcon from '@assets/alert-octagon.svg';
import { CheckSvg, CheckedSvg } from './shared/Icons';
import PayNow from './shared/PayNow';
import css from './MakePayment.scss';
import ProceedToPay from './shared/ProceedToPay';
import VendorBill from './shared/VendorBill';
import { FinalPayment } from './FinalPayment';
import PaymentBankReq from './component/PaymentBankReq.jsx';
import TransactionForgetPassword from './TransactionVerify/ForgetPassword';

const useStyles = makeStyles(() => ({
  indicator: {
    backgroundColor: '#F08B32',
  },
  styledCardTextfield: {
    backgroundColor: 'white !important',
    height: '49px !important',
    width: '90vw !important',
    padding: '0 0 0 25px',
    borderRadius: '16px !important',
  },
  styledCardTextfieldDesktop: {
    width: '100% !important',
    height: '40px !important',
    borderRadius: '8px !important',
    backgroundColor: 'rgba(237, 237, 237, 0.15)',
    border: '1px solid rgba(153, 158, 165, 0.39)',
    padding: '5px',
  },
}));

const Accordion = withStyles({
  root: {
    border: 'none',
    boxShadow: 'none',
    marginBottom: '10px',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      // margin: '10px 0',
    },
  },
  expanded: {
    // margin: '0 !important',
  },
})(MuiAccordion);

const AccordionSummary = withStyles({
  root: {
    backgroundColor: '#FFEFE0',
    borderBottom: 'none',
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles(() => ({
  root: {
    padding: '8px 0px 0 0px',
    backgroundColor: 'white',
  },
}))(MuiAccordionDetails);

const PaymentDialog = withStyles({
  root: {
    '& .css-1t1j96h-MuiPaper-root-MuiDialog-paper': {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    '& .css-yiavyu-MuiBackdrop-root-MuiDialog-backdrop': {
      background: '#000000',
      opacity: '0.2 !important',
    },
  },
})(Mui.Dialog);

const MakePayment = () => {
  const {
    changeSubView,
    organization,
    enableLoading,
    user,
    openSnackBar,
    pageParams,
    userPermissions,
  } = useContext(AppContext);
  const device = localStorage.getItem('device_detect');

  const classes = useStyles();
  const searchRef = useRef();
  const [paymentVoucharId, setPaymentVoucharId] = useState();
  const [retryPaymentVoucharId, setRetryPaymentVoucharId] = useState();
  const [vendorBills, setVendorBills] = useState([]);
  const [unsettledVendorBills, setUnsettledVendorBills] = useState([]);
  const [selectedbillids, setselectedbillids] = useState([]);
  const [searchUnsettledVendorBills, setSearchUnsettledVendorBills] = useState(
    [],
  );
  const [selectedVoucherItems, setSelectedVoucherItems] = useState([]);

  const [tabValue, setTabValue] = useState(0);
  const [vendor, setVendor] = useState();
  const [bankAccounts, setBankAccounts] = useState();
  const [searchTerm, setSearchTerm] = useState();
  const [finalTotal, setFinaltotal] = useState();
  const navigate = Router.useNavigate();
  const [transaction, setTransaction] = useState('');
  const [multiplePayments, setMultiplePayments] = useState(false);
  const [paymentsResponse, setPaymentsResponse] = useState();
  const { state } = Router.useLocation();
  const [payNow, setPayNow] = useState({
    active: false,
    title: 'Grand Total',
    subTitle: 'No Parties and Bills Selected for Payment',
  });

  const [drawer, setDrawer] = useState({
    makePayment: false,
    proceedToPay: false,
    verifyPassword: false,
    paymentSuccess: false,
    paymentBank: false,
    BankupOpen: false,
  });
  const [clickVendorId, setClickVendorId] = React.useState('');

  const [ShowTransPass, setShowTransPass] = useState(false);
  const InitialState = {
    bankless_entity: 0,
  };
  const [BankuploadState, setBankuploadState] = useState(InitialState);
  const [userRoles, setUserRoles] = React.useState({});
  const [havePermission, setHavePermission] = React.useState({ open: false });

  React.useEffect(() => {
    if (Object.keys(userPermissions?.Payments || {})?.length > 0) {
      if (!userPermissions?.Payments?.Payment) {
        setHavePermission({
          open: true,
          back: () => {
            navigate('/dashboard');
            setHavePermission({ open: false });
          },
        });
      }
      setUserRoles({ ...userPermissions?.Payments });
    }
  }, [userPermissions]);

  React.useEffect(() => {
    if (
      Object.keys(userRoles?.Payment || {})?.length > 0 &&
      !userRoles?.Payment?.create_payment
    ) {
      setHavePermission({
        open: true,
        back: () => {
          navigate('/payment');
          setHavePermission({ open: false });
        },
      });
    }
  }, [userRoles?.Payment]);

  const tabchange = (event, value) => {
    setTabValue(value);
  };

  const HandleBankUpload = () => {
    setDrawer({ ...drawer, BankupOpen: false });
  };

  const handleBottomSheetOpen = (open, id) => {
    setDrawer((prev) => ({ ...prev, makePayment: false }));
    setDrawer((prev) => ({ ...prev, [open]: true }));
    if (id !== null) {
      setClickVendorId(id);
    }
  };

  const handleBottomSheetClose = (close) => {
    setDrawer((prev) => ({ ...prev, [close]: false }));
  };

  const handleBottomSheet = (name) => {
    setDrawer((d) => ({ ...d, [name]: false }));
  };

  const showError = (message) => {
    openSnackBar({
      message: message || 'Unknown Error Occured',
      type: 'error',
    });
  };

  const GetUnsettledVendorBillsByVendorId = async (vendorId) => {
    enableLoading(true);

    RestApi(
      `organizations/${organization.orgId}/vendor_unsettled?vendor_id=${vendorId}`,
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
          res.data.map((a) =>
            Object.assign(a, {
              selected: false,
              paidAmount: Number(a.net_balance).toFixed(0),
            }),
          );
          const resdata = res.data;
          if (selectedbillids.length > 0) {
            resdata.map((item) =>
              selectedbillids.map((id) => {
                if (item.id === id) {
                  item.selected = true;
                }
                selectedVoucherItems.map((ele) => {
                  if (ele.txn_line_id === item.id) {
                    item.voucher_id = ele.id;
                    item.paidAmount = ele.amount;
                  }
                });
                // resdata.push(item);
                // return;
              }),
            );
          }
          setVendorBills(resdata);
          setDrawer((d) => ({ ...d, makePayment: true }));
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const onTriggerDrawer = async (name, vendorId) => {
    setVendor(vendorId);
    await GetUnsettledVendorBillsByVendorId(vendorId);
  };

  const getBankAccounts = async () => {
    enableLoading(true);

    await RestApi(
      `organizations/${organization.orgId}/payment_vouchers/${paymentVoucharId}/bank_accounts`,
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
          if (res.message === 'You are not allowed to perform this action') {
            showError(res.message);
          } else {
            setBankAccounts(res.data);
            setDrawer((d) => ({ ...d, proceedToPay: true }));
          }
        } else {
          showError(res.message);
        }
      })
      .catch((e) => {
        showError(e);
        enableLoading(false);
      });
  };

  const handlePay = () => {
    if (payNow.active) {
      getBankAccounts();
    }
  };

  const GetUnsettledVendorBills = async () => {
    enableLoading(true);

    RestApi(
      `organizations/${organization.orgId}/vendor_unsettled?grouped=true`,
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
          setUnsettledVendorBills(res.data);
          const list = res.data.map((item) => {
            const temp = item;
            temp.selected = false;
            return temp;
          });
          setSearchUnsettledVendorBills(list);
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const CreateVoucher = async () => {
    enableLoading(true);
    await RestApi(`organizations/${organization.orgId}/payment_vouchers`, {
      method: METHOD.POST,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
      payload: {
        transaction_type: transaction,
      },
    })
      .then((res) => {
        if (res && !res.error) {
          setPaymentVoucharId(res.id);
        } else {
          showError(res.error);
        }
        enableLoading(false);
      })
      .catch((e) => {
        enableLoading(false);
        showError(e);
      });
  };

  const getAllVoucherItems = async () => {
    enableLoading(true);
    await RestApi(
      `organizations/${organization.orgId}/payment_vouchers/${
        state?.payment?.id || state?.voucherId || paymentVoucharId
      }/items`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        if (res && !res.error) {
          res.data.map((a) =>
            Object.assign(a, {
              selected: true,
              credit_period: a.age,
              name: a.vendor_name,
              voucher_id: a.id,
              paidAmount: a.amount,
            }),
          );
          setVendorBills(res.data);
          setSelectedVoucherItems(res.data);
          setselectedbillids(res.data.map((e) => e.txn_line_id));
          enableLoading(false);
        } else {
          showError(res.error);
          enableLoading(false);
        }
        enableLoading(false);
      })
      .catch((e) => {
        enableLoading(false);
        showError(e);
      });
  };
  // useEffect(() => {
  //   if (state?.payment || state?.voucherId) {
  //     setTabValue(1);
  //     setPaymentVoucharId(state?.payment?.id || state?.voucherId);
  //     getAllVoucherItems();
  //   } else if (state?.people) {
  //     setTabValue(0);
  //     CreateVoucher();
  //     setPaymentVoucharId('');
  //     GetUnsettledVendorBills();
  //     onTriggerDrawer('makePayment', state?.people?.id);
  //   } else {
  //     setTabValue(0);
  //     CreateVoucher();
  //     setPaymentVoucharId('');
  //     GetUnsettledVendorBills();
  //   }
  // }, []);

  useEffect(() => {
    if (retryPaymentVoucharId) {
      setDrawer((d) => ({ ...d, paymentSuccess: false, proceedToPay: false }));
      setMultiplePayments(false);
      setTabValue(1);
      setPaymentVoucharId(retryPaymentVoucharId);
      getAllVoucherItems();
    }
  }, [retryPaymentVoucharId]);
  useEffect(() => {
    if (tabValue === 1) {
      enableLoading(true);
      setTimeout(() => {
        getAllVoucherItems();
      }, 400);
      enableLoading(false);
    } else if (tabValue === 0) {
      // setSearchUnsettledVendorBills(vendorBills);
      // GetUnsettledVendorBills();
      // setTimeout(() => {
      const newItems = unsettledVendorBills.map((item) => {
        vendorBills.map((ele) => {
          if (item.id === ele.txn_line_id) {
            const updatedItem = {
              ...item,
              // voucher_id: res.id,
              selected: true,
              // paidAmount: Number(item.net_balance).toFixed(0),
            };
            return updatedItem;
          }
        });

        return { ...item };
      });

      setVendorBills(newItems);
      setSearchUnsettledVendorBills(newItems);
      // }, 100);
    }
  }, [tabValue]);

  const onInputChange = (e) => {
    const { value } = e.target;
    setSearchTerm(value);

    const searchResult =
      unsettledVendorBills &&
      unsettledVendorBills.filter(
        (item) =>
          item && item.name.toLowerCase().indexOf(value.toLowerCase()) > -1,
      );
    setSearchUnsettledVendorBills(searchResult);
  };

  const deleteVoucher = async (id) => {
    await RestApi(
      `organizations/${organization.orgId}/payment_vouchers/${paymentVoucharId}/items/${id}`,
      {
        method: METHOD.DELETE,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        if (res && res.error) {
          showError(res.error);
        }
      })
      .catch((e) => {
        showError(e);
      });
  };

  const updateVoucherItem = async (id, amount) => {
    enableLoading(true);
    await RestApi(
      `organizations/${organization.orgId}/payment_vouchers/${paymentVoucharId}/items/${id}`,
      {
        method: METHOD.PATCH,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.activeToken}`,
        },
        payload: {
          amount,
        },
      },
    )
      .then((res) => {
        if (res && !res.error) {
          const newItems = vendorBills.map((item) => {
            if (item.voucher_id === id) {
              const updatedItem = {
                ...item,
                paidAmount: amount,
              };
              return updatedItem;
            }
            return { ...item };
          });
          setVendorBills(newItems);
        } else {
          showError(res.error);
        }
        enableLoading(false);
      })
      .catch((e) => {
        showError(e);
        enableLoading(false);
      });
  };

  const createVoucherItem = async (data) => {
    const body = {
      vendor_id: state?.payables?.id || vendor,
      amount: data.amount,
      document_reference: '',
      description: data.narration,
      txn_line_id: data.txn_line_id,
    };
    enableLoading(true);

    await RestApi(
      `organizations/${organization.orgId}/payment_vouchers/${paymentVoucharId}/items`,
      {
        method: METHOD.POST,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
        payload: { ...body },
      },
    )
      .then((res) => {
        enableLoading(false);
        if (res && !res.error) {
          const newItems = vendorBills.map((item) => {
            if (item.id === data.txn_line_id) {
              const updatedItem = {
                ...item,
                voucher_id: res.id,
                selected: true,
                paidAmount: Number(item.net_balance).toFixed(0),
              };
              return updatedItem;
            }

            return { ...item };
          });

          setVendorBills(newItems);
          // if(state?.payables) onTriggerDrawer('makePayment', state?.payables?.id);
        } else {
          if (res.error && res.message) {
            if (res.message === 'No vendor bank details is present') {
              // openSnackBar({
              //   message: res.message,
              //   type: MESSAGE_TYPE.WARNING,
              // });
              handleBottomSheetOpen('paymentBank', body.vendor_id);
              return;
            }
          }
          showError(res.error);
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const handleSelect = async (checked, id) => {
    const bill = vendorBills.find((a) => a.id === id);
    const body = {
      amount: state?.payables?.amount || 0,
      document_reference: '',
      description: state?.payables?.narration || bill?.narration || '',
      txn_line_id: state?.payables?.txn_line_id || bill?.id,
    };

    if (checked === true) {
      await createVoucherItem(body);
      setselectedbillids([state?.payables?.txn_line_id]);
    } else {
      await deleteVoucher(bill.voucher_id);
      const newItems = vendorBills.map((item) => {
        if (item.id === id) {
          const updatedItem = {
            ...item,
            selected: checked,
            voucher_id: null,
            paidAmount: 0,
          };
          return updatedItem;
        }
        return item;
      });
      setselectedbillids((prev) => {
        const temp = prev;
        const index = temp.indexOf(bill.txn_line_id);
        if (index > -1) {
          temp.splice(index, 1);
        }
        return temp;
      });
      setVendorBills(newItems);
      // const temp = searchUnsettledVendorBills.map((item) => {
      //   const t = item;
      //   if (t.id === vendor_id) {
      //     t.selected = false;
      //     t.total_count = Number(t.total_count) + 1;
      //     return item;
      //   }
      //   return t;
      // });
      // setSearchUnsettledVendorBills(temp);
    }
  };

  const groupByKey = (data, key) => {
    return data.reduce((acc, item) => {
      (acc[item[key]] = acc[item[key]] || []).push(item);
      return acc;
    }, {});
  };

  useEffect(() => {
    // let partyCount = 1;
    // if (state) {
    const vendorObj = {};
    vendorBills.forEach((el) => {
      vendorObj[el.vendor_id] = null;
    });
    const partyCount = Object.keys(vendorObj).length;
    // }
    const billCount = vendorBills.filter((a) => a.selected).length;

    const totalAmount = vendorBills
      .filter((a) => a.selected && Number(a.paidAmount) <= Number(a.amount))
      .map((a) => Number(a.paidAmount) || 0)
      .reduce((a, b) => a + b, 0);
    if (billCount === 0) {
      setPayNow({
        active: false,
        title: 'Grand Total',
        subTitle: 'No Parties and Bills Selected for Payment',
      });
    } else {
      setPayNow({
        active: Number.isNaN(totalAmount) ? 0 : Number(totalAmount) > 0,
        title: FormattedAmount(totalAmount),
        subTitle: `${partyCount} Party and ${billCount} Bills Selected`,
      });
    }
  }, [vendorBills]);

  const fintotal = (input) => {
    let total = 0;
    input.map((item) => {
      total += Number(item.paidAmount);
      return total;
    });
    return Number.isNaN(total) ? 0 : total;
  };

  const handleAmountChange = (amount, id) => {
    const newItems = vendorBills.map((item) => {
      if (item.id === id) {
        const updatedItem = {
          ...item,
          paidAmount: amount,
        };
        return updatedItem;
      }

      return { ...item };
    });
    Object.keys(
      groupByKey(
        newItems.filter((a) => a.selected),
        'vendor_name',
      ),
    ).map((objKey) => {
      const finalTotalValue = FormattedAmount(
        fintotal(
          groupByKey(
            newItems.filter((a) => a.selected),
            'vendor_name',
          )[objKey],
        ),
      );
      setFinaltotal((prevState) => ({
        ...prevState,
        [`${objKey}`]: finalTotalValue,
      }));
      console.log(finalTotalValue);
    });

    setVendorBills(newItems);
  };
  const GetTransaction = (item) => {
    setTransaction(item);
  };

  const BulkDelete = async (keyValue) => {
    const voucherKeys = groupByKey(
      vendorBills.filter((a) => a.selected),
      'vendor_name',
    )[keyValue].map((listItem) => listItem.voucher_id);
    const selectedId = groupByKey(
      vendorBills.filter((a) => a.selected),
      'vendor_name',
    )[keyValue].map((listItem) => {
      console.log('listIt', listItem);
      return listItem.txn_line_id;
    });
    const paramVouchar = `${voucherKeys.map(
      (ele) => `voucher_item_ids[]=${ele}`,
    )}`.replaceAll(',', '&');
    await RestApi(
      `organizations/${organization.orgId}/payment_vouchers/${paymentVoucharId}/delete_items?${paramVouchar}`,
      {
        method: METHOD.DELETE,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        if (res && res.error) {
          showError(res.error);
        } else if (res?.message === 'Selected voucher items has been deleted') {
          openSnackBar({
            message: res?.message,
            type: MESSAGE_TYPE.INFO,
          });
          const newItems = vendorBills.map((item) => {
            for (let i = selectedId.length - 1; i >= 0; i--) {
              if (item.txn_line_id === selectedId[i]) {
                item.selected = false;
                item.voucherId = null;
                item.paidAmount = 0;
                return item;
              }
            }
            return item;
          });
          setselectedbillids((prev) => {
            const temp = prev;
            for (let i = selectedId.length - 1; i >= 0; i--)
              temp.splice(selectedId[i], 1);
            return temp;
          });
          setVendorBills(newItems);
          getAllVoucherItems();
        }
      })
      .catch((e) => {
        showError(e);
      });
  };

  const RefreshVouchers = async () => {
    const body = {};
    body.type = state.opt;

    enableLoading(true);
    await RestApi(`organizations/${organization.orgId}/quick_payments`, {
      method: METHOD.POST,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
      payload: {
        ...body,
      },
    })
      .then((res) => {
        enableLoading(false);
        if (res) {
          GetUnsettledVendorBills();
          setPaymentVoucharId(res?.id);
          getAllVoucherItems();
          HandleBankUpload();
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  useEffect(() => {
    if (state?.payment || state?.voucherId) {
      setPaymentVoucharId(state?.payment?.id || state?.voucherId);
      if (state?.payment) {
        if (state?.vendorUnsettled) {
          setUnsettledVendorBills(state?.vendorUnsettled);
        } else {
          GetUnsettledVendorBills();
        }
      }

      setTabValue(1);
      getAllVoucherItems();
      setBankuploadState({
        ...BankuploadState,
        bankless_entities: state?.payment?.bankless_entities,
        // bankless_entities: 10,
      });
      if (
        state?.payment?.bankless_entities > 0 &&
        (state.opt === 'overdue' || state.opt === 'payables')
      )
        setDrawer({ ...drawer, BankupOpen: true });
    } else if (state?.fromVendorSelection) {
      setPaymentVoucharId('');
      setTabValue(0);
      CreateVoucher();
      GetUnsettledVendorBills();
      onTriggerDrawer('makePayment', state?.fromVendorSelection?.id);
    } else if (state?.payables) {
      CreateVoucher();
    } else {
      setPaymentVoucharId('');
      setTabValue(0);
      CreateVoucher();
      GetUnsettledVendorBills();
    }
  }, []);

  useMemo(async () => {
    if (paymentVoucharId && state?.payables) {
      await GetUnsettledVendorBills();
      await handleSelect(true, state?.payables?.id);
      await setTabValue(1);
    }
  }, [paymentVoucharId]);

  //  Transaction Forget Password Start

  const ShowForgetPassWord = () => {
    setShowTransPass(true);
  };

  // Transaction Forget Password End

  return (
    // here
    <>
      <PageTitle
        title="Payments"
        onClick={() => {
          if (state?.fromVendorSelection) {
            navigate(state?.fromVendorSelection?.path, {
              state: state?.fromVendorSelection?.backState,
            });
          } else {
            navigate(-1);
          }
        }}
      />
      <div className={cssDash.makePaymentContainer}>
        <div
          className={
            device === 'desktop'
              ? css.makePaymentContainerDesktop
              : css.makePaymentContainer
          }
        >
          <div
            className={
              device === 'desktop'
                ? css.makePaymentContainerMainDesktop
                : css.makePaymentContainerMainMobile
            }
          >
            <div
              className={
                device === 'desktop'
                  ? css.headerContainerDesktop
                  : css.headerContainer
              }
            >
              <div className={css.headerLabel}>
                {drawer.paymentSuccess ? 'Payment Status' : 'Make a Payment'}
              </div>
              <span className={css.headerUnderline} />
            </div>
            {drawer.paymentSuccess ? (
              <>
                {multiplePayments === true && (
                  <FinalPayment
                    paymentsResponse={paymentsResponse}
                    setRetryPaymentVoucharId={setRetryPaymentVoucharId}
                    paymentType="voucher_payment"
                  />
                )}
                {multiplePayments === false && (
                  <SuccessView
                    title="Your Payment is Being Processed"
                    description=""
                    btnTitle="Visit Payments"
                    onClick={() => {
                      changeSubView('paymentView');
                      navigate('/payment');
                    }}
                  />
                )}
              </>
            ) : (
              <div
                className={
                  device === 'desktop'
                    ? css.tabContainerDesktop
                    : css.tabContainer
                }
              >
                <div
                  className={
                    device === 'desktop'
                      ? css.tabsWrapperDesktop
                      : css.tabsWrapper
                  }
                >
                  <Tabs
                    value={tabValue}
                    onChange={tabchange}
                    className={css.tabsStyle}
                    classes={{
                      indicator: classes.indicator,
                    }}
                  >
                    <Tab
                      disableRipple
                      value={0}
                      key="outstanding"
                      label="OUTSTANDING"
                      className={
                        tabValue === 0 ? css.activeTab : css.deactiveTab
                      }
                    />
                    <Tab
                      disableRipple
                      value={1}
                      key="selected"
                      label="SELECTED"
                      className={
                        tabValue === 1 ? css.activeTab : css.deactiveTab
                      }
                    />
                  </Tabs>
                </div>
                {tabValue === 1 && device === 'desktop' && (
                  <div className={css.infoTextDiv}>
                    <p className={css.infoText}>
                      <img src={alertIcon} alt="Alert" /> Click Outstanding to
                      make Payment to more vendors
                    </p>
                  </div>
                )}
                <Mui.Typography className={css.text}>
                  companies to be selected
                </Mui.Typography>
                {tabValue === 0 ? (
                  <>
                    <div className={css.outstanding}>
                      <InputBase
                        inputRef={searchRef}
                        className={
                          device === 'desktop'
                            ? classes.styledCardTextfieldDesktop
                            : classes.styledCardTextfield
                        }
                        sx={{ ml: 1, flex: 1 }}
                        placeholder={
                          device === 'desktop'
                            ? 'Search for Bills company'
                            : 'search for bills'
                        }
                        name="search"
                        value={searchTerm}
                        onChange={(e) => onInputChange(e)}
                      />
                      <div
                        className={
                          device === 'desktop' ? css.billsDesktop : css.bills
                        }
                      >
                        {searchUnsettledVendorBills &&
                          searchUnsettledVendorBills.length > 0 &&
                          searchUnsettledVendorBills.map((bill) => {
                            // if (bill.selected === false) {
                            return (
                              <div
                                key={`index-${bill.id}`}
                                className={
                                  device === 'desktop'
                                    ? css.billItemDesktop
                                    : css.biilItem
                                }
                                onClick={() =>
                                  onTriggerDrawer('makePayment', bill.id)
                                }
                              >
                                <div className={css.body}>
                                  <p className={css.billName}>
                                    {bill.name?.toLowerCase()}
                                  </p>
                                  <p className={css.totalBill}>
                                    {bill.total_count} Outstanding Bills
                                  </p>
                                </div>
                                <p className={css.billAmount}>
                                  {FormattedAmount(bill?.total_net_balance)}
                                </p>
                              </div>
                            );
                            // }
                          })}
                        {searchUnsettledVendorBills &&
                          searchUnsettledVendorBills.length === 0 && (
                            <Mui.Typography align="center">
                              No Data Found
                            </Mui.Typography>
                          )}
                      </div>
                    </div>
                    <div
                      className={
                        device === 'desktop' ? css.payNowDesktop : css.payNow
                      }
                    >
                      <PayNow
                        active={payNow.active}
                        title={payNow.title}
                        subTitle={payNow.subTitle}
                        handlePay={() => {}}
                        hasBalance
                        PayType={(item) => GetTransaction(item)}
                      />
                    </div>
                    <SelectBottomSheet
                      triggerComponent
                      open={drawer.makePayment}
                      name="makePayment"
                      onClose={() => handleBottomSheet('makePayment')}
                      id="overFlowHidden"
                      addNewSheet
                    >
                      <VendorBill
                        vendorBillsList={vendorBills}
                        vendor_id={vendor}
                        deleteVoucher={deleteVoucher}
                        paymentVoucharId={paymentVoucharId}
                        selectedbills={selectedbillids}
                        setselectedbillids={setselectedbillids}
                        done={(amount, billCount, selectedVendorBills) => {
                          setDrawer({ makePayment: false });
                          setPayNow({
                            active: true,
                            title: `Rs. ${amount}`,
                            subTitle: `1 Party and ${billCount} Bill(s) Selected`,
                          });
                          setVendorBills(selectedVendorBills);
                          setTabValue(1);
                        }}
                        handleBottomSheetOpen={handleBottomSheetOpen}
                      />
                    </SelectBottomSheet>
                  </>
                ) : (
                  <>
                    <div className={css.selectedParty}>
                      {vendorBills?.length > 0 &&
                        Object.keys(
                          groupByKey(
                            vendorBills.filter((a) => a.selected),
                            'vendor_name',
                          ),
                        ).map((objKey) => {
                          return (
                            <Accordion>
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                              >
                                <FormControlLabel
                                  aria-label="Acknowledge"
                                  onClick={(event) => event.stopPropagation()}
                                  onFocus={(event) => event.stopPropagation()}
                                  control={
                                    <Checkbox
                                      icon={<CheckSvg />}
                                      checkedIcon={<CheckedSvg />}
                                      checked={
                                        vendorBills.filter((a) => a?.selected)
                                          ?.length > 0
                                      }
                                      onChange={() => BulkDelete(objKey)}
                                    />
                                  }
                                />
                                <div className={css.selectedBill}>
                                  <p className={css.selectedBillName}>
                                    {pageParams === null
                                      ? unsettledVendorBills
                                          .find((a) => a.id === vendor)
                                          ?.name?.toLowerCase()
                                      : objKey}
                                  </p>
                                  <p className={css.selectedTotalAmount}>
                                    {FormattedAmount(
                                      fintotal(
                                        groupByKey(
                                          vendorBills.filter((a) => a.selected),
                                          'vendor_name',
                                        )[objKey],
                                      ),
                                    )}{' '}
                                    {console.log('finalTotal', finalTotal)}
                                  </p>
                                </div>
                              </AccordionSummary>
                              <AccordionDetails>
                                <div style={{ width: '100%' }}>
                                  {console.log(
                                    'groupkey',
                                    groupByKey(
                                      vendorBills.filter((a) => a.selected),
                                      'vendor_name',
                                    )[objKey],
                                  )}
                                  {groupByKey(
                                    vendorBills.filter((a) => a.selected),
                                    'vendor_name',
                                  )[objKey].map((listitem, index) => {
                                    // setSelect(listitem);
                                    return (
                                      <div
                                        className={
                                          device === 'desktop'
                                            ? css.categoryOptionsDesktop
                                            : css.categoryOptions
                                        }
                                        key={listitem.id}
                                        role="menuitem"
                                      >
                                        {console.log('itemval', listitem)}
                                        <BillItem
                                          key={listitem.id}
                                          index={index}
                                          checked={listitem.selected}
                                          name={listitem.vendor_name}
                                          totalAmount={
                                            listitem.net_balance
                                              ? listitem.net_balance
                                              : listitem.original_amount
                                          }
                                          paidAmount={listitem.paidAmount}
                                          day={listitem.age_description}
                                          descriptionColor={
                                            listitem.age_description_color
                                          }
                                          hasAgeDescription
                                          handleChange={(e) =>
                                            handleSelect(
                                              e.target.checked,
                                              listitem.id,
                                              listitem.vendor_id,
                                            )
                                          }
                                          id={listitem.id}
                                          tabValue={tabValue}
                                          handleAmountChange={(e) => {
                                            handleAmountChange(
                                              e?.target?.value,
                                              listitem?.id,
                                            );
                                          }}
                                          date={listitem.date}
                                          updateAmount={() =>
                                            updateVoucherItem(
                                              listitem.voucher_id,
                                              listitem.paidAmount,
                                            )
                                          }
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </AccordionDetails>
                            </Accordion>
                          );
                        })}
                    </div>

                    <div
                      className={
                        device === 'desktop' ? css.payNowDesk : css.payNow
                      }
                    >
                      <PayNow
                        active={payNow.active}
                        title={payNow.title}
                        subTitle={payNow.subTitle}
                        handlePay={handlePay}
                        hasBalance
                        PayType={(item) => GetTransaction(item)}
                      />
                    </div>
                    <SelectBottomSheet
                      triggerComponent
                      open={drawer.proceedToPay}
                      name="proceedToPay"
                      onClose={handleBottomSheet}
                    >
                      <ProceedToPay
                        onClose={() => handleBottomSheet('proceedToPay')}
                        paymentVoucharId={paymentVoucharId}
                        showVerifyPassword={[drawer, setDrawer]}
                        setMultiplePayments={setMultiplePayments}
                        setPaymentsResponse={setPaymentsResponse}
                        bankAccounts={bankAccounts}
                        paidAmount={vendorBills
                          .filter((a) => a.selected)
                          .map((a) => Number(a.paidAmount) || 0)
                          .reduce((a, b) => a + b, 0)
                          .toFixed(2)}
                        payNow={payNow}
                        ShowTransForgPass={ShowForgetPassWord}
                      />
                    </SelectBottomSheet>

                    <SelectBottomSheet
                      triggerComponent
                      open={ShowTransPass}
                      name="forgetPassword"
                      hideClose
                    >
                      <TransactionForgetPassword
                        onClose={() => setShowTransPass(false)}
                      />
                    </SelectBottomSheet>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <Mui.Dialog
          open={drawer.paymentBank && device === 'desktop'}
          onClose={() => handleBottomSheetClose('paymentBank')}
        >
          <PaymentBankReq
            vendorId={clickVendorId}
            handleBottomSheet={() => handleBottomSheetClose('paymentBank')}
          />
        </Mui.Dialog>
        <SelectBottomSheet
          open={drawer.paymentBank && device === 'mobile'}
          onClose={() => handleBottomSheetClose('paymentBank')}
          addNewSheet
          id="overFlowHidden"
          triggerComponent={<></>}
          onTrigger={handleBottomSheetOpen}
        >
          <PaymentBankReq
            vendorId={clickVendorId}
            handleBottomSheet={() => handleBottomSheetClose('paymentBank')}
          />
        </SelectBottomSheet>

        {/* Vendor Bank Details Upload Start */}

        <PaymentDialog
          open={drawer.BankupOpen && device === 'desktop'}
          onClose={HandleBankUpload}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          className={css.bankupload}
        >
          <UploadBankDetails
            data={BankuploadState}
            RefreshVouchers={RefreshVouchers}
            onClose={HandleBankUpload}
          />
        </PaymentDialog>

        {/* <SelectBottomSheet
          open={drawer.BankupOpen && device === 'mobile'}
          onClose={HandleBankUpload}
          addNewSheet
          triggerComponent={<></>}
          onTrigger={handleBottomSheetOpen}
        >
          <UploadBankDetailsMobile
            data={BankuploadState}
            RefreshVouchers={RefreshVouchers}
            onClose={HandleBankUpload}
          />
        </SelectBottomSheet> */}
        {/* Vendor Bank Details Upload End */}
      </div>
      {havePermission.open && (
        <PermissionDialog onClose={() => havePermission.back()} />
      )}
    </>
  );
};

export default MakePayment;
