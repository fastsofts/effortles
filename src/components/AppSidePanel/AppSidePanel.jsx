/* @flow */
/**
 * @fileoverview Date picker component
 */
/* eslint-disable no-lonely-if */

import React, { useContext } from 'react';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer.jsx';
import JSBridge from '@nativeBridge/jsbridge';
import { makeStyles, styled } from '@material-ui/core/styles';
import { withStyles, Divider } from '@material-ui/core';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import DoneIcon from '@mui/icons-material/Done';
import Drawer from '@material-ui/core/Drawer';
import * as Mui from '@mui/material';
import AppContext from '@root/AppContext.jsx';
import * as Router from 'react-router-dom';
import effortless from '@assets/SideBarLogo.png';
import { PermissionDialog } from '@components/Permissions/PermissionDialog.jsx';
import {
  Co,
  DashboardWeb,
  RecievablesWeb,
  ComplianceWeb,
  ExpenseBillsWeb,
  FundingWeb,
  PeopleWeb,
  ProfileWeb,
  PayrollWeb,
  SettingsWeb,
  LogoutWeb,
  PaymentsWeb,
  BankingWeb,
  SignOut,
  ReportWeb,
} from '@components/SvgIcons/SvgIcons.jsx';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { googleLogout } from '@react-oauth/google';
import { isMobile, isDesktop } from 'react-device-detect';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet';
import PackageJson from '../../../package.json';
import AddNewCompany from '../../core/LoginContainer/AddNewCompany';
import css from './AppSidePanel.scss';
import action from '../../assets/actions.svg';
import { SubMenuList } from './SubMenu';

const drawerStyles = makeStyles(() => ({
  paper: {
    width: '18%',
  },
  '@global': {
    '*::-webkit-scrollbar': {
      width: '0em',
    },
  },
}));
const drawerStyles2 = makeStyles(() => ({
  paper: {
    borderTopRightRadius: 20,
    width: '83%',
  },
}));

const Puller = styled(Mui.Box)(() => ({
  width: '50px',
  height: 6,
  backgroundColor: '#C4C4C4',
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
}));

