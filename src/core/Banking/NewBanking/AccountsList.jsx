import React, { memo, useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import moment from 'moment';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { withStyles } from '@material-ui/core/styles';

import RestApi, { METHOD } from '@services/RestApi';
import AppContext from '@root/AppContext';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer';

import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
// import Refresh from '../../../assets/fetchaccbal.svg';
import { StyledMenu } from './Statement/util';
// import IciciLogo from '../../../assets/icicilogo.svg';
// import eflogo from '../../../assets/BankLogo/ef.svg';
// const logoBaseURL = '../../../assets/BankLogo/';

import css from './bankingnew.scss';
import SelectBottomSheet from '../../../components/SelectBottomSheet/SelectBottomSheet';
import EditAccount from './EditIndividualAccount';

const MenuList = withStyles({
  paper: {
    background: '#FFFFFF',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: '0px 0px 16px rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
  },
})(Menu);

const StatusComponent = {
  disconnect: (
    <>
      <div className={css.disconnect}>
        <div className={css.dinconnectinline} />
      </div>
      <Typography className={css.disstatus}>Disconnect</Typography>
    </>
  ),
  active: (
    <>
      <div className={css.active}>
        <div className={css.activeinline} />
      </div>
      <Typography className={css.actstatus}>Active</Typography>
    </>
  ),
  paused: (
    <>
      <div className={css.pause}>
        <div className={css.pauseinline} />
      </div>
      <Typography className={css.pausestatus}>Paused</Typography>
    </>
  ),
  disabled: (
    <>
      <div className={css.disable}>
        <div className={css.disableinline} />
      </div>
      <Typography className={css.diablestatus}>Disable</Typography>
    </>
  ),
  fetching: (
    <>
      <div className={css.fetching}>
        <div className={css.fetchinginline} />
      </div>
      <Typography className={css.fetchingstatus}>Fetching</Typography>
    </>
  ),
};

const AccountsList = ({
  acclist,
  FetchBankAccounts,
  AccountOperation,
  bankListingDetails,
  handleConnectBank,
}) => {
  const { organization, user, openSnackBar, enableLoading } =
    useContext(AppContext);
  // setAmt

  // const [ShowShort, setShowShort] = useState(false);
  const [AmoutShortValue, setAmoutShortValue] = useState('Amount low to high');
  const [EditBankshow, setEditBankshow] = useState(false);
  const [BankLists, setBankLists] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [oneBankList, setoneBankList] = useState({});
  const [bankSync, setbankbankSync] = useState();
  const [bankStatus, setbankStatus] = useState();

  const [anchorElSort, setAnchorElSort] = useState(null);
  const openSort = Boolean(anchorElSort);

  const IndianCurrency = Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  });
  const navigate = useNavigate();

  const handleClick = (val) => (event) => {
    event.stopPropagation();
    setoneBankList(val);
    if (val.account_status === 'paused') setbankbankSync('Enable');
    else setbankbankSync('Disable');

    if (val.account_status === 'disabled') setbankStatus('Enable');
    else setbankStatus('Disable');

    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const HandleShortAmount = (val, data) => {
    setAmoutShortValue(val);
    setAnchorElSort(null);
    const sorteddata = Object.assign(data);
    const subAccountGroups = Object.keys(sorteddata);

    if (val === 'Amount low to high')
      subAccountGroups.forEach((item) => {
        sorteddata[item]?.sort(
          (a, b) =>
            parseFloat(a?.available_balance) - parseFloat(b?.available_balance)
        );
      });
    else
      subAccountGroups.forEach((item) => {
        sorteddata[item]?.sort(
          (a, b) =>
            parseFloat(b?.available_balance) - parseFloat(a?.available_balance)
        );
      });

    setBankLists(sorteddata);
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

  const HanldeListItemClick = (val) => () => {
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
      else BankSync('disable');
    else if (val === 'DEA')
      if (oneBankList.account_status === 'disabled')
        AccountOperation({
          fastLinkConfig: 'refresh_bank',
          fastLinkConfigLocal: 'activate_bank',
          bankAccountType: oneBankList.bank_account_type,
          bank_account_id: oneBankList.id,
        });
      else BankStausUpdate('disable');
    else if (val === 'DBA') DeleteBankAccount();

    handleClose();
  };

  const BankFilter = () => {
    const result_3 = acclist?.BankList?.reduce((x, y) => {
      (x[y.sub_account_group] = x[y.sub_account_group] || []).push(y);
      return x;
    }, {});
    HandleShortAmount('Amount low to high', result_3);
  };

  const fetchBankDetailsStatus = (id, type, accDetails) => {
    // console.log(id, type, accDetails);
    navigate('/banking-statement', {
      state: {
        bankListingDetails,
        accDetails,
      },
    });

    // enableLoading(true);
    // RestApi(
    //   accDetails?.service_provider === 'yodlee'
    //     ? `organizations/${organization?.orgId}/yodlee_bank_accounts/${id}`
    //     : `organizations/${organization?.orgId}/bank_accounts/${id}`,
    //   {
    //     method: METHOD.GET,
    //     headers: {
    //       Authorization: `Bearer ${user?.activeToken}`,
    //     },
    //   }
    // )
    //   .then((res) => {
    //     if (res && res.account_status === 'fetching') {
    //       enableLoading(
    //         true,
    //         "Please Wait! - Effortless is pulling the bank transaction data, this first-time sync will take 2 to 5 minutes, so don't close the app..."
    //       );
    //       setTimeout(() => {
    //         // enableLoading(true);
    //         fetchBankDetailsStatus(res.id);
    //       }, 3000);
    //     } else if (
    //       res &&
    //       (res.account_status === 'active' || res.account_status === 'paused')
    //     ) {
    //       setAmt({
    //         accName: res?.bank_name,
    //         amt: res?.available_balance,
    //         id: res?.id,
    //         accNum: res?.bank_account_number,
    //         bankListingDetails,
    //         accountDetails: accDetails,
    //       });
    //       if (type === 'company') {
    //         if (res.service_provider !== 'yodlee')
    //           navigate('/banking-banklist-account', {
    //             state: {
    //               value: {
    //                 accName: 'ICICI Bank',
    //                 amt: accDetails.available_balance,
    //                 id: res.id,
    //                 accNum: res.bank_account_number,
    //                 bankListingDetails,
    //                 accountDetails: accDetails,
    //               },
    //               key: 'connectedBankingTransactions',
    //             },
    //           });
    //         else
    //           navigate('/banking-banklist-account', {
    //             state: {
    //               value: {
    //                 accName: res.bank_name,
    //                 amt: res.available_balance || accDetails.available_balance,
    //                 id: res.id,
    //                 accNum: res.bank_account_number,
    //                 bankListingDetails,
    //                 accountDetails: accDetails,
    //               },
    //               key: 'accountBalanceFromBuisness',
    //             },
    //           });
    //       } else if (type === 'founder') {
    //         navigate('/banking-founders-account', {
    //           state: {
    //             value: {
    //               accName: res.bank_name,
    //               amt: res.available_balance,
    //               id: res.id,
    //               accNum: res.bank_account_number,
    //               bankListingDetails,
    //               accountDetails: accDetails,
    //             },
    //             key: 'accountBalanceFromFounder',
    //           },
    //         });
    //       } else {
    //         navigate('/banking-banklist-account', {
    //           state: {
    //             value: {
    //               accName: res.bank_name,
    //               amt: res.available_balance,
    //               id: res.id,
    //               accNum: res.bank_account_number,
    //               bankListingDetails,
    //               accountDetails: accDetails,
    //             },
    //             key: 'accountBalance',
    //           },

    //           // state: {
    //           //   value: {
    //           //     response: res.data,
    //           //     data: res,
    //           //     accName: 'ICICI Bank',
    //           //     amt: amount,
    //           //     accNum: accountnumber,
    //           //     id,
    //           //   },
    //           //   key: 'connectedBankingTransactions',
    //           // },
    //         });
    //       }
    //       enableLoading(false);
    //     } else if (res && res.account_status === 'disabled') {
    //       enableLoading(false);

    //       openSnackBar({
    //         message: 'Account is Disabled',
    //         type: MESSAGE_TYPE.WARNING,
    //       });
    //     } else {
    //       enableLoading(false);
    //       openSnackBar({
    //         message: res.message || 'Something went wrong!',
    //         type: MESSAGE_TYPE.WARNING,
    //       });
    //     }
    //   })
    //   .catch((e) => {
    //     openSnackBar({
    //       message: e.message,
    //       type: MESSAGE_TYPE.INFO,
    //     });
    //   });
  };

  const handleAccountClick = (val) => () => {
    if (val.bank_account_id || val.id)
      fetchBankDetailsStatus(
        val?.service_provider === 'yodlee' ? val.id : val.bank_account_id,
        val.bank_account_type,
        val
      );
    else
      openSnackBar({
        message: 'Bank Account ID is not found.',
        type: MESSAGE_TYPE.ERROR,
      });
  };

  // const visibleTodos = useMemo(
  //   () => HandleShortAmount('todos', tab),
  //   [todos, tab]
  // );
  const wordWrap = (dn, an) => {
    let name;
    if (dn) {
      if (dn.length > 15) name = `${dn?.slice(0, 13)}...`;
      else name = dn;
    } else if (an) {
      if (an.length > 15) name = `${an?.slice(0, 13)}...`;
      else name = an;
    } else name = '';
    return name;
  };

  const tallyAccountConnect = (e) => {
    e.stopPropagation();
    handleConnectBank();
  };

  useEffect(() => {
    BankFilter();
  }, [acclist]);

  return (
    <Box className={css.alcontainer}>
      <MenuList
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        className={css.menu}
      >
        <MenuItem className={css.menuitem} onClick={HanldeListItemClick('EAD')}>
          Edit Account Details
        </MenuItem>
        {oneBankList.service_provider === 'yodlee' && (
          <MenuItem
            className={css.menuitem}
            onClick={HanldeListItemClick('UBC')}
          >
            Update Bank Credentials
          </MenuItem>
        )}
        <MenuItem
          className={css.menuitem}
          onClick={HanldeListItemClick('DEBS')}
        >
          {`${bankSync} Bank Sync`}
        </MenuItem>
        <MenuItem className={css.menuitem} onClick={HanldeListItemClick('DEA')}>
          {`${bankStatus} Account`}
        </MenuItem>
        <MenuItem className={css.menuitem} onClick={HanldeListItemClick('DBA')}>
          Delete Bank Account
        </MenuItem>
      </MenuList>

      <Stack className={css.accountlistheader}>
        <Typography variant="h4" className={css.headertext}>
          {`List of ${
            acclist.title.substr(0, 1).toUpperCase() +
            acclist.title.substr(1).toLowerCase()
          } Account`}
        </Typography>
        <Typography className={css.totalamount}>{acclist.totalamt}</Typography>
      </Stack>
      <Stack className={css.bodycontainer}>
        {Object.keys(BankLists)
          .sort()
          .map((val, ind) => (
            <>
              <Stack className={css.acclistswrp}>
                <Stack className={css.acctypewtp}>
                  <Typography className={css.acctyptext}>{val}</Typography>
                  {ind === 0 && (
                    <Stack className={css.accbalsortwrp}>
                      <Button
                        aria-controls={
                          openSort ? 'demo-customized-menu' : undefined
                        }
                        aria-haspopup="true"
                        aria-expanded={openSort ? 'true' : undefined}
                        variant="contained"
                        disableElevation
                        onClick={(e) => setAnchorElSort(e.currentTarget)}
                        endIcon={<KeyboardArrowDownOutlinedIcon />}
                        className={css.accbalsortbtn}
                      >
                        Sort By:
                        <span
                          style={{
                            marginLeft: '5px',
                            color: '#000000',
                            fontWeight: 300,
                          }}
                        >
                          {AmoutShortValue}
                        </span>
                      </Button>
                      <StyledMenu
                        id="demo-customized-menu"
                        MenuListProps={{
                          'aria-labelledby': 'demo-customized-button',
                        }}
                        anchorEl={anchorElSort}
                        open={openSort}
                        onClose={() => setAnchorElSort(null)}
                        listwidth={255}
                      >
                        {['Amount low to high', 'Amount high to low'].map(
                          (items) => (
                            <MenuItem
                              onClick={() =>
                                HandleShortAmount(items, BankLists)
                              }
                              disableRipple
                              key={items}
                            >
                              {items}
                            </MenuItem>
                          )
                        )}
                      </StyledMenu>
                    </Stack>
                  )}
                </Stack>
                {BankLists[val].map((row) => (
                  <>
                    <Grid
                      className={css.acclistitemwrp}
                      key={row.id}
                      onClick={handleAccountClick(row)}
                      // navigate('/banking-statement', { state: { row } })
                      container
                    >
                      <Grid item md={5}>
                        <Stack>
                          <Stack
                            sx={{ flexDirection: 'row', alignItems: 'center' }}
                          >
                            <span
                              // src={
                              //   row.account_name === 'Effortless Virtual Account'
                              //     ? eflogo
                              //     : IciciLogo
                              // }
                              // alt="Bank Logo"
                              // width="32px"
                              // height="32px"
                              aria-label={row.bank_code}
                              className={css.banklogo}
                            />
                            <Stack>
                              <Typography
                                className={css.accholdname}
                                title={
                                  row.display_name || row.account_holder_name
                                }
                              >
                                {wordWrap(
                                  row.display_name,
                                  row.account_holder_name
                                )}
                              </Typography>
                              <Typography className={css.accnumber}>
                                {`A/C No: ${row.bank_account_number}`}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Grid>
                      <Grid item md={4}>
                        <Stack>
                          <Stack className={css.accstatus_utime}>
                            {row.sub_account_group !== 'Tally Accounts' ? (
                              <>{StatusComponent[row.account_status]}</>
                            ) : (
                              <Button
                                className={css.tallyconnect}
                                onClick={tallyAccountConnect}
                              >
                                <AddRoundedIcon className={css.connectplus} />
                                {/* <span className={css.connectplus}>+</span>  */}
                                Connect
                              </Button>
                            )}
                            {row.last_synced_at && (
                              <span>
                                {`Update On : ${moment(
                                  row.last_synced_at
                                ).format('DD-MM-YYYY')}`}
                              </span>
                            )}
                          </Stack>
                          <Typography className={css.accifsccode}>
                            {`IFSC: ${row.ifsc_code}`}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item md={3}>
                        <Stack>
                          <Stack
                            sx={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginBottom: '5px',
                              justifyContent: 'end',
                            }}
                          >
                            <Typography className={css.acccountsaving}>
                              {IndianCurrency.format(row.available_balance)}
                            </Typography>
                            {row.account_name !==
                              'Effortless Virtual Account' && (
                              <IconButton
                                sx={{ padding: '0px', marginLeft: '3px' }}
                              >
                                <MoreVertRoundedIcon
                                  sx={{ color: '#464646' }}
                                  fontSize="small"
                                  onClick={handleClick(row)}
                                />
                              </IconButton>
                            )}
                          </Stack>

                          <Typography
                            className={
                              row.account_name !== 'Effortless Virtual Account'
                                ? css.amtinbnk
                                : `${css.amtinbnk} ${css.mr_0}`
                            }
                          >
                            Amount in Bank
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </>
                ))}
              </Stack>
            </>
          ))}
      </Stack>

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
  );
};

export default memo(AccountsList);
