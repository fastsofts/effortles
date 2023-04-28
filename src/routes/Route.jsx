import React from 'react';
import * as Router from 'react-router-dom';
import AppContext from '@root/AppContext.jsx';
import SignInContainer from '@core/LoginContainer/SignInContainer.jsx';
import SignUpContainer from '@core/LoginContainer/SignUpContainer.jsx';
import VerificationCodeContainer from '@core/LoginContainer/VerificationCodeContainer.jsx';
import FillOrgDetailsContainer from '@core/LoginContainer/FillOrgDetailsContainer.jsx';
import ForgetPasswordContainer from '@core/LoginContainer/ForgotPasswordContainer.jsx';
import DashboardViewContainer from '@core/DashboardView/DashboardViewContainer.jsx';
import DashboardIndex from '@core/DashboardView/DashboardPage/DashboardIndex';
import PageTitle from '@core/DashboardView/PageTitle';
import css from '@core/DashboardView/DashboardViewContainer.scss';
import DraftInvoiceContainer from '@core/InvoiceView/DraftInvoiceContainer';
import InvoiceView from '@core/InvoiceView/InvoiceViewContainer';
import RecurringInvoiceContainer from '@core/InvoiceView/RecurringInvoiceContainer';
import ApprovedInvoiceContainer from '@core/InvoiceView/UndispatchedInvoiceContainer';
import UnApprovedInvoiceContainer from '@core/InvoiceView/UnApprovedInvoiceContainer';
import CreateInvoiceContainerBeta from '@core/InvoiceView/CreateInvoiceContainerBeta';
import GenerateInvoicePDF from '@core/InvoiceView/GenerateInvoicePdf';
// import Banking from '@core/Banking/banking';
// import BankList from '@core/Banking/BankList';
// Added by VNS
import BankCategoryDetails from '@core/Banking/Categorization/Bankingcategorizationdetails';
import Categorization from '@core/Banking/Categorization/BankingCategorization.jsx';
import Support from '@core/Support/Support';

import BankAccontDetails from '@core/Banking/AccountBalance/BankAccontDetails';
// import CategorizeTransactions from '@core/Banking/AccountBalance/CategorizeTransactions';
import Done from '@core/Banking/AccountBalance/Done';
import People from '@core/people/people';
import SuccessPage from '@core/InvoiceView/SuccessPage';
import DeliverInvoiceToCustomer from '@core/InvoiceView/DeliverInvoiceToCustomer';
import RecurringInvoiceHistory from '@core/InvoiceView/RecurringInvoiceHistory';
import BillBookViewContainer from '@core/BillBookView/BillBookViewContainer.jsx';
import UploadYourBillContainer from '@core/BillBookView/UploadYourBillContainer.jsx';
// import RecordAnExpense from '@core/BillBookView/RecordAnExpense.jsx';
import UtilityBills from '@core/BillBookView/UtilityBillsViewContainer.jsx';
import BillsInQueue from '@core/BillBookView/BillsInQueue.jsx';
import YourBills from '@core/BillBookView/YourBills.jsx';
import DraftBill from '@core/BillBookView/BillsInDraft.jsx';
import SalaryCost from '@core/BillBookView/SalaryCost.jsx';
import Payments from '@core/PaymentView/Payments.jsx';
import AdvancePayment from '@core/PaymentView/AdvancePayment.jsx';
import MakePayment from '@core/PaymentView/MakePayment.jsx';
import PaymentHistory from '@core/PaymentView/PaymentHistory';
import AccountBalance from '@core/Banking/AccountBalance/AccoutBalance.jsx';
import BankingForms from '@core/Banking/bankingForms.jsx';
import SettingsMenu from '@core/Settings/SettingsMenu.jsx';
import Receivables from '@core/Receivables/Receivables.jsx';
// import Schedule from '@core/Receivables/Schedule/Schedule.jsx';
import SelectedAging from '@core/Receivables/Ageing/SelectedAgeing.jsx';
import RequestPayment from '@core/Receivables/Ageing/RequestPayment.jsx';
import CapturePayment from '@core/Banking/capturePayment';

import Payables from '@core/Payables/Receivables.jsx';
// import Schedule from '@core/Payables/Schedule/Schedule.jsx';
import PaySelectedAging from '@core/Payables/Ageing/SelectedAgeing.jsx';
import PayRequestPayment from '@core/Payables/Ageing/RequestPayment.jsx';

import MultiplePayment from '@core/PaymentView/MultiplePayments/MultiplePayment.jsx';
import DeliverComments from '@core/PaymentView/MultiplePayments/DeliverComments.jsx';
import ApprovalProcessTwo from '@core/PaymentView/MultiplePayments/ApprovalProcessTwo.jsx';
import ApprovedProcessThree from '@core/PaymentView/MultiplePayments/ApprovedProcessThree.jsx';
import ApprovalProcessFour from '@core/PaymentView/MultiplePayments/ApprovalProcessFour.jsx';
import ApprovalProcessFive from '@core/PaymentView/MultiplePayments/ApprovalProcessFive.jsx';
import PaymentsApprovalTwo from '@core/PaymentView/MultiplePayments/PaymentsApprovalTwo.jsx';

