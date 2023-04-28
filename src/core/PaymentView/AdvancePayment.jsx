/* eslint-disable react/jsx-boolean-value */
import React, { useState, useContext, useEffect } from 'react';
import * as Router from 'react-router-dom';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet';
import * as Mui from '@mui/material';
import { PermissionDialog } from '@components/Permissions/PermissionDialog.jsx';
import { validateRequired, validateDecimalNum } from '@services/Validation.jsx';
import AppContext from '@root/AppContext.jsx';
import useDebounce from '@components/Debounce/Debounce.jsx';
import { Button, makeStyles, Chip, styled } from '@material-ui/core';
import themes from '@root/theme.scss';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import CustomSearch from '@components/SearchSheet/CustomSearch.jsx';
import { InvoiceCustomer } from '@components/Invoice/EditForm.jsx';
import Input, { AmountFormatCustom } from '@components/Input/Input.jsx';
import VendorList from '@components/Vendor/VendorList';
import SuccessView from '@core/BillBookView/shared/SuccessView';
// import AddNewVendor from '@core/BillBookView/shared/AddVendor.jsx';
import PageTitle from '@core/DashboardView/PageTitle';
import { FormattedAmount } from '@components/formattedValue/FormattedValue';
import cssDash from '@core/DashboardView/DashboardViewContainer.scss';
import ExpenseCategoryList from '../BillBookView/shared/ExpenseCategoryList.jsx';
import PayNow from './shared/PayNow';
import { FinalPayment } from './FinalPayment';
import ProceedToPay from './shared/ProceedToPay';
import PaymentBankReq from './component/PaymentBankReq.jsx';
import css from './AdvancePayment.scss';

const useStyles = makeStyles(() => ({
  chips: {
    // minWidth: '80px',
    margin: '5px 5px',
    minWidth: '20%',
    maxWidth: '95% !important',
    minHeight: '38px',
    paddingTop: '17px',
    paddingBottom: '17px',
  },
  active: {
    background: '#f2d4cd',
    color: themes.colorPrimaryButton,
    borderColor: themes.colorPrimaryButton,
    fontWeight: 'bold',
  },
  root: {
    '& .MuiInputLabel-root': {
      fontWeight: 400,
      color: '#6E6E6E',
    },
  },
}));

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

const Puller = styled(Mui.Box)(() => ({
  width: '50px',
  height: 6,
  backgroundColor: '#C4C4C4',
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
}));

const VALIDATION = {
  vendor: {
    errMsg: 'Please provide valid vendor name',
    test: validateRequired,
    page: 1,
  },
  amount: {
    errMsg: 'Please provide valid amount',
    test: validateRequired,
    page: 2,
  },
  tds: {
    errMsg: 'Please provide valid TDS',
    test: (v) => validateDecimalNum(v, 2),
    page: 2,
  },
  expenseCategory: {
    errMsg: 'Choose expense category',
    test: (v) => validateRequired(v?.name),
    page: 2,
  },
};

const initialState = {
  vendor: '',
  amount: '',
  tds: '',
  expenseCategory: '',
};

