import React, { useState, useContext, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Stack,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  IconButton,
  // ListItemAvatar,
  Avatar,
  ListItemText,
} from '@mui/material';
import { makeStyles } from '@material-ui/core/styles';

import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';

import RestApi, { METHOD } from '@services/RestApi';
import AppContext from '@root/AppContext';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer';

import VirtualCardEmpty from './Components/VirtualCardEmpty';
import BankAccountsEmpty from './Components/BankAccountsEmpty';
import SelectBottomSheet from '../../../../components/SelectBottomSheet/SelectBottomSheet';
import AccountPreferance from './Components/AccountPreferance';
import BusinessAccountConnect from './Components/BusinessAccountConnent';
import AccountEditOptions from './Components/AccountEditOptions';
import EditAccount from '../EditIndividualAccount';

import brandlogo from '../../../../assets/effcardbrandmobile.svg';
import acceditmobile from '../../../../assets/acceditmobile.svg';
// import hdfclogo from '../../../../assets/BankLogo/ef.svg';
import css from './bankingmobile.scss';

const useStyles = makeStyles({
  AccordionRoot: {
    boxShadow: 'none !important',
    background: 'none !important',
    margin: '0px !important',

    '&.Mui-expanded': {
      background: '#FFFFFF !important',
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1) !important',
      borderRadius: '8px !important',
      marginBottom: '16px !important',
    },

    '&:before': {
      display: 'none',
    },
  },

  AccordionSummary: {
    padding: '12px !important',
    minHeight: 'initial !important',

    '& .MuiAccordionSummary-content': {
      justifyContent: 'space-between',
      margin: '0px !important',
    },

    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
      transform: 'rotate(90deg) !important',
    },
  },

  AccordionDetails: {
    padding: '0 !important',
  },

  AccordionListItemText: {
    margin: '0 0 0 0 !important',

    '& .MuiListItemText-primary': {
      fontWeight: 500,
      fontSize: '13px',
      lineHeight: '16px',
      color: '#2E3A59',
    },
    '& .MuiListItemText-secondary': {
      fontWeight: 400,
      fontSize: '12px',
      lineHeight: '15px',
      color: '#6E6E6E',
    },
  },

  More: {
    textAlign: 'center !important',
    color: '#f08b32 !important',
  },
});

const InitialState = [
  { name: 'Founder’s Bank Account', check: true },
  { name: 'Owner’s Bank Account', check: false },
  { name: 'Promoter’s Bank Account', check: false },
];

