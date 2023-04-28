import React from 'react';
import * as Mui from '@mui/material';
import AppContext from '@root/AppContext.jsx';
import JSBridge from '@nativeBridge/jsbridge';
import RestApi, { METHOD, BASE_URL } from '@services/RestApi.jsx';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet.jsx';
import { FormattedAmount } from '@components/formattedValue/FormattedValue';
import CloudUpload from '@material-ui/icons/CloudUpload';
import { DirectUpload } from '@rails/activestorage';
// import alert from '@assets/warning.svg';
import VendorList from '@components/Vendor/VendorList';
import moment from 'moment';
import rightArrow from '@assets/chevron-right.svg';
import { InvoiceCustomer } from '@components/Invoice/EditForm.jsx';
import { validateRequired } from '@services/Validation.jsx';
import CustomSearch from '@components/SearchSheet/CustomSearch.jsx';
import SuccessView from '../shared/SuccessView';
import ExpenseCategoryList from '../shared/ExpenseCategoryList';
import PreviewContent from '../shared/PreviewContent';
import css from '../UploadYourBillContainer.scss';

function useStateCallback(initialState) {
  const [state, setState] = React.useState(initialState);
  const cbRef = React.useRef(null); // init mutable ref container for callbacks

  const setStateCallback = React.useCallback((stateParameter, cb) => {
    cbRef.current = cb; // store current, passed callback in ref
    setState(stateParameter);
  }, []); // keep object reference stable, exactly like `useState`

  React.useEffect(() => {
    // cb.current is `null` on initial render,
    // so we only invoke callback on state *updates*
    if (cbRef.current) {
      cbRef.current(state);
      cbRef.current = null; // reset callback after execution
    }
  }, [state]);

  return [state, setStateCallback];
}

const initialState = {
  name: '',

  expenseCategory: '',

  paymentStatus: '',
  vendor: '',
  doNotTrack: false,
};

const paymentStatusListWithBill = [
  { id: 'company_cash', label: 'Paid with Company Cash' },
  { id: 'paid_as_advance', label: 'Paid as Advance' },
  { id: 'to_pay', label: 'To Pay' },
  { id: 'company_card', label: 'Paid with Company Card' },
  { id: 'personal', label: 'Paid Personally' },
  { id: 'company_account', label: 'Paid with Company Account' },
];

const paymentStatusListWithoutBill = [
  { id: 'company_cash', label: 'Paid with Company Cash' },
  { id: 'personal', label: 'Paid Personally' },
];

