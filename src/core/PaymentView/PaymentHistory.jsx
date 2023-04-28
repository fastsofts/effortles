import React, { useState, useContext, useEffect } from 'react';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet';
import { OnlyDatePicker } from '@components/DatePicker/DatePicker.jsx';
import { makeStyles, Chip } from '@material-ui/core';
import Lottie from 'react-lottie';
import * as Mui from '@mui/material';
import * as Router from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import themes from '@root/theme.scss';
import AppContext from '@root/AppContext.jsx';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import { PermissionDialog } from '@components/Permissions/PermissionDialog.jsx';
import moment from 'moment';
import sucessAnimation from '@root/Lotties/paymentSucess.json';
import failAnimation from '@root/Lotties/paymentFailed.json';
import processingAnimation from '@root/Lotties/paymentProcessing.json';
import { FormattedAmount } from '@components/formattedValue/FormattedValue';
import CloseIcon from '@mui/icons-material/Close';
import VendorList from './shared/VendorList';
import StopWatch from '../../assets/WebAssets/stopwatch.svg';
import CircleOk from '../../assets/WebAssets/circle-ok.svg';
import ErrorImg from '../../assets/WebAssets/error.svg';
import css from './PaymentHistory.scss';
import Calander from '../InvoiceView/Calander';

const useStyles = makeStyles(() => ({
  chips: {
    marginRight: '5px',
    '& .MuiChip-root': {
      background: 'white',
      border: '1px solid #f0f0f0',
      flexDirection: 'row-reverse !important',
    },
    '& .MuiChip-icon': {
      marginRight: '5px',
      marginLeft: '-10px',
    },
  },
  searchInput: {
    margin: '0 20px',
    padding: '5px 10px 0 0',
    '& .MuiTextField-root': {
      paddingLeft: '8px',
      marginBottom: '8px',
      border: '1px solid rgb(180 175 174)',
    },
    '& .MuiInput-root': {
      height: '56px !important',
    },
  },
  checkbox: {
    padding: 0,
    paddingTop: 4,
    '& .MuiSvgIcon-root': {
      fontSize: '2.4rem',
      fill: 'transparent',
    },
  },
  selectedchips: {
    minWidth: '80px',
    margin: '0 6px 0 0',
    background: '#fdf1e6',
    color: themes.colorPrimaryButton,
    borderColor: themes.colorPrimaryButton,
  },
}));

const sortOptions = [
  {
    id: 1,
    name: 'Recent payments',
    click: { order_by: 'created_at', order: 'asc' },
  },
  {
    id: 2,
    name: 'Bill amount Low to High',
    click: { order_by: 'amount', order: 'asc' },
  },
  {
    id: 3,
    name: 'Bill amount High to Low',
    click: { order_by: 'amount', order: 'desc' },
  },
  { id: 4, name: 'A-Z', click: { order_by: 'name', order: 'asc' } },
  { id: 5, name: 'Z-A', click: { order_by: 'name', order: 'desc' } },
];

const initialState = {
  vendors: [],
  sort: '',
  date: '',
};

