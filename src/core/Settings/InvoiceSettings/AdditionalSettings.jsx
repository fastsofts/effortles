import { Divider } from '@material-ui/core';
import ToggleSwitch from '@components/ToggleSwitch/ToggleSwitch';
import { PermissionDialog } from '@components/Permissions/PermissionDialog.jsx';
import * as Mui from '@mui/material';
import { styled } from '@material-ui/core/styles';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet';
import React, { useContext } from 'react';
import AppContext from '@root/AppContext.jsx';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer.jsx';
import RightArrow from '@assets/rightArrow.svg';
import * as Router from 'react-router-dom';
import { additionalSettingsCard } from '../SettingsImages';
import LutFormSettings from './LutFormSettings';
import css from './InvoiceSettings.scss';

const Puller = styled(Mui.Box)(() => ({
  width: '50px',
  height: 6,
  backgroundColor: '#C4C4C4',
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
}));

const card1 = [
  {
    id: 1,
    lable: 'Invoice Approval Workflow',
    icon: additionalSettingsCard.invoiceApprovalWorkflow,
    type: 'toggle',
    isActive: true,
  },
  {
    id: 2,
    lable: 'Email Subject & Body',
    icon: additionalSettingsCard.emailSubjectBody,
    type: 'button',
    route: '/settings-invoice-EmailSubjectBody',
    isActive: true,
  },
  {
    id: 3,
    lable: 'Enter LUT Number',
    icon: additionalSettingsCard.addtionalHash,
    type: 'add',
    value: 'Add',
    isActive: true,
  },
  {
    id: 4,
    lable: 'Choose Your Preference',
    icon: additionalSettingsCard.addtionalHash,
    type: 'customSelect',
    isActive: true,
  },
];
function AdditionalSettings() {
  const {
    organization,
    user,
    enableLoading,
    openSnackBar,
    changeSubView,
    userPermissions,
  } = useContext(AppContext);
  const navigate = Router.useNavigate();
  const handlePageChange = (route) => {
    changeSubView(route);
    navigate(route);
  };
  // const [cardTemp] = React.useState(card1);
  const device = localStorage.getItem('device_detect');
  const [lutSheet, setLutSheet] = React.useState({ open: false });
  const [Preference, setPreference] = React.useState('estimate');
  const [LocalState, setLocalState] = React.useState({
    view: 'save',
    value: [],
  });

  const [userRolesInvoicing, setUserRolesInvoicing] = React.useState({});
  const [havePermission, setHavePermission] = React.useState({ open: false });

  React.useEffect(() => {
    if (Object.keys(userPermissions?.Settings || {})?.length > 0) {
      if (!userPermissions?.Settings?.Settings) {
        setHavePermission({
          open: true,
          back: () => {
            navigate('/dashboard');
            setHavePermission({ open: false });
          },
        });
      }
      setUserRolesInvoicing({ ...userPermissions?.Invoicing });
    }
  }, [userPermissions]);

  const UpdateLut = (mainState) => {
    enableLoading(true);
    RestApi(`organizations/${organization.orgId}/lut_document`, {
      method: METHOD.PATCH,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
      payload: {
        lut_number: mainState?.LUTNumber,
        document: mainState?.LUTFileId,
      },
    })
      .then((res) => {
        if (res && !res?.error) {
          openSnackBar({
            message: 'Updated Successfully',
            type: MESSAGE_TYPE.INFO,
          });
          setLutSheet((prev) => ({ ...prev, open: false }));
        } else {
          openSnackBar({
            message: res?.message || 'Unknown Error occured',
            type: MESSAGE_TYPE.ERROR,
          });
        }
        enableLoading(false);
      })
      .catch((res) => {
        enableLoading(false);
        openSnackBar({
          message: res?.message || 'Unknown Error occured',
          type: MESSAGE_TYPE.ERROR,
        });
      });
  };

  const PreviousLUT = () => {
    enableLoading(true);
    RestApi(`organizations/${organization.orgId}/lut_documents`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        if (res && !res?.error) {
          if (res?.data?.length === 0) {
            setLocalState({ type: 'save', value: [] });
          } else {
            setLocalState({ type: 'update', value: res?.data });
          }
        } else {
          openSnackBar({
            message: res?.message || 'Unknown Error occured',
            type: MESSAGE_TYPE.ERROR,
          });
        }
        enableLoading(false);
      })
      .catch((res) => {
        enableLoading(false);
        openSnackBar({
          message: res?.message || 'Unknown Error occured',
          type: MESSAGE_TYPE.ERROR,
        });
      });
  };

  React.useEffect(() => {
    PreviousLUT();
  }, []);

  const CardView = ({ item, length }) => {
    return (
      <div
        className={
          item?.type === 'customSelect' &&
          device === 'mobile' &&
          css.customSelect
        }
      >
        <div className={css.ToggleCardContainer}>
          <div
            className={
              device === 'desktop' ? css.iconWrapperDesktop : css.iconWrapper
            }
          >
            <img className={css.icon} src={item.icon} alt={item.lable} />
          </div>
          {(item.type === 'toggle' && (
            <Mui.FormGroup style={{ width: '100%' }}>
              <Mui.FormControlLabel
                style={{ justifyContent: 'space-between' }}
                label={item.lable}
                labelPlacement="start"
                control={<ToggleSwitch defaultChecked />}
              />
            </Mui.FormGroup>
          )) || (
            <div
              onClick={() => {
                if (item.id === 2) {
                  if (
                    !userRolesInvoicing['Email Subject & Body']
                      ?.view_email_templates
                  ) {
                    setHavePermission({
                      open: true,
                      back: () => {
                        setHavePermission({ open: false });
                      },
                    });
                    return;
                  }
                  handlePageChange(item.route);
                } else {
                  handlePageChange(item.route);
                }
              }}
              className={css.arrowWrapperOver}
            >
              <div className={css.lable}>{item.lable} </div>
              <div className={css.arrowWrapper}>
                {item?.type === 'button' && (
                  <img src={RightArrow} alt={item.lable} />
                )}
                {item?.type === 'add' && (
                  <div
                    onClick={() =>
                      setLutSheet((prev) => ({ ...prev, open: true }))
                    }
                  >
                    <p className={css.RightAdd}>
                      {LocalState?.value?.length > 0
                        ? LocalState?.value[0]?.lut_number
                        : item?.value}
                    </p>
                  </div>
                )}
                {item?.type === 'customSelect' && device === 'desktop' && (
                  <div className={css.mainButton}>
                    <div
                      className={
                        Preference === 'estimate'
                          ? css.selected
                          : css.unSelected
                      }
                      onClick={() => setPreference('estimate')}
                    >
                      <p>Estimate</p>
                    </div>
                    <div
                      className={
                        Preference === 'proforma'
                          ? css.selected
                          : css.unSelected
                      }
                      onClick={() => setPreference('proforma')}
                    >
                      <p>Proforma</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {item?.type === 'customSelect' && device === 'mobile' && (
          <div className={css.mainButton}>
            <div
              className={
                Preference === 'estimate' ? css.selected : css.unSelected
              }
              onClick={() => setPreference('estimate')}
            >
              <p>Estimate</p>
            </div>
            <div
              className={
                Preference === 'proforma' ? css.selected : css.unSelected
              }
              onClick={() => setPreference('proforma')}
            >
              <p>Proforma</p>
            </div>
          </div>
        )}
        {length !== item.id && (
          <div className={css.divider}>
            <Divider />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        className={
          device === 'desktop'
            ? css.contactDetailsOnInvoiceContainerDesktop
            : css.contactDetailsOnInvoiceContainer
        }
      >
        <div className={css.card}>
          {card1?.map((item, ind) => {
            return (
              <div key={item.id}>
                {ind !== 0 && <CardView item={item} length={card1.length} />}
              </div>
            );
          })}
        </div>
      </div>
      {havePermission.open && (
        <PermissionDialog onClose={() => havePermission.back()} />
      )}
      <SelectBottomSheet
        open={lutSheet?.open}
        onClose={() => setLutSheet((prev) => ({ ...prev, open: false }))}
        triggerComponent={<></>}
        addNewSheet
      >
        {device === 'mobile' && <Puller />}
        <LutFormSettings
          type={LocalState?.type}
          onClose={() => setLutSheet((prev) => ({ ...prev, open: false }))}
          submitValue={(val) => UpdateLut(val)}
          LocalState={LocalState?.value}
        />
      </SelectBottomSheet>
    </>
  );
}

export default AdditionalSettings;
