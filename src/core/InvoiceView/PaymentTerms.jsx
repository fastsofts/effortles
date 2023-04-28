import * as React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as Mui from '@mui/material';
import AppContext from '@root/AppContext.jsx';
import { FormattedAmount } from '@components/formattedValue/FormattedValue';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet.jsx';
import moment from 'moment';
import Input from '@components/Input/Input.jsx';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import { styled, makeStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import themes from '@root/theme.scss';
import css from './PaymentTermCss.scss';
import { step2 } from './InvoiceImages.js';

const Puller = styled(Mui.Box)(() => ({
  width: '50px',
  height: 6,
  backgroundColor: '#C4C4C4',
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
}));

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

const PaymentTerms = ({
  selectCustomer,
  callFunction,
  lineItems,
  fromBill,
}) => {
  const classes = useStyles();
  const {
    organization,
    enableLoading,
    user,
    // openSnackBar,
  } = React.useContext(AppContext);
  const [drawer, setDrawer] = React.useState({
    paymentTerms: false,
    expandPayment: false,
  });
  const device = localStorage.getItem('device_detect');
  const [tabValue, setTabValue] = React.useState('to_pay');
  const [toPayDay, setToPayDay] = React.useState({
    creditPeriod: 0,
    newDueDate: '',
  });
  const [customerUnsettled, setCustomerUnsettled] = React.useState([]);
  const [advancesData, setAdvancesData] = React.useState([]);
  const [toShow, setToShow] = React.useState('to_pay');
  const [showValue, setShowValue] = React.useState({
    creditPeriodToShow: 0,
    advancesDataToShow: [],
  });
  const onTriggerDrawer = (name) => {
    setDrawer((d) => ({ ...d, [name]: true }));
  };

  const handleBottomSheet = (name, from, data) => {
    setDrawer((d) => ({ ...d, [name]: false }));
    if (from === 'to_pay') {
      setToPayDay((p) => ({ ...p, creditPeriod: data }));
    } else if (from === 'advance') {
      setAdvancesData(data);
    } else {
      setToPayDay((p) => ({
        ...p,
        creditPeriod: showValue?.creditPeriodToShow,
      }));
    }
  };

  React.useEffect(() => {
    const date = selectCustomer?.date
      ? new Date(selectCustomer?.date)
      : new Date();
    const tempDate =
      date?.getTime() + Number(toPayDay.creditPeriod) * 24 * 60 * 60 * 1000;
    setToPayDay((prev) => ({ ...prev, newDueDate: new Date(tempDate) }));
  }, [toPayDay.creditPeriod]);

  React.useEffect(() => {
    setToPayDay((prev) => ({
      ...prev,
      creditPeriod: selectCustomer?.credit_period,
    }));
    setShowValue((prev) => ({
      ...prev,
      creditPeriodToShow: selectCustomer?.credit_period,
    }));
  }, [selectCustomer]);

  const fetchPayments = (userId) => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/customer_unsettled?customer_id=${userId}&unsettled_advance=true`,
      {
        method: METHOD.GET,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        if (res && !res.error) {
          setCustomerUnsettled(res?.data);
        } else if (res.error) {
          console.log(res.error);
        }
      })
      .catch((err) => {
        console.log(err);
      });
    enableLoading(false);
  };

  const hangleChecked = (item) => {
    if (
      advancesData?.length === 0 ||
      !advancesData?.map((val) => val?.id)?.includes(item?.id)
    ) {
      setAdvancesData((previous) => [...previous, item]);
    } else {
      setAdvancesData((previous) => [
        ...previous.filter((val) => val?.id !== item?.id),
      ]);
    }
  };
  React.useEffect(() => {
    if (selectCustomer?.customer_id) {
      fetchPayments(selectCustomer?.customer_id);
    }
  }, [selectCustomer?.customer_id]);

  return (
    <>
      {!fromBill && (
        <div
          className={css.mainDivPayment}
          onClick={() => {
            setDrawer((prev) => ({
              ...prev,
              expandPayment: !drawer.expandPayment,
            }));
          }}
        >
          <p className={css.payment}>Payment Terms & Advance Paid</p>
          <ExpandMoreIcon
            sx={{
              transition: '.5s',
              transform: drawer.expandPayment
                ? 'rotate(180deg)'
                : 'rotate(360deg)',
            }}
          />
        </div>
      )}
      {drawer.expandPayment && toShow === 'to_pay' && !fromBill && (
        <div className={css.row2}>
          <div
            className={css.searchInput}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              onTriggerDrawer('paymentTerms');
            }}
          >
            <p className={css.paymentPTag}>
              T + {showValue?.creditPeriodToShow}
            </p>
            <img className={css.searchIcon} src={step2.editIcon} alt="edit" />
          </div>
        </div>
      )}
      {fromBill && (
        <div className={css.fromBill}>
          <p className={css.label}>Enter Credit Period</p>
          <div
            className={css.searchInput}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              onTriggerDrawer('paymentTerms');
            }}
          >
            <p className={css.paymentPTag}>
              T + {showValue?.creditPeriodToShow}
            </p>
            <p className={css.paymentPTag}>Days</p>
          </div>
        </div>
      )}
      {drawer.expandPayment && toShow === 'advance' && (
        <div className={css.row1}>
          <p className={css.advancePTag}>
            Adjustments have been made against the <br />
            following Advance Payments:
          </p>
          <div style={{ padding: 10 }}>
            {showValue?.advancesDataToShow?.map((item) => (
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  paddingBottom: 5,
                }}
              >
                <Mui.ListItemText
                  primary={
                    <p
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        margin: 0,
                      }}
                    >
                      {item?.document_number}
                    </p>
                  }
                  secondary={`paid on ${moment(item.date).format(
                    'DD MMM YYYY',
                  )}`}
                  sx={{ width: '60%' }}
                />
                <p
                  style={{
                    width: '40%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textAlign: 'right',
                  }}
                >
                  {FormattedAmount(item?.net_balance)}
                </p>
              </div>
            ))}
          </div>
          <div
            style={{
              margin: '10px 0 0 0',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Mui.Button
              className={`${css.secondary} ${css.modifyPTag}`}
              onClick={() => {
                onTriggerDrawer('paymentTerms');
              }}
            >
              Modify Advance Adjustment(s)
            </Mui.Button>
          </div>
        </div>
      )}
      <SelectBottomSheet
        name="paymentTerms"
        triggerComponent={<div style={{ display: 'none' }} />}
        open={drawer.paymentTerms}
        onTrigger={onTriggerDrawer}
        onClose={handleBottomSheet}
        // maxHeight="45vh"
        addNewSheet
      >
        <>
          {device === 'mobile' && <Puller />}
          <div style={{ padding: '15px' }}>
            <div style={{ padding: '5px 0' }}>
              <p className={css.valueHeader}>Payment Terms</p>
            </div>

            {!fromBill && (
              <div className={css.paymentSelection}>
                <Mui.Button
                  className={tabValue === 'to_pay' ? css.selectedBtn : css.btn}
                  variant="text"
                  onClick={() => {
                    setTabValue('to_pay');
                  }}
                >
                  To Pay
                </Mui.Button>
                <Mui.Button
                  className={tabValue === 'advance' ? css.selectedBtn : css.btn}
                  variant="text"
                  onClick={() => {
                    setTabValue('advance');
                  }}
                >
                  Advance Paid
                </Mui.Button>
              </div>
            )}

            {tabValue === 'to_pay' && (
              <div style={{ padding: '20px' }}>
                <Input
                  name="creditPeriod"
                  className={`${css.greyBorder} ${classes.root}`}
                  label="Enter Credit Period"
                  variant="standard"
                  value={toPayDay.creditPeriod}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    type: 'number',
                    endAdornment: <p className={css.cssDays}>Days</p>,
                    inputProps: {
                      min: 0,
                    },
                  }}
                  fullWidth
                  onChange={(event) => {
                    event.persist();
                    if (event?.target?.value >= 0) {
                      setToPayDay((prev) => ({
                        ...prev,
                        creditPeriod: event?.target?.value,
                      }));
                    }
                  }}
                  theme="light"
                  onKeyDown={(e) =>
                    ['e', 'E', '-', '+', '.'].includes(e.key) &&
                    e.preventDefault()
                  }
                />

                <p className={css.newDueDate}>
                  Based on the Updated Credit Period, the new Due Date is:
                </p>

                <Input
                  name="newDueDate"
                  //   className={`${css.greyBorder} ${classes.root}`}
                  rootStyle={{
                    border: '1px solid #A0A4AF',
                    background: 'rgba(153, 158, 165, 0.39)',
                  }}
                  label="New Due Date"
                  variant="standard"
                  value={moment(toPayDay?.newDueDate).format('DD-MM-YYYY')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                  //   onChange={(event) =>
                  //     setToPayDay((prev) => ({
                  //       ...prev,
                  //       newDueDate: event?.target?.value,
                  //     }))
                  //   }
                  theme="light"
                  disabled
                />

                <div
                  style={{
                    margin: '35px 0 0 0',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Mui.Button
                    variant="contained"
                    className={css.primary}
                    style={{ padding: 15, textTransform: 'initial' }}
                    onClick={() => {
                      setToShow('to_pay');
                      setShowValue((prev) => ({
                        ...prev,
                        creditPeriodToShow: toPayDay?.creditPeriod,
                      }));
                      handleBottomSheet(
                        'paymentTerms',
                        'to_pay',
                        toPayDay?.creditPeriod,
                      );
                      callFunction({ credit_period: toPayDay?.creditPeriod });
                    }}
                  >
                    Update Payment Terms
                  </Mui.Button>
                </div>
              </div>
            )}

            {tabValue === 'advance' && selectCustomer?.customer_id && (
              <>
                <div
                  style={{
                    // padding: '20px',
                    maxHeight: device === 'desktop' ? '70vh' : '50vh',
                    overflow: 'auto',
                  }}
                >
                  {customerUnsettled?.length > 0 &&
                    customerUnsettled?.map((item) => (
                      <div
                        style={{
                          display: 'flex',
                          gap: 5,
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        <Checkbox
                          style={{
                            color: '#F08B32',
                            textTransform: 'capitalize',
                            width: '10%',
                          }}
                          onClick={() => hangleChecked(item)}
                          inputProps={{ 'aria-label': 'controlled' }}
                          checked={advancesData
                            ?.map((val) => val?.id)
                            ?.includes(item?.id)}
                          value={item}
                        />
                        <Mui.ListItemText
                          primary={
                            <p
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                margin: 0,
                              }}
                            >
                              {item?.document_number}
                            </p>
                          }
                          secondary={`paid on ${moment(item.date).format(
                            'DD MMM YYYY',
                          )}`}
                          sx={{ width: '50%' }}
                          onClick={() => hangleChecked(item)}
                        />
                        <p
                          style={{
                            width: '40%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {FormattedAmount(item?.net_balance)}
                        </p>
                      </div>
                    ))}

                  {customerUnsettled?.length === 0 && (
                    <p
                      style={{
                        color: '#e0513e',
                        fontWeight: '700',
                        margin: '25px',
                      }}
                    >
                      No Advances to Show
                    </p>
                  )}
                </div>
                <div
                  style={{
                    margin: '15px 0 0 0',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Mui.Button
                    variant="contained"
                    className={css.primary}
                    style={{
                      width: '90%',
                      height: 'auto',
                      textTransform: 'initial',
                    }}
                    disabled={advancesData?.length === 0}
                    onClick={() => {
                      setToShow('advance');
                      setShowValue((prev) => ({
                        ...prev,
                        advancesDataToShow: advancesData,
                      }));
                      handleBottomSheet(
                        'paymentTerms',
                        'advance',
                        advancesData,
                      );
                      const temp = advancesData?.map((val) => val?.id);
                      callFunction({ advances: temp });
                    }}
                  >
                    Confirm Adjustment <br />{' '}
                    {lineItems.length > 0
                      ? FormattedAmount(
                          lineItems.reduce(
                            (acc, val) => acc + parseInt(val.total, 10),
                            0,
                          ),
                        )
                      : FormattedAmount(0)}{' '}
                    /{' '}
                    {advancesData?.length > 0
                      ? FormattedAmount(
                          advancesData
                            ?.map((val) => Number(val?.net_balance))
                            ?.reduce((a, b) => a + b),
                        )
                      : FormattedAmount(0)}
                  </Mui.Button>
                </div>
              </>
            )}
            {tabValue === 'advance' && !selectCustomer?.customer_id && (
              <p
                style={{
                  color: '#e0513e',
                  fontWeight: '700',
                  margin: '0px 25px 25px 25px',
                }}
              >
                Please Select Customer
              </p>
            )}
          </div>
        </>
      </SelectBottomSheet>
    </>
  );
};

export default PaymentTerms;
