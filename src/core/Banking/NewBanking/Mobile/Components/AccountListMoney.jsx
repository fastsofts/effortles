import React, { useState, useEffect, useContext, memo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Stack,
  Typography,
  List,
  ListItem,
  ListItemButton,
  FormControlLabel,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Radio,
  Button,
} from '@mui/material';

import { styled } from '@mui/material/styles';
import { makeStyles } from '@material-ui/core/styles';

import AppContext from '@root/AppContext';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer';
import RestApi, { METHOD } from '@services/RestApi';

import Searchicon from '../../../../../assets/search_1.svg';
import icici from '../../../../../assets/BankLogo/icicilogo.svg';

import css from '../bankingmobile.scss';

const BpIcon = styled('span')(({ theme }) => ({
  borderRadius: '50%',
  width: 16,
  height: 16,

  backgroundColor: '#FFFFFF',
  border: '1px solid #F08B32',
  backgroundImage:
    theme.palette.mode === 'dark'
      ? 'linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))'
      : 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
  padding: 0,
  '.Mui-focusVisible &': {
    outline: '2px auto rgba(19,124,189,.6)',
    outlineOffset: 2,
  },
  'input:hover ~ &': {
    backgroundColor: '#FFFFFF',
    border: '1px solid #F08B32',
  },
  'input:disabled ~ &': {
    boxShadow: 'none',
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(57,75,89,.5)'
        : 'rgba(206,217,224,.5)',
  },
}));

const BpCheckedIcon = styled(BpIcon)({
  backgroundColor: '#F08B32',

  backgroundImage:
    'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
  '&:before': {
    display: 'block',
    width: 16,
    height: 16,
    backgroundImage: 'radial-gradient(#fff,#fff 28%,transparent 32%)',
    content: '""',
  },
  'input:hover ~ &': {
    backgroundColor: '#F08B32',
  },
});

const BpRadio = (props) => {
  return (
    <Radio
      disableRipple
      color="default"
      checkedIcon={<BpCheckedIcon />}
      icon={<BpIcon />}
      {...props}
    />
  );
};

const useStyles = makeStyles(() => ({
  root: {
    '&:hover': {
      backgroundColor: 'transparant',
    },
    '& .MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded': {
      borderRadius: '18px',
      maxWidth: 500,
    },
  },
  RadioRoot: {
    padding: 0,
    marginRight: '14px !important',

    '& .MuiRadio-root': {
      padding: 0,
    },
  },
  listitemRoot: {
    padding: '0px !important',
    marginBottom: '20px',

    '&:last-child': {
      marginBottom: 0,
    },

    '& .MuiListItemSecondaryAction-root': {
      right: 0,
    },
  },

  AccountText: {
    '& .MuiListItemText-primary': {
      fontWeight: 400,
      fontSize: '13px',
      lineHeight: '16px',
      color: '#2E3A59',
    },
    '& .MuiListItemText-secondary': {
      fontWeight: 300,
      fontSize: '12px',
      lineHeight: '15px',
      color: '#6E6E6E',
    },
  },
}));

