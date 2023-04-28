import * as React from 'react';
import * as Mui from '@mui/material';
import SimpleSnackbar from '@components/SnackBarContainer/CustomSnackBar.jsx';
// import RestApi, { METHOD } from '@services/RestApi.jsx';
import { PermissionDialog } from '@components/Permissions/PermissionDialog.jsx';
import InfiniteScroll from 'react-infinite-scroll-component';
import ToggleSwitch from '@components/ToggleSwitch/ToggleSwitch';
import AppContext from '@root/AppContext.jsx';
import SearchIcon from '@material-ui/icons/Search';
import { styled } from '@material-ui/core/styles';
import css from './SearchCustomer.scss';
import cssaddon from '../../core/Banking/AccountBalance/CommonDrawer.scss';

const Puller = styled(Mui.Box)(() => ({
  width: '50px',
  height: 6,
  backgroundColor: '#C4C4C4',
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
}));

const ButtonBackColor = {
  customer: { bgcolor: 'rgba(32, 201, 172, 0.1)', color: '#20C9AC' },
  vendor: { bgcolor: 'rgba(0, 165, 255, 0.1)', color: '#00A5FF' },
  employee: { bgcolor: 'rgba(255, 160, 67, 0.1)', color: '#00A5FF' },
  lender: { bgcolor: 'rgba(255, 160, 67, 0.1)', color: '#FFA043' },
  promoter: { bgcolor: 'rgba(252, 52, 0, 0.1)', color: '#FC3400' },
  government: { bgcolor: 'rgba(132, 129, 138, 0.1)', color: '#2E2C34' },
  'other banks': { bgcolor: 'rgba(182, 180, 186, 0.1)', color: '#84818A' },
};

let initquery = true;

