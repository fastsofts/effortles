/* @flow */
/**
 * @fileoverview  AppHeader
 */
import React, { useContext, useState } from 'react';
import AppContext from '@root/AppContext.jsx';
import * as Mui from '@mui/material';
import * as MuiIcon from '@mui/icons-material';
import * as Router from 'react-router-dom';
import topIcon from '@assets/WebAssets/topIcon.svg';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon2 from '@material-ui/icons/Search';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuList from '@material-ui/core/MenuList';
import NotificationContainer from '@components/AppHeader/NotificationContainer.jsx';
import css from '@core/DashboardView/DashboardViewContainer.scss';
import {
  SearchIcon,
  NotificationIcon,
  BurgerMenuIcon,
  SuperIcon,
  LogoutWeb,
} from '@components/SvgIcons/SvgIcons.jsx';
import superWebIcon from '../../assets/superWebIcon.svg';
import plusSquare from '../../assets/plus-square.png';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Mui.Slide direction="left" ref={ref} {...props} />;
});

const AppHeader = (props) => {
  const {
    toggleSidePanel,
    // notificationList,
    // changeSubView,
    user,
    currentUserInfo,
    setSessionToken,
    setUserInfo,
    addOrganization,
    organization,
    // getCurrentUser
  } = useContext(AppContext);
  const { pathname } = Router.useLocation();

  const { hideSearchIcon, hideNotificationIcon } = props;
  const [openNotification, setOpenNotification] = useState(false);
  const themes = Mui.useTheme();
  const desktopView = Mui.useMediaQuery(themes.breakpoints.up('sm'));
  const device = localStorage.getItem('device_detect');
  const userNameFont = user?.userName;
  const symbol = userNameFont?.slice(0, 1);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorElForOrganization, setAnchorElForOrganization] =
    React.useState(null);
  const open = Boolean(anchorEl);
  const openForOrganization = Boolean(anchorElForOrganization);
  const navigate = Router.useNavigate();
  const handleClick = (event, component) => {
    if (component === 'calendar') {
      // setAnchorElCalendar(event.currentTarget);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };
  return (
    <div
      className={css.appHeader}
      style={{
        height: device === 'desktop' ? '15%' : 'auto',
        padding: device === 'desktop' ? '0px 15px 0px' : '15px 15px 0px',
        visibility:
          pathname === '/notification' && device !== 'desktop' && 'hidden',
      }}
    >
      {desktopView === false ? (
        <>
          <div className={css.left}>
            <BurgerMenuIcon className={css.icons} onClick={toggleSidePanel} />
          </div>
          <div className={css.right}>
            {!hideSearchIcon && (
              <SearchIcon className={`${css.icons} ${css.searchIcon}`} />
            )}

            {!hideNotificationIcon && (
              <div
                className={css.notifyContainer}
                onClick={() => navigate('/notification')}
              >
                <NotificationIcon className={css.icons} />
              </div>
            )}
          </div>
          <NotificationContainer
            open={openNotification}
            handleClose={() => setOpenNotification(false)}
          />
          <div
            style={{ paddingLeft: '0.5rem' }}
            onClick={() => {
              navigate('/support');
            }}
          >
            <SuperIcon style={{ fontSize: '36px' }} />
          </div>
        </>
      ) : (
        <Mui.Stack direction="row" justifyContent="space-between" width="100%">
          <Mui.Grid className={css.FullGrid} />
          <Mui.Grid className={css.search}>
            <Mui.Stack direction="row">
              <div
                className={css.searchFilter}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '15px',
                  padding: '7px',
                  boxShadow: '0px 0px 40px rgba(48, 73, 191, 0.05)',
                  borderRadius: '16px',
                }}
              >
                <SearchIcon2 style={{ color: '#af9d9d' }} />{' '}
                <input
                  placeholder="Search anything"
                  className={css.textFieldFocus}
                  style={{ border: 'none', overflow: 'auto', fontSize: '12px' }}
                />
              </div>
            </Mui.Stack>
            <div
              className={css.superWebIcon}
              onClick={() => {
                navigate('/support');
              }}
            >
              <img src={superWebIcon} alt="super" />
            </div>
            <Mui.Stack
              direction="row"
              onClick={(e) => handleClick(e, 'organixation')}
              className={css.appBarAccountSymbols}
            >
              <Mui.Stack direction="row" spacing={1}>
                <Mui.Avatar className={css.avatar}>
                  <Mui.Typography variant="h5" color="#F08B32">
                    {symbol}
                  </Mui.Typography>
                </Mui.Avatar>
                <Mui.Typography className={css.name}>
                  {user && user.userName}
                </Mui.Typography>
              </Mui.Stack>
              <KeyboardArrowDownIcon className={css.imgcss3} />
            </Mui.Stack>

            <Mui.Grid
              onClick={() => setOpenNotification(true)}
              style={{ cursor: 'pointer' }}
            >
              <img className={css.notify} src={topIcon} alt="notify" />
            </Mui.Grid>

            <NotificationContainer
              open={openNotification}
              handleClose={() => setOpenNotification(false)}
            />
          </Mui.Grid>
        </Mui.Stack>
      )}
      <Popper
        anchorEl={anchorEl}
        open={open}
        role={undefined}
        transition
        disablePortal
        style={{
          zIndex: 11,
          marginTop: 20,
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.08)',
        }}
        placement="bottom-end"
      >
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: 'center top', borderRadius: '10px' }}
          >
            <Paper>
              <span className={css.poperMainDialog} />
              <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
                <MenuList
                  autoFocusItem={
                    anchorElForOrganization && desktopView === true
                  }
                  id="menu-list-grow"
                  style={{ overflow: 'auto', listStyle: 'none', padding: 0 }}
                  className={css.optionsWrapper}
                >
                  <li aria-hidden="true">
                    <div
                      direction="row"
                      className={css.appBarAccountSymbol}
                      width="100%"
                    >
                      <div style={{ display: 'inline-block' }}>
                        <Mui.Avatar className={css.avatarForPopover}>
                          {symbol}
                        </Mui.Avatar>
                      </div>
                      <div className={css.itemsEmail}>
                        {currentUserInfo && currentUserInfo.email}
                      </div>
                    </div>
                  </li>
                  <hr style={{ border: '1px solid #EDEDED', margin: 0 }} />
                  <li aria-hidden="true">
                    <Mui.Stack
                      direction="row"
                      className={css.appBarAccountSymbol}
                      alignItems="center"
                      width="100%"
                      onClick={() => {
                        setAnchorEl(null);
                        setAnchorElForOrganization(null);
                        navigate('/add-new-organization');
                      }}
                    >
                      <img
                        src={plusSquare}
                        alt="change_account"
                        style={{
                          width: '32px',
                          height: '32px',
                          objectFit: 'contain',
                        }}
                      />
                      <div className={css.itemsEmail}>Add New Company</div>
                    </Mui.Stack>
                  </li>
                  <hr style={{ border: '1px solid #EDEDED', margin: 0 }} />
                  <li
                    className={css.items}
                    aria-hidden="true"
                    style={{ fontWeight: 400, color: '#FF4842' }}
                  >
                    <Mui.Stack
                      direction="row"
                      onClick={() => {
                        setUserInfo({ userInfo: null });
                        setSessionToken({ activeToken: null });
                        localStorage.removeItem('user_info');
                        localStorage.removeItem('current_user_info');
                        localStorage.removeItem('session_token');
                        localStorage.removeItem('selected_organization');
                        navigate('/');
                      }}
                      className={css.appBarAccountSymbol}
                      alignItems="center"
                      width="100%"
                    >
                      <LogoutWeb
                        style={{
                          width: '32px',
                          height: '32px',
                          objectFit: 'contain',
                          margin: '0 0 0 8px',
                        }}
                      />
                      <div className={css.itemsLogOut}>Logout</div>
                    </Mui.Stack>
                  </li>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
      <Mui.Dialog
        id="basic-menu-sort"
        TransitionComponent={Transition}
        anchorEl={anchorElForOrganization}
        open={openForOrganization}
        onClose={() => setAnchorElForOrganization(null)}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        PaperProps={{
          elevation: 3,
          style: {
            width: '35ch',
            padding: '5px',
            position: 'absolute',
            right: '500px',
            top: '175px',
            overflow: 'visible',
            borderRadius: 16,
          },
        }}
      >
        <div className={css.effortlessOptions}>
          <ul
            className={css.optionsWrapper}
            style={{ overflow: 'auto', minHeight: 'auto', maxHeight: '20rem' }}
          >
            {user &&
              user?.userInfo?.data?.map((val) => (
                <div key={`index${val.id}`}>
                  <li aria-hidden="true">
                    <Mui.Stack
                      direction="row"
                      onClick={() => {
                        const orgId = val?.id ? val.id : '';
                        const orgName = val?.name ? val.name : '';
                        const shortName = val?.short_name ? val.short_name : '';
                        localStorage.setItem(
                          'selected_organization',
                          JSON.stringify({ orgId, orgName, shortName }),
                        );
                        addOrganization({ orgId, orgName, shortName });
                        setAnchorElForOrganization(null);
                        setAnchorEl(null);
                        navigate('/');
                      }}
                      className={css.appBarAccountSymbol}
                      alignItems="center"
                      width="100%"
                    >
                      {organization.orgId === val?.id ? (
                        <MuiIcon.Done
                          style={{
                            width: '35px',
                            height: '35px',
                            margin: '0 10% 0 5%',
                          }}
                        />
                      ) : (
                        <MuiIcon.Done
                          style={{
                            width: '35px',
                            height: '30px',
                            margin: '0 10% 0 5%',
                            color: 'transparent',
                          }}
                        />
                      )}
                      <Mui.Grid
                        className={css.items}
                        style={{ fontWeight: 300, color: '#283049' }}
                      >
                        {val?.name}
                      </Mui.Grid>
                    </Mui.Stack>
                  </li>
                  <hr style={{ border: '1px solid #EDEDED' }} />
                </div>
              ))}
          </ul>
          <Mui.Stack
            direction="row"
            onClick={() => {
              setAnchorEl(null);
              setAnchorElForOrganization(null);
              navigate('/add-new-organization');
            }}
            className={css.appBarAccountSymbol}
            alignItems="center"
            width="100%"
            style={{ background: '#F5F5F5' }}
          >
            <Mui.IconButton style={{ margin: '0 10% 0 5%' }}>
              <MuiIcon.AddCircleOutline
                style={{
                  width: '35px',
                  height: '35px',
                  margin: '0 10% 0 5%',
                  color: '#283049',
                }}
              />
            </Mui.IconButton>
            <Mui.Grid
              className={css.items}
              style={{ fontWeight: 400, color: '#283049', fontSize: 25 }}
            >
              Add Account
            </Mui.Grid>
          </Mui.Stack>
        </div>
      </Mui.Dialog>
    </div>
  );
};
export default AppHeader;