const AccountListMoney = ({
  onClose,
  LoadAmount,
  setPaymentResponse,
  actionTyope,
  ippoPaySuccess,
}) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { organization, user, enableLoading, openSnackBar } =
    useContext(AppContext);

  const [Search, setSearch] = useState('');
  const [selectedBank, setselectedBank] = useState('');
  const [btnutils, setBtnutils] = useState({
    title: 'Choose Account To Load Money',
    desc: 'Withdraw Money to your Effortless Virtual Account',
  });

  const [actionHandler, setactionHandler] = useState(false);

  const [bankDetail, setBankDetail] = useState([]);
  const [limitedBank, setlimitedBank] = useState([]);

  const FetchConnectedBank = async () => {
    enableLoading(true);
    await RestApi(
      `organizations/${organization?.orgId}/vendor_bills/connected_banking_list`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        if (res && !res.error) {
          setBankDetail(res?.data);
          setlimitedBank(res?.data);
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

  const FilterBank = () => {
    const filteredBanks = bankDetail.filter((item) =>
      item.bank_account_name.toLowerCase().includes(Search.toLowerCase()),
    );
    setlimitedBank(filteredBanks);
  };

  const AccountConfirmation = () => {
    onClose();
    navigate('/banking');
    openSnackBar({
      message: 'Account Confirmation Successfull',
      type: MESSAGE_TYPE.INFO,
    });
  };

  const Proceed = async () => {
    if (actionTyope === 'load_money')
      await RestApi(
        `organizations/${organization?.orgId}/effortless_virtual_accounts/create_payment`,
        {
          method: METHOD.POST,
          headers: {
            Authorization: `Bearer ${user?.activeToken}`,
          },
          payload: {
            amount: LoadAmount,
            bank_account_id: selectedBank,
          },
        },
      )
        .then((res) => {
          if (res && !res.error) {
            if (res?.collection_service_provider === 'ippopay')
              setPaymentResponse(res);
            else window.alert('Other GateWay');
          } else if (res.error) {
            openSnackBar({
              message:
                res.error || res.message || 'Sorry, Something went wrong',
              type: MESSAGE_TYPE.ERROR,
            });
          }
        })
        .catch((e) => {
          console.log('PayU error', e);
          enableLoading(false);
        });
    else setPaymentResponse(selectedBank);
  };

  useEffect(() => {
    FilterBank();
  }, [Search]);

  useEffect(() => {
    if (ippoPaySuccess === 'paymentSuccess') {
      setactionHandler(true);
      setBtnutils({
        ...btnutils,
        title: 'Account Confirmation',
        desc: 'Did you utilise the following bank account to load money into your Effortless Virtual Account?',
      });
    }
  }, [ippoPaySuccess]);

  useEffect(() => {
    FetchConnectedBank();
  }, []);

  return (
    <>
      <Stack className={css.bottommodalcontainer}>
        <Stack
          className={css.emptyBar}
          sx={{ marginBottom: '20px !important' }}
        />
        <Typography variant="h4" className={css.headertext}>
          {btnutils.title}
        </Typography>
        <Typography className={css.desc}>{btnutils.desc}</Typography>

        {bankDetail?.length > 5 && (
          <Stack className={css.searchwrp}>
            <img src={Searchicon} alt="search" width={16} height={16} />
            <input
              type="search"
              value={Search}
              className={css.searchinput}
              placeholder="Search a Bank Account"
              onChange={(e) => setSearch(e.target.value)}
            />
          </Stack>
        )}

        <List
          dense
          sx={{
            width: '100%',
            bgcolor: 'background.paper',
            padding: 0,
            marginBottom: '14px',
          }}
        >
          {limitedBank.length > 0 ? (
            <>
              {limitedBank.slice(0, 3)?.map((val) => (
                <ListItem
                  key={val.id}
                  secondaryAction={
                    <Typography
                      className={
                        val.bank_account_type === 'company'
                          ? css.bankaccbusiness
                          : css.bankaccpersonal
                      }
                    >
                      {val.bank_account_type === 'company'
                        ? 'Business'
                        : 'Personal'}
                    </Typography>
                  }
                  sx={{
                    padding: 0,
                  }}
                  className={classes.listitemRoot}
                  onClick={() => setselectedBank(val.id)}
                >
                  <ListItemButton
                    sx={{ padding: '0 0 0 11px', borderRadius: '4px' }}
                  >
                    <FormControlLabel
                      value="bank_account"
                      className={classes.RadioRoot}
                      control={
                        <BpRadio
                          name="selectedBank"
                          checked={selectedBank === val.id}
                          onChange={() => setselectedBank(val.id)}
                        />
                      }
                    />

                    <ListItemAvatar
                      sx={{ minWidth: 'initial', marginRight: '6px' }}
                    >
                      <Avatar
                        alt="Avatar"
                        src={icici}
                        sx={{ width: '32px', height: '32px' }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        val.bank_account_name.length > 20
                          ? `${val.bank_account_name?.slice(0, 20)}...`
                          : val.bank_account_name || ''
                      }
                      secondary={
                        val?.bank_account_number
                          ? `xx ${val?.bank_account_number?.substr(-4)}`
                          : ''
                      }
                      className={classes.AccountText}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </>
          ) : (
            <ListItem>
              <ListItemText primary="No bank found." />
            </ListItem>
          )}
          {/* <ListItem disablePadding>
          <ListItemButton sx={{ padding: '6px 0', borderRadius: '4px' }}>
            <ListItemAvatar sx={{ minWidth: 'initial', marginRight: '6px' }}>
              <Avatar
                alt="Avatar"
                src={addbank}
                sx={{ width: '32px', height: '32px' }}
              />
            </ListItemAvatar>
            <ListItemText
              primary="Add Bank Account"
              className={css.addaccitem}
            />
          </ListItemButton>
        </ListItem> */}
        </List>
        {!actionHandler ? (
          <Button
            className={
              selectedBank === ''
                ? `${css.submit_btn} ${css.opacitybtn}`
                : css.submit_btn
            }
            onClick={Proceed}
            disabled={selectedBank === ''}
          >
            {`${
              actionTyope === 'load_money' ? 'Pay' : 'Withdraw'
            } Rs. ${LoadAmount}`}
          </Button>
        ) : (
          <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button className={css.confno}>No</Button>
            <Button className={css.confyes} onClick={AccountConfirmation}>
              Yes
            </Button>
          </Stack>
        )}
      </Stack>
    </>
  );
};

export default memo(AccountListMoney);