const CustomSearch = ({
  showType,
  customerList,
  callFunction,
  handleLocationParties,
  handleAllParties,
  addNewOne,
  openDrawer,
  dntCheckbox,
  onDoNotTrackVendor,
  from,
  basetowardsdata,
  selbutton,
  hideLocation,
  pagination,
  setPagination,
  option,
  allpartiescolors,
}) => {
  const {
    // organization,
    // enableLoading,
    // user,
    loading,
    userPermissions,
  } = React.useContext(AppContext);
  const [userList, setUserList] = React.useState([]);
  const [toggleType, setToggleType] = React.useState();
  const device = localStorage.getItem('device_detect');
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState(dntCheckbox);
  const showtyp = showType.split('_')[1] ? showType.split('_')[1] : showType;
  const [openSnack, setOpenSnack] = React.useState(false);
  const [hasMoreItems, sethasMoreItems] = React.useState(true);
  const [displaynodatatext, setdisplaynodatatext] = React.useState(false);
  const [userRoles, setUserRoles] = React.useState({});
  const [havePermission, setHavePermission] = React.useState({ open: false });

  React.useEffect(() => {
    if (Object.keys(userPermissions?.People || {})?.length > 0) {
      setUserRoles({ ...userPermissions?.People });
    }
  }, [userPermissions]);

  React.useEffect(() => {
    // set the customer list
    setUserList(customerList);
    setTimeout(() => {
      if (customerList.length === 0) {
        setdisplaynodatatext(true);
      }
    }, 500);
  }, [customerList]);

  const handleChange = () => {
    setSelected(!selected);
    onDoNotTrackVendor(!selected);
    initquery = false;
  };

  const nativeSelector = () => {
    const elements = document.querySelectorAll(
      '.SelectBottomSheet_childContainer2',
    );
    const results = [];
    for (let i = 0; i < elements.length; i += 1) {
      if (
        elements[i].hasChildNodes() &&
        elements[i].childNodes[0].nodeType === 3
      ) {
        results.push(elements[i].childNodes[0]);
      }
    }
    return results;
  };

  const searchtext = () => {
    if (displaynodatatext) {
      return <Mui.Box sx={{ paddingLeft: '20px' }}>No data found</Mui.Box>;
    }
    return '';
  };

  const searchnodata =
    selbutton && selbutton.toUpperCase() === 'OTHER BANKS' ? '' : searchtext();

  React.useEffect(() => {
    const textnodes = nativeSelector();
    let _nv = '';
    for (let i = 0, len = textnodes.length; i < len; i += 1) {
      _nv = textnodes[i].nodeValue;
      textnodes[i].nodeValue = _nv.replace(/]/g, '');
    }
    if (initquery) {
      setQuery(
        basetowardsdata &&
          basetowardsdata.name &&
          basetowardsdata.name.toUpperCase() !== 'N/A'
          ? basetowardsdata.name
          : '',
      );
    }
    initquery = false;
  }, [userList]);

  const loadMore = () => {
    if (pagination?.totalPage > 1) {
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
      callFunction(toggleType === 'all', '', pagination?.currentPage);
    } else if (
      pagination?.totalPage === pagination?.currentPage ||
      pagination?.totalPage <= pagination?.currentPage
    ) {
      sethasMoreItems(false);
    }
  }, [pagination?.currentPage]);

  React.useEffect(() => {
    sethasMoreItems(false);
  }, [toggleType]);

  React.useEffect(() => {
    if (pagination?.totalPage > 1) {
      sethasMoreItems(true);
    }
  }, [pagination?.totalPage]);

  const viewportheight_desktop =
    option && option.toUpperCase() === 'CUSTOM POPUPS' ? '57vh' : '78vh';
  const viewportheight_mobile =
    option && option.toUpperCase() === 'CUSTOM POPUPS' ? '38vh' : '53vh';

  const EditCustomerVendor = (type, param) => {
    if (param?.primary_relationship === 'customer') {
      if (!userRoles?.Customers?.edit_customers) {
        setHavePermission({
          open: true,
          back: () => {
            setHavePermission({ open: false });
          },
        });
        return;
      }
    }
    if (param?.primary_relationship === 'vendor') {
      if (!userRoles?.Vendors?.edit_vendors) {
        setHavePermission({
          open: true,
          back: () => {
            setHavePermission({ open: false });
          },
        });
        return;
      }
    }
    openDrawer(type, param);
  };
  const AddCustomerVendor = (type) => {
    if (type === 'Customer') {
      if (!userRoles?.Customers?.create_customers) {
        setHavePermission({
          open: true,
          back: () => {
            setHavePermission({ open: false });
          },
        });
        return;
      }
    }
    if (type === 'Vendor') {
      if (!userRoles?.Vendors?.create_vendors) {
        setHavePermission({
          open: true,
          back: () => {
            setHavePermission({ open: false });
          },
        });
        return;
      }
    }
    addNewOne(`${type}`);
  };

  return (
    <>
      {device === 'mobile' && <Puller />}
      {from === 'billBooking' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: 'rgba(240, 139, 50, 0.5)',
            borderRadius: '5px',
            padding: '5px',
            margin: '25px 20px 5px 20px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Mui.Checkbox
            checked={selected}
            style={{ color: '#FFFFFF' }}
            onClick={handleChange}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: '#000000',
                fontSize: '14px',
                lineHeight: '18px',
                marginBlock: '7px',
              }}
            >
              “Do Not Track” Vendor for this Transaction
            </div>
            <div
              style={{
                color: '#000000',
                fontSize: '11px',
                lineHeight: '14px',
                fontWeight: '300',
              }}
            >
              Only use this option for small expenses (under Rs. 5,000 a year)
              and vendors who do not give you GST credit by mentioning your
              GSTIN in their invoices
            </div>
          </div>
        </div>
      )}
      {selbutton && selbutton.toUpperCase() === 'OTHER BANKS' ? (
        ''
      ) : (
        <div className={css.searchFilterFull}>
          <SearchIcon className={css.searchFilterIcon} />{' '}
          <input
            onClick={(event) => {
              event.target.select();
            }}
            placeholder={
              toggleType === 'all' || showtyp.toLowerCase() === 'all parties'
                ? 'Search Party'
                : `Search ${
                    showType === 'BANKLIST' ||
                    showType === 'CATEGORYLIST_1' ||
                    showType === 'CATEGORYLIST_2'
                      ? ''
                      : showtyp
                  }`
            }
            onChange={(event) => {
              event.persist();
              initquery = false;
              setQuery(event?.target?.value);
              if (event?.target?.value?.length > 0) {
                if (toggleType === 'all') {
                  if (showType.split('_')[0] === 'CUSTOM POPUPS') {
                    callFunction(true, event?.target?.value);
                  } else {
                    callFunction(true, event?.target?.value);
                  }
                } else if (toggleType !== 'all') {
                  if (showType.split('_')[0] === 'CUSTOM POPUPS') {
                    callFunction(showtyp, event?.target?.value);
                  } else {
                    callFunction(false, event?.target?.value);
                  }
                }
              }
              if (event?.target?.value?.length === 0) {
                if (toggleType === 'all') {
                  if (showType.split('_')[0] === 'CUSTOM POPUPS') {
                    callFunction(true, '');
                  } else {
                    callFunction(true);
                  }
                } else if (toggleType !== 'all') {
                  if (showType.split('_')[0] === 'CUSTOM POPUPS') {
                    callFunction(true, '');
                  } else {
                    callFunction(false);
                  }
                }
              }
            }}
            value={query}
            className={css.searchFilterInputBig}
            autoFocus
          />
        </div>
      )}
      {showType !== 'BANKLIST' &&
      showType !== 'CATEGORYLIST_1' &&
      showType !== 'CATEGORYLIST_2' &&
      showType === showtyp ? (
        <div className={css.toggelList}>
          <p className={css.toggelPTag}>{showType}</p>
          <ToggleSwitch
            checked={toggleType === 'all'}
            onChange={(e) => {
              //   deactivate(e, val);
              setUserList([]);
              setQuery('');
              if (e?.target?.checked) {
                callFunction(true);
                setToggleType('all');
              } else {
                callFunction();
                setToggleType(showType);
              }
            }}
          />
          <p className={css.toggelPTag}>All Parties</p>
        </div>
      ) : (
        ''
      )}

      <div
        style={{
          overflow: 'auto',
          minHeight: 'auto',
          maxHeight:
            device === 'desktop'
              ? (from === 'billBooking' && '62vh') || viewportheight_desktop
              : (from === 'billBooking' && '47vh') || viewportheight_mobile,
        }}
      >
        {userList?.length === 0 ? (
          searchnodata
        ) : (
          <InfiniteScroll
            dataLength={userList?.length}
            next={() => loadMore()}
            height={
              device === 'desktop'
                ? (from === 'billBooking' && '62vh') || '75vh'
                : (from === 'billBooking' && '50vh') || '55vh'
            }
            scrollThreshold="20px"
            initialScrollY="100px"
            hasMore={hasMoreItems}
            loader={<h4 style={{ margin: '28px 26px' }}>Loading...</h4>}
          >
            {userList?.length > 0
              ? userList
                  // .filter((post) => {
                  //   if (query?.length < 3) {
                  //     return post;
                  //   }
                  //   if (post.name.toLowerCase().includes(query.toLowerCase())) {
                  //     return post;
                  //   }
                  //   return false;
                  // })
                  .map((element) =>
                    toggleType === 'all' ? (
                      element?.active && (
                        <div
                          className={css.valueWrapper}
                          onClick={() => {
                            if (showType.split('-')[0] === 'CUSTOM POPUPS') {
                              handleAllParties(element);
                            }
                            if (
                              showType === 'Customer' ||
                              showType === 'BANKLIST'
                            ) {
                              handleAllParties(element);
                            } else if (showType === 'Vendor' && !selected) {
                              handleAllParties(element);
                            }
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              overflowY: 'auto',
                            }}
                          >
                            <Mui.Button
                              className={`${css.value} ${css.captalize}`}
                            >
                              {element.name.toLowerCase()}
                            </Mui.Button>
                            <span
                              style={{
                                color: `${
                                  ButtonBackColor[
                                    element.primary_relationship.toLowerCase()
                                  ].color
                                }`,
                                backgroundColor: `${
                                  ButtonBackColor[
                                    element.primary_relationship.toLowerCase()
                                  ].bgcolor
                                }`,
                              }}
                            >
                              {showtyp.toLowerCase() === 'all parties' ? (
                                <Mui.Box className={cssaddon.popupNameButton}>
                                  element.primary_relationship
                                </Mui.Box>
                              ) : (
                                <Mui.Box className={cssaddon.popupNameButton}>
                                  {element.primary_relationship}
                                </Mui.Box>
                              )}
                            </span>
                          </div>
                          <hr />
                        </div>
                      )
                    ) : (
                      <>
                        {element?.active && (
                          <AddressRadio
                            customerValue={element}
                            handleLocationParties={handleLocationParties}
                            openDrawer={EditCustomerVendor}
                            showType={showType}
                            selected={selected}
                            hideLocation={hideLocation}
                            setOpenSnack={setOpenSnack}
                            allpartiescolors={allpartiescolors}
                          />
                        )}
                      </>
                    ),
                  )
              : searchnodata}
          </InfiniteScroll>
        )}
        {!loading && userList?.length === 0}
        {loading && <p style={{ margin: '20px 30px' }}>Loading...</p>}
      </div>
      <div
        className={css.valueWrapper}
        onClick={() => {
          // TriggerAddVendor();
          // setAddVendor(true);
        }}
      >
        <Mui.Button
          className={css.highlightedValue}
          onClick={() => {
            AddCustomerVendor(showtyp);
          }}
        >
          {showType === 'BANKLIST' ||
          showType === 'CATEGORYLIST_1' ||
          showType === 'CATEGORYLIST_2' ||
          showtyp.toLowerCase() === 'other banks' ||
          showtyp.toLowerCase() === 'all parties'
            ? ''
            : `+ Add New ${showtyp}`}
        </Mui.Button>
        <hr />
      </div>
      <SimpleSnackbar
        openSnack={openSnack}
        message={`Please Uncheck "Do not Track Vendor"`}
        setOpenSnack={setOpenSnack}
      />
      {havePermission.open && (
        <PermissionDialog onClose={() => havePermission.back()} />
      )}
    </>
  );
};