// import TeamSettings from '../core/Settings/TeamSettings/TeamSettings';
import TeamSettingRoles from '../core/Settings/TeamSettings/TeamSettingRoles';
import TeamsRoles from '../core/Settings/TeamSettings/TeamsRoles';
import ReminderSettings from '../core/Settings/ReminderSettings/ReminderSettings';
import ActivityLogs from '../core/Settings/ActivitySettings/ActivityLogs';
import AccountSettings from '../core/Settings/AccountSettings/AccountSettings';
import InvoiceSettings from '../core/Settings/InvoiceSettings/InvoiceSettings';
import ShareInvoiceOption from '../core/Settings/InvoiceSettings/ShareInvoiceOption';
import EmailSubjectBody from '../core/Settings/InvoiceSettings/EmailSubjectBody';
import OtherPaymentOptions from '../core/Settings/InvoiceSettings/OtherPaymentOptions';
import OtpVerificationCommon from '../core/OtpVerificationCommon';
import Signature from '../core/Settings/InvoiceSettings/Signature';
import TermsAndConditions from '../core/Settings/InvoiceSettings/TermsAndConditions';
import ContactDetailsOnInvoice from '../core/Settings/InvoiceSettings/ContactDetailsOnInvoice';
import InvoiceDesigns from '../core/Settings/InvoiceSettings/InvoiceDesigns';
import AdditionalSettings from '../core/Settings/InvoiceSettings/AdditionalSettings';
// import EffortlessPay from '@core/PaymentView/EffortlessPay/EffortlessPay.jsx';
// import Processing from '../PaymentView/MultiplePayments/Processing';
import BulkUpload from '../core/InvoiceView/bulkUpload';
import * as Route from './Private-route';
import AddAndManage from '../core/BillBookView/AddAndManage';
import BusinessDetails from '../core/Settings/UpdateDetails/BusinessDetails';
import MultiplePayments from '../core/PaymentView/MultiplePayments/MultiplePayments';
import MakeAPayment from '../core/PaymentView/PaymentsApproval/MakeAPayment';
import Processing from '../core/PaymentView/PaymentsApproval/Processing';
import AddAndManageEmailList from '../core/BillBookView/AddAndManageEmailList';
import AddAndManageStatement from '../core/BillBookView/AddAndManageStatement';
import RazorPayMerchant from '../core/Settings/InvoiceSettings/RazorPayMerchant';
import CompanyData from '../core/LoginContainer/CompanyData';
import AddNewCompany from '../core/LoginContainer/AddNewCompany';
import { ConnectBanking } from '../core/Banking/ConnectBanking/ConnectBanking';
import GenericQueryForm from '../components/GenericQueryForm/GenericQueryForm';
import MemberReq from '../components/MemberRequest/MemberReq';
import VerifyMember from '../components/VerifyMember/VerifyMember';
import Ippopay from '../core/Banking/Ippopay';
import Report from '../core/ReportView/Report';
// import CategorizeDashboard from '@core/Banking/Categorization/categorizeDashboard.jsx';
import BankingNew from '../core/Banking/NewBanking/Banknew';
import BankStatement from '../core/Banking/NewBanking/Statement/BankStatement';
import LoadMoney from '../core/Banking/NewBanking/Mobile/LoadMoneyMobile';
import WithdrawMoney from '../core/Banking/NewBanking/Mobile/WithdrawMoneyMobile';
import { Service } from './Service.jsx';
import Notification from '../core/Notification/Notification';
// import Agening from '../core/Receivables/Ageing/Ageing';

