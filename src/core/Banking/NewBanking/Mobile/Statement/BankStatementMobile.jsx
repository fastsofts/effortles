import React, { memo, useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';

import JSBridge from '@nativeBridge/jsbridge';

import {
  Stack,
  Box,
  Button,
  Typography,
  ButtonGroup,
  Avatar,
  IconButton,
} from '@mui/material';
import { Checkbox } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import InfiniteScroll from 'react-infinite-scroll-component';

import RestApi, { METHOD, BASE_URL } from '@services/RestApi';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer';
import AppContext from '@root/AppContext';

import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import CloseRoundedIon from '@mui/icons-material/CloseRounded';

import SelectBottomSheet from '../../../../../components/SelectBottomSheet/SelectBottomSheet';
import BottomSelectList from '../Components/BottomSelectList';
import AccountSelect from '../Components/AccountSelect';
import TransactionDetails from '../Components/TransactionDetails';

// import MobileCalendar from '../../../../../components/MobileCalendar/DateRangePicker';
import Calendar from '../../../../../assets/calendar.svg';
import HDFC from '../../../../../assets/BankLogo/dropDown/hdfc.svg';
import Download from '../../../../../assets/st_download.svg';
// import Refresh from '../../../../../assets/st_refresh.svg';

// import { StyledMenu, AccountType } from '../../Statement/util';
import css from '../bankingmobile.scss';

const listItemData = [
  'Virtual Bank Account',
  'Business Bank Account',
  'Founder’s Bank Account',
];

const datePriodData = [
  'Today',
  'Yesterday',
  'This Week',
  'This Month',
  'This Year',
  'This Quarter',
  'Custom',
];

const intialAccButton = {
  virtual: 'Virtual Bank Account',
  business: 'Business Bank Account',
  founder: 'Founder’s Bank Account',
};

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

const derivedMasters = {
  incomecategories: { data: [] },
  expensecategories: { data: [] },
  towards: { inflow: {}, outflow: {}, data: [] },
  type: [
    { name: 'Receipt', id: 'receipt_from_party' },
    { name: 'Payment', id: 'pauyment_to_party' },
  ],
};

const BankStatementMobile = () => {
  const IndianCurrency = Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  });
  const classes = useStyle();
  const navigate = useNavigate();

  const { organization, user, enableLoading, openSnackBar } =
    useContext(AppContext);
  const { bankListingDetails, accDetails, filedDisable } = useLocation().state;

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

  const [acctbtnVal, setacctbtnVal] = useState(intialAccButton.business);
  const [Account, setAccount] = useState(accDetails);
  const [datePeriod, setDatePeriod] = useState(datePriodData[4]);
  const [date, setDate] = useState({
    fromDate: moment().startOf('year').format('YYYY-MM-DD'),
    endDate: moment().endOf('year').format('YYYY-MM-DD'),
  });
  const [oneTransaction, setOneTransaction] = useState('');

  const [accountTypeShow, setAccountTypeShow] = useState(false);
  const [datePeriodShow, setDatePeriodShow] = useState(false);
  const [accountShow, setAccountShow] = useState(false);
  const [transactionShow, setTransactionShow] = useState(false);

  const [tabButton, setTabButton] = useState(initialTabButton);
  const [btnClass, setbtnClass] = useState(initialTabButton.first);

  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  console.log(loading);

  const [bankTxns, setBankTxns] = useState([]);
  const [bankTxnsDetails, setBankTxnsDetails] = useState({});
  const [selectedTransaction, setSelectedTransaction] = useState([]);
  const [hasMoreItems, sethasMoreItems] = useState(true);

  const handleAccountType = (val) => () => {
    setacctbtnVal(val);
    setAccountTypeShow(false);
    if (val === intialAccButton.founder) {
      setTabButton({
        ...tabButton,
        first: 'Personal',
        second: 'Business',
        third: 'Categorized',
      });
      setbtnClass('Personal');
      setBankTxns([]);
      setBankTxnsDetails({});
      setAccount('');
    } else {
      setTabButton({
        ...tabButton,
        first: 'All Transaction',
        second: 'Uncategorized',
        third: 'Categorized',
      });
      setbtnClass('All Transaction');
      setBankTxns([]);
      setBankTxnsDetails({});
      setAccount('');
    }
  };

  const handleDateChange = (item) => () => {
    if (item === datePriodData[0]) {
      setDatePeriod(item);
      setDate({
        ...date,
        fromDate: moment().format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'),
      });
    } else if (item === datePriodData[1]) {
      setDatePeriod(item);
      setDate({
        ...date,
        fromDate: moment().add(-1, 'days').format('YYYY-MM-DD'),
        endDate: moment().add(-1, 'days').format('YYYY-MM-DD'),
      });
    } else if (item === datePriodData[2]) {
      setDatePeriod(item);
      setDate({
        ...date,
        fromDate: moment().startOf('week').format('YYYY-MM-DD'),
        endDate: moment().endOf('week').format('YYYY-MM-DD'),
      });
    } else if (item === datePriodData[3]) {
      setDatePeriod(item);
      setDate({
        ...date,
        fromDate: moment().startOf('month').format('YYYY-MM-DD'),
        endDate: moment().endOf('month').format('YYYY-MM-DD'),
      });
    } else if (item === datePriodData[4]) {
      setDatePeriod(item);
      setDate({
        ...date,
        fromDate: moment().startOf('year').format('YYYY-MM-DD'),
        endDate: moment().endOf('year').format('YYYY-MM-DD'),
      });
    } else if (item === datePriodData[5]) {
      setDatePeriod(item);
      setDate({
        ...date,
        fromDate: moment().startOf('quarter').format('YYYY-MM-DD'),
        endDate: moment().endOf('quarter').format('YYYY-MM-DD'),
      });
    }
    setDatePeriodShow(false);
  };

  const handleAccountSelect = (val) => () => {
    setAccount(val);
    setAccountShow(false);
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

    JSBridge.downloadWithAuthentication(
      Account.service_provider === 'yodlee'
        ? `${BASE_URL}/organizations/${organization?.orgId}/yodlee_bank_accounts/${Account?.id}/downloads.xlsx?${params}`
        : `${BASE_URL}/organizations/${organization?.orgId}/icici_bank_accounts/${Account?.bank_account_id}/download.xlsx?${params}`
    );

    // fetch(
    //   Account.service_provider === 'yodlee'
    //     ? `${BASE_URL}/organizations/${organization?.orgId}/yodlee_bank_accounts/${Account?.id}/downloads.xlsx?${params}`
    //     : `${BASE_URL}/organizations/${organization?.orgId}/icici_bank_accounts/${Account?.bank_account_id}/download.xlsx?${params}`,
    //   {
    //     method: 'GET',
    //     headers: {
    //       Authorization: `Bearer ${user.activeToken}`,
    //     },
    //   }
    // )
    //   .then((response) => response.blob())
    //   .then((blob) => {
    //     enableLoading(false);

    //     const url = window.URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = `statement from ${date.fromDate} to ${date.endDate}.xlsx`;
    //     document.body.appendChild(a);
    //     a.click();
    //     a.remove();
    //   })
    //   .catch((e) => {
    //     openSnackBar({
    //       message: e.message,
    //       type: MESSAGE_TYPE.ERROR,
    //     });
    //   });
  };

  const btnAction = (val) => () => {
    setbtnClass(val);
    if (val === initialTabButton.first) setFilter('all');
    else if (val === initialTabButton.second) setFilter('uncat');
    else if (val === initialTabButton.third) setFilter('cat');
  };

  const BankAccountsGroupBusiness = (data) => {
    const dateGroupData = data?.reduce((x, y) => {
      (x[moment(y.date).format('DD MMM YYYY')] =
        x[moment(y.date).format('DD MMM YYYY')] || []).push(y);
      return x;
    }, []);
    setBankTxnsDetails(dateGroupData);
  };

  const BankAccountsGroupPersonal = (data) => {
    const dateGroupData = data?.reduce((x, y) => {
      (x[moment(y.date).format('DD MMM YYYY')] =
        x[moment(y.date).format('DD MMM YYYY')] || []).push(y);
      return x;
    }, []);

    const newArray = {};
    // const temparr = [];

    Object.keys(dateGroupData)?.forEach((item) => {
      if (btnClass !== 'Categorized') {
        const filteredcat = dateGroupData[item].filter(
          (obj) =>
            obj.txn_category === btnClass.toLowerCase() &&
            obj.categorized === false
        );
        if (filteredcat.length !== 0) newArray[item] = filteredcat;
      } else {
        const filteredcat = dateGroupData[item].filter(
          (obj) => obj.categorized === true
        );
        if (filteredcat.length !== 0) newArray[item].push(filteredcat);
      }
    });

    setBankTxnsDetails((prev) => ({ ...prev, ...newArray }));
    console.log(newArray);
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
      Account.service_provider === 'yodlee'
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
          // setBankTxnsDetails((prev) => [...prev, ...res.data]);

          if (accDetails?.bank_account_type === 'company')
            BankAccountsGroupBusiness(res?.data);
          else {
            BankAccountsGroupPersonal(res?.data);
          }
          enableLoading(false);
          setLoading(false);
        } else if (res.error) {
          openSnackBar({
            message: res.message,
            type: MESSAGE_TYPE.ERROR,
          });
          enableLoading(false);
          setLoading(false);
        }
      })
      .catch((e) => {
        enableLoading(false);
        setLoading(false);
        openSnackBar({
          message: e.message,
          type: MESSAGE_TYPE.ERROR,
        });
      });
  };

  // const DateRangeSelector = (dates) => {
  //   setDate({
  //     ...date,
  //     fromDate: moment(dates[0]).format('YYYY-MM-DD'),
  //     endDate: moment(dates[1]).format('YYYY-MM-DD'),
  //   });
  //   setDatePeriod(
  //     `${moment(dates[0]).format('DD/MM/YY')} to ${moment(dates[1]).format(
  //       'DD/MM/YY'
  //     )}`
  //   );

  //   setcalendarShow(true);
  // };
  const icon = true;

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

  const TransactionSelect = (id) => (e) => {
    if (e.target.checked) setSelectedTransaction([...selectedTransaction, id]);
    else
      setSelectedTransaction([
        ...selectedTransaction.slice(0, selectedTransaction.indexOf(id)),
        ...selectedTransaction.slice(selectedTransaction.indexOf(id) + 1),
      ]);
  };

  const TransactionView = (row) => () => {
    setOneTransaction(row);
    setTransactionShow(true);
  };
  const loadMore = () => {
    if (page >= bankTxns.pages) {
      sethasMoreItems(false);
    } else {
      setPage((prev) => prev + 1);
    }
  };

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

    const datanew = bankTxns.data.map((data) => {
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

  // const CategTransactionSelect = (tranDetail) => () => {
  //   const alldata = { data: [] };
  //   let counter = 0;
  //   let rowfound = 0;

  //   const datanew = bankTxnsDetails.map((data) => {
  //     data.index = counter;
  //     counter += 1;
  //     return data;
  //   });

  //   alldata.data = datanew.filter(
  //     (data) => data.txn_category.toLowerCase() === 'business'
  //   );

  //   if (bankTxnsDetails && bankTxnsDetails.length > 0) {
  //     const ndataten = bankTxnsDetails.filter(
  //       (data) => data.txn_category.toLowerCase() === 'business'
  //     );
  //     ndataten.forEach((banktransaction, index) => {
  //       if (banktransaction.id === tranDetail.id) {
  //         rowfound = index;
  //       }
  //     });
  //   }

  //   localStorage.setItem('pagestart', rowfound);
  //   localStorage.setItem('itemstatus', tranDetail.categorized ? 'Edit' : 'Add');

  //   navigate('/bankingcategorization', {
  //     state: {
  //       status: !tranDetail.categorized ? 'Add' : 'Edit', // selected transaction already categorized ? "Edit" : "Add"
  //       bankaccountid: accDetails.bank_account_id, // Bank Account ID
  //       selectedtype: 'others', //
  //       row: rowfound, //
  //       alldata, // All Business Category Transactions
  //       bankname: accDetails.bank_name, // Bank Name
  //       bankaccount: accDetails.bank_account_number, // Bank Account  Number
  //       bankid: accDetails.bank_account_id, // Bank Account ID
  //       selecteddata: tranDetail, // Selected Transaction Details
  //       masterslist: derivedMasters,
  //     },
  //   });
  //   // navigate('/bill-upload', { state: { tranDetail } });
  // };

  useEffect(() => {
    fetchTowardsDetails();
    fetchExpenseCategoryDetails();
    fetchIncomeCategoryDetails();
  }, []);

  useEffect(() => {
    if (accDetails?.bank_account_type === 'company')
      setacctbtnVal(intialAccButton.business);
    else if (accDetails?.bank_account_type === 'founder') {
      setacctbtnVal(intialAccButton.founder);
    } else setacctbtnVal(intialAccButton.virtual);
    setAccount(accDetails);
  }, [accDetails]);

  useEffect(() => {
    FetchConnectedBankingTxns();
  }, [page]);

  useEffect(() => {
    if (Account !== '') {
      setLoading(true);
      setSelectedTransaction([]);
      FetchConnectedBankingTxns();
      setBankTxnsDetails({});
      setPage(1);
    }
  }, [datePeriod, Account, filter]);

  return (
    <>
      <Box className={css.mobilestconstainer}>
        <Stack className={css.accountcalendarwrp}>
          <Button
            aria-expanded={accountTypeShow ? 'true' : undefined}
            variant="contained"
            disableElevation
            onClick={() => setAccountTypeShow(true)}
            endIcon={<KeyboardArrowDownOutlinedIcon />}
            className={css.dropdownbtn}
            disabled={filedDisable === 'true'}
          >
            {`${acctbtnVal.split(' ')?.[0]} ${acctbtnVal.split(' ')?.[2]}`}
          </Button>

          <Button
            variant="contained"
            disableElevation
            onClick={() => setDatePeriodShow(true)}
            startIcon={
              <>
                <img src={Calendar} alt="calendar" style={{ zIndex: 1 }} />
              </>
            }
            endIcon={<KeyboardArrowDownOutlinedIcon />}
            className={`${css.dropdownbtn} ${css.dateicon}`}
          >
            {datePeriod}
          </Button>
        </Stack>

        <Button
          aria-expanded={accountShow ? 'true' : undefined}
          variant="contained"
          disableElevation
          endIcon={icon && <KeyboardArrowDownOutlinedIcon />}
          className={css.dropdownbtn}
          onClick={() => icon && setAccountShow(true)}
          sx={{
            width: '100%',
            justifyContent: 'flex-start',
            marginBottom: '8px',
          }}
          disabled={filedDisable === 'true'}
        >
          {Account !== '' ? (
            <>
              <img src={HDFC} alt="bank logo" style={{ marginRight: 8 }} />
              {`${
                Account?.bank_name
              } - xxxx ${Account?.bank_account_number?.slice(-4)}`}
            </>
          ) : (
            'Select Bank Account'
          )}
        </Button>

        <Stack className={css.synciconwrp}>
          {selectedTransaction.length !== 0 ? (
            <>
              <Stack className={css.movetranwrp}>
                <Typography className={css.seltrancoounrt}>
                  {`${selectedTransaction.length} Transaction Selected`}
                </Typography>
                <IconButton
                  className={css.closeiconbtn}
                  onClick={() => setSelectedTransaction([])}
                >
                  <CloseRoundedIon className={css.closeicon} />
                </IconButton>
              </Stack>
              <Button className={css.tranmovesubmit} onClick={TransactionMove}>
                {`Move to ${btnClass === 'Personal' ? 'Business' : 'Personal'}`}
              </Button>
            </>
          ) : (
            <>
              <Typography className={css.lastsync}>
                {`Last Sync : ${
                  accDetails.lastsync
                    ? moment(accDetails.lastsync).format('DD MM YYYY hh:mm A')
                    : 'Not available'
                }`}
              </Typography>
              <ButtonGroup variant="outlined" className={css.btngroup}>
                {/* <Button className={css.actionbtn}>
              <Avatar
                className={css.actionbtnicon}
                alt="refresh icon"
                src={Refresh}
              />
            </Button> */}
                <Button className={css.actionbtn} onClick={StatementDownload}>
                  <Avatar
                    className={css.actionbtnicon}
                    alt="download icon"
                    src={Download}
                  />
                </Button>
              </ButtonGroup>
            </>
          )}
        </Stack>

        <Stack className={css.tabwrp}>
          <Button
            className={
              btnClass === tabButton.first
                ? `${css.tabs} ${css.active}`
                : css.tabs
            }
            onClick={btnAction(tabButton.first)}
          >
            {tabButton.first}
          </Button>
          <Button
            className={
              btnClass === tabButton.second
                ? `${css.tabs} ${css.active}`
                : css.tabs
            }
            onClick={btnAction(tabButton.second)}
            disabled={filedDisable === 'true'}
          >
            {tabButton.second}
          </Button>
          <Button
            className={
              btnClass === tabButton.third
                ? `${css.tabs} ${css.active}`
                : css.tabs
            }
            onClick={btnAction(tabButton.third)}
            disabled={filedDisable === 'true'}
          >
            {tabButton.third}
          </Button>
        </Stack>

        <Stack className={css.amountscontainer}>
          <Stack className={css.amountwrp}>
            <Stack>
              <Typography className={`${css.amounttitle} ${css.openbal}`}>
                Opening Balance
              </Typography>
              <Typography className={css.amount}>
                {IndianCurrency.format(Math.abs(bankTxns.opening_balance || 0))}
              </Typography>
            </Stack>
            <Stack>
              <Typography
                className={`${css.amounttitle} ${css.closebal} `}
                sx={{ textAlign: 'right' }}
              >
                Closing Balance
              </Typography>
              <Typography className={css.amount} sx={{ textAlign: 'right' }}>
                {IndianCurrency.format(Math.abs(bankTxns.closing_balance || 0))}
              </Typography>
            </Stack>
          </Stack>
          <Stack
            className={css.amountwrp}
            sx={{ marginBottom: '0 !important' }}
          >
            <Stack>
              <Typography className={`${css.amounttitle} ${css.totalinbal} `}>
                Total Inflow
              </Typography>
              <Typography className={css.amount}>
                {IndianCurrency.format(Math.abs(bankTxns.inflow || 0))}
              </Typography>
            </Stack>
            <Stack>
              <Typography
                className={`${css.amounttitle} ${css.totaloutbal} `}
                sx={{ textAlign: 'right' }}
              >
                Total Outflow
              </Typography>
              <Typography className={css.amount} sx={{ textAlign: 'right' }}>
                {IndianCurrency.format(Math.abs(bankTxns.outflow || 0))}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        {acctbtnVal === intialAccButton.founder ? (
          <Box className={css.transactioncontainer} id="tableContainer">
            <InfiniteScroll
              dataLength={Object.keys(bankTxnsDetails).length}
              next={loadMore}
              // loader={<h3>Loading...</h3>}
              hasMore={hasMoreItems}
              scrollableTarget="tableContainer"
            >
              {Object.keys(bankTxnsDetails)?.map((item) => (
                <Stack key={item}>
                  <Stack className={css.datesticky}>
                    <Typography className={css.transacdate}>{item}</Typography>
                  </Stack>

                  {bankTxnsDetails[item]
                    ?.filter((item_) =>
                      btnClass !== 'Categorized'
                        ? item_.txn_category === btnClass.toLowerCase()
                        : item_.categorized === true
                    )
                    .map((row) => (
                      <Stack
                        className={css.transacsubcontainer}
                        key={row.id}
                        onClick={TransactionView(row)}
                      >
                        {btnClass === 'Categorized' ? (
                          <>
                            <Stack className={css.transacdescwrp}>
                              <Typography className={css.transacdesc}>
                                {row.party_name || '-'}
                              </Typography>

                              <Typography
                                className={
                                  Number(row.amount) > 0
                                    ? css.transacdescamtpos
                                    : css.transacdescamtneg
                                }
                              >
                                {`₹.${row.formatted_amount}`}
                              </Typography>
                            </Stack>
                            <Stack className={css.transacsubdescwrp}>
                              <Typography className={css.transacsubdesc}>
                                {row.narration}
                              </Typography>
                              <Typography className={css.transacbal}>
                                {`Bal : ₹.${row.formatted_running_balance}`}
                              </Typography>
                            </Stack>
                          </>
                        ) : (
                          <Stack className={css.transacsubdescwrp}>
                            <Stack
                              sx={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            >
                              <span className={classes.checkBoxRoot}>
                                <Checkbox
                                  onChange={TransactionSelect(row.id)}
                                  checked={selectedTransaction.includes(row.id)}
                                />
                              </span>
                              <Typography className={css.transacsubdesc}>
                                {row.narration}
                              </Typography>
                            </Stack>

                            <Typography
                              className={
                                Number(row.amount) > 0
                                  ? css.transacdescamtpos
                                  : css.transacdescamtneg
                              }
                            >
                              {`₹.${row.formatted_amount}`}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    ))}
                </Stack>
              ))}
            </InfiniteScroll>
          </Box>
        ) : (
          <Box className={css.transactioncontainer}>
            {Object.keys(bankTxnsDetails)?.map((item) => (
              <Stack key={item}>
                <Stack className={css.datesticky}>
                  <Typography className={css.transacdate}>{item}</Typography>
                </Stack>
                {bankTxnsDetails[item].map((row) => (
                  <Stack
                    className={css.transacsubcontainer}
                    key={row.id}
                    onClick={CategTransactionSelect(row)}
                  >
                    <Stack className={css.transacdescwrp}>
                      <Typography className={css.transacdesc}>
                        Agrya | Professional fees
                      </Typography>
                      <Typography
                        className={
                          Number(row.amount) > 0
                            ? css.transacdescamtpos
                            : css.transacdescamtneg
                        }
                      >
                        {`₹.${row.formatted_amount}`}
                      </Typography>
                    </Stack>
                    <Stack className={css.transacsubdescwrp}>
                      <Typography className={css.transacsubdesc}>
                        {row.narration}
                      </Typography>
                      <Typography className={css.transacbal}>
                        {`Bal : ₹.${row.formatted_running_balance}`}
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            ))}
          </Box>
        )}
      </Box>

      <SelectBottomSheet
        triggerComponent
        open={accountTypeShow}
        name="Account Type"
        onClose={() => setAccountTypeShow(false)}
        addNewSheet
      >
        <BottomSelectList
          onClose={() => setAccountTypeShow(false)}
          handleChange={handleAccountType}
          selectedValue={acctbtnVal}
          title="Select Account Type"
          data={listItemData}
        />
      </SelectBottomSheet>

      <SelectBottomSheet
        triggerComponent
        open={datePeriodShow}
        name="Period Select"
        onClose={() => setDatePeriodShow(false)}
        addNewSheet
      >
        <BottomSelectList
          // onClose={() => setAccountTypeShow(false)}
          handleChange={handleDateChange}
          selectedValue={datePeriod}
          title="hide"
          data={datePriodData}
        />
      </SelectBottomSheet>

      <SelectBottomSheet
        triggerComponent
        open={accountShow}
        name="Account Select"
        onClose={() => setAccountShow(false)}
        addNewSheet
      >
        <AccountSelect
          onClose={() => setAccountShow(false)}
          handleAccountSelect={handleAccountSelect}
          title="Business Account Type"
          bankListingDetails={bankListingDetails}
          intialAccButton={intialAccButton}
          acctbtnVal={acctbtnVal}
        />
      </SelectBottomSheet>

      <SelectBottomSheet
        triggerComponent
        open={transactionShow}
        name="Transaction Detail"
        onClose={() => setTransactionShow(false)}
        addNewSheet
      >
        <TransactionDetails
          onClose={() => setTransactionShow(false)}
          title="Transaction details"
          data={oneTransaction}
        />
      </SelectBottomSheet>
    </>
  );
};

export default memo(BankStatementMobile);
