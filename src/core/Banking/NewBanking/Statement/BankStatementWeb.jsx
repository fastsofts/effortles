import React, { memo, useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
// import InfiniteScroll from 'react-infinite-scroll-component';

import {
  Box,
  Stack,
  Typography,
  ButtonGroup,
  Button,
  Avatar,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
  IconButton,
  Grid,
} from '@mui/material';
import { makeStyles } from '@material-ui/core/styles';

import { Checkbox } from '@material-ui/core';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import MobileCalendar from '@components/MobileCalendar/DateRangePicker';

// import RestApi, { METHOD } from '@services/RestApi';
import RestApi, { METHOD, BASE_URL } from '@services/RestApi';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer';
import AppContext from '@root/AppContext';

import { TranStatus, AccountType, StyledMenu, DateListItem } from './util';
import Download from '../../../../assets/st_download.svg';
// import Upload from '../../../../assets/st_upload.svg';
// import Refresh from '../../../../assets/st_refresh.svg';
import OpenBal from '../../../../assets/st_open_bal.svg';
import Inflow from '../../../../assets/st_total_inflow.svg';
import Outflow from '../../../../assets/st_total_outflow.svg';
import CloseBal from '../../../../assets/st_close_bal.svg';
import Calendar from '../../../../assets/calendar.svg';

import HDFC from '../../../../assets/BankLogo/dropDown/hdfc.svg';

import css from '../bankingnew.scss';

export const useStyle = makeStyles({
  checkBoxRoot: {
    paddingTop: '3px !important',
    paddingRight: '0px !important',

    '& .MuiCheckbox-root:not(.Mui-checked)': {
      '& .MuiIconButton-label': {
        color: '#FFFFFF !important',
        border: '1px solid #E5E5E5',
        borderRadius: '2px',
        width: '16px',
        height: '16px',
        margin: '3px',

        '&:hover': {
          background: '#FFFFFF',
        },

        '& .MuiSvgIcon-root': {
          display: 'none',
        },
      },
    },
    '& .MuiCheckbox-colorSecondary.Mui-checked': {
      color: '#F08B32 !important',
    },
    '& .MuiCheckbox-root.Mui-disabled': {
      background: 'rgba(203, 213, 225, 0.5)',
      border: '1px solid rgba(203, 213, 225, 0.5)',
      cursor: 'not-allowed',
    },
  },
});

const intialAccButton = {
  virtual: 'Virtual Bank Account',
  business: 'Business Bank Account',
  founder: 'Founder’s Bank Account',
};

const derivedMasters = {
  incomecategories: { data: [] },
  expensecategories: { data: [] },
  towards: { inflow: {}, outflow: {}, data: [] },
  type: [
    { name: 'Receipt', id: 'receipt_from_party' },
    { name: 'Payment', id: 'pauyment_to_party' },
  ],
};

const BankStatementWeb = () => {
  const { bankListingDetails, accDetails, filedDisable, billId } =
    useLocation().state;

  const classes = useStyle();
  const { organization, user, enableLoading, openSnackBar } =
    useContext(AppContext);

  const navigate = useNavigate();
  const IndianCurrency = Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  });

  const initialTabButton =
    accDetails?.bank_account_type === 'company'
      ? {
          first: 'All Transaction',
          second: 'Uncategorized',
          third: 'Categorized',
        }
      : {
          first: 'Personal',
          second: 'Business',
          third: 'Categorized',
        };

  const [title, setTitle] = useState(initialTabButton.first);
  const [tabButton, setTabButton] = useState(initialTabButton);
  const [btnClass, setbtnClass] = useState(initialTabButton.first);

  const [acctbtnVal, setacctbtnVal] = useState(intialAccButton.business);

  const [search, setSearch] = useState('');
  const [calendarShow, setcalendarShow] = useState(true);

  const [filteredBanks, setfilteredBanks] = useState(bankListingDetails);
  const [bankLength, setbankLength] = useState(0);
  const [loading, setLoading] = useState('Loading');
  const [Account, setAccount] = useState(accDetails);
  const [bankTxns, setBankTxns] = useState([]);
  const [bankTxnsDetails, setBankTxnsDetails] = useState([]);
  const [date, setDate] = useState({
    fromDate: moment().startOf('year').format('YYYY-MM-DD'),
    endDate: moment().endOf('year').format('YYYY-MM-DD'),
  });
  const [datePeriod, setDatePeriod] = useState(DateListItem[4]);
  const [filter, setFilter] = useState('all');

  const [accTypeEl, setAccTypeEl] = useState(null);
  const [accountEl, setAccountEl] = useState(null);
  const [dateEl, setDateEl] = useState(null);

  const open = Boolean(accTypeEl);
  const accountopen = Boolean(accountEl);
  const dateopen = Boolean(dateEl);

  const [selectedTransaction, setSelectedTransaction] = useState([]);
  const [vendorBillDetails, setVendorBillDetails] = useState('');
  const [loadingOne, setLoadingOne] = useState(false);
  console.log(vendorBillDetails, 'vijsy');
  // Infinite Scroll Start //
  // const [hasMoreItems, sethasMoreItems] = useState(true);
  const [page] = useState(1);
  // Infinite Scroll  End//

  const handleClick = (event) => {
    setAccTypeEl(event.currentTarget);
  };

  const handleClose = (val) => () => {
    setacctbtnVal(val);
    setAccTypeEl(null);

    if (val === intialAccButton.founder) {
      setTabButton({
        ...tabButton,
        first: 'Personal',
        second: 'Business',
        third: 'Categorized',
      });
      setbtnClass('Personal');
      setTitle('Personal');
      setBankTxns([]);
      setBankTxnsDetails([]);
      setAccount('');
    } else {
      setTabButton({
        ...tabButton,
        first: 'All Transaction',
        second: 'Uncategorized',
        third: 'Categorized',
      });
      setbtnClass('All Transaction');
      setTitle('All Transaction');
      setBankTxns([]);
      setBankTxnsDetails([]);
      setAccount('');
    }
  };

  const handleAccountSelect = (val) => () => {
    setAccount(val);
    setAccountEl(null);
  };

  const btnAction = (val) => () => {
    setbtnClass(val);
    setTitle(val);
    if (val === initialTabButton.first) setFilter('all');
    else if (val === initialTabButton.second) setFilter('uncat');
    else if (val === initialTabButton.third) setFilter('cat');
  };

  const dropDownAccountFilter = () => {
    let type;
    if (acctbtnVal === intialAccButton.business) type = 'company';
    else if (acctbtnVal === intialAccButton.founder) type = 'founder';
    else type = 'virtual';

    if (type === 'company' || type === 'founder') {
      const filteredRow = bankListingDetails.filter(
        (row) =>
          row.bank_account_type === type &&
          row.account_name !== 'Effortless Virtual Account' &&
          row.bank_name.toLowerCase().includes(search.toLowerCase())
      );

      const len = bankListingDetails.filter(
        (row) =>
          row.bank_account_type === type &&
          row.account_name !== 'Effortless Virtual Account'
      );

      setbankLength(len?.length);
      // if (filteredRow[0]) setAccount(filteredRow[0]);
      setfilteredBanks(filteredRow);
      setLoading('loaded');
    }
    // else if (type === 'virtual') {
    //   setAccount(
    //     bankListingDetails.filter(
    //       (row) => row.account_name === 'Effortless Virtual Account'
    //     )
    //   );
    // }
  };

  const FetchConnectedBankingTxns = () => {
    enableLoading(true);

    let params = '';
    if (acctbtnVal === intialAccButton.founder)
      params = `from_date=${date.fromDate}&to_date=${date.endDate}&page=${page}`;
    else
      params =
        filter === 'all'
          ? `from_date=${date.fromDate}&to_date=${date.endDate}&page=${page}`
          : `from_date=${date.fromDate}&to_date=${date.endDate}&categorized=${
              filter === 'cat' ? 'true' : 'false'
            }&page=${page}`;

    RestApi(
      Account.service_provider === 'yodlee' || Account.service_provider === null
        ? `organizations/${organization?.orgId}/yodlee_bank_accounts/${Account?.id}/txns?${params}`
        : `organizations/${organization?.orgId}/icici_bank_accounts/${Account?.bank_account_id}/txns?${params}`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user?.activeToken}`,
        },
      }
    )
      .then((res) => {
        if (res && !res.error) {
          setBankTxns(res);
          setBankTxnsDetails((prev) => [...prev, ...res.data]);
          enableLoading(false);
          setLoadingOne(false);
        } else if (res.error) {
          openSnackBar({
            message: res.message,
            type: MESSAGE_TYPE.ERROR,
          });
          enableLoading(false);
          setLoadingOne(false);
        }
      })
      .catch((e) => {
        enableLoading(false);
        setLoadingOne(false);
        openSnackBar({
          message: e.message,
          type: MESSAGE_TYPE.ERROR,
        });
      });
  };

  const StatementDownload = () => {
    enableLoading(true);

    // let params = '';
    // if (filter === 'all')
    const params = `from_date=${date.fromDate}&to_date=${date.endDate}`;
    // else
    //   params = `from_date=${date.fromDate}&to_date=${
    //     date.endDate
    //   }&categorized=${filter === 'cat' ? 'true' : 'false'}`;
    fetch(
      Account.service_provider === 'yodlee'
        ? `${BASE_URL}/organizations/${organization?.orgId}/yodlee_bank_accounts/${Account?.id}/downloads.xlsx?${params}`
        : `${BASE_URL}/organizations/${organization?.orgId}/icici_bank_accounts/${Account?.bank_account_id}/download.xlsx?${params}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      }
    )
      .then((response) => response.blob())
      .then((blob) => {
        enableLoading(false);

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `statement from ${date.fromDate} to ${date.endDate}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((e) => {
        openSnackBar({
          message: e.message,
          type: MESSAGE_TYPE.ERROR,
        });
      });
  };

  // const TnxsRefresh = () => {
  //   enableLoading(true);
  //   RestApi(
  //     Account.service_provider === 'yodlee'
  //       ? `organizations/${organization?.orgId}/yodlee_bank_accounts/${Account?.id}/sync`
  //       : `organizations/${organization?.orgId}/icici_bank_accounts/${Account?.bank_account_id}/sync`,
  //     {
  //       method: METHOD.GET,
  //       headers: {
  //         Authorization: `Bearer ${user?.activeToken}`,
  //       },
  //     }
  //   )
  //     .then((res) => {
  //       if (res && !res.error && res.success)
  //         openSnackBar({
  //           message: res.message,
  //           type: MESSAGE_TYPE.ERROR,
  //         });
  //       else
  //         openSnackBar({
  //           message: res.message,
  //           type: MESSAGE_TYPE.ERROR,
  //         });

  //       enableLoading(false);
  //     })
  //     .catch((e) => {
  //       openSnackBar({
  //         message: e.message,
  //         type: MESSAGE_TYPE.ERROR,
  //       });
  //     });
  // };

  const TransactionMove = () => {
    let cat;
    if (btnClass === 'Personal') cat = 'business';
    else if (btnClass === 'Business') cat = 'personal';

    RestApi(
      `organizations/${organization?.orgId}/yodlee_bank_accounts/${Account?.id}/txn_update`,
      {
        method: METHOD.PATCH,
        headers: {
          Authorization: `Bearer ${user?.activeToken}`,
        },
        payload: {
          ids: selectedTransaction,
          txn_category: cat,
        },
      }
    )
      .then((res) => {
        if (res && !res.error && res.success) {
          openSnackBar({
            message: 'Transaction moved successfully.',
            type: MESSAGE_TYPE.INFO,
          });
          FetchConnectedBankingTxns();
          setSelectedTransaction([]);
        } else if (res.error) {
          openSnackBar({
            message: res.message,
            type: MESSAGE_TYPE.ERROR,
          });
        }

        enableLoading(false);
      })
      .catch((e) => {
        openSnackBar({
          message: e.message,
          type: MESSAGE_TYPE.ERROR,
        });
      });
  };

  const handleDateChange = (item) => () => {
    if (item === DateListItem[0]) {
      setDatePeriod(item);
      setDate({
        ...date,
        fromDate: moment().format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'),
      });
    } else if (item === DateListItem[1]) {
      setDatePeriod(item);
      setDate({
        ...date,
        fromDate: moment().add(-1, 'days').format('YYYY-MM-DD'),
        endDate: moment().add(-1, 'days').format('YYYY-MM-DD'),
      });
    } else if (item === DateListItem[2]) {
      setDatePeriod(item);
      setDate({
        ...date,
        fromDate: moment().startOf('week').format('YYYY-MM-DD'),
        endDate: moment().endOf('week').format('YYYY-MM-DD'),
      });
    } else if (item === DateListItem[3]) {
      setDatePeriod(item);
      setDate({
        ...date,
        fromDate: moment().startOf('month').format('YYYY-MM-DD'),
        endDate: moment().endOf('month').format('YYYY-MM-DD'),
      });
    } else if (item === DateListItem[4]) {
      setDatePeriod(item);
      setDate({
        ...date,
        fromDate: moment().startOf('year').format('YYYY-MM-DD'),
        endDate: moment().endOf('year').format('YYYY-MM-DD'),
      });
    } else if (item === DateListItem[5]) {
      setDatePeriod(item);
      setDate({
        ...date,
        fromDate: moment().startOf('quarter').format('YYYY-MM-DD'),
        endDate: moment().endOf('quarter').format('YYYY-MM-DD'),
      });
    }
    setDateEl(null);
  };

  const DateRangeSelector = (dates) => {
    setDate({
      ...date,
      fromDate: moment(dates[0]).format('YYYY-MM-DD'),
      endDate: moment(dates[1]).format('YYYY-MM-DD'),
    });
    setDatePeriod(
      `${moment(dates[0]).format('DD/MM/YY')} to ${moment(dates[1]).format(
        'DD/MM/YY'
      )}`
    );

    setcalendarShow(true);
  };

  const TransactionSelect = (id) => (e) => {
    if (e.target.checked) setSelectedTransaction([...selectedTransaction, id]);
    else
      setSelectedTransaction([
        ...selectedTransaction.slice(0, selectedTransaction.indexOf(id)),
        ...selectedTransaction.slice(selectedTransaction.indexOf(id) + 1),
      ]);
  };

  // const loadMore = () => {
  //   if (page >= bankTxns.pages) {
  //     sethasMoreItems(false);
  //   } else {
  //     setPage((prev) => prev + 1);
  //   }
  // };

  const fetchExpenseCategoryDetails = () => {
    enableLoading(true);
    const params = {
      category_type: 'expense_category',
    };
    const tquery = Object.keys(params)
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join('&');
    const query = `?${tquery}`;
    const urls = `organizations/${organization?.orgId}/accounts${query}`;
    RestApi(urls, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user?.activeToken}`,
      },
    })
      .then((res) => {
        const newdata = res.data.filter((ecategory) => {
          return ecategory.active;
        });
        derivedMasters.expensecategories.data = newdata;
        enableLoading(false);
      })
      .catch((e) => {
        openSnackBar({
          message: e.message,
          type: MESSAGE_TYPE.INFO,
        });
      });
  };

  const fetchIncomeCategoryDetails = () => {
    enableLoading(true);
    const urls = `organizations/${organization?.orgId}/income_categories`;
    RestApi(urls, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user?.activeToken}`,
      },
    })
      .then((res) => {
        const newdata = res.data.filter((ecategory) => {
          return ecategory.active;
        });
        derivedMasters.incomecategories.data = newdata;
        enableLoading(false);
      })
      .catch((e) => {
        openSnackBar({
          message: e.message,
          type: MESSAGE_TYPE.INFO,
        });
      });
  };

  const fetchTowardsDetails = () => {
    enableLoading(true);
    const urls = `organizations/${organization?.orgId}/accounts/categorization_account_list`;
    RestApi(urls, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user?.activeToken}`,
      },
    })
      .then((res) => {
        derivedMasters.towards.data = res.data;
        derivedMasters.towards.data.push({
          id: 'expense',
          name: 'Expenses',
          inflow_description: 'Expense',
          outflow_description: 'Expense',
        });
        derivedMasters.towards.data.push({
          id: 'income',
          name: 'Income',
          inflow_description: 'Income',
          outflow_description: 'Income',
        });
        const newlist1 = {};
        const newlist2 = {};
        res.data.forEach((toward) => {
          newlist1[toward.inflow_description] = toward;
          newlist2[toward.outflow_description] = toward;
        });
        derivedMasters.towards.inflow = newlist1;
        derivedMasters.towards.outflow = newlist2;
        enableLoading(false);
      })
      .catch((e) => {
        openSnackBar({
          message: e.message,
          type: MESSAGE_TYPE.INFO,
        });
      });
  };

  const CategTransactionSelect = (tranDetail) => () => {
    const alldata = { data: [] };
    let counter = 0;
    let rowfound = 0;

    const datanew = bankTxnsDetails.map((data) => {
      data.index = counter;
      counter += 1;
      return data;
    });

    alldata.data = datanew.filter(
      (data) => data.txn_category.toLowerCase() === 'business'
    );

    if (bankTxnsDetails && bankTxnsDetails.length > 0) {
      const ndataten = bankTxnsDetails.filter(
        (data) => data.txn_category.toLowerCase() === 'business'
      );
      ndataten.forEach((banktransaction, index) => {
        if (banktransaction.id === tranDetail.id) {
          rowfound = index;
        }
      });
    }

    localStorage.setItem('pagestart', rowfound);
    localStorage.setItem('itemstatus', tranDetail.categorized ? 'Edit' : 'Add');

    navigate('/bankingcategorization', {
      state: {
        status: !tranDetail.categorized ? 'Add' : 'Edit', // selected transaction already categorized ? "Edit" : "Add"
        bankaccountid: accDetails.bank_account_id, // Bank Account ID
        selectedtype: 'others', //
        row: rowfound, //
        alldata, // All Business Category Transactions
        bankname: accDetails.bank_name, // Bank Name
        bankaccount: accDetails.bank_account_number, // Bank Account  Number
        bankid: accDetails.bank_account_id, // Bank Account ID
        selecteddata: tranDetail, // Selected Transaction Details
        masterslist: derivedMasters,
      },
    });
    // navigate('/bill-upload', {
    //   state: {
    //     selected: { ...vendorBillDetails, bank_txn_id: tranDetail.txn_id },
    //   },
    // });
  };

  const getVendorBillDetails = () => {
    RestApi(`organizations/${organization?.orgId}/vendor_bills/${billId}`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user?.activeToken}`,
      },
    })
      .then((res) => {
        // if (res && !res.error) {
        //   setVendorBillDetails(res.data);
        // } else if (res.error) {
        //   openSnackBar({
        //     message: res.message,
        //     type: MESSAGE_TYPE.ERROR,
        //   });
        // }
        setVendorBillDetails(res);

        enableLoading(false);
      })
      .catch((e) => {
        openSnackBar({
          message: e.message,
          type: MESSAGE_TYPE.ERROR,
        });
      });
  };

  useEffect(() => {
    fetchTowardsDetails();
    fetchExpenseCategoryDetails();
    fetchIncomeCategoryDetails();
  }, []);

  useEffect(() => {
    if (billId) getVendorBillDetails();
  }, [billId]);

  useEffect(() => {
    if (accDetails?.bank_account_type === 'company')
      setacctbtnVal(intialAccButton.business);
    else if (accDetails?.bank_account_type === 'founder') {
      setacctbtnVal(intialAccButton.founder);
    } else setacctbtnVal(intialAccButton.virtual);
    setAccount(accDetails);
  }, [accDetails]);

  useEffect(() => {
    dropDownAccountFilter();
  }, [search, acctbtnVal]);

  useEffect(() => {
    if (Account !== '') {
      setLoadingOne(true);
      setSelectedTransaction([]);
      setBankTxnsDetails([]);
      FetchConnectedBankingTxns();
    }
  }, [datePeriod, Account, filter, page]);

  return (
    <>
      <Box className={css.statementcontainer}>
        <Stack className={css.headercontainer}>
          <Stack className={css.titlewrp}>
            <Typography variant="h4" className={css.titletext}>
              {title}
            </Typography>
            <Stack className={css.categbtnwrp}>
              {accDetails.uncategorized_count > 0 && filter === 'all' && (
                <Button
                  className={css.categalert}
                  onClick={() => {
                    setFilter('uncat');
                    setTitle(initialTabButton.second);
                    setbtnClass(initialTabButton.second);
                  }}
                >
                  <span className={css.uncategcount}>
                    {accDetails.uncategorized_count}
                  </span>
                  <Typography className={css.uncategtext}>
                    Uncategorized Transactions
                  </Typography>
                </Button>
              )}

              <ButtonGroup variant="contained" className={css.btngroup}>
                <Button className={css.actionbtn} onClick={StatementDownload}>
                  <Avatar
                    className={css.actiontbnicon}
                    alt="icon logo"
                    src={Download}
                  />
                  Download
                </Button>
                {/* <Button className={css.actionbtn}>
                    <Avatar
                      className={css.actiontbnicon}
                      alt="icon logo"
                      src={Upload}
                    />
                    Upload
                  </Button>
                  <Button className={css.actionbtn}>
                    <Avatar
                      className={css.actiontbnicon}
                      alt="icon logo"
                      src={Refresh}
                    />
                    Refresh
                  </Button> */}
              </ButtonGroup>
            </Stack>
          </Stack>

          <Stack className={css.filterelwrp}>
            <Grid
              className={css.balamountwrp}
              container
              spacing={{ md: 4, lg: 2 }}
              columns={{ md: 12, lg: 12 }}
            >
              <Grid item md={6} lg={4.5}>
                <Stack>
                  <ButtonGroup variant="contained" className={css.trantbnwrp}>
                    <Button
                      className={
                        btnClass === tabButton.first
                          ? `${css.tranbtnactive} ${
                              btnClass === 'All Transaction' && css.padd
                            }`
                          : `${css.tranbtn} ${
                              tabButton.first === 'All Transaction' && css.padd
                            }`
                      }
                      onClick={btnAction(tabButton.first)}
                    >
                      {tabButton.first}
                    </Button>
                    <Button
                      className={
                        btnClass === tabButton.second
                          ? css.tranbtnactive
                          : css.tranbtn
                      }
                      disabled={filedDisable === 'true'}
                      onClick={btnAction(tabButton.second)}
                    >
                      {tabButton.second}
                    </Button>
                    <Button
                      className={
                        btnClass === tabButton.third
                          ? css.tranbtnactive
                          : css.tranbtn
                      }
                      disabled={filedDisable === 'true'}
                      onClick={btnAction(tabButton.third)}
                    >
                      {tabButton.third}
                    </Button>
                  </ButtonGroup>
                </Stack>
              </Grid>

              {selectedTransaction.length === 0 ? (
                <>
                  <Grid item md={6} lg={2}>
                    <Stack>
                      <Button
                        aria-expanded={open ? 'true' : undefined}
                        variant="contained"
                        disableElevation
                        onClick={handleClick}
                        endIcon={<KeyboardArrowDownOutlinedIcon />}
                        className={css.dropdownbtn}
                        disabled={filedDisable === 'true'}
                      >
                        {`${acctbtnVal.split(' ')?.[0]} ${
                          acctbtnVal.split(' ')?.[2]
                        }`}
                      </Button>
                      <StyledMenu
                        anchorEl={accTypeEl}
                        open={open}
                        onClose={() => setAccTypeEl(null)}
                        listwidth={184}
                      >
                        {Object.keys(intialAccButton).map((val) => (
                          <MenuItem
                            onClick={handleClose(intialAccButton[val])}
                            disableRipple
                            selected={acctbtnVal === intialAccButton[val]}
                            key={val}
                          >
                            {intialAccButton[val]}
                          </MenuItem>
                        ))}
                      </StyledMenu>
                    </Stack>
                  </Grid>

                  <Grid item md={6} lg={2.7}>
                    <Stack>
                      <Button
                        aria-expanded={accountopen ? 'true' : undefined}
                        variant="contained"
                        disableElevation
                        onClick={(e) => setAccountEl(e.currentTarget)}
                        endIcon={<KeyboardArrowDownOutlinedIcon />}
                        className={css.dropdownbtn}
                        sx={
                          Account !== ''
                            ? { padding: '8px 12px !important' }
                            : { padding: '10px 12px !important' }
                        }
                        disabled={filedDisable === 'true'}
                      >
                        {Account !== '' ? (
                          <>
                            <img
                              src={HDFC}
                              alt="bank logo"
                              style={{ marginRight: 8 }}
                            />
                            {`${
                              Account?.bank_name
                            } - xxxx ${Account?.bank_account_number?.slice(
                              -4
                            )}`}
                          </>
                        ) : (
                          'Select Bank Account'
                        )}
                      </Button>
                      <StyledMenu
                        anchorEl={accountEl}
                        open={accountopen}
                        onClose={() => setAccountEl(null)}
                        sx={{
                          '& .MuiPaper-root': {
                            padding: 0,
                          },

                          '& .MuiMenuItem-root': {
                            marginBottom: '0px !important',
                            justifyContent: 'space-between',
                          },
                        }}
                        listwidth={224}
                      >
                        {bankLength > 5 && (
                          <Stack className={css.searchBanks}>
                            <input
                              name="search"
                              type="search"
                              placeholder="Search Bank"
                              className={css.searchInput}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSearch(e.target.value);
                              }}
                              onKeyDown={(e) => e.stopPropagation()}
                              value={search}
                            />
                          </Stack>
                        )}

                        {filteredBanks?.slice(0, 5)?.map((val) => (
                          <MenuItem
                            onClick={handleAccountSelect(val)}
                            disableRipple
                            key={val.bank_account_id || val.id}
                          >
                            <Stack className={css.banklogowrp}>
                              <img
                                src={HDFC}
                                alt="Bank Logo"
                                width="20px"
                                height="20px"
                                style={{ marginRight: 8 }}
                              />
                              <Stack>
                                <Typography className={css.bankname}>
                                  {val.bank_name.lenght > 15
                                    ? `${val.bank_name.slice(0, 13)}...`
                                    : val.bank_name}
                                </Typography>
                                <Typography className={css.accnumber}>
                                  {`xxxx ${val.bank_account_number.slice(-4)}`}
                                </Typography>
                              </Stack>
                            </Stack>
                            {AccountType.SA}
                          </MenuItem>
                        ))}
                        {filteredBanks.length === 0 && (
                          <MenuItem>
                            {loading === 'Loading'
                              ? 'Loading...'
                              : 'No banks found'}
                          </MenuItem>
                        )}
                      </StyledMenu>
                    </Stack>
                  </Grid>

                  <Grid item md={6} lg={2.8}>
                    <Stack>
                      <Button
                        id="demo-customized-button"
                        aria-controls={
                          dateopen ? 'demo-customized-menu' : undefined
                        }
                        aria-haspopup="true"
                        aria-expanded={dateopen ? 'true' : undefined}
                        variant="contained"
                        disableElevation
                        onClick={(e) => setDateEl(e.currentTarget)}
                        startIcon={
                          <>
                            <img
                              src={Calendar}
                              alt="calendar"
                              style={{ zIndex: 1 }}
                            />
                          </>
                        }
                        endIcon={<KeyboardArrowDownOutlinedIcon />}
                        className={`${css.dropdownbtn} ${css.dateicon}`}
                      >
                        {datePeriod}
                      </Button>
                      <StyledMenu
                        anchorEl={dateEl}
                        open={dateopen}
                        onClose={() => setDateEl(null)}
                        sx={{
                          '& .MuiPaper-root': {
                            padding: '8px 0',
                          },

                          '& .MuiMenuItem-root': {
                            marginBottom: '8px !important',
                          },
                        }}
                      >
                        {calendarShow ? (
                          <>
                            {DateListItem.map((row) => (
                              <MenuItem
                                key={row}
                                disableRipple
                                onClick={handleDateChange(row)}
                              >
                                {row}
                              </MenuItem>
                            ))}
                            <MenuItem
                              disableRipple
                              sx={{
                                color: '#f08b32 !important',
                                fontWeight: '500 !important',
                                marginBottom: 0,
                              }}
                              onClick={() => setcalendarShow(false)}
                            >
                              Custom
                            </MenuItem>
                          </>
                        ) : (
                          <MobileCalendar
                            DateRangeSelector={DateRangeSelector}
                            onClose={() => setDateEl(null)}
                          />
                        )}
                      </StyledMenu>
                    </Stack>
                  </Grid>
                </>
              ) : (
                <Grid item md={12} lg={6}>
                  <Stack className={css.movetranwrp}>
                    <Button
                      className={css.movesubmit}
                      onClick={TransactionMove}
                    >
                      {`Move to
                   ${
                     btnClass === 'Personal' ? 'business' : 'personal'
                   } transaction`}
                    </Button>
                    <Typography className={css.selectedtranscount}>
                      {`${selectedTransaction.length} Transaction Selected`}
                    </Typography>
                    <IconButton
                      className={css.closeicon}
                      onClick={() => setSelectedTransaction([])}
                    >
                      <CloseRoundedIcon />
                    </IconButton>
                  </Stack>
                </Grid>
              )}
            </Grid>
          </Stack>

          <Grid
            className={css.balamountwrp}
            container
            spacing={{ md: 4, lg: 2 }}
            columns={{ md: 12, lg: 12 }}
          >
            <Grid item md={6} lg={3}>
              <Stack className={css.balamtelwrp}>
                <Avatar alt="open" src={OpenBal} className={css.balamticon} />
                <Stack>
                  <Typography className={css.balamttitle}>
                    Opening Balance
                  </Typography>
                  <Typography className={css.balamt}>
                    {IndianCurrency.format(
                      Math.abs(bankTxns.opening_balance || 0)
                    )}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>

            <Grid item md={6} lg={3}>
              <Stack className={css.balamtelwrp}>
                <Avatar
                  alt="total inflow"
                  src={Inflow}
                  className={css.balamticon}
                />
                <Stack>
                  <Typography className={css.balamttitle}>
                    Total Inflow
                  </Typography>
                  <Typography className={css.balamt}>
                    {IndianCurrency.format(Math.abs(bankTxns.inflow || 0))}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>

            <Grid item md={6} lg={3}>
              <Stack className={css.balamtelwrp}>
                <Avatar
                  alt="total outflow"
                  src={Outflow}
                  className={css.balamticon}
                />
                <Stack>
                  <Typography className={css.balamttitle}>
                    Total Outflow
                  </Typography>
                  <Typography className={css.balamt}>
                    {IndianCurrency.format(Math.abs(bankTxns.outflow || 0))}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid item md={6} lg={3}>
              <Stack className={css.balamtelwrp}>
                <Avatar alt="close" src={CloseBal} className={css.balamticon} />
                <Stack>
                  <Typography className={css.balamttitle}>
                    Closing Balance
                  </Typography>
                  <Typography className={css.balamt}>
                    {IndianCurrency.format(
                      Math.abs(bankTxns.closing_balance || 0)
                    )}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Stack>

        <TableContainer className={css.st_table_container} id="tableContainer">
          <Table sx={{ minWidth: 650 }} stickyHeader>
            {acctbtnVal === intialAccButton.founder ? (
              <>
                {/* {TableHeadBody(btnClass)} */}
                {/* <InfiniteScroll
                    dataLength={bankTxnsDetails.length}
                    next={loadMore}
                    loader={<TableCell>Loading...</TableCell>}
                    // scrollThreshold="20px"
                    // initialScrollY="100px"
                    hasMore={hasMoreItems}
                    scrollableTarget="tableContainer"
                  > */}
                <TableHead>
                  <TableRow className={css.table_head_row}>
                    {btnClass !== 'Categorized' && <TableCell />}

                    <TableCell sx={{ minWidth: 105, paddingLeft: '23px' }}>
                      Date
                    </TableCell>
                    {btnClass === 'Business' && <TableCell>Status</TableCell>}
                    {btnClass === 'Categorized' && (
                      <>
                        <TableCell sx={{ minWidth: 115 }}>Party</TableCell>

                        <TableCell sx={{ minWidth: 115 }}>Purpose</TableCell>
                      </>
                    )}
                    <TableCell>Description</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>Inflow</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>Outflow</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {bankTxnsDetails?.filter((item) =>
                    btnClass !== 'Categorized'
                      ? item.txn_category === btnClass.toLowerCase()
                      : item.categorized === true
                  ).length > 0 ? (
                    <>
                      {bankTxnsDetails
                        ?.filter((item) =>
                          btnClass !== 'Categorized'
                            ? item.txn_category === btnClass.toLowerCase()
                            : item.categorized === true
                        )
                        .map((val) => (
                          <TableRow
                            className={css.table_body_row}
                            key={val.id}
                            onClick={
                              val.txn_category !== 'personal' &&
                              CategTransactionSelect(val)
                            }
                          >
                            {btnClass !== 'Categorized' && (
                              <TableCell className={classes.checkBoxRoot}>
                                <Checkbox
                                  onChange={TransactionSelect(val.id)}
                                  checked={selectedTransaction.includes(val.id)}
                                />
                              </TableCell>
                            )}

                            <TableCell
                              className={css.date}
                              sx={
                                btnClass === 'Categorized'
                                  ? {
                                      minWidth: 105,
                                      paddingLeft: '23px !important',
                                    }
                                  : {
                                      minWidth: 105,
                                    }
                              }
                            >
                              {moment(val.date).format('MMM Do, YYYY')}
                            </TableCell>

                            {btnClass === 'Business' && (
                              <TableCell className={css.status}>
                                {TranStatus(val.status)}
                              </TableCell>
                            )}
                            {btnClass === 'Categorized' && (
                              <>
                                <TableCell className={css.party}>
                                  {val.party_name || '-'}
                                </TableCell>
                                <TableCell className={css.party}>
                                  {val.purpose || '-'}
                                </TableCell>
                              </>
                            )}
                            <TableCell className={css.desc}>
                              <Typography className={css.desc_title}>
                                {val.narration || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell className={css.inflow}>
                              {Number(val.amount) > 0
                                ? `₹${val.formatted_amount}`
                                : `-`}
                            </TableCell>
                            <TableCell className={css.outflow}>
                              {Number(val.amount) < 0
                                ? `₹${val.formatted_amount}`
                                : `-`}
                            </TableCell>
                          </TableRow>
                        ))}
                    </>
                  ) : (
                    <TableRow>
                      <TableCell
                        // colSpan={6}
                        sx={{ textAlign: 'center', borderBottom: 'none' }}
                      >
                        {bankTxnsDetails?.filter((item) =>
                          btnClass !== 'Categorized'
                            ? item.txn_category === btnClass.toLowerCase()
                            : item.categorized === true
                        ).length === 0 && loadingOne
                          ? 'Loading...'
                          : 'No data.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                {/* </InfiniteScroll> */}
              </>
            ) : (
              <>
                {/* <InfiniteScroll
                    dataLength={bankTxnsDetails.length}
                    next={loadMore}
                    loader={<TableCell>Loading...</TableCell>}
                    // scrollThreshold="20px"
                    // initialScrollY="100px"
                    hasMore={hasMoreItems}
                    scrollableTarget="tableContainer"
                  > */}
                <TableHead>
                  <TableRow className={css.table_head_row}>
                    <TableCell sx={{ minWidth: 105, paddingLeft: '23px' }}>
                      Date
                    </TableCell>
                    {btnClass === 'Categorized' && (
                      <>
                        <TableCell>Doc.No</TableCell>
                        <TableCell>Party</TableCell>
                        <TableCell>Purpose</TableCell>
                      </>
                    )}
                    {btnClass === 'All Transaction' && (
                      <TableCell>Status</TableCell>
                    )}
                    {(btnClass === 'All Transaction' ||
                      acctbtnVal === intialAccButton.virtual) && (
                      <TableCell sx={{ minWidth: 115 }}>
                        Party & Purpose
                      </TableCell>
                    )}

                    {/* //acctbtnVal === intialAccButton.business  */}
                    <TableCell>Description</TableCell>
                    {btnClass === 'Uncategorized' && (
                      <TableCell>Status</TableCell>
                    )}

                    <TableCell sx={{ textAlign: 'right' }}>Inflow</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>Outflow</TableCell>
                    {btnClass === 'All Transaction' && (
                      <TableCell sx={{ textAlign: 'right' }}>Balance</TableCell>
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {/* <InfiniteScroll> */}

                  {bankTxns?.count > 0 ? (
                    <>
                      {bankTxnsDetails?.map((val) => (
                        <TableRow
                          className={css.table_body_row}
                          key={val.id}
                          onClick={CategTransactionSelect(val)}
                        >
                          <TableCell
                            className={css.date}
                            sx={{
                              minWidth: 105,
                              paddingLeft: '23px !important',
                            }}
                          >
                            {moment(val.date).format('MMM Do, YYYY')}
                          </TableCell>
                          {btnClass === 'Categorized' && (
                            <>
                              <TableCell
                                className={css.party}
                                sx={{
                                  fontWeight: '400 !important',
                                  color: '#3049BF !important',
                                  minWidth: '100px',
                                }}
                              >
                                INV- 00120000
                              </TableCell>
                              <TableCell className={css.party}>
                                {val.party_name || '-'}
                              </TableCell>
                              <TableCell className={css.party}>
                                {val.purpose || '-'}
                              </TableCell>
                            </>
                          )}

                          {btnClass === 'All Transaction' && (
                            <TableCell className={css.status}>
                              {TranStatus(val.status)}
                            </TableCell>
                          )}
                          {(btnClass === 'All Transaction' ||
                            acctbtnVal === intialAccButton.virtual) && (
                            <TableCell className={css.party}>
                              {val.party_name || '-'} <br />
                              {val.purpose || '-'}
                            </TableCell>
                          )}

                          <TableCell className={css.desc}>
                            <Typography className={css.desc_title}>
                              {val.narration || '-'}
                            </Typography>

                            {/* <Typography className={css.desc_subtitle}>
                        xxxxxxxxxx2242 with account number xxxx2242 has been
                        added.
                      </Typography> */}
                          </TableCell>

                          {btnClass === 'Uncategorized' && (
                            <TableCell className={css.status}>
                              {TranStatus(val.status)}
                            </TableCell>
                          )}

                          <TableCell className={css.inflow}>
                            {/* {Number(val.amount) > 0
                        ? IndianCurrency.format(Math.abs(val.amount))
                        : `-`} */}
                            {Number(val.amount) > 0
                              ? `₹${val.formatted_amount}`
                              : `-`}
                          </TableCell>

                          <TableCell className={css.outflow}>
                            {/* {Number(val.amount) < 0
                        ? IndianCurrency.format(Math.abs(val.amount))
                        : `-`} */}
                            {Number(val.amount) < 0
                              ? `₹${val.formatted_amount}`
                              : `-`}
                          </TableCell>

                          {btnClass === 'All Transaction' && (
                            <TableCell className={css.balance}>
                              {IndianCurrency.format(val.running_balance)}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        sx={{ textAlign: 'center', borderBottom: 'none' }}
                      >
                        No data...
                      </TableCell>
                    </TableRow>
                  )}
                  {/* </InfiniteScroll> */}
                </TableBody>
                {/* </InfiniteScroll> */}
              </>
            )}
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default memo(BankStatementWeb);