const SuperAccUpload = ({
  typeOfImage,
  uploadPDF,
  uploadFlieName,
  uploadId,
  handleBottomSheetForSuper,
  handleBottomSheetForSuperDone,
  successView,
  setSuperEditValue,
  vendorSuper,
  paymentStatusSuper,
  categorySuper,
  // haveBillSuper,
  setDonePageBill,
  doNotTrackCheck,
  categorizationvendordetails,
  selectedTransaction,
  isVendorPresent,
  venFetchDetails,
}) => {
  const {
    organization,
    enableLoading,
    user,
    openSnackBar,
    // registerEventListeners,
    // deRegisterEventListener,
  } = React.useContext(AppContext);
  const device = localStorage.getItem('device_detect');
  const [filename, setFilename] = React.useState('');
  const [typeImage, setTypeImage] = React.useState();
  const [localState, setLocalState] = useStateCallback(initialState);
  // const [haveBill, setHaveBill] = React.useState(haveBillSuper);
  // const [selected, setSelected] = React.useState(!haveBillSuper);
  // const [unselect, setUnselect] = React.useState(!haveBillSuper);
  const [trigger, setTrigger] = React.useState('list');
  const [pdfUrl, setPdfUrl] = React.useState();
  const [drawer, setDrawer] = React.useState({
    expenseCategory: false,
    paymentStatus: false,
    vendor: false,
    edit: false,
  });
  const [isVendorAvailable, setIsVendorAvailable] =
    React.useState(isVendorPresent);
  const initialValidationErr = '';
  const [validationErr, setValidationErr] =
    React.useState(initialValidationErr);
  const [dntCheckbox, setDntCheckbox] = React.useState(doNotTrackCheck);
  const [vendorList, setVendorList] = React.useState([]);
  const [expenseCategoryList, setExpenseCategoryList] = React.useState([]);
  const [assetCategoryList, setAssetCategoryList] = React.useState([]);
  // const [fetchDetails, setFetchDetails] = React.useState();
  const [editValue, setEditValue] = React.useState({});
  const [vendorsUnsettledList, setVendorsUnsettledList] = React.useState([]);
  const [advancesData, setAdvancesData] = React.useState([]);
  const [donePage, setDonePage] = React.useState(false);

  console.log(venFetchDetails);

  const VALIDATION = {
    expenseCategory: {
      errMsg: 'Choose category',
      test: (v) => validateRequired(v?.name),
    },
    paymentStatus: {
      errMsg: 'Please choose Payment Status',
      test: (v) => validateRequired(v?.label),
    },
    vendor: {
      errMsg: 'Please choose Vendor',
      test: (v) =>
        !localState.doNotTrack ? validateRequired(v?.name ? v.name : v) : true,
    },
  };

  React.useEffect(() => {
    setFilename(uploadFlieName || '');
    setTypeImage(typeImage || '');
    setPdfUrl(uploadPDF || '');
    if (categorizationvendordetails?.id) {
      setLocalState((prev) => ({
        ...prev,
        file: uploadId,
        vendor: categorizationvendordetails.name,
        paymentStatus: paymentStatusSuper,
        expenseCategory: categorySuper,
      }));
    } else {
      setLocalState((prev) => ({
        ...prev,
        file: uploadId,
        vendor: vendorSuper(),
        paymentStatus: paymentStatusSuper,
        expenseCategory: categorySuper,
      }));
    }
  }, [
    uploadPDF,
    typeOfImage,
    uploadFlieName,
    uploadId,
    // vendorSuper,
    paymentStatusSuper,
    categorySuper,
    categorizationvendordetails,
  ]);

  const getVendor = async (allParties, searchVal) => {
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

  const getOcrData = (id) => {
    enableLoading(true);
    RestApi(`organizations/${organization.orgId}/vendor_bills`, {
      method: METHOD.POST,
      payload: { file: id },
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        if (res && !res.error) {
          // setFetchDetails(res);
          setPdfUrl(res.file_url);
          enableLoading(false);
        } else {
          enableLoading(false);
          const errorValues = Object.values(res.errors);
          openSnackBar({ message: errorValues.join(', '), type: 'error' });
          setFilename('');
        }
      })
      .catch((e) => {
        console.log('getOcrData', e);
        openSnackBar({ message: 'Unknown error occured', type: 'error' });
        setFilename('');
        enableLoading(false);
      });
  };

  const saveBills = () => {
    const params = categorizationvendordetails?.id
      ? {
          name: localState.name,
          expense_account_id: localState.expenseCategory?.id,
          payment_mode: localState.paymentStatus?.id,
          vendor_id: localState.vendor?.id,
          // file: !haveBill ? undefined :
          file: localState.file,
          in_queue: true,
          bank_txn_id: selectedTransaction?.id,
        }
      : {
          name: localState.name,
          expense_account_id: localState.expenseCategory?.id,
          payment_mode: localState.paymentStatus?.id,
          vendor_id: localState.vendor?.id,
          // file: !haveBill ? undefined : localState.file,
          file: localState.file,
          in_queue: true,
        };

    RestApi(`organizations/${organization.orgId}/vendor_bills`, {
      method: METHOD.POST,
      payload: params,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        enableLoading(false);
        if (res && !res.error) {
          console.log(res);
          if (device === 'mobile') {
            successView('done');
          }
          if (device === 'desktop') {
            setDonePageBill(true);
            setDonePage(true);
          }
        } else {
          const errorValues = Object.values(res.errors);
          openSnackBar({ message: errorValues.join(', '), type: 'error' });
        }
      })
      .catch((e) => {
        openSnackBar({
          message: e?.message || 'Unknown error occured',
          type: 'error',
        });
      });
  };

  React.useEffect(() => {
    getVendor();
    getExpenseCategory();
    getAssetCategory();
  }, []);

  // const handleChange = () => {
  //   if (haveBill) {
  //     setSelected(true);
  //     setUnselect(true);
  //     setHaveBill(false);
  //     // setFilename('');
  //     // setLocalState((s) => ({ ...s, file: '' }));
  //   } else if (!haveBill) {
  //     setSelected(false);
  //     setUnselect(true);
  //     setHaveBill(true);
  //   }
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
      [name]: !VALIDATION?.[name]?.test?.(value),
    }));
    // if (ps.target.name === 'amount') {
    //   reValidate({ target: { name: 'expenseCategory' } });
    // }
  };

  const onTriggerDrawer = (name) => {
    if (name === 'addManually' || name === 'list') {
      setTrigger(name);
      getVendor();
    } else if (localState?.vendor?.id) {
      setTrigger('list');
      getVendor();
    }
    setDrawer((d) => ({ ...d, [name]: true }));
  };

  const handleBottomSheet = (name, data) => {
    setDrawer((d) => ({ ...d, [name]: false }));

    if (data) setLocalState((s) => ({ ...s, [name]: data }));
    if (data === 'Do not track' && name === 'vendor') {
      return;
    }
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
  const handleDoNotTrackVendor = (data) => {
    const stateName = 'doNotTrack';
    const validationName = 'vendor';
    setIsVendorAvailable(data);
    setValidationErr((v) => ({
      ...v,
      [validationName]: false,
    }));
    setLocalState((s) => ({ ...s, [stateName]: data }));
    setDntCheckbox(data);
    handleBottomSheet('vendor', data ? 'Do not track' : '');
  };

  React.useEffect(() => {
    if (doNotTrackCheck) handleDoNotTrackVendor(doNotTrackCheck);
  }, [doNotTrackCheck]);

  const onFileUpload = (e, directFile) => {
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

  const handleWithLocation = (element) => {
    handleBottomSheet('vendor', element);
  };

  const onTriggerDrawerForEdit = (name, element) => {
    setEditValue(element);
    setSuperEditValue(element);
    setDrawer((d) => ({ ...d, vendor: false }));
    if (device === 'desktop') {
      setDrawer((d) => ({ ...d, [name]: true }));
    }
    if (device === 'mobile') {
      successView('edit');
    }
  };

  const handleNextBottomSheet = (name, next, data) => {
    if (data) setLocalState((s) => ({ ...s, [name]: data }));
    if (localState[name] && !data) return;
    reValidate({ target: { name, value: data } });
    setDrawer((d) => ({ ...d, [name]: false }));
    setDrawer((d) => ({ ...d, [next]: true }));
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

  const hangleChecked = (data) => {
    if (advancesData.indexOf(data) < 0) {
      setAdvancesData((previous) => [...previous, data]);
    } else {
      setAdvancesData((previous) => [
        ...previous.filter((val) => val !== data),
      ]);
    }
  };

  const validateAllFields = () => {
    const stateData = localState;
    // console.log('STATE', state);
    return Object.keys(VALIDATION).reduce((a, v) => {
      a[v] = !VALIDATION?.[v]?.test(stateData[v]);
      return a;
    }, {});
  };

  const onSubmit = () => {
    const v = validateAllFields();
    const valid = Object.values(v).every((val) => !val);

    if (!valid) {
      setValidationErr((s) => ({ ...s, ...v }));
      return;
    }
    if (!filename) {
      openSnackBar({ message: 'Please upload your bill', type: 'error' });
      return;
    }
    if (!isVendorAvailable && !localState?.doNotTrack) {
      setValidationErr((s) => ({ ...s, vendor: true }));
      return;
    }

    saveBills();
  };

  const ocrByScan = () => {
    JSBridge.ocrByScan();
  };

  const ocrByBrowse = () => {
    JSBridge.ocrByBrowse();
  };

  return !donePage ? (
    <>
      <div
        style={{
          margin: device === 'desktop' ? '1rem' : '5%',
          width: device === 'desktop' ? '30rem' : '90%',
        }}
        className={css.headerContainer}
      >
        {device === 'desktop' && (
          <p className={`${css.headerLabel} ${css.headerLabelForClose}`}>
            Assign to SuperAccountant
            <span
              className={css.closeDialog}
              onClick={() => {
                handleBottomSheetForSuper();
              }}
            >
              X
            </span>
          </p>
        )}
        {device === 'desktop' && <span className={css.headerUnderline} />}
        <p className={css.headerSubLabel}>
          Please share data related to the fields presented below so that we can
          record your expense efficiently
        </p>
      </div>
      <div
        className={
          device === 'desktop'
            ? css.recordAnExpenseContainerForSuper
            : css.recordAnExpenseContainerForSuperMobile
        }
      >
        <div className={`${css.inputContainer} ${css.inputContainerForSuper}`}>
          {/* {haveBill ? ( */}
          <div className={css.uploadContainer}>
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
            <div
              style={{
                position: 'absolute',
                width: '90%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
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
                  <Mui.Button
                    className={`${css.submitButton}`}
                    onClick={() => {
                      ocrByScan();
                    }}
                  >
                    Scan
                  </Mui.Button>
                ) : (
                  <label className={`${css.submitButton}`} htmlFor="upload">
                    Scan
                  </label>
                )}

                {window.isDevice() === true ? (
                  <Mui.Button
                    className={`${css.submitButton}`}
                    onClick={() => {
                      ocrByBrowse();
                    }}
                  >
                    Browse
                  </Mui.Button>
                ) : (
                  <label className={`${css.submitButton}`} htmlFor="upload">
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
              {/* <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                </div> */}
            </div>

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
            {/* {!filename && (
                <div className={css.description}>
                  Browse bills or scan your document
                </div>
              )} */}
          </div>
          {/* ) : (
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
                It is recommended to always upload a bill especially for any
                transction above Rs. 2000 for Tax Purposes
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
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
          )} */}

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
          >
            <ExpenseCategoryList
              expenseCategoryList={expenseCategoryList}
              assetCategoryList={assetCategoryList}
              onClick={(ps) => handleBottomSheet('expenseCategory', ps)}
              hasTDSCategory={false}
              categoryListOpen={drawer.expenseCategory}
            />
          </SelectBottomSheet>
          {/* {haveBill && ( */}
          {console.log('localState', localState)}
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
            label="Vendor"
            open={drawer.vendor}
            value={
              localState.vendor?.name
                ? localState.vendor?.name
                : localState.vendor
            }
            toShow={isVendorAvailable}
            showAddText={
              !isVendorAvailable &&
              (localState.vendor?.name || localState.vendor)
                ? 'Add This Vendor'
                : 'Add Vendor'
            }
            onTrigger={onTriggerDrawer}
            onClose={handleBottomSheet}
            required={!dntCheckbox}
            addNewSheet={!(trigger === 'list')}
            disabled={categorizationvendordetails?.id}
            // triggerComponent={
            //   <div
            //     className={css.iconField}
            //   >
            //     <p>Vendor</p>
            //   </div>
            // }
          >
            {trigger === 'addManually' && (
              <VendorList
                trigger={trigger}
                vendorList={vendorList}
                valOfSelection={handleBottomSheet}
                onClick={(ps) => handleBottomSheet('vendor', ps)}
                onDoNotTrackVendor={(ps) => handleDoNotTrackVendor(ps)}
                dntCheckbox={dntCheckbox}
                // setDntCheckbox={setDntCheckbox}
                continueFlow={() => setDrawer((d) => ({ ...d, vendor: false }))}
                updateVendorList={getVendor}
                details={venFetchDetails}
                panEnable
              />
            )}
            {trigger === 'list' && (
              <CustomSearch
                showType="Vendor"
                customerList={vendorList}
                callFunction={getVendor}
                handleLocationParties={handleWithLocation}
                handleAllParties={(ps) => handleBottomSheet('vendor', ps)}
                addNewOne={() => setTrigger('addManually')}
                openDrawer={onTriggerDrawerForEdit}
                dntCheckbox={dntCheckbox}
                onDoNotTrackVendor={(ps) => handleDoNotTrackVendor(ps)}
                // details={fetchDetails}
                from="billBooking"
              />
            )}
          </SelectBottomSheet>
          {/* )} */}

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
            value={localState.paymentStatus?.label}
            onTrigger={onTriggerDrawer}
            onClose={handleBottomSheet}
            required
            addNewSheet
            disabled={categorizationvendordetails?.id}
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
                          getVendorUnsettled();
                        }}
                      >
                        <div>{ps.label}</div>
                        <div
                          style={{
                            height: '18px',
                            width: '10px',
                            marginLeft: '13.42px',
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
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleBottomSheet('paymentStatus', ps)}
                      >
                        {ps.label}
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
                    <div onClick={() => handleBottomSheet('paymentStatus', ps)}>
                      {ps.label}
                    </div>
                  </div>
                ))}
          </SelectBottomSheet>

          <SelectBottomSheet
            name="preview"
            triggerComponent={
              <Mui.Button
                className={`${css.superSubmitButton}`}
                onClick={() => {
                  onSubmit();
                }}
                size="medium"
              >
                Assign Now
              </Mui.Button>
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

          <SelectBottomSheet
            open={drawer.paidAdvance}
            onClose={() => {
              handleBottomSheet('paidAdvance', 'test');
            }}
            triggerComponent={<></>}
          >
            <div className={css.advancePaid}>
              <div className={css.handle} />
              <div className={css.header}>
                <div className={css.valueHeader}>Select Advances to Adjust</div>
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
                            <Mui.Checkbox
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
              <div style={{ padding: '5px 0' }} className={css.headerContainer}>
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
        </div>
      </div>
    </>
  ) : (
    <div style={{ width: '30rem' }}>
      <SuccessView
        title="Done"
        // description={`${response?.expense_category?.name} ${
        //   response?.status
        // } to ${response?.vendor?.name} for Rs. ${toInr(
        //   response?.amount,
        // )} has been recorded`}
        description="Your Bill has been sent to your SuperAccountant. Please expect a speedy Bill Booking experience."
        onClick={handleBottomSheetForSuperDone}
      />
    </div>
  );
};

export default SuperAccUpload;
