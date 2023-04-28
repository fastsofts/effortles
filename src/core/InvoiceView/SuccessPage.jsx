import * as React from 'react';
import * as Mui from '@material-ui/core';
import InvoiceSuccess from '@assets/InvoiceSuccess.svg';
// import AppContext from '@root/AppContext.jsx';
import * as Router from 'react-router-dom';
import css from './CreateInvoiceContainer.scss';

const SuccessPage = () => {
  const navigate = Router.useNavigate();
  const { state } = Router.useLocation();

  React.useEffect(() => {
    if (state?.type !== 'unApprovedSuccess') {
      navigate('/invoice');
    }
  }, []);

  const device = localStorage.getItem('device_detect');

  return (
    <div
      className={css.createInvoiceContainer}
      style={{
        display: 'flex',
        height: device === 'desktop' ? '90%' : 'calc(100% - 25px)',
      }}
    >
      <div className={css.successPage}>
        <div>
          <Mui.Typography
            variant="h4"
            align="center"
            className={css.successTitle}
          >
            Well Done !
          </Mui.Typography>
        </div>
        <div className={css.successPageCenterd}>
          <img src={InvoiceSuccess} alt="Well Done" />
        </div>
        <div>
          <Mui.Typography variant="body2" align="center">
            Your Invoice has been sent for approval.
          </Mui.Typography>
          <br />
          <Mui.Typography variant="body2" align="center">
            After the Approval Process is completed, you can deliver the Invoice
            to your Client
          </Mui.Typography>
        </div>
        <div className={css.successPageCenterd}>
          {/* <input type="button" value="Return to your Dashboard" className={css.primary} onClick={() => { }} /> */}
          <Mui.Button
            variant="contained"
            className={css.primary}
            onClick={() => {
              // changeView('dashboard');
              // changeSubView('');
              navigate('/invoice');
            }}
          >
            Return to your Dashboard
          </Mui.Button>
        </div>
      </div>
    </div>
  );
};
export default SuccessPage;
