/* @flow */
/**
 * @fileoverview App launch component
 */

import React, { useReducer } from 'react';
import actionCable from 'actioncable';
import CircularProgress from '@material-ui/core/CircularProgress';
import { BASE_URL } from '@services/RestApi.jsx';
// import NavigationSetup from '@root/NavigationSetup.jsx';
import AppContext from '@root/AppContext.jsx';
import AppReducer from '@root/AppReducer.jsx';
import AppActions from '@root/AppActions.jsx';
import SnackBarContainer from '@components/SnackBarContainer/SnackBarContainer.jsx';
import AppSidePanel from '@components/AppSidePanel/AppSidePanel.jsx';
import * as Router from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import css from '@root/App.scss';
import { LicenseInfo } from '@mui/x-license-pro';
import CommonRoute from './routes/Route';

const INITIAL_STATE = {
  user: null,
  viewType: 'signIn',
  organization: null,
  loading: false,
  snackBar: {},
  registeredListeners: {},
  editRole: {},
  selectedOrg: 'all',
  cable: actionCable.createConsumer(
    `wss://${BASE_URL.split('//')[1].split('/')[0]}/cable`,
  ),
};

Sentry.init({
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        React.useEffect,
      ),
    }),
  ],
  tracesSampleRate: 1.0,
});

const SentryRoutes = Sentry.withSentryReactRouterV6Routing(CommonRoute);

LicenseInfo.setLicenseKey(
  'e8185c84beb4956b5b6eb26765b7b0a1Tz01NDk0NixFPTE3MDA5MDAyNzQwNDQsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI=',
);

const App = () => {
  const [state, dispatch] = useReducer(AppReducer, INITIAL_STATE);
  const [amt, setAmt] = React.useState({});
  const [categorize, setCategorize] = React.useState({});
  const [indexHeading, setIndexHeading] = React.useState({});
  const [dates, setDates] = React.useState({ status: false });
  const [logo, setLogo] = React.useState('');
  const [transactionType, setTransactionType] = React.useState('IMPS');
  const [transactionTypeList, setTransactionTypeList] = React.useState([]);
  const [connect, setConnect] = React.useState(false);
  const [invoiceCounts, setInvoiceCounts] = React.useState({});
  const [userPermissions, setUserPermission] = React.useState({});

  // TODO - Move to AppActions.jsx

  const currentValue = {
    ...state,
    user: state.user,
    ...AppActions(dispatch),
    setAmt,
    amt,
    categorize,
    setCategorize,
    indexHeading,
    setIndexHeading,
    dates,
    setDates,
    logo,
    setLogo,
    transactionType,
    setTransactionType,
    connect,
    setConnect,
    transactionTypeList,
    setTransactionTypeList,
    invoiceCounts,
    setInvoiceCounts,
    userPermissions,
    setUserPermission,
  };

  const { snackBar, closeSnackBar } = currentValue;

  return (
    // Todo
    // Transfer it to react Route module
    <Router.BrowserRouter>
      <AppContext.Provider value={currentValue}>
        {state.loading && (
          <div className={css.loadingContainer}>
            <CircularProgress className={css.loader} />
            <span>{state?.loadingText}</span>
          </div>
        )}
        {/* {NavigationSetup.map((n) => {
        const Component = n.view;

        if (n.id === state.viewType) {
          return <Component key={`${n.id}`} />;
        }
        return <></>;
      })} */}
        {localStorage.getItem('session_token') !== null &&
          localStorage.getItem('session_token') !== 'null' && <AppSidePanel />}

        <GoogleOAuthProvider clientId="948981309308-7fgus5h35p1ftajdfmbmk74o3nnod6oe.apps.googleusercontent.com">
          <SentryRoutes>
            <CommonRoute />
          </SentryRoutes>
        </GoogleOAuthProvider>

        {snackBar.open && (
          <SnackBarContainer
            open={!!snackBar.open}
            message={snackBar.message}
            type={snackBar.type}
            handleClose={() => closeSnackBar()}
          />
        )}
      </AppContext.Provider>
    </Router.BrowserRouter>
  );
};

export default App;