export default function CommonRoute() {
  const navigate = Router.useNavigate();
  // const reg = /^[a-zA-Z0-9]*$/;
  const redirectUrl = new URLSearchParams(window.location.search);
  const paramsObj = Array.from(redirectUrl.entries()).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: value }),
    {},
  );
  if (paramsObj.redirect_to) {
    window.location.replace(
      paramsObj.redirect_to
        .match(/.{1,2}/g)
        .map((byte) => String.fromCharCode(parseInt(byte, 16)))
        .join(''),
    );
  }
  const url = window.location.pathname;
  const paramsString = window.location.search;
  Service(paramsString, url);
  // const { state } = Router.useLocation();

  const { connect, setConnect } = React.useContext(AppContext);

  const device = localStorage?.getItem('device_detect');
  // const pathName = window.location.pathname;

  return Router.useRoutes([
    // page Not Found

    {
      path: '*',
      element: (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ffff',
            fontSize: 50,
            textAlign: 'center',
          }}
        >
          PAGE NOT FOUND!!!
        </div>
      ),
    },

    // Account

    {
      path: '/',
      element: (
        <Route.Private>
          <SignInContainer />
        </Route.Private>
      ),
    },
    {
      path: '/signup',
      element: (
        <Route.Private>
          <SignUpContainer />
        </Route.Private>
      ),
    },
    // {
    //   path: '/companydata',
    //   element: (
    //     <Route.Private>
    //       <CompanyData />
    //     </Route.Private>
    //   ),
    // },
    {
      path: '/forgot-password',
      element: (
        <Route.Private>
          <ForgetPasswordContainer />
        </Route.Private>
      ),
    },
    {
      path: '/verification',
      element: (
        <Route.Private>
          <VerificationCodeContainer />
        </Route.Private>
      ),
    },
    {
      path: '/fill-org-details',
      element: (
        <Route.Private>
          <FillOrgDetailsContainer />
        </Route.Private>
      ),
    },

    {
      path: '/generic-query-form',
      element: (
        <Route.Private>
          <GenericQueryForm />
        </Route.Private>
      ),
    },

    {
      path: '/member-request',
      element: (
        <Route.Private>
          <MemberReq />
        </Route.Private>
      ),
    },

    {
      path: '/verify-member',
      element: (
        <Route.Private>
          <VerifyMember />
        </Route.Private>
      ),
    },

    // Main-Layout
    {
      path: '/*',
      element: (
        <Route.Private protect>
          <DashboardViewContainer />
        </Route.Private>
      ),
      children: [
        // company

        {
          path: 'companydata',
          element: <CompanyData />,
        },

        // dashboard

        {
          path: 'dashboard',
          element: (
            <>
              <PageTitle title="Dashboard" />
              <div
                className={
                  device === 'mobile'
                    ? css.dashboardBodyContainer
                    : css.dashboardBodyContainerDesktop
                }
              >
                <DashboardIndex />
              </div>
            </>
          ),
        },

        // invoice

        {
          path: 'invoice',
          element: (
            <>
              <PageTitle
                title="Invoice"
                onClick={() => navigate('/dashboard')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <InvoiceView />
              </div>
            </>
          ),
        },

        // new- invoice

        {
          path: 'invoice-new',
          element: (
            <>
              {/* <PageTitle
                title="New Invoice"
                onClick={() => navigate('/invoice')}
              />
              <div
                className={
                  device === 'mobile'
                    ? css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              > */}
              <CreateInvoiceContainerBeta />
              {/* </div> */}
            </>
          ),
        },

        {
          path: 'invoice-new-pdf',
          element: (
            <>
              <PageTitle
                title="New Invoice"
                onClick={() => {
                  navigate('invoice-new', { state: { from: 'pdf' } });
                  // navigate(-1, { state: { from: 'pdf' } });
                }}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <GenerateInvoicePDF />
              </div>
            </>
          ),
        },

        {
          path: 'invoice-new-deliver',
          element: (
            <>
              <PageTitle title="New Invoice" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <DeliverInvoiceToCustomer />
              </div>
            </>
          ),
        },

        // draft invoice

        {
          path: 'invoice-draft',
          element: (
            <>
              <PageTitle
                title="Draft Invoice"
                onClick={() => navigate('/invoice')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <DraftInvoiceContainer />
              </div>
            </>
          ),
        },

        {
          path: 'invoice-draft-new',
          element: (
            <>
              {/* <PageTitle
                title="Draft Invoice"
                onClick={() => navigate('/invoice-draft')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              > */}
              <CreateInvoiceContainerBeta />
              {/* </div> */}
            </>
          ),
        },
        {
          path: 'invoice-draft-pdf',
          element: (
            <>
              <PageTitle
                title="Draft "
                onClick={() => navigate('/invoice-draft')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <GenerateInvoicePDF />
              </div>
            </>
          ),
        },
        // unapproved invoice

        {
          path: 'invoice-unapproved',
          element: (
            <>
              <PageTitle
                title="Unapproved Invoice"
                onClick={() => navigate('/invoice')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <UnApprovedInvoiceContainer />
              </div>
            </>
          ),
        },

        {
          path: 'invoice-unapproved-pdf',
          element: (
            <>
              <PageTitle
                title="Unapproved Invoice"
                onClick={() => navigate('invoice-unapproved')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <GenerateInvoicePDF />
              </div>
            </>
          ),
        },

        {
          path: 'invoice-unapproved-success',
          element: (
            <>
              <PageTitle
                title="Unapproved Invoice"
                onClick={() => navigate('/invoice-unapproved')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <SuccessPage />
              </div>
            </>
          ),
        },

        // approved invoice

        {
          path: 'invoice-approved',
          element: (
            <>
              {/* <PageTitle
                title="Invoices Raised"
                onClick={() => navigate('/invoice')}
              /> */}
              {/* <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              > */}
              <ApprovedInvoiceContainer />
              {/* </div> */}
            </>
          ),
        },

        {
          path: 'ippopay',
          element: (
            <>
              <PageTitle
                title="Invoices Raised"
                onClick={() => {
                  navigate(-1);
                }}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <Ippopay />
              </div>
            </>
          ),
        },

        {
          path: 'invoice-approved-pdf',
          element: (
            <>
              <PageTitle
                title="Invoices Raised"
                onClick={() => {
                  // navigate('invoice-approved');
                  navigate(-1);
                }}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <GenerateInvoicePDF />
              </div>
            </>
          ),
        },

        {
          path: 'invoice-approved-deliver',
          element: (
            <>
              <PageTitle title="Invoices Raised" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <DeliverInvoiceToCustomer />
              </div>
            </>
          ),
        },

        // recurring invoice

        {
          path: 'invoice-recurring',
          element: (
            <>
              <PageTitle
                title="Recurring Invoice"
                onClick={() => navigate('/invoice')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <RecurringInvoiceContainer />
              </div>
            </>
          ),
        },

        {
          path: 'invoice-recurring-view',
          element: (
            <>
              <PageTitle
                title="Recurring Invoice"
                onClick={() => navigate('/invoice-recurring')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <RecurringInvoiceHistory />
              </div>
            </>
          ),
        },
        {
          path: 'invoice-recurring-edit',
          element: (
            <>
              {/* <PageTitle
                title="Recurring Invoice"
                onClick={() => navigate('invoice-recurring')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              > */}
              <CreateInvoiceContainerBeta />
              {/* </div> */}
            </>
          ),
        },

        // estimate

        {
          path: 'invoice-estimate',
          element: (
            <>
              {/* <PageTitle
                title="Estimate"
                onClick={() => navigate('/invoice')}
              />
              <div
                className={
                  device === 'mobile'
                    ? css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              > */}
              <CreateInvoiceContainerBeta />
              {/* </div> */}
            </>
          ),
        },

        {
          path: 'invoice-estimate-pdf',
          element: (
            <>
              <PageTitle
                title="Estimate"
                onClick={() =>
                  navigate('invoice-estimate', { state: { from: 'pdf' } })
                }
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <GenerateInvoicePDF />
              </div>
            </>
          ),
        },

        {
          path: 'invoice-estimate-deliver',
          element: (
            <>
              <PageTitle title="Estimate" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <DeliverInvoiceToCustomer />
              </div>
            </>
          ),
        },

        {
          path: 'invoice-upload',
          element: (
            <>
              {/* <PageTitle
                title="Upload Invoice"
                onClick={() => navigate('/invoice')}
              /> */}
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <BulkUpload />
              </div>
            </>
          ),
        },
        {
          path: 'invoice-upload/:type',
          element: (
            <>
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <BulkUpload />
              </div>
            </>
          ),
        },
        // Banking

        {
          path: 'banking',
          element: (
            <>
              <PageTitle
                title="Banking"
                onClick={() => {
                  if (connect) {
                    setConnect(false);
                  } else {
                    navigate('/dashboard');
                  }
                }}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                {/* <Banking />{' '} */}
                <BankingNew />{' '}
              </div>
            </>
          ),
        },

        {
          path: 'banking-new',
          element: (
            <>
              <PageTitle
                title="Banking New"
                onClick={() => {
                  if (connect) {
                    setConnect(false);
                  } else {
                    navigate('/dashboard');
                  }
                }}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <BankingNew />
              </div>
            </>
          ),
        },
        {
          path: 'banking-statement',
          element: (
            <>
              <PageTitle
                title="Banking Statement"
                onClick={() => {
                  if (connect) {
                    setConnect(false);
                  } else {
                    navigate(-1);
                  }
                }}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <BankStatement />
              </div>
            </>
          ),
        },
        {
          path: 'banking-loadmoney',
          element: (
            <>
              <PageTitle
                title="Load Money"
                onClick={() => {
                  if (connect) {
                    setConnect(false);
                  } else {
                    navigate('/banking-new');
                  }
                }}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <LoadMoney />
              </div>
            </>
          ),
        },
        {
          path: 'banking-withdrawmoney',
          element: (
            <>
              <PageTitle
                title="Withdraw Money"
                onClick={() => {
                  if (connect) {
                    setConnect(false);
                  } else {
                    navigate('/banking-new');
                  }
                }}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <WithdrawMoney />
              </div>
            </>
          ),
        },
        {
          path: 'connect-banking',
          element: (
            <>
              {device === 'mobile' ? (
                <Router.Navigate to="/banking" />
              ) : (
                <>
                  <PageTitle
                    title="Connected Banking"
                    onClick={() => navigate('/banking')}
                  />
                  <div
                    className={
                      device === 'mobile'
                        ? // ? css.dashboardBodyContainer
                          css.dashboardBodyContainerhideNavBar
                        : css.dashboardBodyContainerDesktop
                    }
                  >
                    {' '}
                    <ConnectBanking />{' '}
                  </div>
                </>
              )}
            </>
          ),
        },
        {
          path: 'banking-virtualAccountOnBoarding',
          element: (
            <>
              <PageTitle
                title="Set Up - Basic Details"
                onClick={() => navigate('/banking')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <BankingForms />{' '}
              </div>
            </>
          ),
        },

        {
          path: 'banking-banklist',
          element: (
            <>
              <PageTitle title="Banking" onClick={() => navigate('/banking')} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainerBankList
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <BankingNew />{' '}
              </div>
            </>
          ),
        },

        {
          path: 'banking-banklist-account',
          element: (
            <>
              <PageTitle title="Banking" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <AccountBalance />{' '}
              </div>
            </>
          ),
        },

        {
          path: 'banking-founders-account',
          element: (
            <>
              <PageTitle title="Banking" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <BankAccontDetails />{' '}
              </div>
            </>
          ),
        },

        {
          path: 'banking-categorize-done',
          element: (
            <>
              <PageTitle title="Banking" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <Done />{' '}
              </div>
            </>
          ),
        },

        // {
        //   path: 'banking-categorization',
        //   element: (
        //     <>
        //       <PageTitle title="Banking" onClick={() => navigate(-1)} />
        //       <div
        //         className={
        //           device === 'mobile'
        //             ? // ? css.dashboardBodyContainer
        //               css.dashboardBodyContainerhideNavBar
        //             : css.dashboardBodyContainerDesktop
        //         }
        //       >
        //         {' '}
        //         <CategorizeDashboard />{' '}
        //       </div>
        //     </>
        //   ),
        // },

        // People

        {
          path: 'people/*',
          element: (
            <>
              {/* <PageTitle
                title="People"
                onClick={() => navigate('/dashboard')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '} */}
              <People /> {/* </div> */}
            </>
          ),
          children: [
            {
              path: 'generic-query-form',
              element: (
                <>
                  <GenericQueryForm />
                </>
              ),
            },
          ],
        },

        {
          path: 'people-invoice-new',
          element: (
            <>
              {/* <PageTitle
                title="New Invoice"
                onClick={() => navigate('/invoice')}
              />
              <div
                className={
                  device === 'mobile'
                    ? css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              > */}
              <CreateInvoiceContainerBeta />
              {/* </div> */}
            </>
          ),
        },

        {
          path: 'people-invoice-new-pdf',
          element: (
            <>
              <PageTitle
                title="New Invoice"
                onClick={() => {
                  navigate('people-invoice-new', { state: { from: 'pdf' } });
                  // navigate(-1, { state: { from: 'pdf' } });
                }}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <GenerateInvoicePDF />
              </div>
            </>
          ),
        },
        {
          path: 'people-invoice-new-deliver',
          element: (
            <>
              <PageTitle title="New Invoice" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <DeliverInvoiceToCustomer />
              </div>
            </>
          ),
        },

        // Bills

        {
          path: 'bill',
          element: (
            <>
              <PageTitle
                title="Bill Booking"
                onClick={() => navigate('/dashboard')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <BillBookViewContainer />{' '}
              </div>
            </>
          ),
        },

        {
          path: 'bill-upload',
          element: (
            <>
              {/* <PageTitle
                title="Bill Booking"
                onClick={() => navigate('/bill')}
              />
              <div
                className={
                  device === 'mobile'
                    ? css.dashboardBodyContainer
                    : css.dashboardBodyContainerDesktop
                }
              > */}{' '}
              <UploadYourBillContainer /> {/* </div> */}
            </>
          ),
        },

        {
          path: 'bill-upload-done',
          element: (
            <>
              <PageTitle
                title="Bill Booking"
                onClick={() => navigate('/bill')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <UploadYourBillContainer />{' '}
              </div>
            </>
          ),
        },

        {
          path: 'bill-utility',
          element: (
            <>
              <PageTitle title="Bill Booking" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <UtilityBills />{' '}
              </div>
            </>
          ),
        },

        {
          path: 'bill-queue',
          element: (
            <>
              <PageTitle title="Bill Booking" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <BillsInQueue />{' '}
              </div>
            </>
          ),
        },

        {
          path: 'bill-draft',
          element: (
            <>
              <PageTitle title="Bill Booking" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <DraftBill />{' '}
              </div>
            </>
          ),
        },

        {
          path: 'bill-salary',
          element: (
            <>
              <PageTitle title="Bill Booking" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <SalaryCost />{' '}
              </div>
            </>
          ),
        },

        {
          path: 'bill-yourbills',
          element: (
            // <>
            //   <PageTitle title="Bill Booking" onClick={() => navigate(-1)} />
            //   <div
            //     className={
            //       device === 'mobile'
            //         ? // ? css.dashboardBodyContainer
            //           css.dashboardBodyContainerhideNavBar
            //         : css.dashboardBodyContainerDesktop
            //     }
            //   >
            <YourBills />
            //   {/* </div>
            // </> */}
          ),
        },

        {
          path: 'bill-Add-And-Manage',
          element: (
            <>
              <PageTitle title="Add and manage" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <AddAndManage />{' '}
              </div>
            </>
          ),
        },
        {
          path: 'bill-Add-And-Manage-EmailList',
          element: (
            <>
              <PageTitle title="Add and manage" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <AddAndManageEmailList />{' '}
              </div>
            </>
          ),
        },

        {
          path: 'bill-Add-And-Manage-Statement',
          element: (
            <>
              <PageTitle title="Add and manage" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <AddAndManageStatement />{' '}
              </div>
            </>
          ),
        },

        // payments

        {
          path: 'payment',
          element: (
            <>
              <PageTitle
                title="Payments"
                onClick={() => navigate('/dashboard')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <Payments />{' '}
              </div>
            </>
          ),
        },

        {
          path: 'payment-makepayment',
          element: (
            <>
              {/* <PageTitle title="Payments" onClick={() => navigate(-1)} />
              <div className={css.makePaymentContainer}> */}{' '}
              <MakePayment /> {/* </div> */}
            </>
          ),
        },

        {
          path: 'payment-advancepayments',
          element: (
            <>
              {/* <PageTitle title="Payments" onClick={() => navigate(-1)} /> */}
              {/* <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              > */}{' '}
              <AdvancePayment /> {/* </div> */}
            </>
          ),
        },

        {
          path: 'payment-history',
          element: (
            <>
              <PageTitle title="Payments" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <PaymentHistory />{' '}
              </div>
            </>
          ),
        },
        // settings
        {
          path: 'settings',
          element: (
            <>
              <PageTitle
                title="Settings"
                onClick={() => navigate('/dashboard')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <SettingsMenu />
              </div>
            </>
          ),
        },

        {
          path: 'settings-companyData',
          element: (
            <>
              <PageTitle
                title="Setup Company Data"
                onClick={() => navigate('/settings')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <CompanyData />
              </div>
            </>
          ),
        },
        // Notification
        {
          path: 'notification',
          element: (
            <>
              <PageTitle
                title="Notification"
                onClick={() => navigate('/dashboard')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <Notification />
              </div>
            </>
          ),
        },

        // Receivables

        {
          path: 'receivables',

          element: (
            <>
              <PageTitle
                title="Receivables"
                onClick={() => navigate('/dashboard')}
              />

              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <Receivables />
              </div>
            </>
          ),
        },

        // {
        //   path: 'Receivables',

        //   element: (
        //     <>
        //       <PageTitle title="Receivables" onClick={() => navigate(-1)} />

        //       <div
        //         className={
        //           device === 'mobile'
        //             ? css.dashboardBodyContainer
        //             : css.dashboardBodyContainerDesktop
        //         }
        //       >
        //         {' '}
        //         <Receivables />
        //       </div>
        //     </>
        //   ),
        // },

        // {
        //   path: 'Receivables',

        //   element: (
        //     <>
        //       <PageTitle title="Receivables" onClick={() => navigate(-1)} />

        //       <div
        //         className={
        //           device === 'mobile'
        //             ? css.dashboardBodyContainer
        //             : css.dashboardBodyContainerDesktop
        //         }
        //       >
        //         {' '}
        //         <Receivables />
        //       </div>
        //     </>
        //   ),
        // },

        {
          path: 'receivables-ageing',

          element: (
            <>
              <PageTitle
                title="Receivables"
                onClick={() => navigate('/receivables')}
              />

              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                {/* <Agening /> */}
                <Receivables />
              </div>
            </>
          ),
        },

        {
          path: 'receivables-ageing-view',

          element: (
            <>
              {/* <PageTitle title="Receivables" onClick={() => navigate(-1)} /> */}
              {/* <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
                style={{
                  margin:
                    device === 'desktop' &&
                    pathName === '/receivables-ageing-view'
                      ? 0
                      : '',
                }}
              > */}{' '}
              <SelectedAging />
              {/* </div> */}
            </>
          ),
        },

        {
          path: 'RequestPayment',

          element: (
            <>
              <PageTitle title="Receivables" onClick={() => navigate(-1)} />

              <div
                className={
                  device === 'mobile'
                    ? css.dashboardBodyContainer
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <RequestPayment />
              </div>
            </>
          ),
        },

        {
          path: 'receivables-schedule',

          element: (
            <>
              <PageTitle title="Receivables" onClick={() => navigate(-1)} />

              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <Receivables />
              </div>
            </>
          ),
        },

        // Payables

        {
          path: 'payables',

          element: (
            <>
              <PageTitle
                title="Payables"
                onClick={() => navigate('/dashboard')}
              />

              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <Payables />
              </div>
            </>
          ),
        },

        {
          path: 'payables-ageing',

          element: (
            <>
              <PageTitle
                title="Payables"
                onClick={() => navigate('/payables')}
              />

              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                {/* <Agening /> */}
                <Payables />
              </div>
            </>
          ),
        },

        {
          path: 'payables-ageing-view',

          element: (
            <>
              {/* <PageTitle title="Payables" onClick={() => navigate(-1)} />

              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
                style={{
                  margin:
                    device === 'desktop' && pathName === '/payables-ageing-view'
                      ? 0
                      : '',
                }}
              > */}{' '}
              <PaySelectedAging />
              {/* </div> */}
            </>
          ),
        },

        {
          path: 'RequestPayment',

          element: (
            <>
              <PageTitle title="Payables" onClick={() => navigate(-1)} />

              <div
                className={
                  device === 'mobile'
                    ? css.dashboardBodyContainer
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <PayRequestPayment />
              </div>
            </>
          ),
        },

        // {
        //   path: 'payables-schedule',

        //   element: (
        //     <>
        //       <PageTitle title="Payables" onClick={() => navigate(-1)} />

        //       <div
        //         className={
        //           device === 'mobile'
        //             ? // ? css.dashboardBodyContainer
        //               css.dashboardBodyContainerhideNavBar
        //             : css.dashboardBodyContainerDesktop
        //         }
        //       >
        //         {' '}
        //         <Payables />
        //       </div>
        //     </>
        //   ),
        // },

        {
          path: 'settings-invoiceSettings',
          element: (
            <>
              <PageTitle
                title="Invoice Settings"
                onClick={() => navigate('/settings')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <InvoiceSettings />
              </div>
            </>
          ),
        },
        {
          path: 'settings-AccountSettings',
          element: (
            <>
              <PageTitle
                title="Account Settings"
                onClick={() => navigate('/settings')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                <AccountSettings />
              </div>
            </>
          ),
        },
        {
          path: 'settings-reminderSettings',
          element: (
            <>
              <PageTitle
                title="Reminder Settings"
                onClick={() => navigate('/settings')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <ReminderSettings />
              </div>
            </>
          ),
        },
        {
          path: 'settings-teamSettings',
          element: (
            <>
              <PageTitle
                title="Team Settings"
                onClick={() => navigate('/settings')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <TeamSettingRoles />
              </div>
            </>
          ),
        },
        {
          path: 'settings-teamSettings-Role',
          element: (
            <>
              <PageTitle
                title="Team Settings"
                onClick={() => navigate('/settings')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <TeamsRoles />
              </div>
            </>
          ),
        },
        {
          path: 'settings-activity',
          element: (
            <>
              <PageTitle
                title="Activity Logs"
                onClick={() => navigate('/settings')}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <ActivityLogs />
              </div>
            </>
          ),
        },
        {
          path: 'settings-invoice-shareInvoiceOptions',
          element: (
            <>
              <PageTitle title="Share Invoice" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <ShareInvoiceOption />
              </div>
            </>
          ),
        },
        {
          path: 'settings-invoice-contactDetails',
          element: (
            <>
              <PageTitle title="Custom Fields" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <ContactDetailsOnInvoice />
              </div>
            </>
          ),
        },
        {
          path: 'settings-invoice-EmailSubjectBody',
          element: (
            <>
              <PageTitle
                title="Email Subject & Body"
                onClick={() => navigate(-1)}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <EmailSubjectBody />
              </div>
            </>
          ),
        },
        {
          path: 'settings-invoice-termsAndConditions',
          element: (
            <>
              <PageTitle
                title="Terms And Conditions"
                onClick={() => navigate(-1)}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <TermsAndConditions />
              </div>
            </>
          ),
        },
        {
          path: 'settings-invoice-signature',
          element: (
            <>
              <PageTitle title="Signature" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <Signature />
              </div>
            </>
          ),
        },
        {
          path: 'settings-razorpay-newCustomer',
          element: (
            <>
              <PageTitle
                title="Razorpay Sub-Merchant"
                onClick={() => navigate(-1)}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <RazorPayMerchant />
              </div>
            </>
          ),
        },
        {
          path: 'settings-razorpay-existingCustomer',
          element: (
            <>
              <PageTitle
                title="Razorpay Sub-Merchant"
                onClick={() => navigate(-1)}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <RazorPayMerchant />
              </div>
            </>
          ),
        },

        {
          path: 'settings-invoiceDesigns',
          element: (
            <>
              <PageTitle title="Invoice Designs" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <InvoiceDesigns />
              </div>
            </>
          ),
        },
        {
          path: 'settings-invoice-additionalSettings',
          element: (
            <>
              <PageTitle
                title="Additional Settings"
                onClick={() => navigate(-1)}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <AdditionalSettings />
              </div>
            </>
          ),
        },
        {
          path: 'settings-BusinessDetails',
          element: (
            <>
              {/* <PageTitle
                title="Business Details"
                onClick={() => navigate(-1)}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '} */}
              <BusinessDetails />
              {/* </div> */}
            </>
          ),
        },

        {
          path: 'support',
          element: (
            <>
              <PageTitle title="Help & Support" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <Support />
              </div>
            </>
          ),
        },

        {
          path: 'settings-OtherPaymentOptions',
          element: (
            <>
              <PageTitle title="Other Payments" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <OtherPaymentOptions />
              </div>
            </>
          ),
        },
        // Others

        {
          path: 'capture-payment',

          element: (
            <>
              {/* <PageTitle title="Receivables" onClick={() => navigate(-1)} /> */}

              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <CapturePayment />
              </div>
            </>
          ),
        },

        {
          path: 'otp-verification',

          element: (
            <>
              {/* <PageTitle title="Receivables" onClick={() => navigate(-1)} /> */}

              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <OtpVerificationCommon />
              </div>
            </>
          ),
        },

        // multiplePayments

        {
          path: 'multiple-payments',

          element: (
            <>
              <PageTitle title="Receivables" onClick={() => navigate(-1)} />

              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <MultiplePayments />
              </div>
            </>
          ),
        },

        {
          path: 'multiple-payment',

          element: (
            <>
              <PageTitle title="Receivables" onClick={() => navigate(-1)} />

              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <MultiplePayment />
              </div>
            </>
          ),
        },
        {
          path: 'deliver-comments',

          element: (
            <>
              <PageTitle title="Receivables" onClick={() => navigate(-1)} />

              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <DeliverComments />
              </div>
            </>
          ),
        },
        {
          path: 'approval-process2',

          element: (
            <>
              <PageTitle title="Receivables" onClick={() => navigate(-1)} />

              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <ApprovalProcessTwo />
              </div>
            </>
          ),
        },
        {
          path: 'approved-process-3',

          element: (
            <>
              <PageTitle title="Receivables" onClick={() => navigate(-1)} />

              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <ApprovedProcessThree />
              </div>
            </>
          ),
        },

        {
          path: 'approval-process-4',

          element: (
            <>
              <PageTitle title="Receivables" onClick={() => navigate(-1)} />

              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <ApprovalProcessFour />
              </div>
            </>
          ),
        },

        {
          path: 'approval-process-5',

          element: (
            <>
              <PageTitle title="Receivables" onClick={() => navigate(-1)} />

              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <ApprovalProcessFive />
              </div>
            </>
          ),
        },

        {
          path: 'payments-approval-2',

          element: (
            <>
              <PageTitle title="Receivables" onClick={() => navigate(-1)} />

              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <PaymentsApprovalTwo />
              </div>
            </>
          ),
        },

        // new payments approval flow
        {
          path: 'make-a-payment',

          element: (
            <>
              <PageTitle title="Make A Payment" onClick={() => navigate(-1)} />

              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <MakeAPayment />
              </div>
            </>
          ),
        },
        {
          path: 'payment-processing',

          element: (
            <>
              <PageTitle title="Make A Payment" onClick={() => navigate(-1)} />

              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <Processing />
              </div>
            </>
          ),
        },

        // AddNewCompany

        {
          path: 'add-new-organization',

          element: (
            <>
              <PageTitle title="Add New Company" onClick={() => navigate(-1)} />

              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainer
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <AddNewCompany />
              </div>
            </>
          ),
        },
        {
          // Added by VNS
          path: 'bankingcategorizeddetails',
          element: (
            <>
              <PageTitle
                title="Banking Categorization"
                onClick={() => navigate(-1)}
              />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainerBankList
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <BankCategoryDetails />{' '}
              </div>
            </>
          ),
        },
        {
          path: 'bankingcategorization',
          element: (
            <>
              <PageTitle title="Categorization" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainerBankList
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <Categorization />{' '}
              </div>
            </>
          ), // Added by VNS
        },

        // report
        {
          path: 'report',
          element: (
            <>
              <PageTitle title="Report" onClick={() => navigate(-1)} />
              <div
                className={
                  device === 'mobile'
                    ? // ? css.dashboardBodyContainerBankList
                      css.dashboardBodyContainerhideNavBar
                    : css.dashboardBodyContainerDesktop
                }
              >
                {' '}
                <Report />{' '}
              </div>
            </>
          ),
        },
      ],
    },
  ]);
}
