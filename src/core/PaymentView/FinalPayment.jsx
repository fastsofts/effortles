import React, { useEffect, useState, useContext } from 'react';
import AppContext from '@root/AppContext.jsx';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import * as Router from 'react-router-dom';
import * as Mui from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import css from './FinalPayment.scss';
import silencer from '../../assets/WebAssets/silencer.svg';
import CircleOk from '../../assets/WebAssets/circle-ok.svg';
import ErrorImg from '../../assets/WebAssets/error.svg';
import StopWatch from '../../assets/WebAssets/stopwatch.svg';
// import ErrorImg from '../../assets/WebAssets/error.svg';

export const FinalPayment = ({
  paymentsResponse,
  setRetryPaymentVoucharId,
  paymentType,
}) => {
  const { organization, user, enableLoading, openSnackBar } =
    useContext(AppContext);
  const navigate = Router.useNavigate();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [failedState, setFailedState] = useState(false);
  const [failedStateList, setFailedStateList] = useState([]);
  useEffect(() => {
    if (paymentsResponse?.length > 0) {
      setFailedState(
        paymentsResponse.find((ele) => ele.payment_status === 'Failed').id !==
          null ||
          paymentsResponse.find((ele) => ele.payment_status === 'Failed').id !==
            '',
      );
      setFailedStateList(
        paymentsResponse.map((ele) => {
          if (ele.payment_status === 'Failed') return ele.payment_order_id;
          return '';
        }),
      );
    }
  }, [paymentsResponse]);

  const RetryPayment = async () => {
    enableLoading(true, 'Please wait for a moment...');
    RestApi(`organizations/${organization.orgId}/payment_orders`, {
      method: METHOD.POST,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
      payload: {
        payment_order_ids: failedStateList,
      },
    })
      .then((res) => {
        enableLoading(false);
        if (res && !res.error) {
          if (res?.success) {
            setRetryPaymentVoucharId(res?.payment_voucher_id);
            // navigate('/payment-makepayment', {
            //   state: { voucherId: res?.payment_voucher_id },
            // });
          } else if (res.error) {
            openSnackBar({
              message: res.message || 'Unknown Error Occured',
              type: 'error',
            });
          }
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  return (
    <Mui.Card
      className={css.CardComponent}
      sx={{ height: mobile ? 'auto !important' : '70vh !important' }}
    >
      <Mui.Grid container spacing={2}>
        <Mui.Grid item xs={12} lg={5} md={5} className={css.LeftSide}>
          <Mui.CardMedia
            component="img"
            src={silencer}
            alt="silencer"
            className={css.Img}
          />
          <Mui.Typography className={css.head}>Heads Up!</Mui.Typography>
          {failedState && (
            <>
              <Mui.Typography className={css.subhead} align="center">
                Not All Transactions were Successful
              </Mui.Typography>
              {paymentType === 'voucher_payment' && (
                <Mui.Button
                  className={css.btnhead}
                  onClick={() => RetryPayment()}
                >
                  <Mui.Typography className={css.btn}>
                    Retry Unsuccesful Payments
                  </Mui.Typography>
                </Mui.Button>
              )}
            </>
          )}
          <Mui.Typography
            className={css.link}
            role="presentation"
            onClick={() => {
              navigate('/payment');
            }}
          >
            Return to Payment Dashboard
          </Mui.Typography>
        </Mui.Grid>
        <Mui.Stack
          sx={{ display: mobile ? 'none' : 'flex' }}
          className={css.divider}
        />
        <Mui.Grid item xs={12} lg={6} md={6} className={css.RightSide}>
          {paymentsResponse?.map((ele) => (
            <Mui.Card elevation={1} className={css.Box}>
              <Mui.Grid container spacing={2}>
                <Mui.Grid item xs={8}>
                  <Mui.Typography className={css.BoxHead}>
                    {ele.vendor_name}
                  </Mui.Typography>
                  <Mui.Typography className={css.BoxSubHead}>
                    Paid from Effortless Virtual Account
                  </Mui.Typography>
                  <Mui.Typography className={css.BoxAmount}>
                    {`Rs. ${ele.amount}`}
                  </Mui.Typography>
                </Mui.Grid>
                <Mui.Grid item xs={4}>
                  <Mui.Stack direction="column">
                    <Mui.Stack className={css.ImgHead}>
                      {ele.payment_status === 'Failed' && (
                        <>
                          {' '}
                          <Mui.CardMedia
                            className={css.BoxImg}
                            component="img"
                            src={ErrorImg}
                            alt="ErrorImg"
                          />
                          <Mui.Typography className={css.BoxFailed}>
                            {ele.payment_status}
                          </Mui.Typography>{' '}
                        </>
                      )}
                      {ele.payment_status === 'Success' && (
                        <>
                          <Mui.CardMedia
                            className={css.BoxImg}
                            component="img"
                            src={CircleOk}
                            alt="CircleOk"
                          />
                          <Mui.Typography className={css.BoxSuccess}>
                            {ele.payment_status}
                          </Mui.Typography>
                        </>
                      )}
                      {ele.payment_status === 'Processing' && (
                        <>
                          <Mui.CardMedia
                            className={css.BoxImg}
                            component="img"
                            src={StopWatch}
                            alt="CircleOk"
                          />
                          <Mui.Typography className={css.BoxProcessing}>
                            {ele.payment_status}
                          </Mui.Typography>
                        </>
                      )}
                    </Mui.Stack>
                  </Mui.Stack>
                </Mui.Grid>
              </Mui.Grid>
            </Mui.Card>
          ))}
        </Mui.Grid>
      </Mui.Grid>
    </Mui.Card>
  );
};
