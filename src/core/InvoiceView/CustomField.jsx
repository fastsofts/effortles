/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */

import React, { useContext } from 'react';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import AppContext from '@root/AppContext.jsx';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as Mui from '@mui/material';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet.jsx';
import { styled } from '@material-ui/core/styles';
import css from './PaymentTermCss.scss';
// import { step2 } from './InvoiceImages.js';

const Puller = styled(Mui.Box)(() => ({
  width: '50px',
  height: 6,
  backgroundColor: '#C4C4C4',
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
}));

const CustomField = ({ selectCustomer, callFunction }) => {
  const { organization, enableLoading, user } = useContext(AppContext);
  const [drawer, setDrawer] = React.useState({
    customField: false,
    exapndCustom: false,
  });
  const device = localStorage.getItem('device_detect');
  const [customObject, setCustomObject] = React.useState();
  const [userObject, setUserObject] = React.useState({});

  const RedefineKeys = () => {
    enableLoading(true);
    RestApi(`organizations/${organization.orgId}/invoice_custom_fields`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    }).then((res) => {
      if (res && !res.error) {
        setCustomObject(res?.data?.filter((ele) => ele.active === true));
      }
    });
    enableLoading(false);
  };

  React.useEffect(() => {
    if (selectCustomer?.custom_data) RedefineKeys();
    setUserObject(selectCustomer?.custom_data);
  }, [selectCustomer?.custom_data]);

  const onTriggerDrawer = (name) => {
    setDrawer((d) => ({ ...d, [name]: true }));
  };

  const handleBottomSheet = (name) => {
    setDrawer((d) => ({ ...d, [name]: false }));
  };

  return (
    <>
      <div
        className={css.mainDivCustom}
        onClick={() =>
          setDrawer((prev) => ({ ...prev, exapndCustom: !drawer.exapndCustom }))
        }
      >
        <p className={css.custom}>Custom Fields</p>
        <ExpandMoreIcon
          sx={{
            transition: '.5s',
            transform: drawer.exapndCustom
              ? 'rotate(180deg)'
              : 'rotate(360deg)',
          }}
        />
      </div>
      {drawer.exapndCustom && (
        <div>
          {/* <div className={css.row2}>
            <div
              className={css.searchInput}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                // onTriggerDrawer('customField');
                // const temp =
                //   customArray.length === 0
                //     ? 0
                //     : customArray[customArray?.length - 1];
                // setCustomArray((prev) => [...prev, temp + 1]);
              }}
            >
              <p>Custom Field</p>
              <img className={css.searchIcon} src={step2.addIcon} alt="edit" />
            </div>
          </div> */}

          {customObject?.map((val) => (
            <div className={css.createCustom}>
              <p className={css.createCustomPTag}>{val.name}</p>
              <input
                type="text"
                name={val.field_name}
                value={
                  (userObject &&
                    Object.keys(userObject).length !== 0 &&
                    Object.entries(userObject)?.filter(
                      ([key]) => key === val.field_name,
                    )[0][1]) ||
                  ''
                }
                placeholder={
                  (userObject &&
                    Object.keys(userObject).length !== 0 &&
                    Object.entries(userObject)?.filter(
                      ([key]) => key === val.field_name,
                    )[0][1]) ||
                  '-'
                }
                onChange={(event) => {
                  event.persist();
                  setUserObject((prev) => ({
                    ...prev,
                    [event?.target?.name]: event?.target?.value,
                  }));
                }}
                className={css.createCustomInput}
              />
            </div>
          ))}

          {customObject?.length > 0 && (
            <div
              style={{
                margin: '25px 0 15px 0',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Mui.Button
                variant="contained"
                className={css.primary}
                style={{ padding: 15, textTransform: 'initial' }}
                onClick={() => {
                  callFunction({ custom_data: userObject });
                }}
              >
                Confirm Custom Fields
              </Mui.Button>
            </div>
          )}
          {customObject?.length === 0 && (
            <p
              style={{
                color: '#e0513e',
                fontWeight: '700',
                margin: '0px 25px 25px 25px',
              }}
            >
              No Custom Field to show
            </p>
          )}
        </div>
      )}
      <SelectBottomSheet
        name="customField"
        triggerComponent={<div style={{ display: 'none' }} />}
        open={drawer.customField}
        onTrigger={onTriggerDrawer}
        onClose={handleBottomSheet}
        // maxHeight="45vh"
        addNewSheet
      >
        <>
          {device === 'mobile' && <Puller />}
          <div style={{ padding: '15px' }}>
            <div style={{ padding: '5px 0' }}>
              <p className={css.valueHeader}>Custom Fields</p>
            </div>
          </div>
        </>
      </SelectBottomSheet>
    </>
  );
};

export default CustomField;
