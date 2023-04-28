/* @flow */
/**
 * @fileoverview  Recurring Invoice Container
 */

import React, { useState, useEffect, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import * as Mui from '@mui/material';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import DialogContainer from '@components/DialogContainer/DialogContainer.jsx';
import {
  DataGridPro,
  // GridFilterPanel,
  GridColumnMenuContainer,
  SortGridMenuItems,
  // HideGridColMenuItem,
  // GridColumnsMenuItem,
  GridFilterMenuItem,
  // GridToolbar,
  // GridToolbarContainer,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarQuickFilter,
  // GridToolbarDensitySelector,
} from '@mui/x-data-grid-pro';
import { PermissionDialog } from '@components/Permissions/PermissionDialog.jsx';
import moment from 'moment';
import { FormattedAmount } from '@components/formattedValue/FormattedValue';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer.jsx';
// import { makeStyles } from '@material-ui/core/styles';
import AppContext from '@root/AppContext.jsx';
import upload from '@assets/fileupload.svg';
import * as Router from 'react-router-dom';
// import sort from '../../assets/sort.svg';
import css from './CreateInvoiceContainer.scss';

export function CustomColumnMenu(props) {
  const { hideMenu, currentColumn, color, ...other } = props;

  return (
    <GridColumnMenuContainer
      hideMenu={hideMenu}
      currentColumn={currentColumn}
      {...other}
    >
      <SortGridMenuItems onClick={hideMenu} column={currentColumn} />
      <GridFilterMenuItem onClick={hideMenu} column={currentColumn} />
      {/* <HideGridColMenuItem onClick={hideMenu} column={currentColumn} /> */}
      {/* <GridColumnsMenuItem onClick={hideMenu} column={currentColumn} /> */}
    </GridColumnMenuContainer>
  );
}

const useStyles = makeStyles(() => ({
  headingRecurring: {
    fontWeight: '500',
    fontSize: '13px',
    lineHeight: '15px',
    display: 'flex',
    alignItems: 'center',
    color: '#283049',
    paddingBottom: '5px',
  },
  divider: {
    borderRadius: '8px',
    width: '16px',
    height: '3px',
    backgroundColor: '#F08B32',
  },
  cardItem: {},

  name: {
    paddingBottom: '18px',
    fontWeight: '700',
    fontSize: '14px',
    lineHeight: '18px',
    color: '#2E3A59',
    whiteSpace: 'nowrap',
    width: '40vw',
    textOverflow: 'ellipsis',
    textTransform: 'capitalize',
    overflow: 'hidden',
  },
  contentAndDate: {
    textAlign: 'justify',
    fontWeight: '400',
    fontSize: '12px',
    lineHeight: '15px',
    color: '#000000',
    marginBottom: '18px',
  },
  amount: {
    fontWeight: '700',
    fontSize: '13px',
    lineHeight: '16px',
    color: '#000000',
    whiteSpace: 'nowrap',
    marginLeft: '4%',
    marginRight: '3%',
    marginTop: '2px',
  },
}));

const RecurringInvoiceContainer = () => {
  const classes = useStyles();
  const device = localStorage.getItem('device_detect');
  const {
    organization,
    user,
    enableLoading,
    openSnackBar,
    changeSubView,
    setActiveInvoiceId,
    // loading,
    userPermissions,
  } = useContext(AppContext);

  const [openSummary, setOpenSummary] = useState(false);
  const [activeItem, setActiveItem] = useState({});
  const [draftInvoice, setDraftInvoice] = useState([]);
  // const [draftInvoiceDesktop, setDraftInvoiceDesktop] = useState({});
  const navigate = Router.useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [customerID, setCustomerID] = React.useState([]);
  // const [query, setQuery] = useState('');
  const [pagination, setPagination] = React.useState({
    currentPage: 1,
    totalPage: 1,
  });

  const [userRoles, setUserRoles] = React.useState({});
  const [havePermission, setHavePermission] = React.useState({ open: false });

  React.useEffect(() => {
    if (Object.keys(userPermissions?.Invoicing || {})?.length > 0) {
      if (!userPermissions?.Invoicing?.Invoicing) {
        setHavePermission({
          open: true,
          back: () => {
            navigate('/dashboard');
            setHavePermission({ open: false });
          },
        });
      }
      setUserRoles({ ...userPermissions?.Invoicing });
    }
  }, [userPermissions]);

  // eslint-disable-next-line no-unused-vars
  const onOpenSummary = (item) => {
    setActiveItem(item);
    setOpenSummary(true);
  };

  const onCloseSummary = () => {
    setOpenSummary(false);
  };

  const fetchDraftInvoice = (numPage) => {
    let filter = '';
    if (customerID && customerID.length === 1) {
      filter += `customer_id=${customerID || ''}`;
    } else if (customerID && customerID.length > 1) {
      customerID.forEach((v) => {
        filter += `customer_ids[]=${v}&`;
      });
    }
    // enableLoading(true);
    RestApi(
      `organizations/${organization.orgId}/customer_agreements?${
        filter || ''
      }&page=${numPage || 1}`,
      {
        method: METHOD.GET,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
      },
    )
      .then((res) => {
        if (res && !res.error) {
          if (res?.data) {
            setPagination({ currentPage: res?.page, totalPage: res?.pages });
            if (numPage > 1) {
              setDraftInvoice((prev) => [...prev, ...res?.data]);
            } else {
              setDraftInvoice(res.data.map((c) => c));
            }
          } else if (res.message) {
            openSnackBar({
              message: res.message || 'Unknown error occured',
              type: MESSAGE_TYPE.ERROR,
            });
          }
        } else {
          openSnackBar({
            message: res.message || 'Unknown error occured',
            type: MESSAGE_TYPE.ERROR,
          });
        }
        enableLoading(false);
      })
      .catch((res) => {
        openSnackBar({
          message: res.message || 'Unknown error occured',
          type: MESSAGE_TYPE.ERROR,
        });
      });
  };

  React.useEffect(() => {
    if (pagination.totalPage > 1) {
      if (pagination?.currentPage < pagination?.totalPage) {
        setTimeout(() => {
          fetchDraftInvoice(pagination?.currentPage + 1);
        }, 1000);
      }
    }
  }, [pagination.totalPage, pagination.currentPage]);
  const deleteInvoice = (id) => {
    RestApi(`organizations/${organization.orgId}/customer_agreements/${id}`, {
      method: METHOD.DELETE,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    }).then((res) => {
      fetchDraftInvoice();
      if (res && !res.error) {
        openSnackBar({
          message: 'Recurring invoice deleted Successfully',
          type: MESSAGE_TYPE.INFO,
        });
        setOpenSummary(false);
      }
    });
  };

  // eslint-disable-next-line no-unused-vars
  const editInvoice = (id) => {
    changeSubView('invoiceCreateViewBeta');
    setActiveInvoiceId({
      activeInvoiceId: id,
      activeInvoiceSubject: 'customer_agreements',
    });
  };

  useEffect(() => {
    fetchDraftInvoice();
  }, [customerID]);

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: 'white',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    // color: theme.palette.text.secondary,
    boxSizing: 'border-box',
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: 'None',
  }));

  const summaryContent = () => {
    return (
      <div className={css.summaryContainer}>
        <div className={css.summaryInfo}>
          <span className={css.label}>Customer Name</span>
          <span className={css.value}>{activeItem.customer_name}</span>
        </div>
        <div className={css.summaryInfo}>
          <span className={css.label}>Start Date</span>
          <span className={css.value}>{activeItem.start_date}</span>
        </div>
        <div className={css.summaryInfo}>
          <span className={css.label}>End Date</span>
          <span className={css.value}>{activeItem.end_date}</span>
        </div>
        <div className={css.summaryInfo}>
          <span className={css.label}>Every Month</span>
          <span className={css.value}>{activeItem.day_of_creation}</span>
        </div>
        <div className={css.summaryInfo}>
          <span className={css.label}>Amount</span>
          <span className={css.value}>{activeItem.total_amount}</span>
        </div>
        <Grid
          container
          spacing={3}
          alignItems="center"
          className={css.approveInvoiceForm}
        >
          <Grid item xs={6}>
            <Button
              variant="contained"
              className={css.submitButton}
              fullWidth
              onClick={() => {}}
            >
              Follow up
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="contained"
              className={css.submitButton}
              fullWidth
              onClick={() => {
                deleteInvoice(activeItem.id);
              }}
            >
              Remove Recurring
            </Button>
          </Grid>
        </Grid>
      </div>
    );
  };
  const handleRowSelection = (c) => {
    if (!userRoles?.['Recurring Invoice']?.view_recurring_invoices) {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
      return;
    }
    navigate('/invoice-recurring-view', {
      state: { id: c.id, recurringAccess: userRoles?.['Recurring Invoice'] },
    });
  };

  const upcomingInvoice = (dayOfCreation) => {
    if (Number(dayOfCreation) > new Date().getDate()) {
      return `${moment(
        new Date(
          `${dayOfCreation}/${moment().format('MMM')}/${moment().format(
            'YYYY',
          )}`,
        ),
      ).format('MMM DD')}`;
    }
    if (Number(dayOfCreation) <= new Date().getDate()) {
      return `${moment(
        new Date(
          `${dayOfCreation}/${moment().format('MMM')}/${moment().format(
            'YYYY',
          )}`,
        ),
      )
        .add(1, 'months')
        .format('MMM DD')}`;
    }
    return '-';
  };

  const recurringColumn = [
    {
      field: 'code',
      headerName: 'Agreement Code',
      flex: 1,
      renderCell: (params) => {
        return (
          <div
            onClick={() => {
              // setEditSingle(params.row);
              handleRowSelection(params.row);
            }}
          >
            <p
              style={{
                whiteSpace: 'break-spaces',
                textTransform: 'capitalize',
              }}
            >
              {params.row?.code || '-'}
            </p>
          </div>
        );
      },
      maxWidth: 150,
      width: 130,
      sortable: false,
    },
    {
      field: 'customer_name',
      headerName: 'Customer',
      flex: 1,
      renderCell: (params) => {
        return (
          <div
            onClick={() => {
              // setEditSingle(params.row);
              handleRowSelection(params.row);
            }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Mui.Avatar
              className={css.avatar}
              src={`https://avatars.dicebear.com/api/initials/${params.row?.customer_name}.svg?chars=1`}
            />{' '}
            <p style={{ whiteSpace: 'break-spaces' }}>
              {params.row?.customer_name}
            </p>
          </div>
        );
      },
      // maxWidth: 360,
      minWidth: 250,
      // width: 350,
    },
    {
      field: 'start_date',
      headerName: 'Start Date',
      type: 'date',
      renderCell: (params) => {
        return (
          <div
            onClick={() => {
              // setEditSingle(params.row);
              handleRowSelection(params.row);
            }}
          >
            <p style={{ whiteSpace: 'break-spaces' }}>
              {moment(params.row?.start_date).format('DD-MM-YYYY')}
            </p>
          </div>
        );
      },
      maxWidth: 100,
    },
    {
      field: 'total_amount',
      headerName: 'Invoice Value',
      headerClassName: 'left-align--header',
      type: 'number',
      flex: 1,
      renderCell: (params) => {
        return (
          <div
            onClick={() => {
              // setEditSingle(params.row);
              handleRowSelection(params.row);
            }}
          >
            <p style={{ whiteSpace: 'nowrap' }}>
              {FormattedAmount(params.row?.total_amount)}
            </p>
          </div>
        );
      },
      maxWidth: 150,
      width: 120,
      align: 'right',
    },
    {
      field: 'day_of_creation',
      headerName: 'Created On',
      type: 'date',
      flex: 1,
      renderCell: (params) => {
        return (
          <div
            onClick={() => {
              // setEditSingle(params.row);
              handleRowSelection(params.row);
            }}
          >
            <p style={{ whiteSpace: 'break-spaces' }}>
              {/* {moment(params.row?.day_of_creation).format('DD-MM-yyyy')} */}
              {upcomingInvoice(params.row?.day_of_creation)}
            </p>
          </div>
        );
      },
      maxWidth: 100,
      align: 'center',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => {
        return (
          <div
            onClick={() => {
              // setEditSingle(params.row);
              handleRowSelection(params.row);
            }}
          >
            <p style={{ whiteSpace: 'break-spaces' }}>{params.row?.status}</p>
          </div>
        );
      },
      maxWidth: 100,
      sortable: false,
    },
  ];

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        {/* <GridToolbarDensitySelector /> */}
        <GridToolbarExport />
        <GridToolbarQuickFilter sx={{ marginLeft: 'auto' }} />
      </GridToolbarContainer>
    );
  }

  return (
    <div className={css.draftInvoiceContainer}>
      {/* {draftInvoice.map((d) => (
        <Grid
          container
          spacing={3}
          alignItems="center"
          className={css.draftItem}
        >
          <Grid
            item
            xs={8}
            className={css.draftInfo}
            onClick={() => {
              onOpenSummary(d);
            }}
          >
            <span className={css.invoiceTitle}>{d.customer_name}</span>
            <ArrowRightIcon className={css.arrowIcon} />
          </Grid>
          <Grid item xs={4}>
            <EditIcon
              className={css.editIcon}
              onClick={() => {
                editInvoice(d.id);
              }}
            />
            <DeleteIcon
              className={css.deleteIcon}
              onClick={() => {
                deleteInvoice(d.id);
              }}
            />
          </Grid>
        </Grid>
      ))} */}
      {device === 'desktop' && (
        <Mui.Grid container>
          <Mui.Grid item xs={12}>
            <Mui.Stack className={css.RecurringContainer}>
              {device === 'desktop' && draftInvoice && (
                //   (draftInvoice?.length === 0 && (
                //   <Grid item xs={12} className={css.draftInfo}>
                //     <Mui.Typography
                //       align="center"
                //       style={{ padding: '250px 0' }}
                //     >
                //       No Invoices found!!!
                //     </Mui.Typography>
                //   </Grid>
                // )) || (
                <>
                  <div className={css.buttDiv}>
                    <Mui.Button
                      variant="contained"
                      component="label"
                      className={css.orangeConatined}
                      disableElevation
                      disableTouchRipple
                      // disabled={forUpload.length === 0 || percentage !== 100}
                      onClick={() => {
                        if (
                          !userRoles?.['Recurring Invoice']
                            ?.create_recurring_invoices
                        ) {
                          setHavePermission({
                            open: true,
                            back: () => {
                              setHavePermission({ open: false });
                            },
                          });
                          return;
                        }
                        navigate(`/invoice-upload/${'recurring'}`);
                      }}
                    >
                      <img src={upload} alt="" style={{ marginRight: '5px' }} />
                      Upload Recurring Invoices
                    </Mui.Button>
                    {/* set search component here while set reduce buttDiv width to 70% */}
                  </div>
                  <Mui.Box
                    sx={{
                      height: '100%',
                      width: '100%',
                      marginTop: '0 !important',
                      '& .left-align--header': {
                        '.MuiDataGrid-columnHeaderDraggableContainer': {
                          flexDirection: 'row !important',
                        },
                        '.MuiDataGrid-columnHeaderTitleContainer': {
                          flexDirection: 'row !important',
                        },
                        textAlign: 'left',
                      },
                    }}
                  >
                    <DataGridPro
                      rows={draftInvoice}
                      columns={recurringColumn}
                      density="compact"
                      getRowHeight={() => 'auto'}
                      // loading={data.rows.length === 0}
                      rowHeight={60}
                      disableColumnReorder
                      hideFooter
                      // checkboxSelection
                      disableSelectionOnClick
                      // disableColumnSelector
                      // disableDensitySelector
                      // onFilterModelChange={(item) =>
                      //   setColumnHeader(item?.items?.[0]?.columnField)
                      // }
                      components={{
                        Toolbar: CustomToolbar,
                        // FilterPanel: CustomerListDraft,
                        // Footer: CustomFooter,
                        ColumnMenu: CustomColumnMenu,
                        // Header: CustomFooter
                        // ColumnMenu: CustomFooter
                        NoRowsOverlay: () => (
                          <Mui.Stack
                            height="100%"
                            alignItems="center"
                            justifyContent="center"
                          >
                            No Data Found
                          </Mui.Stack>
                        ),
                      }}
                      componentsProps={{
                        toolbar: {
                          showQuickFilter: true,
                          quickFilterProps: { debounceMs: 500 },
                        },
                        // filterPanel: {
                        //   headCol: columnHeader,
                        //   setFilterCustListTempPro: setCustomerID,
                        //   setWebValuePro: setWebValue,
                        // },
                      }}
                      sx={{
                        background: '#fff',
                        borderRadius: '16px',
                        '& .MuiDataGrid-columnHeaderTitle': {
                          whiteSpace: 'break-spaces',
                          textAlign: 'center',
                          lineHeight: '20px',
                        },
                        '& .MuiDataGrid-row': {
                          cursor: 'pointer !important',
                        },
                      }}
                    />
                  </Mui.Box>
                  {/* <Mui.Stack direction="row" className={css.selectBtnStack}>
                    <Mui.Stack direction="row" className={css.selectBtnStack1}>
                      <Mui.Button className={css.selectBtn}>
                        <Mui.Typography className={css.selectBtnText}>
                          date
                        </Mui.Typography>
                        <KeyboardArrowDownIcon />
                      </Mui.Button>
                      
                      <Mui.Button className={css.selectBtn}>
                        <Mui.Typography className={css.selectBtnText}>
                          customer
                        </Mui.Typography>{' '}
                        <KeyboardArrowDownIcon />
                      </Mui.Button>
                    </Mui.Stack>
                    <Mui.Stack>
                      <Mui.Button className={css.selectBtn}>
                        <Mui.Typography className={css.selectBtnText}>
                          sort
                        </Mui.Typography>{' '}
                        <KeyboardArrowDownIcon />
                      </Mui.Button>
                    </Mui.Stack>
                  </Mui.Stack> */}
                </>
              )}
            </Mui.Stack>
          </Mui.Grid>
        </Mui.Grid>
      )}
      {device === 'mobile' && (
        <Mui.Grid container>
          <Mui.Stack
            direction="column"
            // item
            // xs={12}
            // lg={12}
            // md={12}
            // xs={12}
            style={{ margin: '4% 4% 8% 4%', width: '100%' }}
          >
            <Mui.Box sx={{ width: '100%' }}>
              <Mui.Stack spacing={1}>
                <Mui.Stack
                  spacing={1}
                  style={{ paddingTop: '15px', paddingBottom: '5px' }}
                >
                  <Mui.Grid className={classes.headingRecurring}>
                    YOUR RECURRING INVOICES
                  </Mui.Grid>
                  <Mui.Divider
                    className={classes.divider}
                    variant="fullWidth"
                  />{' '}
                </Mui.Stack>
                {draftInvoice && draftInvoice?.length === 0 ? (
                  // <Grid
                  //   container
                  //   spacing={3}
                  //   alignItems="center"
                  //   className={css.draftItem}
                  // >

                  <Grid item xs={12} className={css.draftInfo}>
                    <Mui.Typography align="center">
                      No Invoices found!!!
                    </Mui.Typography>
                  </Grid>
                ) : (
                  // </Grid>
                  draftInvoice?.map((d) => (
                    <Mui.Grid
                      item
                      xs={12}
                      lg={12}
                      md={12}
                      style={{ paddingTop: '10px' }}
                      onClick={() => {
                        handleRowSelection(d);
                      }}
                    >
                      <Item
                        style={{
                          backgroundColor: 'white',
                          textAlignLast: 'center',
                          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                          borderRadius: '18px',
                        }}
                      >
                        <Mui.Stack
                          direction="row"
                          justifyContent="space-between"
                        >
                          <Mui.Grid
                            alignSelf="center"
                            style={{ paddingRight: '25px', paddingLeft: '3%' }}
                          >
                            <Mui.Avatar
                              style={{
                                textTransform: 'uppercase',
                                fontSize: '13.588px',
                                color: 'white',
                                backgroundColor: '#F08B32',
                              }}
                            >
                              {d?.customer_name?.slice(0, 1)}
                            </Mui.Avatar>
                          </Mui.Grid>
                          <Mui.Grid
                            style={{
                              textAlignLast: 'left',
                              paddingRight: '15px',
                              textTransform: 'capitalize',
                            }}
                          >
                            <Mui.Grid className={classes.name}>
                              {d?.customer_name?.toLowerCase()}
                            </Mui.Grid>
                            <Mui.Grid className={classes.contentAndDate}>
                              Preparing on the {d?.day_of_creation}th of every
                              month until{' '}
                              {d?.end_date
                                ? moment(d.end_date).format('DD-MM-YYYY')
                                : '-'}
                            </Mui.Grid>
                          </Mui.Grid>
                          <Mui.Grid className={classes.amount}>
                            {FormattedAmount(d?.total_amount)}
                          </Mui.Grid>
                        </Mui.Stack>
                      </Item>
                    </Mui.Grid>
                  ))
                )}
              </Mui.Stack>
            </Mui.Box>
          </Mui.Stack>
        </Mui.Grid>
      )}

      <DialogContainer
        title="Invoice Summary"
        body={summaryContent()}
        open={openSummary}
        onCancel={onCloseSummary}
        onSubmit={undefined}
        maxWidth="lg"
        submitText="Open Invoice"
      />
      {havePermission.open && (
        <PermissionDialog onClose={() => havePermission.back()} />
      )}
    </div>
  );
};

export default RecurringInvoiceContainer;