const SubAdvancePayment = ({ selectVendor, stateOut }) => {
  const {
    changeSubView,
    organization,
    enableLoading,
    user,
    openSnackBar,
    userPermissions,
  } = useContext(AppContext);
  const device = localStorage.getItem('device_detect');
  const classes = useStyles();
  const initialValidationErr = Object.keys(VALIDATION).map((k) => ({
    [k]: false,
  }));
  const [validationErr, setValidationErr] = useState(initialValidationErr);
  const [vendorList, setVendorList] = useState([]);
  const [advancePaymentDetails, setAdvancePaymentDetails] = useState();
  const [advancePaymentId, setAdvancePaymentId] = useState();
  const [paymentVoucharId, setPaymentVoucharId] = useState();
  const [state, setState] = useState(initialState);
  const [formattedState, setFormattedState] = useState(initialState);
  const [page, setPage] = useState(1);
  const [noTransition, setNoTransition] = useState('');
  const [vendorView, setVendorView] = useState(false);
  const [multiplePayments, setMultiplePayments] = useState(false);
  const [paymentsResponse, setPaymentsResponse] = useState();
  const [retryPaymentVoucharId, setRetryPaymentVoucharId] = useState();
  const [expenseCategoryList, setExpenseCategoryList] = useState([]);
  const [bankAccounts, setBankAccounts] = useState();
  const [transaction, setTransaction] = useState('');
  const navigate = Router.useNavigate();
  const [drawer, setDrawer] = useState({
    vendor: false,
    bankAccount: false,
    proceedToPay: false,
    paymentSuccess: false,
    payU: false,
    edit: false,
    paymentBank: false,
  });
  const [clickVendorId, setClickVendorId] = React.useState('');
  const [trigger, setTrigger] = useState('list');
  const [editValue, setEditValue] = useState({});
  const debouncedForAmt = useDebounce(state?.amount);

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

  const showError = (message) => {
    openSnackBar({
      message: message || 'Unknown Error Occured',
      type: 'error',
    });
  };

  const handleBottomSheetOpen = (open, id) => {
    setDrawer((prev) => ({ ...prev, [open]: true }));
    if (id !== null) {
      setClickVendorId(id);
    }
  };

  const handleBottomSheetClose = (close) => {
    setDrawer((prev) => ({ ...prev, [close]: false }));
  };

  useEffect(() => {
    if (retryPaymentVoucharId) {
      setDrawer((d) => ({ ...d, paymentSuccess: false, proceedToPay: false }));
      setMultiplePayments(false);
      // setTabValue(1);
      setPaymentVoucharId(retryPaymentVoucharId);
      // getAllVoucherItems();
    }
  }, [retryPaymentVoucharId]);

  const getVendors = async (allParties, searchVal) => {
    await enableLoading(true);
    await RestApi(
      !allParties
        ? `organizations/${organization.orgId}/entities?type[]=vendor&search=${
            searchVal || ''
          }`
        : `organizations/${organization.orgId}/entities?search=${
            searchVal || ''
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
        if (res && !res.error && res.data) {
          setVendorList(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
        enableLoading(false);
      });
    enableLoading(false);
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
          setBankAccounts(res.data);
        } else {
          showError(res.message);
        }
      })
      .catch((e) => {
        showError(e);
        enableLoading(false);
      });
  };

  // const onCloseVendor = () => {
  //   setVendorView(false);
  //   setPage(1);
  //   getVendors();
  // };

  const onAddVendor = () => {
    setVendorView(true);
    setPage(-1);
  };

  useEffect(() => {
    if (noTransition === 'yes') {
      if (page > 1) setPage((p) => p - 1);
    } else if (noTransition === 'no') setPage((p) => p + 1);
  }, [noTransition]);

  const createAdvancePayment = async (vendorId) => {
    enableLoading(true);
    await RestApi(`organizations/${organization.orgId}/advance_payments`, {
      method: METHOD.POST,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
      payload: {
        vendor_id: vendorId,
      },
    })
      .then((res) => {
        enableLoading(false);
        if (res && !res.error) {
          setAdvancePaymentDetails(res);
          setAdvancePaymentId(res.id);
          setState((s) => ({ ...s, amount: res.amount, tds: res.tds_amount }));
          setFormattedState((s) => ({
            ...s,
            amount: res.amount,
            tds: res.tds_amount,
          }));
          setNoTransition('no');
        } else if (res?.error) {
          setNoTransition('yes');
          if (res.message === 'No vendor bank details is present') {
            // openSnackBar({
            //   message: res.message,
            //   type: MESSAGE_TYPE.WARNING,
            // });
            handleBottomSheetOpen('paymentBank', vendorId);
            return;
          }
          showError(res.message);
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const updateAdvancePaymentDetail = async (data, id) => {
    // enableLoading(true);
    await RestApi(
      `organizations/${organization.orgId}/advance_payments/${id}`,
      {
        method: METHOD.PATCH,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
        payload: data,
      },
    )
      .then((res) => {
        // enableLoading(false);
        if (res && !res.error) {
          setAdvancePaymentDetails(res);
          setAdvancePaymentId(res.id);
          setState((s) => ({ ...s, amount: res.amount, tds: res.tds_amount }));
          setFormattedState((s) => ({
            ...s,
            amount: res.amount,
            tds: res.tds_amount,
          }));
        } else if (res.error) {
          showError(
            res.error ||
              res.message ||
              'Something went Wrong, We will look into it',
          );
        }
        // enableLoading(false);
      })
      .catch(() => {
        enableLoading(false);
        showError('Something went Wrong, We will look into it');
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

  useEffect(() => {
    CreateVoucher();
    getVendors();
  }, []);

  useEffect(() => {
    if (state.expenseCategory || debouncedForAmt) {
      const newData = {
        vendor_id: advancePaymentDetails?.vendor_id,
        amount: debouncedForAmt,
        expense_account_id: state.expenseCategory?.id,
      };
      updateAdvancePaymentDetail(newData, advancePaymentDetails?.id);
    }
  }, [state.expenseCategory, debouncedForAmt]);

  const getEventNameValue = (ps) => {
    const name = ps?.target?.name;
    const value = ps?.target?.value;
    const formattedValue = ps?.target?.formattedValue;
    return [name, value, formattedValue];
  };

  const reValidate = (ps) => {
    const [name, value] = getEventNameValue(ps);
    setValidationErr((v) => ({
      ...v,
      [name]: !VALIDATION?.[name]?.test?.(value),
    }));
  };

  const handleBottomSheet = (name, data) => {
    setDrawer((d) => ({ ...d, [name]: false }));
    setTrigger('list');
    if (data) setState((s) => ({ ...s, [name]: data }));
    if (data) setFormattedState((s) => ({ ...s, [name]: data }));
    if (state[name] && !data) return;
    reValidate({ target: { name, value: data } });
  };

  const onTriggerDrawer = (name) => {
    setDrawer((d) => ({ ...d, [name]: true }));
    getVendors();
  };

  const validateAllFields = (validationData) => {
    return Object.keys(validationData).reduce((a, v) => {
      // eslint-disable-next-line no-param-reassign
      a[v] = !validationData?.[v]?.test(state[v]);
      return a;
    }, {});
  };

  const getExpenseCategories = async () => {
    enableLoading(true);

    await RestApi(`organizations/${organization.orgId}/expense_categories`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
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

  const onPageNext = async () => {
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
    if (page === 1) {
      await createAdvancePayment(state.vendor.id);
      await getExpenseCategories();
    }
    if (page === 2) {
      if (Number(state.tds) >= Number(state.amount)) {
        setValidationErr((i) => ({
          ...i,
          tds: true,
        }));
        return;
      }
      if (
        advancePaymentDetails.amount !== state.amount ||
        advancePaymentDetails.tds_amount !== state.tds ||
        advancePaymentDetails.expense_account_id !== state.expenseCategory.id
      ) {
        const newData = {
          vendor_id: advancePaymentDetails.vendor_id,
          amount: state.amount,
          tds_amount: state.tds,
          transaction_type: transaction,
          // transaction_type:'Bank transaction',
          vendor_bank_detail_id: advancePaymentDetails.vendor_bank_detail_id,
          account_id: advancePaymentDetails.account_id,
          expense_account_id: state.expenseCategory?.id,
        };
        await updateAdvancePaymentDetail(newData, advancePaymentDetails.id);
        // await getBankAccounts();
      }
      await getBankAccounts();
      setDrawer((d) => ({ ...d, proceedToPay: true }));
      return;
    }
    if (page < 4) {
      if (noTransition !== 'yes') {
        // setPage((p) => p + 1);
      }
    }
  };

  const handlePay = async () => {
    await onPageNext();
  };

  const onInputChange = (ps) => {
    reValidate(ps);
    const [name, value, formattedValue] = getEventNameValue(ps);
    if (name === 'tds') {
      setState((s) => ({ ...s, [name]: Number(Number(value)?.toFixed(2)) }));
      setFormattedState((s) => ({ ...s, [name]: formattedValue?.toFixed(2) }));
    } else {
      setState((s) => ({ ...s, [name]: value }));
      setFormattedState((s) => ({ ...s, [name]: formattedValue }));
    }
  };

  const vendorClick = (v) => {
    handleBottomSheet('vendor', v);
    const newVendors = vendorList.map((item) => {
      if (item.id === v.id) {
        const updatedItem = {
          ...item,
        };

        return updatedItem;
      }

      return { ...item };
    });
    setVendorList(newVendors);
  };

  const GetTransaction = (item) => {
    setTransaction(item);
  };

  const handleWithLocation = (element) => {
    // console.log(locationId);
    handleBottomSheet('vendor', element);
  };

  const onTriggerDrawerForEdit = (name, element) => {
    setEditValue(element);
    setDrawer((d) => ({ ...d, vendor: false }));
    if (device === 'desktop') {
      setDrawer((d) => ({ ...d, [name]: true }));
    }
    if (device === 'mobile') {
      setPage(3);
    }
  };

  React.useEffect(() => {
    if (selectVendor) {
      handleBottomSheet('vendor', selectVendor);
    }
  }, [selectVendor]);

  return (
    <>
      <PageTitle
        title="Payments"
        onClick={() => {
          if (stateOut?.fromVendorSelection) {
            navigate(stateOut?.fromVendorSelection?.path, {
              state: stateOut?.fromVendorSelection?.backState,
            });
            return;
          }
          if (device === 'desktop') {
            navigate(-1);
          }
          if (device === 'mobile') {
            if (page === 3) {
              setPage(1);
            } else {
              navigate(-1);
            }
          }
        }}
      />
      <div
        className={
          device === 'mobile'
            ? // ? css.dashboardBodyContainer
              cssDash.dashboardBodyContainerhideNavBar
            : cssDash.dashboardBodyContainerDesktop
        }
      >
        {page === 3 ? (
          <div style={{ marginBottom: '70px', overflow: 'auto' }}>
            <div className={css.headerContainer} style={{ margin: '1rem' }}>
              <div className={css.headerLabel}>{editValue?.name}</div>
              <span className={css.headerUnderline} />
            </div>
            <InvoiceCustomer
              showValue={editValue}
              handleBottomSheet={() => setPage(1)}
              type="vendors"
            />
          </div>
        ) : (
          <div
            className={
              device === 'desktop'
                ? css.advancePaymentContainerDesktop
                : css.advancePaymentContainer
            }
          >
            <Mui.Stack
              style={
                device === 'desktop'
                  ? { height: 'auto', width: '95%' }
                  : { height: 'auto', width: '100%', marginBottom: '85px' }
              }
            >
              <div className={css.headerContainer}>
                <div
                  className={
                    device === 'desktop'
                      ? css.headerLabelDesktop
                      : css.headerLabel
                  }
                >
                  Pay an Advance
                </div>
                <span
                  className={
                    device === 'desktop'
                      ? css.headerUnderlineDesktop
                      : css.headerUnderline
                  }
                />
              </div>
              {drawer.paymentSuccess ? (
                <>
                  {multiplePayments === true && (
                    <FinalPayment
                      paymentsResponse={paymentsResponse}
                      setRetryPaymentVoucharId={setRetryPaymentVoucharId}
                      paymentType="advance_payment"
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
                  className={`${css.inputContainer} ${
                    vendorView ? css.noMargin : ''
                  }`}
                >
                  {page === 1 && (
                    <>
                      <div className={css.label}>Enter Vendor Name</div>
                      <SelectBottomSheet
                        name="vendor"
                        onBlur={reValidate}
                        error={validationErr.vendor}
                        helperText={
                          validationErr.vendor ? VALIDATION?.vendor?.errMsg : ''
                        }
                        label="Vendor"
                        open={drawer.vendor}
                        value={state.vendor?.name}
                        onTrigger={onTriggerDrawer}
                        onClose={handleBottomSheet}
                        addNewSheet={
                          !(trigger === 'list' && device === 'desktop')
                        }
                      >
                        {trigger === 'addManually' && (
                          <VendorList
                            trigger={trigger}
                            vendorList={vendorList}
                            onClick={(ps) => handleBottomSheet('vendor', ps)}
                            addNewVendor={() => onAddVendor()}
                            continueFlow={() => handleBottomSheet('vendor')}
                            updateVendorList={getVendors}
                            // disableAdd
                            hideDoNotTrack
                          />
                        )}
                        {trigger === 'list' && (
                          <CustomSearch
                            showType="Vendor"
                            customerList={vendorList}
                            callFunction={getVendors}
                            handleLocationParties={handleWithLocation}
                            handleAllParties={(ps) =>
                              handleBottomSheet('vendor', ps)
                            }
                            addNewOne={() => setTrigger('addManually')}
                            openDrawer={onTriggerDrawerForEdit}
                            hideLocation
                          />
                        )}
                      </SelectBottomSheet>
                      <SelectBottomSheet
                        name="edit"
                        triggerComponent={<div style={{ display: 'none' }} />}
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
                            <p className={css.headerLabel}>{editValue?.name}</p>
                            <span className={css.headerUnderline} />
                          </div>
                          <InvoiceCustomer
                            showValue={editValue}
                            handleBottomSheet={handleBottomSheet}
                            type="vendors"
                          />
                        </div>
                      </SelectBottomSheet>
                      <div key={state.vendor.id}>
                        {vendorList.slice(0, 5).map((v) => {
                          return (
                            <Chip
                              className={`${classes.chips} ${
                                state.vendor?.name === v.name
                                  ? classes.active
                                  : ''
                              }`}
                              label={
                                <span className={css.wrapLabel}>{v.name}</span>
                              }
                              variant="outlined"
                              onClick={() => {
                                vendorClick({ ...v });
                              }}
                            />
                          );
                        })}
                      </div>
                    </>
                  )}
                  {page === 2 && (
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
                        label="Expense Category"
                        open={drawer.expenseCategory}
                        value={state.expenseCategory?.name}
                        onTrigger={onTriggerDrawer}
                        onClose={handleBottomSheet}
                      >
                        <ExpenseCategoryList
                          expenseCategoryList={expenseCategoryList}
                          onClick={(ps) =>
                            handleBottomSheet('expenseCategory', ps)
                          }
                        />
                      </SelectBottomSheet>
                      <Input
                        name="amount"
                        onBlur={reValidate}
                        helperText={
                          validationErr.amount ? VALIDATION?.amount?.errMsg : ''
                        }
                        className={`${css.greyBorder} ${classes.root}`}
                        label="Advance Amount"
                        variant="standard"
                        value={formattedState.amount || ''}
                        placeholder={0}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          inputComponent: PriceCustom,
                        }}
                        fullWidth
                        onChange={onInputChange}
                        theme="light"
                      />
                      <Input
                        name="tds"
                        // onBlur={reValidate}
                        helperText={
                          validationErr.tds ? VALIDATION?.tds?.errMsg : ''
                        }
                        className={`${css.greyBorder} ${classes.root}`}
                        label="TDS"
                        variant="standard"
                        value={state.tds}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        // inputProps={{
                        //   type: 'Number',
                        // }}
                        InputProps={{
                          readOnly: true,
                          inputComponent: PriceCustom,
                        }}
                        fullWidth
                        onChange={onInputChange}
                        theme="light"
                      />
                    </>
                  )}
                </div>
              )}
              {page !== 4 && !vendorView && page === 1 && (
                <div className={css.actionContainer}>
                  {page === 1 ? <div /> : null}
                  <Button
                    onClick={() => onPageNext()}
                    size="large"
                    className={css.submitButton}
                  >
                    {page === 1 ? 'Next' : 'Proceed to Pay'}
                  </Button>
                </div>
              )}
              {page !== 1 && !drawer.paymentSuccess && (
                <div className={css.PayNow}>
                  <PayNow
                    active={Number(state.amount) - Number(state.tds) > 0}
                    title={FormattedAmount(
                      Number(state?.amount) - Number(state?.tds),
                    )}
                    subTitle="1 Party and 1 Bill Selected"
                    hasBalance
                    handlePay={handlePay}
                    PayType={(item) => GetTransaction(item)}
                  />
                  <SelectBottomSheet
                    triggerComponent
                    open={drawer.proceedToPay}
                    name="proceedToPay"
                    onClose={handleBottomSheet}
                  >
                    <ProceedToPay
                      onClose={handleBottomSheet}
                      paymentVoucharId={paymentVoucharId}
                      advancePaymentId={advancePaymentId}
                      setAdvancePaymentDetails={setAdvancePaymentDetails}
                      setMultiplePayments={setMultiplePayments}
                      setPaymentsResponse={setPaymentsResponse}
                      showVerifyPassword={[drawer, setDrawer]}
                      bankAccounts={bankAccounts}
                      paidAmount={Number(
                        Number(state.amount) - Number(state.tds),
                      )?.toFixed(2)}
                      payNow={{
                        active: true,
                        title: FormattedAmount(
                          Number(state?.amount) - Number(state?.tds),
                        ),
                        subTitle: '1 Party and 1 Bill Selected',
                      }}
                    />
                  </SelectBottomSheet>
                </div>
              )}
              {/* {vendorView && <AddNewVendor onCloseVendor={onCloseVendor} />} */}
            </Mui.Stack>
          </div>
        )}
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
      {havePermission.open && (
        <PermissionDialog onClose={() => havePermission.back()} />
      )}
    </>
  );
};

const AdvancePayment = () => {
  const { state } = Router.useLocation();
  const [vendor, setVendor] = React.useState(false);

  React.useEffect(() => {
    if (state?.fromVendorSelection) {
      setVendor(state?.fromVendorSelection?.id);
    }
  }, [state]);
  return <SubAdvancePayment selectVendor={vendor} stateOut={state} />;
};

export default AdvancePayment;
