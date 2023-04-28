import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Checkbox,
  Modal,
  Dialog,
  MenuItem,
  Popover,
} from '@mui/material';
import { withStyles, makeStyles } from '@material-ui/core/styles';

import RestApi, { METHOD } from '@services/RestApi';
import AppContext from '@root/AppContext';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer';
// import JSBridge from '@nativeBridge/jsbridge';

import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import CircleCheckedFilled from '@material-ui/icons/CheckCircle';
import CircleUnchecked from '@material-ui/icons/RadioButtonUnchecked';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

import CreateAccount from './CreateAccount';
import AccountsList from './AccountsList';
// import BorrowinsLists from './BorrowinsLists';
import { StyledMenu } from './Statement/util';

import SelectBottomSheet from '../../../components/SelectBottomSheet/SelectBottomSheet';
import CreateVirtualAccount from './CreateVirtualAccount';
import AddBorrowings from './AddBorrowings';
import AddBankAccount from './AddBankAccount';
import WithdrawLoadMoney from './WithdrawLoadMoney';
import BankingMobile from './Mobile/BankingMobile';
import TransactionPassword from '../../PaymentView/TransactionVerify/TransactionPassword';

import brandlogo from '../../../assets/effcardbrand.svg';
import bankicon from '../../../assets/bankicon.svg';
import editicon from '../../../assets/accedit.svg';
import css from './bankingnew.scss';

const InitialState = [
  { name: 'Founder’s Bank Account', check: true },
  { name: 'Owner’s Bank Account', check: false },
  { name: 'Promoter’s Bank Account', check: false },
];

const ListsItem = withStyles({
  root: {
    padding: '0 !important',

    '& .Mui-selected': {
      background: 'none !important',

      '& .MuiListItemText-primary': {
        color: '#F08B32 !important',
      },

      '& .MuiTypography-body1': {
        color: '#F08B32 !important',
      },

      '& .MuiSvgIcon-root': {
        color: '#F08B32 !important',
      },
    },
  },
})(ListItem);

const useStyles = makeStyles(() => ({
  root: {
    '& .MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded': {
      borderRadius: '18px',
      maxWidth: 500,
    },
  },

  PopoverRoot: {
    '& .MuiPopover-paper': {
      background: '#FFFFFF',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: '0px 0px 16px rgba(0, 0, 0, 0.2)',
      borderRadius: '8px',
      width: '339px',
      top: '545px !important',
      left: '284px !important',
    },
  },

  titleRoot: {
    fontWeight: '300 !important',
    fontSize: '14px !important',
    lineHeight: '16px !important',
    color: '#414141',
    position: 'relative',
    marginTop: '12px !important',
    padding: '0 0 4px 12px',
    marginBottom: '8px !important',

    '&:before': {
      content: "''",
      width: '13px',
      height: '2px',
      position: 'absolute',
      bottom: 0,
      background: ' #f08b32',
      borderRadius: '8px',
    },
  },

  listItemRoot: {
    padding: 0,
    marginBottom: '8px',
    borderBottom: '1px solid #dcdcdc',
    cursor: 'pointer',

    '&:last-child': {
      marginBottom: '4px',
      borderBottom: 'none !important',
    },
  },

  listTextRoot: {
    margin: 0,

    '& .MuiListItemText-primary': {
      fontWeight: 200,
      fontSize: '14px',
      lineHeight: '16px',
      color: '#414141',
    },
  },
}));