const Banking = ({
  efcarddetail,
  addEffortless,
  businessAccounts,
  founderAccounts,
  FetchBankAccounts,
  AccountOperation,
  AddICICI,
  AddOther,
  bankListingDetails,
  loadingData,
}) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const IndianCurrency = Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  });
  const {
    organization,
    user,
    setAmt,
    openSnackBar,
    currentUserInfo,
    enableLoading,
  } = useContext(AppContext);

  const [EditBankshow, setEditBankshow] = useState(false);
  const [oneBankList, setoneBankList] = useState({});
  const [loadMore, setLoadMore] = useState({ business: 5, founder: 5 });

  // filter top

  const [FounderAccPref, setFounderAccPref] = useState(false);
  const [ConnectAccount, setConnectAccount] = useState(false);
  const [AccountEdit, setAccountEdit] = useState(false);

  // const [BorrowingAccount] = useState(true);

  const [FounderAccHeader, setFounderAccHeader] = useState();
  const [AccHeaderState, setAccHeaderState] = useState(InitialState);

  const SumAmount = (arr) => {
    return arr?.reduce(
      (n, { available_balance }) => Number(n) + Number(available_balance),
      0
    );
  };

  const BankSync = () => {
    enableLoading(true);
    // if (sync === 'enable')
    //   RestApi(
    //     `organizations/${organization.orgId}/bank_accounts/${oneBankList?.bank_account_id}/enable_bank_sync`,
    //     {
    //       method: METHOD.PATCH,
    //       headers: {
    //         Authorization: `Bearer ${user.activeToken}`,
    //       },
    //     }
    //   )
    //     .then((res) => {
    //       enableLoading(false);
    //       if (!res.message || !res.error) {
    //         openSnackBar({
    //           message: 'Bank account sync enabled',
    //           type: MESSAGE_TYPE.INFO,
    //         });
    //         FetchBankAccounts();
    //       } else if (res?.message || res?.error) {
    //         openSnackBar({
    //           message: res?.message || 'Something Wrong',
    //           type: MESSAGE_TYPE.WARNING,
    //         });
    //       }
    //     })
    //     .catch((e) => {
    //       openSnackBar({
    //         message: Object.values(e.errors).join(),
    //         type: MESSAGE_TYPE.ERROR,
    //       });
    //       enableLoading(false);
    //     });
    // else
    RestApi(
      `organizations/${organization.orgId}/bank_accounts/${oneBankList?.bank_account_id}/disable_bank_sync`,
      {
        method: METHOD.PATCH,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      }
    )
      .then((res) => {
        enableLoading(false);
        if (!res.message || !res.error)
          openSnackBar({
            message: 'Bank account sync disbled successfully',
            type: MESSAGE_TYPE.INFO,
          });
        else if (res?.message || res?.error)
          openSnackBar({
            message: res?.message || 'Something Wrong',
            type: MESSAGE_TYPE.WARNING,
          });
        FetchBankAccounts();
      })
      .catch((e) => {
        openSnackBar({
          message: Object.values(e.errors).join(),
          type: MESSAGE_TYPE.ERROR,
        });
        enableLoading(false);
      });
  };

  const BankStausUpdate = (status) => {
    RestApi(
      `organizations/${organization.orgId}/bank_accounts/${oneBankList?.bank_account_id}`,
      {
        method: METHOD.PATCH,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
        payload: {
          account_status: 'disabled',
        },
      }
    )
      .then((res) => {
        enableLoading(false);
        if (!res.message || !res.error) {
          openSnackBar({
            message: `Bank account ${
              status === 'enable' ? 'enabled' : 'disabled'
            }  successfully`,
            type: MESSAGE_TYPE.INFO,
          });
          FetchBankAccounts();
        } else if (res?.message || res?.error) {
          openSnackBar({
            message:
              res?.message ||
              res.errors.bank_account_number ||
              'Something Wrong',
            type: MESSAGE_TYPE.WARNING,
          });
        }
      })
      .catch((e) => {
        openSnackBar({
          message: Object.values(e.errors).join(),
          type: MESSAGE_TYPE.ERROR,
        });
        enableLoading(false);
      });
  };

  const DeleteBankAccount = () => {
    enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/bank_accounts/${oneBankList?.bank_account_id}`,
      {
        method: METHOD.DELETE,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      }
    )
      .then((res) => {
        enableLoading(false);
        if (!res.message || !res.error) {
          openSnackBar({
            message: 'Bank account deleted successfully',
            type: MESSAGE_TYPE.INFO,
          });
          FetchBankAccounts();
        } else if (res?.message || !res.error) {
          openSnackBar({
            message: res?.message || 'Something Wrong',
            type: MESSAGE_TYPE.WARNING,
          });
        }
      })
      .catch((e) => {
        openSnackBar({
          message: Object.values(e.errors).join(),
          type: MESSAGE_TYPE.ERROR,
        });
        enableLoading(false);
      });
  };

  const EditIndividualAccount = (data) => (e) => {
    e.stopPropagation();
    setoneBankList(data);
    setAccountEdit(true);
  };

  const HandleAccountEditOption = (val) => () => {
    setAccountEdit(false);

    if (val === 'EAD') setEditBankshow(true);
    else if (val === 'UBC')
      AccountOperation({
        fastLinkConfig: 'update_credentials',
        fastLinkConfigLocal: 'update_credentials',
        bankAccountType: oneBankList.bank_account_type,
        bank_account_id: oneBankList.id,
      });
    else if (val === 'DEBS')
      if (oneBankList.account_status === 'paused')
        AccountOperation({
          fastLinkConfig: 'refresh_bank',
          fastLinkConfigLocal: 'enable_sync',
          bankAccountType: oneBankList.bank_account_type,
          bank_account_id: oneBankList.id,
        });
      else BankSync();
    else if (val === 'DEA')
      if (oneBankList.account_status === 'disabled')
        AccountOperation({
          fastLinkConfig: 'refresh_bank',
          fastLinkConfigLocal: 'activate_bank',
          bankAccountType: oneBankList.bank_account_type,
          bank_account_id: oneBankList.id,
        });
      else BankStausUpdate('disable');
    else if ('DBA') DeleteBankAccount();
  };

  const fetchBankDetailsStatus = (id, type, accDetails) => {
    enableLoading(true);
    RestApi(
      accDetails?.service_provider === 'yodlee'
        ? `organizations/${organization?.orgId}/yodlee_bank_accounts/${id}`
        : `organizations/${organization?.orgId}/bank_accounts/${id}`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user?.activeToken}`,
        },
      }
    )
      .then((res) => {
        if (res && res.account_status === 'fetching') {
          enableLoading(
            true,
            "Please Wait! - Effortless is pulling the bank transaction data, this first-time sync will take 2 to 5 minutes, so don't close the app..."
          );
          setTimeout(() => {
            // enableLoading(true);
            fetchBankDetailsStatus(res.id);
          }, 3000);
        } else if (
          res &&
          (res.account_status === 'active' || res.account_status === 'paused')
        ) {
          enableLoading(false);
          setAmt({
            accName: res.bank_name,
            amt: res.available_balance,
            id: res.id,
            accNum: res.bank_account_number,
            bankListingDetails,
            accountDetails: accDetails,
          });
          if (type === 'company') {
            if (res.service_provider !== 'yodlee')
              navigate('/banking-banklist-account', {
                state: {
                  value: {
                    accName: 'ICICI Bank',
                    amt: accDetails.available_balance,
                    id: res.id,
                    accNum: res.bank_account_number,
                    bankListingDetails,
                    accountDetails: accDetails,
                  },
                  key: 'connectedBankingTransactions',
                },
              });
            else
              navigate('/banking-banklist-account', {
                state: {
                  value: {
                    accName: res.bank_name,
                    amt: res.available_balance || accDetails.available_balance,
                    id: res.id,
                    accNum: res.bank_account_number,
                    bankListingDetails,
                    accountDetails: accDetails,
                  },
                  key: 'accountBalanceFromBuisness',
                },
              });
          } else if (type === 'founder') {
            navigate('/banking-founders-account', {
              state: {
                value: {
                  accName: res.bank_name,
                  amt: res.available_balance,
                  id: res.id,
                  accNum: res.bank_account_number,
                  bankListingDetails,
                  accountDetails: accDetails,
                },
                key: 'accountBalanceFromFounder',
              },
            });
          } else {
            navigate('/banking-banklist-account', {
              state: {
                value: {
                  accName: res.bank_name,
                  amt: res.available_balance,
                  id: res.id,
                  accNum: res.bank_account_number,
                  bankListingDetails,
                  accountDetails: accDetails,
                },
                key: 'accountBalance',
              },
            });
          }
          enableLoading(false);
        } else if (res && res.account_status === 'disabled') {
          enableLoading(false);
          openSnackBar({
            message: 'Account is Disabled',
            type: MESSAGE_TYPE.WARNING,
          });
        }
      })
      .catch((e) => {
        openSnackBar({
          message: e.message,
          type: MESSAGE_TYPE.INFO,
        });
      });
  };

  const handleAccountClick = (val) => () => {
    if (val.bank_account_id || val.id)
      fetchBankDetailsStatus(
        val.id || val.bank_account_id,
        val?.bank_account_type,
        val
      );
    else
      openSnackBar({
        message: 'Bank Account id not found.',
        type: MESSAGE_TYPE.ERROR,
      });
  };

  const wordWrap = (dn, an) => {
    let name;
    if (dn) {
      if (dn.length > 11) name = `${dn?.slice(0, 13)}...`;
      else name = dn;
    } else if (an) {
      if (an.length > 11) name = `${an?.slice(0, 13)}...`;
      else name = an;
    } else name = '';
    return name;
  };

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

  const handleChangeAccountHeader = (val) => () => {
    setFounderAccHeader(val.name);

    const newState = AccHeaderState.map((row) => {
      if (row.name === val.name) return { ...row, check: true };
      return { ...row, check: false };
    });

    setAccHeaderState(newState);
    let name;
    if (val.name === 'Founder’s Bank Account') name = 'founder';
    else if (val.name === 'Owner’s Bank Account') name = 'owner';
    else if (val.name === 'Promoter’s Bank Account') name = 'promoter';

    accountPreference(name);
    setFounderAccPref(false);
  };

  useEffect(() => {
    accountPreference();
  }, []);

  return (
    <>
      {!loadingData && (
        <Box className={css.banking_mob_container}>
          {Object.keys(efcarddetail || {})?.length === 0 ? (
            <VirtualCardEmpty addEffortless={addEffortless} />
          ) : (
            <Stack className={css.efcard_container}>
              <Stack className={css.brandtxtwrp}>
                <img
                  src={brandlogo}
                  alt="Card Logo"
                  className={css.brandlogo}
                  loading="lazy"
                />
                <Typography className={css.acctext}>Virtual Account</Typography>
              </Stack>
              <Stack className={css.accinfowrp}>
                <Typography className={css.accname}>
                  {efcarddetail?.display_name ||
                    efcarddetail?.account_holder_name ||
                    currentUserInfo?.name}
                </Typography>
                <Typography className={css.accbal}>
                  {(IndianCurrency.format(efcarddetail?.available_balance) !==
                    '₹NaN' &&
                    IndianCurrency.format(efcarddetail?.available_balance)) ||
                    `₹ 0.00`}
                </Typography>
              </Stack>
              <Stack className={css.loadwidthdrawbtnwrp}>
                <Button
                  className={css.widthrawbtn}
                  onClick={() => {
                    navigate('/banking-withdrawmoney');
                  }}
                >
                  Withdraw Money
                </Button>
                <Button
                  className={css.loadmoneybtn}
                  onClick={() => {
                    navigate('/banking-loadmoney');
                  }}
                >
                  Load Money
                </Button>
              </Stack>
            </Stack>
          )}

          {Object.keys(businessAccounts || {})?.length === 0 ? (
            <BankAccountsEmpty
              desc="No Business Accounts Found!"
              btnText="Add Business Account"
              AddAccount={() => setConnectAccount(true)}
            />
          ) : (
            <Stack>
              <Stack className={css.accountTypeHeader}>
                <Typography className={css.accheader}>
                  Business Accounts
                </Typography>
                <Button
                  className={css.connectbtn}
                  onClick={() => setConnectAccount((prev) => !prev)}
                >
                  <AddRoundedIcon />
                  Connect
                </Button>
              </Stack>
              {Object.keys(businessAccounts || {})
                ?.sort()
                .map((row) => (
                  <Accordion className={classes.AccordionRoot} key={row}>
                    <AccordionSummary
                      expandIcon={<KeyboardArrowRightRoundedIcon />}
                      className={classes.AccordionSummary}
                    >
                      <Typography className={css.accitem}>
                        {`${businessAccounts[row].length} ${row} ACCOUNT`}
                      </Typography>
                      <Typography className={css.accamount}>
                        {IndianCurrency.format(
                          SumAmount(businessAccounts[row])
                        )}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails className={classes.AccordionDetails}>
                      <List className={css.accordionList}>
                        {businessAccounts[row]
                          ?.slice(0, loadMore.business)
                          ?.map((val) => (
                            <ListItem
                              key={val.bank_account_number}
                              secondaryAction={
                                <Stack
                                  sx={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}
                                >
                                  <Typography className={css.listaccountAmount}>
                                    {IndianCurrency.format(
                                      val.available_balance
                                    )}
                                  </Typography>
                                  {val.account_name !==
                                    'Effortless Virtual Account' && (
                                    <IconButton
                                      className={css.accordionIconButton}
                                      onClick={EditIndividualAccount(val)}
                                    >
                                      <MoreVertRoundedIcon />
                                    </IconButton>
                                  )}
                                </Stack>
                              }
                              className={css.accordionListItem}
                              disablePadding
                              onClick={handleAccountClick(val)}
                            >
                              <ListItemButton
                                className={css.accordionListItemButton}
                              >
                                {/* <ListItemAvatar
                              sx={{ minWidth: 'initial', marginRight: '6px' }}
                            > */}
                                <span
                                  aria-label={val.bank_code}
                                  // src={hdfclogo}
                                  // alt="bank logo"
                                  className={css.accordionbanklogo}
                                />
                                {/* </ListItemAvatar> */}
                                <ListItemText
                                  title={
                                    val.display_name || val.account_holder_name
                                  }
                                  primary={wordWrap(
                                    val.display_name,
                                    val.account_holder_name
                                  )}
                                  secondary={`xx ${val.bank_account_number?.substr(
                                    -4
                                  )}`}
                                  className={classes.AccordionListItemText}
                                />
                              </ListItemButton>
                            </ListItem>
                          ))}
                        {businessAccounts[row].length > 5 &&
                          loadMore.business !==
                            businessAccounts[row].length && (
                            <ListItem
                              onClick={() =>
                                setLoadMore({
                                  ...loadMore,
                                  business: businessAccounts[row].length,
                                })
                              }
                            >
                              <ListItemButton className={classes.More}>
                                <ListItemText primary="More" />
                              </ListItemButton>
                            </ListItem>
                          )}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
            </Stack>
          )}

          {Object.keys(founderAccounts || {})?.length === 0 ? (
            <BankAccountsEmpty
              desc="No Founder Accounts Found!"
              btnText="Add Founder Account"
              AddAccount={() =>
                AddOther({
                  fastLinkConfig: 'add_bank',
                  fastLinkConfigLocal: 'add_bank',
                  bankAccountType: 'founder',
                })
              }
            />
          ) : (
            <Stack>
              <Stack className={css.accountTypeHeader}>
                <Stack sx={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Typography className={css.accheader}>
                    {FounderAccHeader}
                  </Typography>
                  <IconButton
                    sx={{ marginLeft: '4px' }}
                    onClick={() => setFounderAccPref((prev) => !prev)}
                  >
                    <Avatar
                      src={acceditmobile}
                      alt="edit icon"
                      sx={{ height: '16px', width: '16px' }}
                    />
                  </IconButton>
                </Stack>
                <Button
                  className={css.connectbtn}
                  onClick={() =>
                    AddOther({
                      fastLinkConfig: 'add_bank',
                      fastLinkConfigLocal: 'add_bank',
                      bankAccountType: 'founder',
                    })
                  }
                >
                  <AddRoundedIcon />
                  Connect
                </Button>
              </Stack>
              {Object.keys(founderAccounts || {})
                ?.sort()
                .map((row) => (
                  <Accordion className={classes.AccordionRoot} key={row}>
                    <AccordionSummary
                      expandIcon={<KeyboardArrowRightRoundedIcon />}
                      className={classes.AccordionSummary}
                    >
                      <Typography className={css.accitem}>
                        {`${founderAccounts[row].length} ${row} ACCOUNT`}
                      </Typography>
                      <Typography className={css.accamount}>
                        {IndianCurrency.format(SumAmount(founderAccounts[row]))}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails className={classes.AccordionDetails}>
                      <List className={css.accordionList}>
                        {founderAccounts[row]
                          ?.slice(0, loadMore.founder)
                          ?.map((val) => (
                            <ListItem
                              key={val}
                              secondaryAction={
                                <Stack
                                  sx={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}
                                >
                                  <Typography className={css.listaccountAmount}>
                                    {IndianCurrency.format(
                                      val.available_balance
                                    )}
                                  </Typography>
                                  <IconButton
                                    className={css.accordionIconButton}
                                    onClick={EditIndividualAccount(val)}
                                  >
                                    <MoreVertRoundedIcon />
                                  </IconButton>
                                </Stack>
                              }
                              className={css.accordionListItem}
                              disablePadding
                              onClick={handleAccountClick(val)}
                            >
                              <ListItemButton
                                className={css.accordionListItemButton}
                              >
                                {/* <ListItemAvatar
                              sx={{ minWidth: 'initial', marginRight: '6px' }}
                            >
                              <Avatar
                                src={hdfclogo}
                                alt="bank logo"
                                className={css.accordionbanklogo}
                              />
                            </ListItemAvatar> */}
                                <span
                                  aria-label={val.bank_code}
                                  // src={hdfclogo}
                                  // alt="bank logo"
                                  className={css.accordionbanklogo}
                                />
                                <ListItemText
                                  // primary={val.account_name}
                                  title={
                                    val.display_name || val.account_holder_name
                                  }
                                  primary={wordWrap(
                                    val.display_name,
                                    val.account_holder_name
                                  )}
                                  secondary={`xx ${val.bank_account_number?.substr(
                                    -4
                                  )}`}
                                  className={classes.AccordionListItemText}
                                />
                              </ListItemButton>
                            </ListItem>
                          ))}
                        {founderAccounts[row].length > 5 &&
                          loadMore.founder !== founderAccounts[row].length && (
                            <ListItem
                              onClick={() =>
                                setLoadMore({
                                  ...loadMore,
                                  founder: founderAccounts[row].length,
                                })
                              }
                            >
                              <ListItemButton className={classes.More}>
                                <ListItemText primary="More" />
                              </ListItemButton>
                            </ListItem>
                          )}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
            </Stack>
          )}

          {/* {BorrowingAccount ? (
        <BankAccountsEmpty
          desc="No Borrowings Found!"
          btnText="Add Borrowings"
        />
      ) : (
        <Stack>
          <Stack className={css.accountTypeHeader}>
            <Typography className={css.accheader}>Borrowings</Typography>
            <Button className={css.connectbtn}>
              <AddRoundedIcon />
              Add Borrowings
            </Button>
          </Stack>
          {[1, 2, 3].map((row) => (
            <Accordion className={classes.AccordionRoot} key={row}>
              <AccordionSummary
                expandIcon={<KeyboardArrowRightRoundedIcon />}
                className={classes.AccordionSummary}
              >
                <Typography className={css.accitem}>
                  3 CURRENT ACCOUNTS
                </Typography>
                <Typography className={css.accamount}>Rs. 45,989</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.AccordionDetails}>
                <List className={css.accordionList}>
                  {[1, 2, 3, 4].map((val) => (
                    <ListItem
                      key={val}
                      secondaryAction={
                        <Stack
                          sx={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <Typography className={css.listaccountAmount}>
                            Rs. 45,989
                          </Typography>
                          <IconButton className={css.accordionIconButton}>
                            <MoreVertRoundedIcon />
                          </IconButton>
                        </Stack>
                      }
                      className={css.accordionListItem}
                      disablePadding
                    >
                      <ListItemButton className={css.accordionListItemButton}>
                        <ListItemAvatar
                          sx={{ minWidth: 'initial', marginRight: '6px' }}
                        >
                          <Avatar
                            src={hdfclogo}
                            alt="bank logo"
                            className={css.accordionbanklogo}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary="HDFC Bank"
                          secondary="xx 2244"
                          className={classes.AccordionListItemText}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )} */}

          <SelectBottomSheet
            triggerComponent
            open={FounderAccPref}
            name="Edit Founder"
            onClose={() => setFounderAccPref(false)}
            addNewSheet
          >
            <AccountPreferance
              handleChangeAccountHeader={handleChangeAccountHeader}
              AccHeaderState={AccHeaderState}
            />
          </SelectBottomSheet>

          <SelectBottomSheet
            triggerComponent
            open={ConnectAccount}
            name="Connect Account"
            onClose={() => setConnectAccount(false)}
            addNewSheet
          >
            <BusinessAccountConnect
              onClose={() => setConnectAccount(false)}
              AddICICI={AddICICI}
              AddOther={AddOther}
            />
          </SelectBottomSheet>
          <SelectBottomSheet
            triggerComponent
            open={AccountEdit}
            name="Connect Account"
            onClose={() => setAccountEdit(false)}
            addNewSheet
          >
            <AccountEditOptions
              onClose={() => setAccountEdit(false)}
              HandleOption={HandleAccountEditOption}
              Sync={
                oneBankList.account_status === 'paused' ? 'Enable' : 'Disable'
              }
              Status={
                oneBankList.account_status === 'disabled' ? 'Enable' : 'Disable'
              }
              ubc={oneBankList.service_provider === 'yodlee' ? 'true' : 'false'}
            />
          </SelectBottomSheet>

          <SelectBottomSheet
            triggerComponent
            open={EditBankshow}
            name="Edit Bank"
            onClose={() => setEditBankshow(false)}
          >
            <EditAccount
              onClose={() => setEditBankshow(false)}
              FetchBankAccounts={FetchBankAccounts}
              data={oneBankList}
            />
          </SelectBottomSheet>
        </Box>
      )}
    </>
  );
};

export default memo(Banking);