const PaymentHistory = () => {
  const { organization, enableLoading, user, userPermissions } =
    useContext(AppContext);
  const classes = useStyles();
  const device = localStorage.getItem('device_detect');
  const navigate = Router.useNavigate();
  const [state, setState] = useState(initialState);
  const [vendorList, setVendorList] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState();
  const [toDate, setToDate] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [showFromDate, setShowFromDate] = useState(true);
  const [drawer, setDrawer] = useState({
    date: false,
    vendor: false,
    sort: false,
    payment: false,
  });
  const [anchorElFor, setAnchorElFor] = React.useState({
    sort: null,
    date: null,
    List: null,
  });
  const [webValue, setWebValue] = React.useState({
    fromDate: null,
    toDate: null,
    customerID: null,
    orderBy: null,
  });
  const [hasMoreItems, sethasMoreItems] = React.useState(true);
  const [pagination, setPagination] = React.useState({
    totalPage: 1,
    currentPage: 1,
  });
  const [sortByType, setSortByType] = React.useState({
    order_by: '',
    order: '',
    sort: '',
  });

  const [userRoles, setUserRoles] = React.useState({});
  const [havePermission, setHavePermission] = React.useState({ open: false });

  React.useEffect(() => {
    if (Object.keys(userPermissions?.Payments || {})?.length > 0) {
      if (!userPermissions?.Payments?.Payment) {
        setHavePermission({
          open: true,
          back: () => {
            navigate('/dashboard');
            setHavePermission({ open: false });
          },
        });
      }
      setUserRoles({ ...userPermissions?.Payments });
    }
  }, [userPermissions]);

  React.useEffect(() => {
    if (
      Object.keys(userRoles?.Payment || {})?.length > 0 &&
      !userRoles?.['Payments History']?.view_payment_history
    ) {
      setHavePermission({
        open: true,
        back: () => {
          navigate('/payment');
          setHavePermission({ open: false });
        },
      });
    }
  }, [userRoles?.['Payments History']]);

  const onTriggerDrawer = (name) => {
    setDrawer((d) => ({ ...d, [name]: true }));
  };

  const handleBottomSheet = (name, data) => {
    setDrawer((d) => ({ ...d, [name]: false }));
    if (data) {
      setState((s) => ({ ...s, [name]: data }));
    }
  };

  const onClickVendor = (vendorId) => {
    const clickedVendor = vendorList.find((vl) => vl.id === vendorId);
    const selected = state.vendors.some((vs) => vs.id === clickedVendor.id);
    if (selected) {
      setState((ps) => {
        const pv = ps.vendors;
        return { ...ps, vendors: [...pv].filter((p) => p.id !== vendorId) };
      });
    } else {
      setState((ps) => ({ ...ps, vendors: [...ps.vendors, clickedVendor] }));
    }
  };

  const RetryPayment = async (id) => {
    enableLoading(true, 'Please wait for a moment...');
    RestApi(`organizations/${organization.orgId}/payment_orders`, {
      method: METHOD.POST,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
      payload: {
        payment_order_ids: [id],
      },
    })
      .then((res) => {
        enableLoading(false);
        if (res && !res.error) {
          if (res?.success) {
            navigate('/payment-makepayment', {
              state: { voucherId: res?.payment_voucher_id },
            });
          }
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const getVendors = async (searchVal) => {
    enableLoading(true);

    RestApi(
      `organizations/${organization.orgId}/entities?type[]=vendor&search=${
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
        if (res && !res.error) {
          res.data.map((a) => Object.assign(a, { check: false }));
          setVendorList(res.data);
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const getPaymentHistory = (pageNum) => {
    let filter = '';
    const vendorId = state && state.vendors && state.vendors.map((v) => v.id);

    if (vendorId && vendorId.length === 1) {
      filter += `vendor_id=${vendorId}`;
    } else if (vendorId && vendorId.length > 1) {
      vendorId.forEach((v) => {
        filter += `vendor_ids[]=${v}&`;
      });
    }

    if (toDate) {
      const toDataStr = moment(toDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
      filter +=
        filter === '' ? `to_date=${toDataStr}` : `&to_date=${toDataStr}`;
    }

    if (fromDate) {
      const fromDataStr = moment(fromDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
      filter +=
        filter === ''
          ? `from_date=${fromDataStr}`
          : `&from_date=${fromDataStr}`;
    }

    if (sortByType?.order_by && sortByType?.order) {
      filter +=
        filter === ''
          ? `order_by=${sortByType?.order_by}&order=${sortByType?.order}`
          : `&order_by=${sortByType?.order_by}&order=${sortByType?.order}`;
    }

    RestApi(
      `organizations/${organization.orgId}/payment_histories?${filter}&page=${
        pageNum || 1
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
        if (res && !res.error) {
          res.data.map((a) => Object.assign(a));
          setPagination({
            totalPage: res?.pages,
            currentPage: res?.page,
          });
          if (pageNum === 1 || !pageNum) {
            setPaymentHistory(res.data);
          } else {
            setPaymentHistory((p) => [...p, ...res?.data]);
          }
        }
      })
      .catch(() => {
        enableLoading(false);
      });
  };

  const loadMore = () => {
    if (
      pagination?.totalPage > 1 &&
      pagination?.totalPage > pagination?.currentPage
    ) {
      setPagination((prev) => ({
        ...prev,
        currentPage: pagination?.currentPage + 1,
      }));
    }
  };

  React.useEffect(() => {
    if (
      pagination?.totalPage > 1 &&
      pagination?.currentPage > 1 &&
      pagination?.totalPage >= pagination?.currentPage
    ) {
      getPaymentHistory(pagination?.currentPage);
    } else {
      sethasMoreItems(false);
    }
  }, [pagination?.currentPage]);

  React.useEffect(() => {
    if (pagination?.totalPage > 1) {
      sethasMoreItems(true);
    } else if (pagination?.totalPage === 1) {
      sethasMoreItems(false);
    }
  }, [pagination]);

  useEffect(() => {
    if (fromDate && toDate) {
      if (
        new Date(fromDate).setHours(0, 0, 0, 0) >
        new Date(toDate).setHours(0, 0, 0, 0)
      ) {
        setFromDate(null);
        setToDate(toDate);
      }
    }
  }, [fromDate]);

  useEffect(() => {
    if (fromDate && toDate) {
      if (
        new Date(toDate).setHours(0, 0, 0, 0) <
        new Date(fromDate).setHours(0, 0, 0, 0)
      ) {
        setFromDate(fromDate);
        setToDate(null);
      }
    }
  }, [toDate]);

  useEffect(() => {
    getVendors();
  }, []);

  useEffect(() => {
    getPaymentHistory();
  }, [
    state.vendors,
    toDate,
    fromDate,
    sortByType?.order,
    sortByType?.order_by,
  ]);

  // useEffect(() => {
  //   if (state.sort === '') getPaymentHistory();
  // }, [state.sort]);

  const onSortChange = (v) => {
    setSortByType((s) => ({
      ...s,
      sort: v?.name,
      order_by: v?.click?.order_by,
      order: v?.click?.order,
    }));
    // handleBottomSheet('sort', v);
    // if (v.id === 5) {
    //   paymentHistory.sort((a, b) =>
    //     b.beneficiary_name
    //       .toLowerCase()
    //       .localeCompare(a.beneficiary_name.toLowerCase()),
    //   );
    //   setPaymentHistory(paymentHistory);
    // } else if (v.id === 4) {
    //   paymentHistory.sort((a, b) =>
    //     a.beneficiary_name
    //       .toLowerCase()
    //       .localeCompare(b.beneficiary_name.toLowerCase()),
    //   );
    //   setPaymentHistory(paymentHistory);
    // } else if (v.id === 2) {
    //   const newData = paymentHistory.sort((a, b) => {
    //     return (a.amount || 0) - (b.amount || 0);
    //   });
    //   setPaymentHistory([...newData]);
    // } else if (v.id === 3) {
    //   const newData = paymentHistory.sort((a, b) => {
    //     return (b.amount || 0) - (a.amount || 0);
    //   });
    //   setPaymentHistory([...newData]);
    // } else if (v.id === 1) {
    //   paymentHistory.sort((a, b) => {
    //     return new Date(b.date_of_payment) - new Date(a.date_of_payment);
    //   });
    //   setPaymentHistory(paymentHistory);
    // }
  };

  // const getDetails = (id) => {
  //   enableLoading(true);
  //   RestApi(`organizations/${organization.orgId}/payment_histories/${id}`, {
  //     method: METHOD.GET,
  //     headers: {
  //       Authorization: `Bearer ${user.activeToken}`,
  //     },
  //   })
  //     .then((res) => {
  //       enableLoading(false);
  //       if (res && !res.error) {
  //         Object.assign(res, { id });
  //         if (device === 'desktop') {
  //           onTriggerDrawer('payment');
  //           setPaymentDetails(res);
  //         } else {
  //           onTriggerDrawer('payment');
  //           setPaymentDetails(res);
  //         }
  //       }
  //     })
  //     .catch(() => {
  //       enableLoading(false);
  //     });
  // };

  const defaultOptionsSuccess = {
    loop: true,
    autoplay: true,
    animationData: sucessAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  const defaultOptionsFailed = {
    loop: true,
    autoplay: true,
    animationData: failAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  const defaultOptionsProcessing = {
    loop: true,
    autoplay: true,
    animationData: processingAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <div className={css.container}>
      <div
        className={
          device === 'desktop'
            ? css.paymentHistoryContainerDesktop
            : css.paymentHistoryContainer
        }
      >
        <div className={css.headerContainer}>
          <div
            className={
              device === 'desktop' ? css.headerLabelDesktop : css.headerLabel
            }
          >
            Payment History
          </div>
          <span
            className={
              device === 'desktop'
                ? css.headerLabelDesktop
                : css.headerUnderline
            }
          />
        </div>
        <div className={css.searchContainer}>
          <div className={css.innerSearchContainer}>
            <div
              className={classes.chips}
              onClick={(e) => {
                onTriggerDrawer('date');
                setAnchorElFor({ ...anchorElFor, date: e.currentTarget });
              }}
            >
              <Chip
                label="Date"
                icon={<KeyboardArrowDown />}
                className={css.chipLabel}
              />
            </div>
            <div
              className={classes.chips}
              onClick={(e) => {
                onTriggerDrawer('vendor');
                setAnchorElFor({ ...anchorElFor, list: e.currentTarget });
              }}
            >
              <Chip
                label="Vendor"
                icon={<KeyboardArrowDown />}
                className={css.chipLabel}
              />
            </div>
          </div>
          <div
            className={classes.chips}
            onClick={(e) => {
              onTriggerDrawer('sort');
              setAnchorElFor({ ...anchorElFor, sort: e.currentTarget });
            }}
          >
            <Chip
              label="Sort"
              icon={<KeyboardArrowDown />}
              className={css.chipLabel}
            />
          </div>
        </div>
        {((state.vendors && state.vendors.length > 0) ||
          state.sort ||
          toDate ||
          fromDate ||
          sortByType?.sort) && (
          <div className={css.selectedOptions}>
            {sortByType?.sort && (
              <Chip
                className={classes.selectedchips}
                label={sortByType?.sort}
                variant="outlined"
                onDelete={() => {
                  setSortByType({
                    sort: '',
                    order: '',
                    order_by: '',
                  });
                }}
              />
            )}
            {toDate && fromDate && (
              <Chip
                className={classes.selectedchips}
                label={`${moment(fromDate, 'YYYY-MM-DD').format(
                  'MMM DD',
                )}-${moment(toDate, 'YYYY-MM-DD').format('MMM DD, YYYY')}`}
                variant="outlined"
                onDelete={() => {
                  setFromDate(null);
                  setToDate(null);
                  setWebValue({ ...webValue, fromDate: null, toDate: null });
                }}
              />
            )}
            {state.vendors &&
              state.vendors.map((a) => {
                return (
                  <Chip
                    className={classes.selectedchips}
                    label={a.name}
                    key={a.id}
                    variant="outlined"
                    onDelete={() => {
                      const newVendors = state.vendors.filter(
                        (i) => i.id !== a.id,
                      );

                      setState({ ...state, vendors: newVendors });
                    }}
                  />
                );
              })}
          </div>
        )}
      </div>
      <Mui.Stack
        className={
          device === 'desktop'
            ? css.historyInfoContainerDesktop
            : css.historyInfoContainer
        }
      >
        {paymentHistory.length === 0 && (
          <>
            <Mui.Stack alignItems="center" sx={{ maxWidth: 750 }}>
              <Mui.Typography variant="h5" color=" #6E6E6E" align="center">
                Sorry, No History Found ...
              </Mui.Typography>
            </Mui.Stack>
          </>
        )}
        {paymentHistory?.length > 0 && (
          <InfiniteScroll
            dataLength={paymentHistory?.length}
            next={() => loadMore()}
            height={
              (pagination.totalPage === 1 && 'auto') ||
              (device === 'desktop' ? '70vh' : '80vh')
            }
            scrollThreshold="20px"
            initialScrollY="100px"
            hasMore={hasMoreItems}
          >
            {paymentHistory.map((item) => {
              return device === 'desktop' ? (
                // <>
                //   <Mui.Stack
                //     className={css.mainDesktop}
                //     justifyContent="space-between"
                //     direction="row"
                //   >
                //     <Mui.Stack
                //       className={css.mainStack}
                //       direction="row"
                //       onClick={() => {
                //         // getDetails(item.id);
                //         onTriggerDrawer('payment');
                //         setPaymentDetails(item);
                //       }}
                //     >
                //       <Mui.Stack>
                //         <Mui.Typography
                //           className={css.beneficiaryName}
                //           variant="subtitle2"
                //         >
                //           {item.beneficiary_name}
                //         </Mui.Typography>
                //         <Mui.Typography className={css.source}>
                //           Paid from: {item.bank_name}
                //         </Mui.Typography>
                //         <Mui.Typography>
                //           Rs. {item?.formatted_amount}
                //         </Mui.Typography>
                //         <Mui.Typography className={css.source}>
                //           {moment(item?.date_of_payment).format('MMMM Do YYYY')}
                //         </Mui.Typography>
                //         {item.payment_status === 'success_bank' && (
                //           <p>UTR Number: {item?.bank_reference_number}</p>
                //         )}
                //         {/* <Mui.Stack
                //           direction="row"
                //           spacing={6}
                //           alignItems="center"
                //         >
                //           <Mui.Stack direction="row" spacing={1}>
                //             <>
                //               {(item?.payment_status === 'success_wallet' ||
                //                 item?.payment_status === 'success_bank') && (
                //                 <img src={CircleOk} alt="success" />
                //               )}
                //               {(item?.payment_status === 'processing' ||
                //                 item?.payment_status ===
                //                   'settlement_processing') && (
                //                 <img src={StopWatch} alt="stop" />
                //               )}
                //               {(item?.payment_status === 'failed' ||
                //                 item?.payment_status === 'failure_bank') && (
                //                 <img src={ErrorImg} alt="stop" />
                //               )}

                //               {(item?.payment_status === 'success_wallet' ||
                //                 item?.payment_status === 'success_bank') && (
                //                 <Mui.Typography color="#00A676" variant="body2">
                //                   Paid
                //                 </Mui.Typography>
                //               )}
                //               {(item?.payment_status === 'processing' ||
                //                 item?.payment_status ===
                //                   'settlement_processing') && (
                //                 <Mui.Typography color="#F08B32" variant="body2">
                //                   Processing{' '}
                //                 </Mui.Typography>
                //               )}
                //               {(item?.payment_status === 'failed' ||
                //                 item?.payment_status === 'failure_bank') && (
                //                 <Mui.Typography color="#FF0000" variant="body2">
                //                   Failed{' '}
                //                 </Mui.Typography>
                //               )}
                //             </>
                //           </Mui.Stack>
                //         </Mui.Stack> */}

                //         {/* {(item.payment_status === 'success_bank' ||
                //           item.payment_status === 'success_m2p') && (
                //           <img src={CheckIcon} alt="Done" />
                //         )}
                //         {(item.payment_status === 'failure_bank' ||
                //           item.payment_status === 'failure_m2p') && (
                //           <InfoOutlinedIcon
                //             fontSize="small"
                //             className={css.error}
                //           />
                //         )} */}
                //       </Mui.Stack>
                //     </Mui.Stack>
                //     <Mui.Stack
                //       direction="column"
                //       justifyContent="flex-end"
                //       alignItems="center"
                //       sx={{ p: '0 20px', m: '0.5rem', mb: '2rem' }}
                //       marginBottom="1rem"
                //       style={{ alignItems: 'center', justifyContent: 'center' }}
                //     >
                //       {/* <Mui.Stack direction="row" className={css.iconStack}>
                //         <img src={ShareIcon} alt="Share" />
                //         <img src={EnvelopeIcon} alt="EmailIcon" />
                //       </Mui.Stack> */}
                //       <Mui.Stack justifyContent="center" alignItems="center">
                //         <Mui.Stack
                //           direction="row"
                //           spacing={6}
                //           alignItems="center"
                //         >
                //           <Mui.Stack direction="row" spacing={1}>
                //             <>
                //               {(item?.payment_status === 'success_wallet' ||
                //                 item?.payment_status === 'success_bank') && (
                //                 <img src={CircleOk} alt="success" />
                //               )}
                //               {(item?.payment_status === 'processing' ||
                //                 item?.payment_status ===
                //                   'settlement_processing') && (
                //                 <img src={StopWatch} alt="stop" />
                //               )}
                //               {(item?.payment_status === 'failed' ||
                //                 item?.payment_status === 'failure_bank') && (
                //                 <img src={ErrorImg} alt="stop" />
                //               )}

                //               {(item?.payment_status === 'success_wallet' ||
                //                 item?.payment_status === 'success_bank') && (
                //                 <Mui.Typography color="#00A676" variant="body2">
                //                   Paid
                //                 </Mui.Typography>
                //               )}
                //               {(item?.payment_status === 'processing' ||
                //                 item?.payment_status ===
                //                   'settlement_processing') && (
                //                 <Mui.Typography color="#F08B32" variant="body2">
                //                   Processing{' '}
                //                 </Mui.Typography>
                //               )}
                //               {(item?.payment_status === 'failed' ||
                //                 item?.payment_status === 'failure_bank') && (
                //                 <Mui.Typography color="#FF0000" variant="body2">
                //                   Failed{' '}
                //                 </Mui.Typography>
                //               )}
                //             </>
                //           </Mui.Stack>
                //         </Mui.Stack>
                //         <Mui.Button
                //           className={css.btnStack}
                //           sx={{
                //             display:
                //               item?.payment_status === 'failed' ||
                //               item?.payment_status === 'failure_bank'
                //                 ? 'flex'
                //                 : 'none',
                //             mt: '5px',
                //           }}
                //           onClick={() => RetryPayment(item.id)}
                //         >
                //           Retry
                //         </Mui.Button>
                //       </Mui.Stack>
                //     </Mui.Stack>
                //   </Mui.Stack>
                // </>
                <PaymentHistoryCard
                  item={item}
                  RetryPay={RetryPayment}
                  cardClick={(val) => {
                    onTriggerDrawer('payment');
                    setPaymentDetails(val);
                  }}
                  userRoles={userRoles}
                  setHavePermission={setHavePermission}
                />
              ) : (
                // <>
                //   <div
                //     className={css.main}
                //     onClick={() => {
                //       // getDetails(item.id)
                //       // setItemId(item?.id);
                //       onTriggerDrawer('payment');
                //       setPaymentDetails(item);
                //     }}
                //   >
                //     <div className={css.partOne}>
                //       <div>
                //         <p>{item.beneficiary_name}</p>
                //         {/* {(item.payment_status === 'success_bank' ||
                //           item.payment_status === 'success_m2p') && (
                //           <img src={CheckIcon} alt="Done" />
                //         )}
                //         {(item.payment_status === 'failure_bank' ||
                //           item.payment_status === 'failure_m2p') && (
                //           <InfoOutlinedIcon
                //             fontSize="small"
                //             className={css.error}
                //           />
                //         )} */}
                //       </div>
                //       <p className={css.source}>Paid from: {item.bank_name}</p>
                //       <Mui.Stack direction="row" spacing={1} alignItems="center">
                //         <Mui.Typography className={css.source}>
                //           {moment(item?.date_of_payment).format('MMMM Do YYYY')}
                //         </Mui.Typography>
                //         {/* {item.payment_status === 'success_bank' && (
                //         <p>UTR Number: {item?.bank_reference_number}</p>
                //       )} */}
                //         <Mui.Stack>
                //           <Mui.Button
                //             className={css.mobileBtnStack}
                //             sx={{
                //               display:
                //                 item?.payment_status === 'failed' ||
                //                 item?.payment_status === 'failure_bank'
                //                   ? 'flex'
                //                   : 'none',
                //             }}
                //             onClick={() => RetryPayment(item.id)}
                //           >
                //             Retry
                //           </Mui.Button>
                //         </Mui.Stack>
                //       </Mui.Stack>
                //       {item.payment_status === 'success_bank' && (
                //         <p>UTR Number: {item?.bank_reference_number}</p>
                //       )}
                //     </div>
                //     <div className={css.partTwo}>
                //       <div className={css.statusPart}>
                //         <>
                //           {(item?.payment_status === 'success_wallet' ||
                //             item?.payment_status === 'success_bank') && (
                //             <img src={CircleOk} alt="success" />
                //           )}
                //           {(item?.payment_status === 'processing' ||
                //             item?.payment_status === 'settlement_processing') && (
                //             <img src={StopWatch} alt="stop" />
                //           )}
                //           {item?.payment_status === 'failed' ||
                //             (item?.payment_status === 'failure_bank' && (
                //               <img src={ErrorImg} alt="stop" />
                //             ))}

                //           {(item?.payment_status === 'success_wallet' ||
                //             item?.payment_status === 'success_bank') && (
                //             <Mui.Typography color="#00A676" variant="body2">
                //               Paid
                //             </Mui.Typography>
                //           )}
                //           {(item?.payment_status === 'processing' ||
                //             item?.payment_status === 'settlement_processing') && (
                //             <Mui.Typography color="#F08B32" variant="body2">
                //               Processing{' '}
                //             </Mui.Typography>
                //           )}
                //           {item?.payment_status === 'failed' ||
                //             (item?.payment_status === 'failure_bank' && (
                //               <Mui.Typography color="#FF0000" variant="body2">
                //                 Failed{' '}
                //               </Mui.Typography>
                //             ))}
                //         </>
                //       </div>
                //       <span>Rs. {item?.formatted_amount}</span>

                //       {/* <img src={ShareIcon} alt="Share" />
                //       <img src={EnvelopeIcon} alt="EmailIcon" /> */}
                //     </div>
                //   </div>
                // </>
                <PaymentHistoryCardMobile
                  item={item}
                  RetryPay={RetryPayment}
                  cardClick={(val) => {
                    onTriggerDrawer('payment');
                    setPaymentDetails(val);
                  }}
                  userRoles={userRoles}
                  setHavePermission={setHavePermission}
                />
              );
            })}
          </InfiniteScroll>
        )}
      </Mui.Stack>
      {device === 'mobile' ? (
        <SelectBottomSheet
          triggerComponent
          open={drawer.date}
          name="date"
          onClose={handleBottomSheet}
          addNewSheet
        >
          {showFromDate ? (
            <Calander
              button="Next"
              head="Choose Starting Date"
              handleDate={(date) => {
                setFromDate(moment(date).format('YYYY-MM-DD'));
                setShowFromDate(false);
              }}
            />
          ) : (
            <Calander
              button="Done"
              head="Choose Ending Date"
              handleDate={(date) => {
                setToDate(moment(date).format('YYYY-MM-DD'));
                handleBottomSheet('date');
                setShowFromDate(true);
              }}
            />
          )}
        </SelectBottomSheet>
      ) : (
        <Mui.Popover
          id="basic-menu-list"
          anchorEl={anchorElFor.date}
          open={Boolean(anchorElFor.date)}
          onClose={() => {
            setAnchorElFor({ ...anchorElFor, date: null });
          }}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
          PaperProps={{
            elevation: 3,
            style: {
              maxHeight: 500,
              width: '35ch',
              padding: '5px',
              overflow: 'hidden',
              borderRadius: 20,
            },
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <div className={css.paddingCal}>
            <span>Select the start and end date to filter</span>
            <hr className={css.forline} />

            <div className={css.card}>
              <div className={css.innerCard}>
                <div className={css.startDate}>Start Date</div>

                <div className={css.inputCalander}>
                  <input
                    type="text"
                    value={
                      webValue.fromDate === null
                        ? 'dd-mm-yyyy'
                        : moment(webValue.fromDate, 'YYYY-MM-DD').format(
                            'DD-MM-YYYY',
                          )
                    }
                    className={css.inputValues}
                    // onChange={(e) => {
                    // setWebValue({
                    //   fromDate: e.target.value,
                    //   toDate: toDate,
                    //   customerID: null,
                    //   orderBy: null,
                    // });
                    // }}
                  />
                  <OnlyDatePicker
                    selectedDate={webValue.fromDate}
                    onChange={(date) => {
                      setWebValue({
                        ...webValue,
                        fromDate: moment(date).format('YYYY-MM-DD'),
                      });
                    }}
                  />
                </div>
              </div>

              <div className={css.innerCard}>
                <div className={css.startDate}>End Date</div>

                <div className={css.inputCalander}>
                  <input
                    type="text"
                    className={css.inputValues}
                    value={
                      webValue.toDate === null
                        ? 'dd-mm-yyyy'
                        : moment(webValue.toDate, 'YYYY-MM-DD').format(
                            'DD-MM-YYYY',
                          )
                    }
                  />
                  <OnlyDatePicker
                    selectedDate={webValue.toDate}
                    onChange={(date) => {
                      setWebValue({
                        ...webValue,
                        toDate: moment(date).format('YYYY-MM-DD'),
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <Mui.Button
              contained
              style={{
                backgroundColor: '#F08B32',
                color: '#fff',
                margin: '20px 25%',
                width: '50%',
                borderRadius: 25,
              }}
              disabled={!webValue.fromDate || !webValue.toDate}
              onClick={() => {
                setFromDate(webValue?.fromDate);
                setToDate(webValue?.toDate);
                setAnchorElFor({ ...anchorElFor, date: null });
                handleBottomSheet('date');
              }}
            >
              Apply Filters
            </Mui.Button>
          </div>
        </Mui.Popover>
      )}
      {device === 'mobile' ? (
        <SelectBottomSheet
          triggerComponent
          open={drawer.vendor}
          name="vendor"
          onClose={() => {
            handleBottomSheet('vendor');
            getVendors();
          }}
          multiple
          // addNewSheet
          id="overFlowHidden"
        >
          <VendorList
            vendorList={vendorList}
            selected={state.vendors.map((v) => v.id)}
            disableAdd
            onClick={(v) => onClickVendor(v.id)}
            hideDoNotTrack
            callFunction={getVendors}
          />
        </SelectBottomSheet>
      ) : (
        <Mui.Popover
          id="basic-menu-list"
          anchorEl={anchorElFor.list}
          open={Boolean(anchorElFor.list)}
          onClose={() => {
            setAnchorElFor({ ...anchorElFor, list: null });
            getVendors();
          }}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
          PaperProps={{
            elevation: 3,
            style: {
              maxHeight: 500,
              width: '35ch',
              padding: '5px',
              overflow: 'hidden',
              borderRadius: 20,
            },
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <div style={{ margin: '10px 25px' }}>
            <span>Select Vendor</span>
            <hr className={css.forline} />
          </div>
          <VendorList
            vendorList={vendorList}
            selected={state.vendors.map((v) => v.id)}
            disableAdd
            onClick={(v) => onClickVendor(v.id)}
            hideDoNotTrack
            popOverScroll
            callFunction={getVendors}
          />
        </Mui.Popover>
      )}
      {device === 'mobile' ? (
        <SelectBottomSheet
          triggerComponent
          open={drawer.sort}
          name="sort"
          onClose={handleBottomSheet}
          addNewSheet
        >
          <div className={css.list}>
            {sortOptions.map((v) => (
              <div
                className={css.categoryOptions}
                onClick={() => onSortChange(v)}
                key={v.id}
                role="menuitem"
              >
                {v.name}
              </div>
            ))}
          </div>
        </SelectBottomSheet>
      ) : (
        <Mui.Popover
          id="basic-menu-list"
          anchorEl={anchorElFor.sort}
          open={Boolean(anchorElFor.sort)}
          onClose={() => {
            setAnchorElFor({ ...anchorElFor, sort: null });
          }}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
          PaperProps={{
            elevation: 3,
            style: {
              maxHeight: 500,
              width: '35ch',
              padding: '5px',
              overflow: 'hidden',
              borderRadius: 20,
            },
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <div className={css.list}>
            <div style={{ margin: '10px 25px' }}>
              <span>Sort by</span>
              <hr className={css.forline} />
            </div>
            <ul
              className={css.optionsWrapper}
              style={{ listStyleType: 'none' }}
            >
              {sortOptions.map((e) => (
                <li className={css.items} aria-hidden="true">
                  <Mui.RadioGroup
                    value={webValue.orderBy}
                    onChange={(event) => {
                      setWebValue({ ...webValue, orderBy: event.target.value });
                    }}
                  >
                    <Mui.FormControlLabel
                      value={e.name}
                      control={<Mui.Radio style={{ color: '#F08B32' }} />}
                      label={e.name}
                    />
                  </Mui.RadioGroup>
                </li>
              ))}
            </ul>
            <Mui.Button
              contained
              style={{
                backgroundColor: '#F08B32',
                color: '#fff',
                margin: '20px 25%',
                width: '50%',
                borderRadius: 25,
              }}
              onClick={() => {
                onSortChange(
                  sortOptions.find((data) => data.name === webValue?.orderBy),
                );
                setAnchorElFor({ ...anchorElFor, sort: null });
              }}
            >
              Apply Filters
            </Mui.Button>
          </div>
        </Mui.Popover>
      )}
      {device === 'desktop' ? (
        <Mui.Dialog
          triggerComponent
          open={drawer.payment}
          name="payment"
          onClose={() => setDrawer((prev) => ({ ...prev, payment: false }))}
          PaperProps={{
            elevation: 0,
            style: {
              border: 18,
              minWidth: '32%',
            },
          }}
        >
          {/* <div className={css.paymentHistoryDetail}>
            <div className={`${css.headerContainer} `}>
              <div className={css.headerLabel}>View Details</div>
              <span className={css.headerUnderline} />
            </div>

            <div className={`${css.detailsContainer} `}>
              <p className={css.amount}>{paymentDetails?.beneficiary_name}</p>
              <p
                className={css.amount}
              >{`Rs. ${(+paymentDetails?.amount) 'en-IN')}`}</p>
            </div>

            <>
              {(paymentDetails?.payment_status === 'success_wallet' ||
                paymentDetails?.payment_status === 'success_bank') && (
                <div className={css.tickImg}>
                  <Lottie options={defaultOptionsSuccess} />
                </div>
              )}
              {(paymentDetails?.payment_status === 'processing' ||
                paymentDetails?.payment_status === 'settlement_processing') && (
                <div className={css.tickImg}>
                  <Lottie options={defaultOptionsProcessing} />
                </div>
              )}
              {paymentDetails?.payment_status === 'failed' ||
                (paymentDetails?.payment_status === 'failure_bank' && (
                  <div className={css.tickImg}>
                    <Lottie options={defaultOptionsFailed} />
                  </div>
                ))}
            </>
            <div className={css.contentBody}>
              <div className={css.contentBodyDetails}>
                <p>Bank Account</p>
                <p>
                  {paymentDetails?.beneficiary_bank_name} -{' '}
                  {paymentDetails?.beneficiary_account_number}
                </p>
              </div>
              {paymentDetails?.bank_reference_number && (
                <div className={css.contentBodyDetails}>
                  <p>Transaction Number</p>
                  <p>{paymentDetails?.bank_reference_number}</p>
                </div>
              )}
            </div>
          </div> */}
          <PaymentDetilsShow
            paymentDetails={paymentDetails}
            defaultOptionsSuccess={defaultOptionsSuccess}
            defaultOptionsProcessing={defaultOptionsProcessing}
            defaultOptionsFailed={defaultOptionsFailed}
            handleClose={() =>
              setDrawer((prev) => ({ ...prev, payment: false }))
            }
          />
        </Mui.Dialog>
      ) : (
        <SelectBottomSheet
          triggerComponent
          open={drawer.payment}
          name="payment"
          onClose={handleBottomSheet}
          addNewSheet
        >
          {/* <div className={css.paymentHistoryDetail}>
            <div className={`${css.headerContainer} `}>
              <div className={css.headerLabel}>View Details</div>
              <span className={css.headerUnderline} />
            </div>

            <div className={`${css.detailsContainer} `}>
              <p className={css.amount}>{paymentDetails?.beneficiary_name}</p>
              <p
                className={css.amount}
              >{`Rs. ${(+paymentDetails?.amount) 'en-IN')}`}</p>
            </div>

            <>
              {(paymentDetails?.payment_status === 'success_wallet' ||
                paymentDetails?.payment_status === 'success_bank') && (
                <div className={css.tickImg}>
                  <Lottie options={defaultOptionsSuccess} />
                </div>
              )}
              {(paymentDetails?.payment_status === 'processing' ||
                paymentDetails?.payment_status === 'settlement_processing') && (
                <div className={css.tickImg}>
                  <Lottie options={defaultOptionsProcessing} />
                </div>
              )}
              {paymentDetails?.payment_status === 'failed' ||
                (paymentDetails?.payment_status === 'failure_bank' && (
                  <div className={css.tickImg}>
                    <Lottie options={defaultOptionsFailed} />
                  </div>
                ))}
            </>
            <div className={css.contentBody}>
              <div className={css.contentBodyDetails}>
                <p>Bank Account</p>
                <p>
                  {paymentDetails?.beneficiary_bank_name} -{' '}
                  {paymentDetails?.beneficiary_account_number}
                </p>
              </div>
              {paymentDetails?.bank_reference_number && (
                <div className={css.contentBodyDetails}>
                  <p>Transaction Number</p>
                  <p>{paymentDetails?.bank_reference_number}</p>
                </div>
              )}
            </div>
          </div> */}
          <PaymentDetilsShow
            paymentDetails={paymentDetails}
            defaultOptionsSuccess={defaultOptionsSuccess}
            defaultOptionsProcessing={defaultOptionsProcessing}
            defaultOptionsFailed={defaultOptionsFailed}
            handleClose={() =>
              setDrawer((prev) => ({ ...prev, payment: false }))
            }
          />
        </SelectBottomSheet>
      )}
      {havePermission.open && (
        <PermissionDialog onClose={() => havePermission.back()} />
      )}
    </div>
  );
};

export default PaymentHistory;

const PaymentHistoryCard = (props) => {
  const { item, RetryPay, cardClick, userRoles, setHavePermission } = props;
  return (
    <div className={css.PaymentDiv}>
      <div className={css.leftDiv} onClick={() => cardClick(item)}>
        <div className={css.headConatin}>
          <p className={css.headName}>{item?.beneficiary_name}</p>
          <p className={css.headDate}>
            {moment(item?.date_of_payment, 'YYYY-MM-DD').format('MMM DD, YYYY')}
          </p>
        </div>
        <div className={css.secondConatin}>
          <div className={css.secondConatinSub}>
            <p className={css.key}>
              {item?.payment_status === 'failed' ||
              item?.payment_status === 'failure_bank'
                ? 'Attempt from'
                : 'Paid From'}
            </p>
            <p className={css.value}>{item?.bank_name}</p>
          </div>
          <div className={css.secondConatinSub}>
            <p className={css.key}>
              {item?.payment_status === 'failed' ||
              item?.payment_status === 'failure_bank'
                ? 'Attempt By'
                : 'Paid By'}
            </p>
            <p className={css.value}>{item?.payer_name}</p>
          </div>
          {(item?.payment_status === 'success_wallet' ||
            item.payment_status === 'success_bank') &&
            item?.bank_reference_number && (
              <div className={css.secondConatinSub}>
                <p className={css.key}>UTR Number:</p>
                <p className={css.value}>{item?.bank_reference_number}</p>
              </div>
            )}
        </div>
      </div>
      <div
        className={css.rightDiv}
        onClick={() => {
          if (
            item?.payment_status === 'success_wallet' ||
            item?.payment_status === 'success_bank' ||
            item?.payment_status === 'processing' ||
            item?.payment_status === 'settlement_processing'
          ) {
            cardClick(item);
          }
        }}
      >
        <div className={css.rightContain} onClick={() => cardClick(item)}>
          <p className={css.rightAmt}>Rs. {item?.formatted_amount}</p>
          {(item?.payment_status === 'success_wallet' ||
            item?.payment_status === 'success_bank') && (
            <div className={css.statusDiv}>
              <img src={CircleOk} alt="success" />
              <p className={css.statusText} style={{ color: '#00A676' }}>
                Paid
              </p>
            </div>
          )}
          {(item?.payment_status === 'processing' ||
            item?.payment_status === 'settlement_processing') && (
            <div className={css.statusDiv}>
              <img src={StopWatch} alt="process" />
              <p className={css.statusText} style={{ color: '#F08B32' }}>
                Processing
              </p>
            </div>
          )}
          {(item?.payment_status === 'failed' ||
            item?.payment_status === 'failure_bank') && (
            <div className={css.statusDiv}>
              <img src={ErrorImg} alt="stop" />
              <p className={css.statusText} style={{ color: '#FF0000' }}>
                Failed
              </p>
            </div>
          )}
        </div>
        {(item?.payment_status === 'failed' ||
          item?.payment_status === 'failure_bank') && (
          <Mui.Button
            sx={{
              mt: '5px',
            }}
            onClick={() => {
              if (!userRoles['Payments History']?.create_payment_history) {
                setHavePermission({
                  open: true,
                  back: () => {
                    setHavePermission({ open: false });
                  },
                });
                return;
              }

              RetryPay(item.id);
            }}
            className={css.retryButton}
          >
            Retry
          </Mui.Button>
        )}
      </div>
    </div>
  );
};

const PaymentHistoryCardMobile = (props) => {
  const { item, RetryPay, cardClick, userRoles, setHavePermission } = props;
  return (
    <div className={css.PaymentDivMobile}>
      <div className={css.rightDiv} onClick={() => cardClick(item)}>
        <div className={css.rightContain}>
          <div className={css.section1}>
            {(item?.payment_status === 'success_wallet' ||
              item?.payment_status === 'success_bank') && (
              <div className={css.statusDiv}>
                <img src={CircleOk} alt="success" />
                <p className={css.statusText} style={{ color: '#00A676' }}>
                  Paid
                </p>
              </div>
            )}
            {(item?.payment_status === 'processing' ||
              item?.payment_status === 'settlement_processing') && (
              <div className={css.statusDiv}>
                <img src={StopWatch} alt="process" />
                <p className={css.statusText} style={{ color: '#F08B32' }}>
                  Processing
                </p>
              </div>
            )}
            {(item?.payment_status === 'failed' ||
              item?.payment_status === 'failure_bank') && (
              <div className={css.statusDiv}>
                <img src={ErrorImg} alt="stop" />
                <p className={css.statusText} style={{ color: '#FF0000' }}>
                  Failed
                </p>
              </div>
            )}

            <p className={css.headDate}>
              {moment(item?.date_of_payment, 'YYYY-MM-DD').format(
                'MMM DD, YYYY',
              )}
            </p>
          </div>

          <p className={css.rightAmt}>Rs. {item?.formatted_amount}</p>
        </div>
      </div>
      <div className={css.leftDiv} onClick={() => cardClick(item)}>
        <div className={css.headConatin}>
          <p className={css.headName}>{item?.beneficiary_name}</p>
          {/* <p className={css.headDate}>
            {moment(item?.date_of_payment).format('MMM DD, YYYY')}
          </p> */}
        </div>
        <div className={css.secondConatin}>
          <div className={css.secondConatinSub}>
            <p className={css.key}>
              {' '}
              {item?.payment_status === 'failed' ||
              item?.payment_status === 'failure_bank'
                ? 'Attempt from'
                : 'Paid From'}
            </p>
            <p className={css.value}>{item?.bank_name}</p>
          </div>
          <div className={css.secondConatinSub}>
            <p className={css.key}>
              {item?.payment_status === 'failed' ||
              item?.payment_status === 'failure_bank'
                ? 'Attempt By'
                : 'Paid By'}
            </p>
            <p className={css.value}>{item?.payer_name}</p>
          </div>
          {(item?.payment_status === 'success_wallet' ||
            item.payment_status === 'success_bank') &&
            item?.bank_reference_number && (
              <div className={css.secondConatinSub}>
                <p className={css.key}>UTR Number:</p>
                <p className={css.value}>{item?.bank_reference_number}</p>
              </div>
            )}
          {(item?.payment_status === 'failed' ||
            item?.payment_status === 'failure_bank') && (
            <Mui.Button
              sx={{
                display:
                  item?.payment_status === 'failed' ||
                  item?.payment_status === 'failure_bank'
                    ? 'flex'
                    : 'none',
                mt: '5px',
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!userRoles['Payments History']?.create_payment_history) {
                  setHavePermission({
                    open: true,
                    back: () => {
                      setHavePermission({ open: false });
                    },
                  });
                  return;
                }
                RetryPay(item.id);
              }}
              className={css.retryButton}
            >
              Retry
            </Mui.Button>
          )}
        </div>
      </div>
    </div>
  );
};

const PaymentDetilsShow = (props) => {
  const {
    paymentDetails,
    defaultOptionsSuccess,
    defaultOptionsProcessing,
    defaultOptionsFailed,
    handleClose,
  } = props;
  const device = localStorage.getItem('device_detect');
  return (
    <div className={css.paymentHistoryDetail}>
      <div className={`${css.headerContainer} ${css.headerWithClose}`}>
        <div>
          <div className={css.headerLabel}>View Details</div>
          <span className={css.headerUnderline} />
        </div>
        <Mui.IconButton onClick={() => handleClose()}>
          <CloseIcon />
        </Mui.IconButton>
      </div>

      <div className={`${css.detailsContainer} `}>
        <p className={device === 'mobile' ? css.dialogHeadMob : css.dialogHead}>
          {paymentDetails?.beneficiary_name}
        </p>
        <p className={device === 'mobile' ? css.dialogAmtMob : css.dialogAmt}>
          {FormattedAmount(paymentDetails?.amount)}
        </p>
      </div>

      <>
        {(paymentDetails?.payment_status === 'success_wallet' ||
          paymentDetails?.payment_status === 'success_bank') && (
          <div className={css.tickImg}>
            <Lottie options={defaultOptionsSuccess} />
          </div>
        )}
        {(paymentDetails?.payment_status === 'processing' ||
          paymentDetails?.payment_status === 'settlement_processing') && (
          <div className={css.tickImg}>
            <Lottie options={defaultOptionsProcessing} />
          </div>
        )}
        {paymentDetails?.payment_status === 'failed' ||
          (paymentDetails?.payment_status === 'failure_bank' && (
            <div className={css.tickImg}>
              <Lottie options={defaultOptionsFailed} />
            </div>
          ))}
      </>
      <p className={css.dialogDate}>
        {moment(paymentDetails?.date_of_payment, 'YYYY-MM-DD').format(
          'MMM DD, YYYY',
        )}
      </p>
      <div className={css.contentBody}>
        <div
          className={
            device === 'mobile' ? css.secondConatinSubMob : css.secondConatinSub
          }
        >
          <p className={css.key}>Paid From</p>
          <p className={css.value}>- {paymentDetails?.bank_name}</p>
        </div>
        <div
          className={
            device === 'mobile' ? css.secondConatinSubMob : css.secondConatinSub
          }
        >
          <p className={css.key}>Paid By</p>
          <p className={css.value}>- {paymentDetails?.payer_name}</p>
        </div>
        <div
          className={
            device === 'mobile' ? css.secondConatinSubMob : css.secondConatinSub
          }
        >
          <p className={css.key}>Bank Name</p>
          <p className={css.value}>- {paymentDetails?.beneficiary_bank_name}</p>
        </div>
        {paymentDetails?.bank_reference_number && (
          <div
            className={
              device === 'mobile'
                ? css.secondConatinSubMob
                : css.secondConatinSub
            }
          >
            <p className={css.key}>Transaction Number</p>
            <p className={css.value}>
              - {paymentDetails?.bank_reference_number}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