const Banknew = () => {
  const { organization, user, currentUserInfo, openSnackBar, enableLoading } =
    useContext(AppContext);

  const IndianCurrency = Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  });
  const device = localStorage.getItem('device_detect');
  const classes = useStyles();

  const [AccHeaderState, setAccHeaderState] = useState(InitialState);
  const [FounderAccHeader, setFounderAccHeader] = useState();

  const [founderPreferenceShow, setFounderPreferenceShow] = useState(null);
  const founderPreferenceOpen = Boolean(founderPreferenceShow);

  const [active, setActive] = useState({
    Business: null,
    Founder: null,
    Borrow: null,
  });

  const [activeList, setActiveList] = useState({
    Business: true,
    Founder: false,
    Borrow: false,
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [AddBankshow, setAddBankshow] = useState(false);
  const [VirtualAccountShow, setVirtualAccountShow] = useState(false);
  const [BorrowingShow, setBorrowingShow] = useState(false);
  const [congratsDrawer, setCongratsDrawer] = useState(false);
  const [bankListingDetails, setBankListingDetails] = useState();

  // filletered
  const [effortlessAccounts, seteffortlessAccounts] = useState();
  const [businessAccounts, setbusinessAccounts] = useState({});
  const [founderAccounts, setfounderAccounts] = useState({});
  // const [borrowingsAccounts, setborrowingsAccounts] = useState({});
  const [Banks, setBanks] = useState({
    BankList: [],
    title: '',
    totalamt: '0.00',
  });
  const [loading, setloading] = useState('');
  const [toggleModal, setToggleModal] = useState(false);
  const YodleeInitialState = {
    fastLinkConfig: null,
    fastLinkConfigLocal: null,
    bankAccountType: null,
    bank_account_id: null,
  };
  const [yodleeBank, setyodleeBank] = useState(YodleeInitialState);

  // Load Money & Withdraw Money //
  const [moneyDrawer, setmoneyDrawer] = useState(false);
  const [action, setAction] = useState('');
  // Load Money & Withdraw Money //

  // ADD ICICI Mobile //

  // const AddICICIMobile = (val) => {
  //   setAddBankshow(val);
  // };
  // ADD ICICI Mobile //

  const accountPreference = (name) => {
    enableLoading(true);

    RestApi(`organizations/${organization.orgId}/settings`, {
      method: name ? METHOD.PATCH : METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
      payload: {
        founder_account_name: name,
      },
    })
      .then((res) => {
        enableLoading(false);
        let index;
        if (res.founder_account_name === 'founder') index = 0;
        else if (res.founder_account_name === 'owner') index = 1;
        else if (res.founder_account_name === 'promoter') index = 2;

        setFounderAccHeader(InitialState[index].name);
        const newState = AccHeaderState.map((row) => {
          if (row.name === InitialState[index].name)
            return { ...row, check: true };
          return { ...row, check: false };
        });
        setAccHeaderState(newState);
      })
      .catch(() => {
        enableLoading(false);
        openSnackBar({
          message: 'Unknown Error Occured',
          type: MESSAGE_TYPE.ERROR,
        });
      });
  };

  const handleAccountClick = (val) => () => {
    setFounderAccHeader(val.name);

    const newState = AccHeaderState.map((row) => {
      if (row.name === val.name) return { ...row, check: true };
      return { ...row, check: false };
    });

    setAccHeaderState(newState);
    setFounderPreferenceShow(null);
    let name;
    if (val.name === 'Founder’s Bank Account') name = 'founder';
    else if (val.name === 'Owner’s Bank Account') name = 'owner';
    else if (val.name === 'Promoter’s Bank Account') name = 'promoter';

    accountPreference(name);
  };

  const hanldeActive = (tab, val, title, total, ind) => {
    if (tab === 'Business')
      setActive({ ...active, Business: ind, Founder: null, Borrow: null });
    else if (tab === 'Founder')
      setActive({ ...active, Business: null, Founder: ind, Borrow: null });
    else if (tab === 'Borrow')
      setActive({ ...active, Business: null, Founder: null, Borrow: ind });
    setBanks({ ...Banks, BankList: val, title, totalamt: total });
    setloading('dataLoaded');
  };

  const hanldeActiveList = (val) => () => {
    if (val === 'Business') {
      setActiveList({
        ...activeList,
        Business: true,
        Founder: false,
        Borrow: false,
      });
    } else if (val === 'Founder') {
      setActiveList({
        ...activeList,
        Business: false,
        Founder: true,
        Borrow: false,
      });
    } else if (val === 'Borrow')
      setActiveList({
        ...activeList,
        Business: false,
        Founder: false,
        Borrow: true,
      });
  };

  /* Connect ICICI & Other Banks <-- Business & Founder Both Connect Button onClick --> */
  const handleConnectBank = (item) => () => {
    setAnchorEl(null);

    if (item === 'Add ICICI Bank Account') setAddBankshow(true);
    else
      setyodleeBank({
        ...yodleeBank,
        fastLinkConfig: 'add_bank',
        fastLinkConfigLocal: 'add_bank',
        bankAccountType: 'company',
      });
  };

  /* Transaction Password Setup Modal Trigger callBack */
  const showTransactionPassword = (val) => {
    setCongratsDrawer(val);
    setVirtualAccountShow(false);
  };

  const SumAmount = (arr) => {
    return arr?.reduce(
      (n, { available_balance }) => Number(n) + Number(available_balance),
      0
    );
  };

  const AccountsFilter = (arr) => {
    const result = arr?.reduce((x, y) => {
      (x[y.bank_account_type] = x[y.bank_account_type] || []).push(y);
      return x;
    }, []);

    const result_1 = result?.company?.reduce((x, y) => {
      (x[y.account_type] = x[y.account_type] || []).push(y);
      return x;
    }, {});

    const result_2 = result?.founder?.reduce((x, y) => {
      (x[y.account_type] = x[y.account_type] || []).push(y);
      return x;
    }, {});

    // const result_3 = result?.borrow?.reduce((x, y) => {
    //   (x[y.account_type] = x[y.account_type] || []).push(y);
    //   return x;
    // }, {});

    result_1?.CURRENT?.forEach((item) => {
      if (
        item.bank_account_type === 'company' &&
        item.account_type === 'CURRENT' &&
        item.account_name === 'Effortless Virtual Account'
      ) {
        seteffortlessAccounts(item);
        setloading('dataLoaded');
      }
    });

    if (result_1) {
      Object.keys(result_1)
        ?.sort()
        ?.forEach((val, ind) => {
          if (ind === 0)
            hanldeActive(
              'Business',
              result_1[val],
              val.toUpperCase(),
              IndianCurrency.format(SumAmount(result_1[val])),
              0
            );
        });
    } else if (result_2) {
      Object.keys(result_2)
        ?.sort()
        ?.forEach((val, ind) => {
          if (ind === 0)
            hanldeActive(
              'Founder',
              result_2[val],
              val.toUpperCase,
              IndianCurrency.format(SumAmount(result_2[val])),
              0
            );
        });
    } else setloading('dataNotLoaded');

    setbusinessAccounts(result_1);
    setfounderAccounts(result_2);
    // setborrowingsAccounts(result_3);
  };

  const fetchAllBankDetails = async () => {
    enableLoading(true);
    setActive({ ...active, Business: null, Founder: null, Borrow: null });

    await RestApi(
      `organizations/${organization.orgId}/yodlee_bank_accounts/bank_listing`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      }
    )
      .then((res) => {
        if (res && !res.error) {
          if (res.message) {
            openSnackBar({
              message: res.message,
              type: MESSAGE_TYPE.WARNING,
            });
          } else {
            AccountsFilter(res?.data);
            setBankListingDetails(res?.data);
          }
        }
        enableLoading(false);
      })
      .catch((e) => {
        openSnackBar({
          message: e.message,
          type: MESSAGE_TYPE.WARNING,
        });
      });
  };

  const handleCloseModal = () => {
    setToggleModal(false);
    setyodleeBank(YodleeInitialState);
  };

  /* Yodlee Bank Account Credential Update, Disable, Sync callBack */
  const AccountOperation = (val) => {
    setyodleeBank({ ...val });
  };

  const createBankDetails = (response) => {
    enableLoading(true);
    RestApi(
      `organizations/${organization?.orgId}/yodlee_bank_accounts/handle_fastlink_event`,
      {
        method: METHOD.POST,
        headers: {
          Authorization: `Bearer ${user?.activeToken}`,
        },
        payload: {
          fastlink_flow: yodleeBank.fastLinkConfigLocal,
          sites: response,
          account_type: yodleeBank.bankAccountType,
        },
      }
    )
      .then((res) => {
        if (res && !res.error) fetchAllBankDetails();
        else if (res.error)
          openSnackBar({
            message: res.message || 'Something went wrong',
            type: MESSAGE_TYPE.ERROR,
          });

        enableLoading(false);
        handleCloseModal();
      })
      .catch((e) => {
        openSnackBar({
          message: e.message || 'Error',
          type: MESSAGE_TYPE.ERROR,
        });
        enableLoading(false);
        handleCloseModal();
      });
  };

  const connectBank = () => {
    enableLoading(true);
    RestApi(
      `organizations/${organization?.orgId}/yodlee_bank_accounts/fastlink_config`,
      {
        method: METHOD.POST,
        headers: {
          Authorization: `Bearer ${user?.activeToken}`,
        },
        payload: {
          fastlink_flow: yodleeBank.fastLinkConfig,
          bank_account_id:
            yodleeBank.fastLinkConfig !== 'add_bank'
              ? yodleeBank.bank_account_id
              : undefined,
        },
      }
    )
      .then((res) => {
        if (res && res.fastlink_url) {
          // if (localStorage.getItem('device_detect') === 'desktop') {
          setToggleModal(true);
          let fastlinkParams;
          if (res.flow)
            fastlinkParams = {
              configName: res.fast_link_config_name,
              flow: res.flow,
            };
          else
            fastlinkParams = {
              configName: res.fast_link_config_name,
            };

          if (res.provider_account_id)
            fastlinkParams = {
              ...fastlinkParams,
              providerAccountId: res.provider_account_id,
            };

          window.fastlink.open(
            {
              fastLinkURL: res.fastlink_url,
              accessToken: `Bearer ${res.access_token}`,
              params: fastlinkParams,
              forceIframe: true,
              iframeScrolling: 'yes',
              onError(data) {
                enableLoading(false);
                // will be called on error. For list of possible message, refer to onError(data) Method.
                console.log(data);
                // handleCloseModal();
              },
              onClose(data) {
                console.log(data);

                // will be called called to close FastLink. For list of possible message, refer to onClose(data) Method.
                if (
                  data.action === 'exit' &&
                  (data.status === 'USER_CLOSE_ACTION' ||
                    data.code === 'E103' ||
                    data.code === 'E110')
                ) {
                  handleCloseModal();
                  if (data.code === 'E103') fetchAllBankDetails();
                } else if (
                  data.action === 'exit' &&
                  data.sites &&
                  data.sites.length > 0
                ) {
                  createBankDetails(data.sites);
                }
              },
            },
            'Fastlink-container'
          );
          // } else {
          // JSBridge.connectYodlee(res, yodleeBank.bankAccountType);
          // }

          enableLoading(false);
        } else if (res.error) {
          openSnackBar({
            message: res.message,
            type: MESSAGE_TYPE.ERROR,
          });
          setyodleeBank(YodleeInitialState);
          enableLoading(false);
        }
      })
      .catch((e) => {
        openSnackBar({
          message: e || 'Sorry,Something went Wrong, Please try again',
          type: MESSAGE_TYPE.ERROR,
        });
        enableLoading(false);
      });
  };

  useEffect(() => {
    accountPreference();
  }, []);

  useEffect(() => {
    if (yodleeBank.fastLinkConfig) connectBank();
  }, [yodleeBank.fastLinkConfig]);

  useEffect(() => {
    fetchAllBankDetails();
  }, [congratsDrawer]);

  return (
    <>
      {device === 'desktop' ? (
        <Box className={css.container}>
          <Stack className={css.leftsection}>
            <Stack className={css.efcard_container}>
              {!effortlessAccounts?.account_status ? (
                <>
                  <Typography variant="h3" className={css.banktitle}>
                    Banking that’s Designed for Business
                  </Typography>
                  <Typography className={css.regtext}>
                    Registration and Setup are{' '}
                    <span style={{ fontWeight: 'bold' }}>FREE.</span>
                  </Typography>
                  <Button
                    className={css.accopenbtn}
                    onClick={() => setVirtualAccountShow(true)}
                  >
                    Create Free Account
                  </Button>
                </>
              ) : (
                <>
                  <Stack className={css.brandtxtwrp}>
                    <img
                      src={brandlogo}
                      alt="Card Logo"
                      className={css.brandlogo}
                      loading="lazy"
                    />
                    <Typography className={css.acctext}>
                      Virtual Account
                    </Typography>
                  </Stack>
                  <Stack className={css.accinfowrp}>
                    <Typography className={css.accname}>
                      {effortlessAccounts?.display_name ||
                        effortlessAccounts?.account_holder_name ||
                        currentUserInfo?.name}
                    </Typography>
                    <Typography className={css.accbal}>
                      {IndianCurrency.format(
                        effortlessAccounts?.available_balance
                      )}
                    </Typography>
                  </Stack>
                  <Stack className={css.loadwidthdrawbtnwrp}>
                    <Button
                      className={css.widthrawbtn}
                      onClick={() => {
                        setmoneyDrawer(true);
                        setAction('withdraw_money');
                      }}
                    >
                      Withdraw Money
                    </Button>
                    <Button
                      className={css.loadmoneybtn}
                      onClick={() => {
                        setmoneyDrawer(true);
                        setAction('load_money');
                      }}
                    >
                      Load Money
                    </Button>
                  </Stack>
                </>
              )}
            </Stack>

            <Stack
              className={
                activeList.Business
                  ? `${css.acclistcontainer} ${css.activecontainer}`
                  : css.acclistcontainer
              }
              onClick={hanldeActiveList('Business')}
            >
              <Stack className={css.acctypeheader}>
                <Typography variant="h4" className={css.acctypetext}>
                  Business Bank Account
                </Typography>
                {businessAccounts !== undefined && (
                  <Button
                    aria-controls={open ? 'demo-customized-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    variant="contained"
                    disableElevation
                    className={css.accconnectbtn}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                  >
                    <AddRoundedIcon fontSize="small" />
                    Connect
                  </Button>
                )}
                <StyledMenu
                  id="demo-customized-menu"
                  MenuListProps={{
                    'aria-labelledby': 'demo-customized-button',
                  }}
                  anchorEl={anchorEl}
                  open={open}
                  onClose={() => setAnchorEl(null)}
                  listwidth={198}
                >
                  {['Add ICICI Bank Account', 'Add Other Bank'].map((row) => (
                    <MenuItem
                      key={row}
                      className={css.dropdownitem}
                      onClick={handleConnectBank(row)}
                    >
                      {row}
                    </MenuItem>
                  ))}
                </StyledMenu>
              </Stack>
              {businessAccounts === undefined ||
              Object.keys(businessAccounts)?.length === 0 ? (
                <Stack className={css.nodatawrp}>
                  <img
                    src={bankicon}
                    alt="Bank Icon"
                    className={css.nodataicon}
                    loading="lazy"
                  />
                  <Typography className={css.nodatatext}>
                    No Bank Account Found.
                  </Typography>
                  <Stack sx={{ position: 'relative' }}>
                    <Button
                      className={css.addaccbtn}
                      onClick={(e) => setAnchorEl(e.currentTarget)}
                    >
                      Add Your Bank Account
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <List>
                  {Object.keys(businessAccounts)
                    ?.sort()
                    ?.map((val, ind) => (
                      <ListsItem
                        disablePadding
                        key={val}
                        onClick={() =>
                          hanldeActive(
                            'Business',
                            businessAccounts[val],
                            val,
                            IndianCurrency.format(
                              SumAmount(businessAccounts[val])
                            ),
                            ind
                          )
                        }
                      >
                        <ListItemButton
                          selected={active.Business === ind}
                          className={css.listitemwrp}
                          onClick={() => setActive(ind)}
                        >
                          <ListItemText
                            primary={`${businessAccounts[val].length} ${val} ACCOUNT`}
                            className={css.listitemtext}
                          />
                          <Stack className={css.amountwrp}>
                            <Typography className={css.listaccamt}>
                              {IndianCurrency.format(
                                SumAmount(businessAccounts[val])
                              )}
                            </Typography>
                            <KeyboardArrowRightRoundedIcon
                              className={css.arrowicon}
                            />
                          </Stack>
                        </ListItemButton>
                      </ListsItem>
                    ))}
                </List>
              )}
            </Stack>

            <Stack
              className={
                activeList.Founder
                  ? `${css.acclistcontainer} ${css.activecontainer}`
                  : css.acclistcontainer
              }
              onClick={hanldeActiveList('Founder')}
            >
              <Stack className={`${css.acctypeheader} `}>
                <Typography variant="h4" className={css.acctypetext}>
                  {FounderAccHeader}
                  <IconButton
                    sx={{ padding: '0px', marginLeft: '12px' }}
                    onClick={(e) => setFounderPreferenceShow(e.currentTarget)}
                  >
                    <img src={editicon} alt="account" />
                  </IconButton>
                </Typography>
                {founderAccounts !== undefined && (
                  <Button
                    className={css.accconnectbtn}
                    onClick={() =>
                      setyodleeBank({
                        ...yodleeBank,
                        fastLinkConfig: 'add_bank',
                        fastLinkConfigLocal: 'add_bank',
                        bankAccountType: 'founder',
                      })
                    }
                  >
                    <AddRoundedIcon fontSize="small" />
                    Connect
                  </Button>
                )}

                <Popover
                  open={founderPreferenceOpen}
                  anchorEl={founderPreferenceShow}
                  onClose={() => setFounderPreferenceShow(null)}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  className={classes.PopoverRoot}
                >
                  {/* <Stack className={css.founderaccheader}> */}
                  <Typography className={classes.titleRoot}>
                    Select Preference
                  </Typography>
                  <List sx={{ paddingTop: '0px' }}>
                    {AccHeaderState.map((val) => (
                      <ListItem
                        key={val.name}
                        className={classes.listItemRoot}
                        onClick={handleAccountClick(val)}
                      >
                        <Checkbox
                          icon={<CircleUnchecked />}
                          checkedIcon={<CircleCheckedFilled />}
                          checked={val.check}
                          sx={{
                            color: '#E5E5E5',
                            marginLeft: '3px',
                            padding: 0,
                            marginRight: '12px',

                            '&.Mui-checked': {
                              color: '#F08B32',
                            },
                          }}
                          onChange={handleAccountClick(val)}
                        />
                        <ListItemText
                          primary={val.name}
                          className={classes.listTextRoot}
                        />
                      </ListItem>
                    ))}
                  </List>
                  {/* </Stack> */}
                </Popover>

                {/* <StyledMenu
                  anchorEl={founderPreferenceShow}
                  open={founderPreferenceOpen}
                  onClose={() => setFounderPreferenceShow(null)}
                  listwidth={339}
                >
                  {AccHeaderState.map((val) => (
                    <MenuItem
                      key={val.name}
                      className={`${css.listitem}`}
                      onClick={handleAccountClick(val)}
                    >
                      <Checkbox
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        checked={val.check}
                        sx={{
                          color: '#E5E5E5',
                          marginLeft: '3px',

                          '&.Mui-checked': {
                            color: '#F08B32',
                          },
                        }}
                        onChange={handleAccountClick(val)}
                      />
                      {val.name}
                    </MenuItem>
                  ))}
                </StyledMenu> */}
              </Stack>
              {founderAccounts === undefined ||
              Object.keys(founderAccounts)?.length === 0 ? (
                <Stack className={css.nodatawrp}>
                  <img
                    src={bankicon}
                    alt="Bank Icon"
                    className={css.nodataicon}
                    loading="lazy"
                  />
                  <Typography className={css.nodatatext}>
                    No Bank Account Found.
                  </Typography>
                  <Stack sx={{ position: 'relative' }}>
                    <Button
                      className={css.addaccbtn}
                      onClick={() =>
                        setyodleeBank({
                          ...yodleeBank,
                          fastLinkConfig: 'add_bank',
                          fastLinkConfigLocal: 'add_bank',
                          bankAccountType: 'founder',
                        })
                      }
                    >
                      Add Your Bank Account
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <List>
                  {Object.keys(founderAccounts)
                    ?.sort()
                    ?.map((val, ind) => (
                      <ListsItem
                        disablePadding
                        key={val}
                        onClick={() =>
                          hanldeActive(
                            'Founder',
                            founderAccounts[val],
                            val,
                            IndianCurrency.format(
                              SumAmount(founderAccounts[val])
                            ),
                            ind
                          )
                        }
                      >
                        <ListItemButton
                          className={css.listitemwrp}
                          onClick={() => setActive(ind)}
                          selected={active.Founder === ind}
                        >
                          <ListItemText
                            primary={`${founderAccounts[val].length} ${val} ACCOUNT`}
                            className={css.listitemtext}
                          />
                          <Stack className={css.amountwrp}>
                            <Typography className={css.listaccamt}>
                              {IndianCurrency.format(
                                SumAmount(founderAccounts[val])
                              )}
                            </Typography>
                            <KeyboardArrowRightRoundedIcon
                              className={css.arrowicon}
                            />
                          </Stack>
                        </ListItemButton>
                      </ListsItem>
                    ))}
                </List>
              )}
            </Stack>

            {/* <Stack
              className={
                activeList.Borrow
                  ? `${css.acclistcontainer} ${css.activecontainer}`
                  : css.acclistcontainer
              }
              onClick={hanldeActiveList('Borrow')}
            >
              <Stack className={css.acctypeheader}>
                <Typography variant="h4" className={css.acctypetext}>
                  Borrowings
                </Typography>
                {borrowingsAccounts !== undefined && (
                  <Button
                    className={css.accconnectbtn}
                    onClick={() => setBorrowingShow(true)}
                  >
                    Add Borrowings
                  </Button>
                )}
              </Stack>
              {borrowingsAccounts === undefined ||
              Object.keys(borrowingsAccounts)?.length === 0 ? (
                <Stack className={css.nodatawrp}>
                  <img
                    src={bankicon}
                    alt="Bank Icon"
                    className={css.nodataicon}
                    loading="lazy"
                  />
                  <Typography className={css.nodatatext}>
                    No Borrowings Account Found.
                  </Typography>
                  <Button
                    className={css.addaccbtn}
                    onClick={() => setBorrowingShow(true)}
                  >
                    Add Borrowings
                  </Button>
                </Stack>
              ) : (
                <List>
                  {Object?.keys(borrowingsAccounts)?.map((val, ind) => (
                    <ListsItem
                      disablePadding
                      key={val}
                      onClick={() => hanldeActive('Borrow', val, ind)}
                    >
                      <ListItemButton
                        selected={active.Borrow === ind}
                        className={css.listitemwrp}
                        onClick={() => setActive(ind)}
                      >
                        <ListItemText
                          primary={`${borrowingsAccounts[val].length} ${val} ACCOUNT`}
                          className={css.listitemtext}
                        />
                        <Stack className={css.amountwrp}>
                          <Typography className={css.listaccamt}>
                            {IndianCurrency.format(
                              SumAmount(borrowingsAccounts[val])
                            )}
                          </Typography>
                          <KeyboardArrowRightRoundedIcon
                            className={css.arrowicon}
                          />
                        </Stack>
                      </ListItemButton>
                    </ListsItem>
                  ))}
                </List>
              )}
            </Stack> */}
          </Stack>
          <Stack className={css.rightsection}>
            {loading === 'dataNotLoaded' && (
              <CreateAccount show={() => setVirtualAccountShow(true)} />
            )}
            {loading === 'dataLoaded' && (
              <AccountsList
                acclist={Banks}
                FetchBankAccounts={fetchAllBankDetails}
                AccountOperation={AccountOperation}
                bankListingDetails={bankListingDetails}
              />
              // <BorrowinsLists />
            )}
          </Stack>

          {/* <Modal open={toggleModal} onClose={handleCloseModal}>
            <div
              id="Fastlink-container"
              style={{ height: '100vh', overflow: 'scroll', marginTop: '4vh' }}
            />
          </Modal> */}

          <SelectBottomSheet
            triggerComponent
            open={congratsDrawer}
            name="Create Transaction Password"
            hideClose
            // onClose={() => setCongratsDrawer(false)}
          >
            <TransactionPassword onClose={() => setCongratsDrawer(false)} />
          </SelectBottomSheet>
          <SelectBottomSheet
            triggerComponent
            open={BorrowingShow}
            name="Add Borrowings"
            onClose={() => setBorrowingShow(false)}
          >
            <AddBorrowings />
          </SelectBottomSheet>
          <Dialog
            fullWidth
            maxWidth="sm"
            open={moneyDrawer}
            className={classes.root}
          >
            <WithdrawLoadMoney
              onClose={() => setmoneyDrawer(false)}
              actionType={action}
            />
          </Dialog>
        </Box>
      ) : (
        <BankingMobile
          efcarddetail={effortlessAccounts}
          businessAccounts={businessAccounts}
          founderAccounts={founderAccounts}
          FetchBankAccounts={fetchAllBankDetails}
          AccountOperation={AccountOperation}
          AddICICI={(val) => setAddBankshow(val)}
          addEffortless={() => setVirtualAccountShow(true)}
          AddOther={(val) => {
            setyodleeBank({
              ...yodleeBank,
              fastLinkConfig: val.fastLinkConfig,
              fastLinkConfigLocal: val.fastLinkConfigLocal,
              bankAccountType: val.bankAccountType,
            });
          }}
          bankListingDetails={bankListingDetails}
        />
      )}

      <SelectBottomSheet
        triggerComponent
        open={VirtualAccountShow}
        name="Add Virtual Account"
        onClose={() => setVirtualAccountShow(false)}
      >
        <CreateVirtualAccount
          TransactionPassword={showTransactionPassword}
          FetchBankAccounts={fetchAllBankDetails}
          onClose={() => setVirtualAccountShow(false)}
        />
      </SelectBottomSheet>

      <SelectBottomSheet
        triggerComponent
        open={AddBankshow}
        name="Add Bank"
        onClose={() => setAddBankshow(false)}
      >
        <AddBankAccount
          onClose={() => setAddBankshow(false)}
          FetchConnectedBank={fetchAllBankDetails}
          TransactionPassword={showTransactionPassword}
        />
      </SelectBottomSheet>

      <Modal open={toggleModal} onClose={handleCloseModal}>
        <div
          id="Fastlink-container"
          style={{ height: '100vh', overflow: 'scroll', marginTop: '4vh' }}
        />
      </Modal>
    </>
  );
};

export default Banknew;
