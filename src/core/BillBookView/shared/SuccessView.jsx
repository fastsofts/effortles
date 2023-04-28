import { Button } from '@material-ui/core';
// import * as Mui from '@mui/material';
import React, { useContext } from 'react';
import AppContext from '@root/AppContext.jsx';
import * as Router from 'react-router-dom';
import sucessAnimation from '@root/Lotties/paymentSucess.json';
import Lottie from 'react-lottie';
import css from './SuccessView.scss';

const SuccessView = (props) => {
  const { title, description, onClick, btnTitle, btnStyle } = props;
  const device = localStorage.getItem('device_detect');
  const { changeView, changeSubView } = useContext(AppContext);
  const navigate = Router.useNavigate();
  const returnToDashboard = () => {
    changeView('dashboard');
    changeSubView('');
    navigate('/dashboard');
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: sucessAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <>
      <div style={{width: device === 'mobile' ? '100%' : '40%', margin: device === 'mobile' ? 0 : '0 26%'}}>
        <div className={css.successViewContainerNew}>
          <div className={css.tickImg}>
            <Lottie options={defaultOptions} />
          </div>
          {title && <div className={css.title}>{title}</div>}
          <div className={css.description}>{description}</div>
          <div className={css.actionContainer}>
            <Button
              variant={btnStyle || 'contained'}
              className={
                btnStyle === 'outlined' ? css.outlineButton : css.actionButton
              }
              onClick={onClick}
              size="medium"
            >
              {btnTitle || 'Add another bill'}
            </Button>
            <div
              className={css.linkDashboard}
              onClick={() => returnToDashboard()}
              role="link"
            >
              Return to Dashboard
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuccessView;