const AddressRadio = ({
  customerValue,
  handleLocationParties,
  openDrawer,
  showType,
  selected,
  hideLocation,
  setOpenSnack,
  allpartiescolors,
}) => {
  const [selectId, setSelectId] = React.useState('');
  const device = localStorage.getItem('device_detect');
  const showtyp = showType.split('_')[1] ? showType.split('_')[1] : showType;

  React.useEffect(() => {
    if (customerValue?.party_locations?.length > 0) {
      const temp = customerValue?.party_locations
        ?.filter((data) => data?.active)
        ?.map((val) => val?.id);
      setSelectId(temp?.[0] || '');
    }
  }, [customerValue?.party_locations]);

  const handleChange = (e_id) => {
    setSelectId(e_id);
    if (showType === 'Customer') {
      handleLocationParties(customerValue, e_id);
    } else if (showType === 'Vendor' && !selected) {
      handleLocationParties(customerValue, e_id);
    }
  };

  return (
    <div className={css.valueWrapper}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflowY: 'auto',
        }}
      >
        <Mui.Button
          className={`${css.value} ${css.captalize}`}
          onClick={() => {
            if (showType.split('_')[0] === 'CUSTOM POPUPS') {
              handleLocationParties(customerValue, selectId);
            }
            if (
              showType === 'Customer' ||
              showType === 'BANKLIST' ||
              showType === 'CATEGORYLIST_1' ||
              showType === 'CATEGORYLIST_2'
            ) {
              handleLocationParties(customerValue, selectId);
            }
            if (
              showType === 'Customer' ||
              showType === 'BANKLIST' ||
              showType === 'CATEGORYLIST_1' ||
              showType === 'CATEGORYLIST_2'
            ) {
              handleLocationParties(customerValue, selectId);
            } else if (showType === 'Vendor') {
              if (!selected) {
                handleLocationParties(customerValue, selectId);
              } else {
                setOpenSnack(true);
                // setTimeout(() => {
                //   handleLocationParties("Do not track", null);
                // }, 900);
              }
            }
          }}
        >
          {' '}
          {customerValue?.short_name?.toLowerCase()}{' '}
        </Mui.Button>
        <span
          style={{
            color: `${
              showtyp.toLowerCase() === 'all parties' &&
              allpartiescolors[
                customerValue?.primary_relationship.toLowerCase()
              ].color
            }`,
            backgroundColor: `${
              showtyp.toLowerCase() === 'all parties' &&
              allpartiescolors[
                customerValue?.primary_relationship.toLowerCase()
              ].bgcolor
            }`,
          }}
        >
          {showtyp.toLowerCase() === 'all parties' ? (
            <Mui.Box className={cssaddon.popupNameButton}>
              {customerValue?.primary_relationship}
            </Mui.Box>
          ) : (
            ''
          )}
        </span>
        {showType === 'BANKLIST' ||
        showType === 'CATEGORYLIST_1' ||
        showType === 'CATEGORYLIST_2' ||
        showType === 'CUSTOM POPUPS_All Parties' ? (
          ''
        ) : (
          <div onClick={() => openDrawer('edit', customerValue)}>
            <p className={css.editPTag}>Edit</p>
          </div>
        )}
      </div>
      {!hideLocation && (
        <Mui.RadioGroup
          aria-labelledby="demo-controlled-radio-buttons-group"
          name="controlled-radio-buttons-group"
          value={selectId}
          // onChange={handleChange}
          style={{ padding: '0 0 0 15px' }}
        >
          {customerValue?.party_locations?.length > 0 &&
            customerValue?.party_locations
              ?.filter((data) => data?.active)
              ?.map((val) => (
                <Mui.FormControlLabel
                  value={val?.id}
                  control={
                    <Mui.Radio
                      onClick={() => handleChange(val?.id)}
                      style={{ color: '#F08B32' }}
                      size="small"
                    />
                  }
                  className={css.addressDiv}
                  label={
                    <div onClick={() => handleChange(val?.id)}>
                      <p
                        className={css.addressPTag}
                        style={{
                          width: device === 'desktop' ? '24vw' : '83vw',
                        }}
                      >
                        {val?.address_line2
                          ? `${val?.address_line1}, ${val?.address_line2}, ${
                              val?.city
                            },${' '}
                  ${val?.state}, ${val?.country}`
                          : `${val?.address_line1}, ${val?.city},${' '}
                  ${val?.state}, ${val?.country}`}
                      </p>
                    </div>
                  }
                />
              ))}
        </Mui.RadioGroup>
      )}
      <hr />
    </div>
  );
};
export default CustomSearch;
