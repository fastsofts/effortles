import React from 'react';
import * as Mui from '@mui/material';
import AppContext from '@root/AppContext.jsx';
import JSBridge from '@nativeBridge/jsbridge';
import DownArrow from '@assets/downArrow.svg';
import css from './PayNow.scss';

const PayNow = ({
  title,
  subTitle,
  active,
  handlePay,
  hasBalance,
  PayType,
  hidden,
}) => {
  const {
    registerEventListeners,
    deRegisterEventListener,
    transactionType,
    setTransactionType,
    transactionTypeList,
  } = React.useContext(AppContext);
  const device = localStorage.getItem('device_detect');
  const handleToPay = typeof handlePay === 'function' ? handlePay : () => {};
  const [authenticate, setAuthenticate] = React.useState();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [Type, setType] = React.useState('IMPS');

  React.useEffect(() => {
    setType(transactionType);
  }, [transactionType]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  React.useEffect(() => {
    if (authenticate) handleToPay();
  }, [authenticate]);

  const setUserAuthenticationData = (response) => {
    setAuthenticate(JSON.parse(response.detail.value)?.status);
  };

  React.useEffect(() => {
    registerEventListeners({
      name: 'userAuthorize',
      method: setUserAuthenticationData,
    });
    return () =>
      deRegisterEventListener({
        name: 'userAuthorize',
        method: setUserAuthenticationData,
      });
  }, []);

  const PaymentType = (text) => {
    setType(text);
    setTransactionType(text);
    if (PayType) {
      PayType(text);
    }
    setAnchorEl(null);
  };

  return device === 'desktop' ? (
    <>
      <Mui.Stack direction="row" className={css.payStackDesktop}>
        <Mui.Stack style={{ margin: '0 10px' }}>
          <Mui.Typography style={{ color: 'white' }}>{title}</Mui.Typography>
          <Mui.Typography style={{ color: 'white' }}>
            {' '}
            {subTitle}
          </Mui.Typography>
        </Mui.Stack>
        <Mui.Stack direction="row" className={css.payStackDesktops} spacing={2}>
          {hidden && (
            <Mui.Stack className={css.btn1}>
              <Mui.Button
                sx={{ color: '#f08b32' }}
                onClick={handleClick}
                disabled={!active}
              >
                <Mui.Typography>{Type}</Mui.Typography>
              </Mui.Button>
              <Mui.Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                PaperProps={{
                  sx: { width: '117px !important', borderRadius: 5 },
                }}
              >
                {transactionTypeList &&
                  transactionTypeList?.map((text) => {
                    return (
                      <Mui.Typography
                        align="center"
                        sx={{ cursor: 'pointer', p: '5px', color: '#F08B32' }}
                        onClick={() => PaymentType(text)}
                      >
                        {text}
                      </Mui.Typography>
                    );
                  })}
              </Mui.Popover>
            </Mui.Stack>
          )}
          <Mui.Button
            disabled={!active}
            className={css.btn}
            onClick={handleToPay}
            disableElevation
            disableTouchRipple
          >
            <Mui.Typography>pay now</Mui.Typography>
          </Mui.Button>
        </Mui.Stack>
      </Mui.Stack>
    </>
  ) : (
    <>
      {hidden && Type && (
        <div className={css.transactionBtn}>
          <Mui.Button
            sx={{ color: '#f08b32' }}
            onClick={handleClick}
            disabled={!active}
          >
            <Mui.Typography>{Type}</Mui.Typography>
            <img src={DownArrow} alt="Down Arrow" />
          </Mui.Button>
          <Mui.Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            PaperProps={{
              sx: { width: '100%', borderRadius: 5 },
            }}
          >
            {transactionTypeList &&
              transactionTypeList?.map((text) => {
                return (
                  <Mui.Typography
                    align="center"
                    sx={{ cursor: 'pointer', p: '5px', color: '#F08B32' }}
                    onClick={() => PaymentType(text)}
                  >
                    {text}
                  </Mui.Typography>
                );
              })}
          </Mui.Popover>
        </div>
      )}
      <div
        className={`${css.paynowContainer} ${
          active ? css.active : css.disable
        }`}
      >
        <div className={css.subContainer}>
          <div>
            <p className={css.title}>{title}</p>
            <p className={css.subTitle}>{subTitle}</p>
          </div>
        </div>
        <div
          className={active ? css.paynow : css.paynow}
          onClick={() => {
            if (active && !hasBalance) {
              JSBridge.userAuthenticationforPayments();
            } else if (active) {
              handleToPay();
            }
          }}
        >
          <p>{hasBalance ? 'Pay Now' : 'Add Now'}</p>
        </div>
      </div>
    </>
  );
};

export default PayNow;