const AppSidePanel = () => {
  const {
    toggleSidePanel,
    openSidePanel,
    setSessionToken,
    setUserInfo,
    changeView,
    changeSubView,
    addOrgId,
    setActiveInvoiceId,
    validateSession,
    getCurrentUser,
    organization,
    user,
    logo,
    addOrganization,
    setConnect,
    enableLoading,
    openSnackBar,
    invoiceCounts,
    currentUserInfo,
    setUserPermission,
  } = useContext(AppContext);
  const classes = drawerStyles();
  const classes2 = drawerStyles2();
  const navigate = Router.useNavigate();
  const [navVal, setNavVal] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [roleAccess, setRoleAccess] = React.useState({});
  const [havePermission, setHavePermission] = React.useState({ open: false });
  const deviceDetails = {
    isDesktopDevice: isDesktop,
    isMobileDevice: isMobile,
  };

  React.useEffect(() => {
    if (currentUserInfo?.permissions?.length > 0) {
      const temp = currentUserInfo?.permissions?.reduce((obj, item) => {
        obj[item.name] = item.active;
        return obj;
      }, {});
      setRoleAccess(temp);

      const tempModule = [
        {
          name: 'Invoicing',
          type: [
            'Tax Invoice',
            'Recurring Invoice',
            'Estimate',
            'Custom Fields',
            'Signatures',
            'Email Subject & Body',
          ],
        },
        {
          name: 'Receivables',
          type: [
            'Dashboard',
            'Customer Ageing',
            'Customer Relationships',
            'Customer Analytics',
          ],
        },
        {
          name: 'Banking',
          type: [
            'Connecting a Bank',
            'Effortless Virtual Account',
            'Categorizing Transactions',
            'ICICI Connected Banking',
          ],
        },
        {
          name: 'Payables',
          type: [
            'Dashboard',
            'Vendor Ageing',
            'Vendor Relationships',
            'Vendor Analytics',
          ],
        },
        {
          name: 'Expense',
          type: ['Bill Booking', 'Connect via Gmail'],
        },
        {
          name: 'Payments',
          type: ['Payment', 'Transaction Password', 'Payments History'],
        },
        {
          name: 'People',
          type: ['Customers', 'Vendors', 'Employees'],
        },
        {
          name: 'Settings',
          type: [
            'Company Details',
            'Razorpay Setup',
            'Manage Account Settings',
            'Team Settings',
          ],
        },
      ];

      tempModule?.map((value) => {
        const tempName = value.name;
        const tempMain = value.type;
        const tempRoles = currentUserInfo?.permissions?.find(
          (val) => val?.name === tempName,
        );
        // if (!tempRoles?.active) {
        //   setHavePermission({ open: true, back: () => navigate('/dashboard') });
        // }
        let mainState = [];
        mainState = tempMain.map((ele) =>
          tempRoles?.groups?.find((filter) => filter?.name === ele),
        );
        setUserPermission((prev) => ({
          ...prev,
          [tempName]: {
            ...prev?.[tempName],
            [tempRoles?.name]: tempRoles?.active,
          },
        }));
        mainState?.map((ele) =>
          ele?.permissions?.map((role) =>
            setUserPermission((prev) => ({
              ...prev,
              [tempName]: {
                ...prev?.[tempName],
                [ele?.name]: {
                  ...prev?.[tempName]?.[ele?.name],
                  [role?.name]: role?.active,
                },
              },
            })),
          ),
        );
        return value;
      });
    }
    document.cookie = `eff_user_id=${currentUserInfo?.id};domain=.goeffortless.co; secure; sameSite=none`;
    if (!deviceDetails?.isDesktopDevice && currentUserInfo?.id)
      JSBridge.currentUserData();
  }, [currentUserInfo?.permissions]);

  React.useEffect(() => {
    if (deviceDetails?.isDesktopDevice) {
      localStorage.setItem('device_detect', 'desktop');
    } else {
      localStorage.setItem('device_detect', 'mobile');
    }
  }, [deviceDetails?.isDesktopDevice]);

  React.useEffect(() => {
    const accessToken = localStorage.getItem('session_token');
    const userInfo = JSON.parse(localStorage.getItem('user_info')) || user;
    const organizationProps = JSON.parse(
      localStorage.getItem('selected_organization'),
    );
    if (organizationProps) {
      validateSession(accessToken, organizationProps);
    } else {
      if (accessToken && accessToken !== 'null') validateSession(accessToken);
    }
    if (accessToken && accessToken !== 'null')
      setSessionToken({ activeToken: accessToken });
    if (userInfo) setUserInfo({ userInfo });
  }, []);

  React.useEffect(() => {
    if (organization?.orgId) {
      getCurrentUser(organization.orgId);
    }
  }, [organization?.orgId]);

  const LogoutFunction = async () => {
    await RestApi(`sessions/logout`, {
      method: METHOD.DELETE,
      headers: {
        Authorization: `Bearer ${user?.activeToken}`,
      },
    })
      .then((res) => {
        if (res && !res.error) {
          setUserInfo({ userInfo: null });
          setSessionToken({ activeToken: null });
        } else if (res.error) {
          openSnackBar({
            message: res?.error || res?.message || 'Something Went Wrong',
            type: MESSAGE_TYPE.INFO,
          });
        }
        enableLoading(false);
      })
      .catch((e) => {
        openSnackBar({
          message: Object.values(e.errors).join(),
          type: MESSAGE_TYPE.ERROR,
        });
        enableLoading(false);
      });
  };

  const logout = async () => {
    addOrgId({ orgId: null });
    JSBridge.logoutNative();
    googleLogout();
    toggleSidePanel();
    await localStorage.removeItem('user_info');
    await localStorage.removeItem('current_user_info');
    await localStorage.removeItem('session_token');
    await localStorage.removeItem('selected_organization');
    changeView('signIn');
    changeSubView('');
    await LogoutFunction();
    navigate('/');
  };
  const Dialog = withStyles({
    root: {
      '& .css-1t1j96h-MuiPaper-root-MuiDialog-paper': {
        borderRadius: '16px',
      },
    },
  })(Mui.Dialog);
  const [openProgress, setOpenProgress] = React.useState(null);
  const [statePath, setStatePath] = React.useState('');
  const [statePathSubMenu, setstatePathSubMenu] = React.useState('');
  const onProgressDialogClose = () => {
    setOpenProgress(null);
  };

  const onClickMenu = (page, path, access) => {
    const tempAccess =
      access === '' || access === undefined ? false : !roleAccess[access];

    if (tempAccess) {
      setHavePermission({
        open: true,
        back: () => {
          setHavePermission({ open: false });
        },
      });
    } else {
      const path1 = path === 'route' ? page : path;
      setStatePath(path1);
      setstatePathSubMenu(path1);
      if (page === 'onProgress') {
        setOpenProgress(true);
      } else if (page === 'logoutView') {
        logout();
      } else {
        toggleSidePanel();
        changeSubView(page);
        navigate(path1);
      }
    }
  };

  const desktopView = deviceDetails?.isDesktopDevice;
  const [ids, Setid] = React.useState('');
  const pathName = window.location.pathname;
  const [anchorElForOrganization, setAnchorElForOrganization] =
    React.useState(null);
  const [anchorElForNewOrganization, setAnchorElForNewOrganization] =
    React.useState(null);
  const NavItems =
    desktopView === false
      ? [
          {
            id: 'dashboard',
            label: 'dashboard',
            image: <DashboardWeb className={css.imgcss2} />,
            activePanel: false,
            subIcon: false,
            route: 'dashboard',
            path: '/dashboard',
            access: '',
            subFolder: [],
          },
          {
            id: 'invoice',
            label: 'invoice',
            image: <Co className={css.imgcss2} />,
            activePanel: false,
            subIcon: false,
            route: 'invoiceView',
            path: '/invoice',
            access: 'Invoicing',
            subFolder: [
              {
                id: 'invoice-new',
                label: 'New Invoices',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'invoice-new',
                access: 'Invoicing',
              },

              {
                id: 'invoice-draft',
                label: `Drafts (${invoiceCounts?.draft_count || 0})`,
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'invoice-draft',
                access: 'Invoicing',
              },
              {
                id: 'invoice-approved',
                label: `Invoices Raised (${
                  invoiceCounts?.undispatched_count || 0
                })`,
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'invoice-approved',
                access: 'Invoicing',
              },
              {
                id: 'invoice-unapproved',
                label: `Unapproved Invoice (${
                  invoiceCounts?.unapproved_count || 0
                })`,
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'invoice-unapproved',
                access: 'Invoicing',
              },
              {
                id: 'invoice-recurring',
                label: `Recurring Invoices (${
                  invoiceCounts?.recurring_invoices_count || 0
                })`,
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'invoice-recurring',
                access: 'Invoicing',
              },
              {
                id: 'invoice-estimate',
                label: 'Estimates',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'invoice-estimate',
                access: 'Invoicing',
                divider: 'stop',
              },
            ],
          },
          {
            id: 'receivables',
            label: 'receivables',
            image: <RecievablesWeb className={css.imgcss2} />,

            activePanel: false,
            subIcon: false,
            route: 'receivables',
            path: '/receivables',
            access: 'Receivables',
            subFolder: [
              {
                id: 'receivables-ageing',
                label: 'Ageing',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'receivables-ageing',
                path: '/receivables-ageing',
                access: 'Receivables',
              },
              {
                id: 'receivables-schedule',
                label: 'Schedule',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'receivables-schedule',
                path: '/receivables-schedule',
                access: 'Receivables',
                divider: 'stop',
              },
            ],
          },

          {
            id: 'payables',
            label: 'payables',
            image: <RecievablesWeb className={css.imgcss2} />,

            activePanel: false,
            subIcon: false,
            route: 'payables',
            path: '/payables',
            access: 'Payables',
            subFolder: [
              {
                id: 'payables-ageing',
                label: 'Ageing',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'payables-ageing',
                path: '/payables-ageing',
                access: 'Payables',
                divider: 'stop',
              },
            ],
          },

          {
            id: 'bill',
            label: 'Expenses',
            image: <ExpenseBillsWeb className={css.imgcss2} />,
            activePanel: false,
            subIcon: false,
            route: 'bill',
            path: '/bill',
            access: 'Expense',
            subFolder: [
              {
                id: 'bill-upload',
                label: 'Record an Expense',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'bill-upload',
                path: '/bill-upload',
                access: 'Expense',
              },
              {
                id: 'bill-yourbills',
                label: 'Your bills',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'bill-yourbills',
                path: '/bill-yourbills',
                access: 'Expense',
              },

              {
                id: 'bill-utility',
                label: 'Setup utility bills',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'bill-utility',
                path: '/bill-utility',
                access: 'Expense',
              },
              {
                id: 'bill-Add-And-Manage',
                label: 'Add & Manage',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'bill-Add-And-Manage',
                path: '/bill-Add-And-Manage',
                access: 'Expense',
              },
              {
                id: 'bill-draft',
                label: 'Draft bills',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'bill-draft',
                path: '/bill-draft',
                access: 'Expense',
              },
              {
                id: 'bill-queue',
                label: 'Bills In Queue',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'bill-queue',
                path: '/bill-queue',
                access: 'Expense',
                divider: 'stop',
              },
            ],
          },

          {
            id: 'payment',
            label: 'payments',
            image: (
              <PaymentsWeb
                // color="#283049"
                className={css.imgcss2}
              />
            ),
            activePanel: false,
            subIcon: false,
            route: 'paymentView',
            path: '/payment',
            access: 'Payments',
          },
          {
            id: 'people',
            label: 'People',
            image: <PeopleWeb className={css.imgcss2} />,
            activePanel: false,
            subIcon: false,
            route: 'people',
            path: '/people',
            access: 'People',
          },

          {
            id: 'connect-banking',
            label: 'banking',
            image: <BankingWeb className={css.imgcss2} />,
            activePanel: false,
            subIcon: false,
            route: 'banking',
            path: '/banking',
            access: 'Banking',
          },

          {
            id: 'funding',
            label: 'funding',
            image: <FundingWeb className={css.imgcss2} />,
            activePanel: false,
            // subIcon: true,
            route: 'onProgress',
            path: '',
            access: '',
            subFolder: [],
          },

          {
            id: 'payroll',
            label: 'pay roll',
            image: <PayrollWeb className={css.imgcss2} />,
            activePanel: false,
            // subIcon: true,
            route: 'onProgress',
            path: '',
            access: '',
            subFolder: [],
          },
          {
            id: 'profile',
            label: 'profile',
            image: <ProfileWeb className={css.imgcss2} />,
            activePanel: false,
            // subIcon: true,
            route: 'onProgress',
            path: '',
            access: '',
          },

          {
            id: 'complaince',
            label: 'complaince',
            image: <ComplianceWeb className={css.imgcss2} />,

            activePanel: false,
            subIcon: false,
            route: 'onProgress',
            path: '',
            access: '',
            subFolder: [],
          },
          {
            id: 'settings',
            label: 'settings',
            image: <SettingsWeb className={css.imgcss2} />,
            activePanel: false,
            subIcon: false,
            route: 'settings',
            path: '/settings',
            access: 'Settings',
            subFolder: [
              {
                id: 'settings-invoiceSettings',
                label: 'Invoice Settings',
                image: <SettingsWeb className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: '/settings-invoiceSettings',
                path: '/settings-invoiceSettings',
                access: 'Settings',
              },
              {
                id: 'settings-AccountSettings',
                label: 'Account Settings',
                image: <SettingsWeb className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: '/settings-AccountSettings',
                path: '/settings-AccountSettings',
                access: 'Settings',
              },
              {
                id: 'settings-reminderSettings',
                label: 'Reminder Settings',
                image: <SettingsWeb className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: '/settings-reminderSettings',
                path: '/settings-reminderSettings',
                access: 'Settings',
              },
              // {
              //   id: 'settings-teamSettings',
              //   label: 'Team Settings',
              //   image: <SettingsWeb className={css.imgcss2} />,
              //   activePanel: false,
              //   subIcon: false,
              //   route: '/settings-teamSettings',
              //   path: '/settings-teamSettings',
              // access: 'Settings',
              // },
            ],
          },
          {
            id: 'support',
            label: 'support',
            image: <ProfileWeb className={css.imgcss2} />,
            activePanel: false,
            // subIcon: true,
            route: 'support',
            path: 'support',
            access: '',
          },

          {
            id: 'logouts',
            label: 'logout',
            image: <LogoutWeb className={css.imgcss2} />,
            activePanel: false,
            subIcon: true,
            route: 'logoutView',
            path: '',
            access: '',
          },
        ]
      : [
          {
            id: 'dashboard',
            label: 'dashboard',
            image: <DashboardWeb className={css.imgcss2} />,
            activePanel: false,
            subIcon: false,
            route: 'Dashboard',
            path: '/dashboard',
            access: '',
          },
          {
            id: 'invoice',
            label: 'invoice',
            image: <Co className={css.imgcss2} />,
            activePanel: false,
            subIcon: false,
            route: 'invoiceView',
            path: '/invoice',
            access: 'Invoicing',
            subFolder: [
              {
                id: 'invoice-new',
                label: 'New Invoices',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'invoice-new',
                access: 'Invoicing',
              },
              {
                id: 'invoice-upload',
                label: 'Bulk Upload',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'invoice-upload',
                access: 'Invoicing',
              },
              {
                id: 'invoice-draft',
                label: `Drafts (${invoiceCounts?.draft_count || 0})`,
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'invoice-draft',
                access: 'Invoicing',
              },
              {
                id: 'invoice-approved',
                label: `Invoices Raised (${
                  invoiceCounts?.undispatched_count || 0
                })`,
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'invoice-approved',
                access: 'Invoicing',
              },
              {
                id: 'invoice-unapproved',
                label: `Unapproved Invoice (${
                  invoiceCounts?.unapproved_count || 0
                })`,
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'invoice-unapproved',
                access: 'Invoicing',
              },
              {
                id: 'invoice-recurring',
                label: `Recurring Invoices (${
                  invoiceCounts?.recurring_invoices_count || 0
                })`,
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'invoice-recurring',
                access: 'Invoicing',
              },
              {
                id: 'invoice-estimate',
                label: 'Estimates',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'invoice-estimate',
                access: 'Invoicing',
                divider: 'stop',
              },
            ],
          },
          {
            id: 'receivables',
            label: 'receivables',
            image: <RecievablesWeb className={css.imgcss2} />,
            activePanel: false,
            subIcon: false,
            route: 'receivables',
            path: '/receivables',
            access: 'Receivables',
            subFolder: [
              {
                id: 'receivables-ageing',
                label: 'Ageing',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'receivables-ageing',
                access: 'Receivables',
              },
              {
                id: 'receivables-schedule',
                label: 'Schedule',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'receivables-schedule',
                access: 'Receivables',
                divider: 'stop',
              },
            ],
          },

          {
            id: 'payables',
            label: 'payables',
            image: <RecievablesWeb className={css.imgcss2} />,
            activePanel: false,
            subIcon: false,
            route: 'payables',
            path: '/payables',
            access: 'Payables',
            subFolder: [
              {
                id: 'payables-ageing',
                label: 'Ageing',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'payables-ageing',
                access: 'Payables',
                divider: 'stop',
              },
            ],
          },

          {
            id: 'bill',
            label: 'Expenses',
            image: <ExpenseBillsWeb className={css.imgcss2} />,
            activePanel: false,
            subIcon: false,
            route: 'bill',
            path: '/bill',
            access: 'Expense',
            subFolder: [
              {
                id: 'bill-upload',
                label: 'Record an Expense',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'bill-upload',
                path: '/bill-upload',
                access: 'Expense',
              },
              {
                id: 'bill-yourbills',
                label: 'Your bills',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'bill-yourbills',
                path: '/bill-yourbills',
                access: 'Expense',
              },
              {
                id: 'bill-utility',
                label: 'Setup utility bills',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'bill-utility',
                path: '/bill-utility',
                access: 'Expense',
              },
              {
                id: 'bill-Add-And-Manage',
                label: 'Add & Manage',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'bill-Add-And-Manage',
                path: '/bill-Add-And-Manage',
                access: 'Expense',
              },
              {
                id: 'bill-draft',
                label: 'Draft bills',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'bill-draft',
                path: '/bill-draft',
                access: 'Expense',
              },
              {
                id: 'bill-queue',
                label: 'Bills In Queue',
                image: <Mui.Grid className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: 'bill-queue',
                path: '/bill-queue',
                access: 'Expense',
                divider: 'stop',
              },
            ],
          },
          {
            id: 'payment',
            label: 'payments',
            image: <PaymentsWeb className={css.imgcss2} />,
            activePanel: false,
            subIcon: false,
            route: 'paymentView',
            path: '/payment',
            access: 'Payments',
          },
          {
            id: 'connect-banking',
            label: 'banking',
            image: <BankingWeb className={css.imgcss2} />,
            activePanel: false,
            subIcon: false,
            route: 'connect-banking',
            path: '/banking',
            access: 'Banking',
          },

          {
            id: 'people',
            label: 'People',
            image: <PeopleWeb className={css.imgcss2} />,
            activePanel: false,
            subIcon: false,
            route: 'People',
            path: '/people',
            access: 'People',
          },
          {
            id: 'funding',
            label: 'funding',
            image: <FundingWeb className={css.imgcss2} />,
            activePanel: false,
            // subIcon: true,
            route: 'onProgress',
            path: '',
            access: '',
            // subFolder: [],
          },
          {
            id: 'payroll',
            label: 'pay roll',
            image: <PayrollWeb className={css.imgcss2} />,
            activePanel: false,
            // subIcon: true,
            route: 'onProgress',
            path: '',
            access: '',
            // subFolder: [],
          },
          {
            id: 'complaince',
            label: 'complaince',
            image: <ComplianceWeb className={css.imgcss2} />,
            activePanel: false,
            subIcon: false,
            route: 'onProgress',
            path: '',
            access: '',
            // subFolder: [],
          },

          {
            id: 'profile',
            label: 'profile',
            image: <ProfileWeb className={css.imgcss2} />,
            activePanel: false,
            // subIcon: true,
            route: 'onProgress',
            path: '',
            access: '',
          },

          {
            id: 'report',
            label: 'Report',
            image: <ReportWeb className={css.imgcss2} />,
            activePanel: false,
            subIcon: false,
            route: 'report',
            path: '/report',
            access: '',
          },

          {
            id: 'settings',
            label: 'settings',
            image: (
              <SettingsWeb
                // color={pathName.includes('settings') ? 'white' : '#283049'}
                className={css.imgcss2}
              />
            ),
            activePanel: false,
            subIcon: false,
            route: 'settings',
            path: '/settings',
            access: 'Settings',
            subFolder: [
              {
                id: 'settings-companyData',
                label: 'Set Up Company Data',
                image: <SettingsWeb className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: {
                  pathname: '/settings-companydata',
                  state: { from: 'from-settings-menu' },
                },
                stateValue: 'from-settings-menu',
                path: '/settings-companydata',
                access: 'Settings',
              },
              {
                id: 'settings-invoiceSettings',
                label: 'Invoice Settings',
                image: <SettingsWeb className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: '/settings-invoiceSettings',
                path: '/settings-invoiceSettings',
                access: 'Settings',
              },
              {
                id: 'settings-AccountSettings',
                label: 'Account Settings',
                image: <SettingsWeb className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: '/settings-AccountSettings',
                path: '/settings-AccountSettings',
                access: 'Settings',
              },
              {
                id: 'settings-reminderSettings',
                label: 'Reminder Settings',
                image: <SettingsWeb className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: '/settings-reminderSettings',
                path: '/settings-reminderSettings',
                access: 'Settings',
              },
              {
                id: 'settings-teamSettings',
                label: 'Team Settings',
                image: <SettingsWeb className={css.imgcss2} />,
                activePanel: false,
                subIcon: false,
                route: '/settings-teamSettings',
                path: '/settings-teamSettings',
                access: 'Settings',
              },
            ],
          },
          {
            id: 'support',
            label: 'support',
            image: <ProfileWeb className={css.imgcss2} />,
            activePanel: false,
            // subIcon: true,
            route: 'support',
            path: 'support',
            access: '',
          },

          {
            id: 'logouts',
            label: 'logout',
            image:
              desktopView === true ? (
                <LogoutWeb className={css.imgcss2} />
              ) : (
                <SignOut className={css.imgcss2} color="black" />
              ),
            activePanel: false,
            // subIcon: true,
            route: 'logoutView',
            path: '',
            access: '',
          },
        ];

  const SetActiveMethodSubFolder = (id) => {
    Setid(id);
  };
  const [navActive, setNavActive] = React.useState(NavItems);
  React.useEffect(() => {
    setNavActive(NavItems);
  }, [desktopView, invoiceCounts]);

  const initial = (del) => {
    const str = pathName?.substring(1).split('-');
    const nav = navActive.map((e) => {
      if (e.activePanel === true && del !== 'del') {
        e.subIcon = true;
      } else if (str !== e.id && del === 'del' && desktopView === false) {
        e.subIcon = false;
        e.activePanel = false;
      } else if (e.id.includes(str[0])) {
        e.subIcon = true;
        e.activePanel = true;
      } else {
        e.subIcon = false;
        e.activePanel = false;
      }
      return e;
    });
    setNavActive(nav);
  };
  const setDropDownValue = (val) => {
    const nav = navActive.map((e) => {
      if (e.id === val.id) {
        e.subIcon = true;
      } else {
        e.subIcon = false;
      }
      return e;
    });
    setNavActive(nav);
  };

  const setDropDownVal = () => {
    const str = pathName?.substring(1);
    const tempNavItem = NavItems;
    tempNavItem.forEach((e) => {
      if (e.id === navVal.id && e.id === str) {
        e.subIcon = true;
        e.activePanel = true;
      }
    });
    setNavActive(tempNavItem);
  };

  const sidePanel = () => {
    const str = pathName?.substring(1);
    if (str === 'receivables-ageing-view') {
      setNavVal({
        id: 'receivables-ageing',
        icon: true,
      });
      SetActiveMethodSubFolder('receivables-ageing');
    } else if (str === 'payables-ageing-view') {
      setNavVal({
        id: 'payables-ageing',
        icon: true,
      });
      SetActiveMethodSubFolder('payables-ageing');
    } else if (str.includes('invoice-estimate')) {
      setNavVal({
        id: 'invoice-estimate',
        icon: true,
      });
      SetActiveMethodSubFolder('invoice-estimate');
    } else if (str.includes('invoice-new')) {
      setNavVal({
        id: 'invoice-new',
        icon: true,
      });
      SetActiveMethodSubFolder('invoice-new');
    } else if (str.includes('invoice-unapproved')) {
      setNavVal({
        id: 'invoice-unapproved',
        icon: true,
      });
      SetActiveMethodSubFolder('invoice-unapproved');
    } else if (str.includes('invoice-recurring')) {
      setNavVal({
        id: 'invoice-recurring',
        icon: true,
      });
      SetActiveMethodSubFolder('invoice-recurring');
    } else if (str.includes('invoice-estimate')) {
      setNavVal({
        id: 'invoice-estimate',
        icon: true,
      });
      SetActiveMethodSubFolder('invoice-estimate');
    } else if (str.includes('settings-invoice')) {
      setNavVal({
        id: 'settings-invoiceSettings',
        icon: true,
      });
      SetActiveMethodSubFolder('settings-invoiceSettings');
    } else if (str.includes('bill-Add-And-Manage')) {
      setNavVal({
        id: 'bill-Add-And-Manage',
        icon: true,
      });
      SetActiveMethodSubFolder('bill-Add-And-Manage');
    } else {
      setNavVal({
        id: str,
        icon: true,
      });
      SetActiveMethodSubFolder(str);
    }
    setDropDownVal();
  };
  React.useEffect(() => {
    sidePanel();
  }, [pathName, invoiceCounts]);

  React.useEffect(() => {
    initial();
  }, [openSidePanel]);

  React.useEffect(() => {
    initial('del');
  }, [navVal]);
  const subMenuClick = (d) => {
    if (d.id !== pathName?.substring(1)) {
      setActiveInvoiceId({
        activeInvoiceId: '',
      });
      setConnect(false);
      onClickMenu(d.route, 'route', d.access);
      SetActiveMethodSubFolder(d.id);
      if (d?.stateValue && roleAccess?.Settings) {
        navigate(d?.route, { state: { from: d?.stateValue } });
      }
      initial();
    }
  };

  return (
    <>
      <Drawer
        anchor="left"
        open={openSidePanel}
        onClose={toggleSidePanel}
        classes={desktopView === true ? classes : classes2}
        variant={desktopView === true ? 'permanent' : 'temporary'}
        style={{
          display:
            window.location.pathname === '/companydata' ? 'none' : 'block',
        }}
      >
        <div
          className={
            desktopView === false
              ? css.sidePanelContainer
              : css.sidePanelContainer2
          }
        >
          <>
            {' '}
            {desktopView === false ? (
              <>
                {' '}
                <Mui.Stack
                  direction="column"
                  className={css.stack}
                  style={{
                    marginLeft: 'auto',
                  }}
                  onClick={() => {
                    navigate('/dashboard');
                  }}
                >
                  <Mui.Stack
                    direction="row"
                    className={
                      desktopView === true ? css.poweredBy : css.poweredByMobile
                    }
                    alignItems="center"
                    onClick={() => setAnchorElForOrganization(true)}
                  >
                    <Mui.Stack
                      style={{
                        width: '60px',
                        height: '60px',
                        justifyContent: 'center',
                      }}
                    >
                      <Mui.Avatar
                        sx={{
                          borderRadius: logo ? 0 : '50%',
                          width: logo ? 'auto' : '40px',
                          '& .MuiAvatar-img': {
                            width: logo ? 'auto' : '100%',
                          },
                        }}
                        src={
                          logo ||
                          `https://avatars.dicebear.com/api/initials/${organization?.name}.svg?chars=2`
                        }
                      />
                    </Mui.Stack>
                    {desktopView === true ? (
                      <Mui.Typography className={css.effortlessName}>
                        {organization?.name}
                      </Mui.Typography>
                    ) : (
                      <>
                        <Mui.Stack className={css.widthName}>
                          <Mui.Typography className={css.effortlessNameMobile}>
                            {organization?.name}
                          </Mui.Typography>
                          <Mui.Typography className={css.effortlessNameMobile}>
                            {user?.userName}
                          </Mui.Typography>
                        </Mui.Stack>
                        <Mui.Stack className={css.switchCompany}>
                          <KeyboardArrowUpIcon
                            style={{ color: 'white' }}
                            className={
                              !desktopView ? css.imgcss3Mobile : css.imgcss3
                            }
                          />
                          <KeyboardArrowDownIcon
                            style={{ color: 'white' }}
                            className={
                              !desktopView ? css.imgcss3Mobile : css.imgcss3
                            }
                          />
                        </Mui.Stack>
                      </>
                    )}
                  </Mui.Stack>
                </Mui.Stack>
                <Mui.Divider />
              </>
            ) : (
              <div className={css.mlfortitle}>
                <div className={css.poweredBy}>
                  <Mui.Avatar
                    sx={{
                      borderRadius: logo ? 0 : '50%',
                      width: logo ? '40px' : '40px',
                      height: logo ? '40px' : '40px',
                      '& .MuiAvatar-img': {
                        width: logo ? '40px' : '100%',
                        height: logo ? '40px' : '100%',
                        objectFit: 'contain',
                      },
                    }}
                    src={
                      logo ||
                      `https://avatars.dicebear.com/api/initials/${organization?.name}.svg?chars=2`
                    }
                  />
                  <Mui.Typography className={css.effortlessName}>
                    {organization?.shortName}
                  </Mui.Typography>
                  <Mui.Stack
                    className={`${
                      desktopView === false
                        ? css.switchCompany
                        : css.switchCompanyDesktop
                    }`}
                    onClick={(e) => {
                      setAnchorElForOrganization(true);
                      setAnchorEl(e.currentTarget);
                    }}
                  >
                    <KeyboardArrowUpIcon
                      style={{ color: '#283049' }}
                      className={!desktopView ? css.imgcss3Mobile : css.imgcss3}
                    />
                    <KeyboardArrowDownIcon
                      style={{ color: '#283049' }}
                      className={!desktopView ? css.imgcss3Mobile : css.imgcss3}
                    />
                  </Mui.Stack>
                </div>
                <Divider width="164px" />
              </div>
            )}
          </>
          <Mui.Stack className={css.sidePanelListContainer}>
            {navActive?.map((e) => (
              <div
                key={`index${e.id}`}
                className={e.activePanel && css.activeMenu}
              >
                {e.id === 'settings' && (
                  <Mui.Divider
                    sx={{ display: desktopView ? 'none' : '' }}
                    className={css.divid}
                  />
                )}
                <Mui.Stack direction="row">
                  <Mui.Stack
                    component={Router.Link}
                    direction="row"
                    className={css.headLink}
                    onClick={() => {
                      setActiveInvoiceId({
                        activeInvoiceId: '',
                      });
                      setConnect(false);
                      onClickMenu(e.route, e.path, e.access);
                      setNavVal({ id: e.id, icon: e.subIcon, route: e.route });
                    }}
                    to={statePath}
                  >
                    <Mui.Stack
                      component={Router.Link}
                      direction="row"
                      style={{ width: desktopView ? '' : '200px' }}
                      className={
                        (!desktopView &&
                          (e.activePanel
                            ? `${css.sidePanelItem} ${css.sidePanelItemActive}`
                            : `${css.sidePanelItem}`)) ||
                        (e.activePanel
                          ? `${css.sidePanelItem2} ${css.sidePanelItemActive2}`
                          : `${css.sidePanelItem}`)
                      }
                      key={e.id}
                      onClick={() => {
                        setActiveInvoiceId({
                          activeInvoiceId: '',
                        });
                        setConnect(false);
                        onClickMenu(e.route, e.path, e.access);
                        setNavVal({
                          id: e.id,
                          icon: e.subIcon,
                          route: e.route,
                        });
                      }}
                      to={statePath}
                    >
                      {e.image}

                      <Mui.Stack
                        component={Router.Link}
                        direction="row"
                        justifyContent="space-between"
                        className={
                          desktopView === true
                            ? css.dropDownLabel
                            : css.dropDownLabelMobi
                        }
                        key={e.id}
                        onClick={() => {
                          setActiveInvoiceId({
                            activeInvoiceId: '',
                          });
                          setConnect(false);
                          onClickMenu(e.route, e.path, e.access);
                          setNavVal({
                            id: e.id,
                            icon: e.subIcon,
                            route: e.route,
                          });
                        }}
                        to={statePath}
                      >
                        <Mui.Typography
                          style={{ width: desktopView ? '' : '200px' }}
                          className={
                            (!desktopView &&
                              (e.activePanel
                                ? `${css.labelActive}`
                                : `${css.label}`)) ||
                            (e.activePanel
                              ? `${css.labelActive2}`
                              : `${css.label2}`)
                          }
                        >
                          {e.label}
                        </Mui.Typography>
                      </Mui.Stack>
                    </Mui.Stack>
                  </Mui.Stack>
                  <>
                    {e.id !== 'logouts' &&
                    e.id !== 'report' &&
                    e.id !== 'profile' &&
                    e.id !== 'people' &&
                    e.id !== 'payment' &&
                    e.id !== 'banking' &&
                    e.id !== 'connect-banking' &&
                    e.id !== 'complaince' &&
                    e.id !== 'payroll' &&
                    e.id !== 'funding' &&
                    e.id !== 'support' &&
                    e.id !== 'dashboard' ? (
                      <Mui.Stack
                        alignItems="flex-start"
                        alignSelf="center"
                        sx={{ ml: e.activePanel === true ? -3 : '' }}
                        className={!desktopView && css.sidepanelDropdownButton}
                        onClick={() => {
                          setDropDownValue(e);
                        }}
                      >
                        {(!e.subIcon && e.activePanel && (
                          <>
                            <KeyboardArrowDownIcon
                              style={{
                                color: e.activePanel ? 'white' : 'black',
                              }}
                              className={
                                !desktopView ? css.imgcss3Mobile : css.imgcss3
                              }
                            />
                          </>
                        )) ||
                          ((e.subIcon && e.activePanel) || e.subIcon ? (
                            <KeyboardArrowUpIcon
                              style={{
                                color: e.activePanel ? 'white' : 'black',
                              }}
                              className={
                                !desktopView ? css.imgcss3Mobile : css.imgcss3
                              }
                            />
                          ) : (
                            <KeyboardArrowDownIcon className={css.imgcss2} />
                          ))}
                      </Mui.Stack>
                    ) : (
                      ''
                    )}
                  </>
                </Mui.Stack>
                <SubMenuList
                  text={e}
                  subMenuClick={(event) => subMenuClick(event)}
                  ids={ids}
                  statePathSubMenu={statePathSubMenu}
                />
              </div>
            ))}
            {desktopView === false ? (
              <div className={css.packageJsonVersion}>
                <span>V {PackageJson.version}</span>
              </div>
            ) : (
              <>
                <Mui.Stack direction="column" className={css.stack}>
                  <Divider width="164px" />
                  <div className={css.poweredByContainer}>
                    <div className={css.poweredByDiv1}>
                      <Mui.Typography className={css.bottomsidepanel}>
                        Powered by
                      </Mui.Typography>
                      <Mui.Stack direction="row" className={css.poweredBy}>
                        <img
                          className={css.imgcss}
                          src={effortless}
                          style={{ width: '120px' }}
                          alt={action}
                        />
                      </Mui.Stack>
                    </div>
                    <div className={css.poweredByDiv2}>
                      <span>V {PackageJson.version}</span>
                    </div>
                  </div>
                </Mui.Stack>
              </>
            )}
          </Mui.Stack>
          <SelectBottomSheet
            open={anchorElForOrganization && desktopView === false}
            onClose={() => setAnchorElForOrganization(null)}
            triggerComponent={<div style={{ display: 'none' }} />}
            addNewSheet
          >
            <div className={css.effortlessOptions}>
              <Puller />
              <p className={css.heading}>Switch Company</p>
              <ul
                className={css.optionsWrapper}
                style={{
                  overflow: 'auto',
                  minHeight: 'auto',
                  maxHeight: '20rem',
                }}
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
                            const shortName = val?.short_name
                              ? val.short_name
                              : '';
                            localStorage.setItem(
                              'selected_organization',
                              JSON.stringify({ orgId, orgName, shortName }),
                            );
                            addOrganization({ orgId, orgName, shortName });
                            setAnchorElForOrganization(null);
                            toggleSidePanel();
                            navigate('/');
                          }}
                          className={css.appBarAccountSymbol}
                          p={0}
                          alignItems="center"
                          width="100%"
                        >
                          <Mui.Avatar
                            className={
                              organization?.orgId === val?.id
                                ? css.avatarForPopoverSelect
                                : css.avatarForPopover
                            }
                          >
                            <Mui.Typography variant="h5">
                              {val?.name?.slice(0, 1)?.toUpperCase()}
                            </Mui.Typography>
                          </Mui.Avatar>

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
                  setAnchorElForOrganization(null);
                  setAnchorElForNewOrganization(true);
                }}
                className={css.appBarAccountSymbolForBottom}
                alignItems="center"
                width="100%"
              >
                <Mui.Grid className={css.itemsForBottom}>
                  +Add New Company
                </Mui.Grid>
              </Mui.Stack>
            </div>
          </SelectBottomSheet>
          <SelectBottomSheet
            open={anchorElForNewOrganization}
            onClose={() => setAnchorElForNewOrganization(null)}
            triggerComponent={<div style={{ display: 'none' }} />}
            // addNewSheet
          >
            <AddNewCompany
              handleClose={() => {
                setAnchorElForNewOrganization(null);
                toggleSidePanel();
              }}
            />
          </SelectBottomSheet>
        </div>
        <Dialog
          open={Boolean(openProgress)}
          onClose={onProgressDialogClose}
          sx={{ borderRadius: '40px !important' }}
        >
          <Mui.Stack style={{ padding: '1rem' }}>
            <Mui.Typography variant="h6">Whoa!</Mui.Typography>
            <Mui.Typography>This feature is coming soon!</Mui.Typography>
          </Mui.Stack>
        </Dialog>

        <Popper
          open={anchorElForOrganization && desktopView === true}
          anchorEl={anchorEl}
          role={undefined}
          transition
          disablePortal
          style={{
            maxHeight: '50vh',
            overflow: 'auto',
            background: '#fff',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: 'center top' }}
            >
              <Paper
                style={{ width: '17vw', padding: '0 5px', background: '#fff' }}
              >
                <ClickAwayListener
                  onClickAway={() => {
                    setAnchorElForOrganization(null);
                    setAnchorEl(null);
                  }}
                >
                  <MenuList
                    autoFocusItem={
                      anchorElForOrganization && desktopView === true
                    }
                    id="menu-list-grow"
                    style={{ background: '#fff' }}
                  >
                    <Mui.Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      mx={1}
                    >
                      <p className={css.companyList}>Company List</p>
                      <div
                        onClick={() => {
                          setAnchorElForOrganization(null);
                          setAnchorEl(null);
                        }}
                      >
                        <p className={css.companyListClose}>Close</p>
                      </div>
                    </Mui.Stack>
                    {user &&
                      user?.userInfo?.data?.map((val) => (
                        <div
                          key={`index${val.id}`}
                          style={{ background: '#fff' }}
                        >
                          <li aria-hidden="true" style={{ background: '#fff' }}>
                            <Mui.Stack
                              direction="row"
                              alignItems="center"
                              style={{ background: '#fff' }}
                            >
                              <Mui.Stack
                                direction="row"
                                onClick={() => {
                                  const orgId = val?.id ? val.id : '';
                                  const orgName = val?.name ? val.name : '';
                                  const shortName = val?.short_name
                                    ? val.short_name
                                    : '';
                                  localStorage.setItem(
                                    'selected_organization',
                                    JSON.stringify({
                                      orgId,
                                      orgName,
                                      shortName,
                                    }),
                                  );
                                  addOrganization({
                                    orgId,
                                    orgName,
                                    shortName,
                                  });
                                  setAnchorElForOrganization(null);
                                  toggleSidePanel();
                                  navigate('/');
                                }}
                                className={css.appBarAccountSymbol}
                                p={0}
                                alignItems="center"
                                width="100%"
                              >
                                <Mui.Avatar className={css.avatarForPopover}>
                                  <Mui.Typography variant="h6">
                                    {val?.name?.slice(0, 1)?.toUpperCase()}
                                  </Mui.Typography>
                                </Mui.Avatar>
                                <MenuItem className={css.menuListText}>
                                  {val?.short_name}
                                </MenuItem>
                              </Mui.Stack>
                              {organization.orgId === val?.id && (
                                <DoneIcon
                                  style={{ color: '#f38b09', margin: 5 }}
                                />
                              )}
                            </Mui.Stack>
                          </li>
                        </div>
                      ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Drawer>
      {havePermission.open && (
        <PermissionDialog onClose={() => havePermission.back()} />
      )}
    </>
  );
};

export default AppSidePanel;
