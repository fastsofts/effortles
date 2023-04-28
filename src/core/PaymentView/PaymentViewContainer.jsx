import React, { useContext, useEffect } from 'react';
import JSBridge from '@nativeBridge/jsbridge';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import SaveImg from '@assets/Save.svg';
import ReceiptImg from '@assets/Receipt.svg';
import AppContext from '@root/AppContext.jsx';
import UploadYourBillImg from '@assets/Group.svg';
import css from './PaymentViewContainer.scss';

const PaymentViewContainer = () => {
  const { changeSubView, registerEventListeners } = useContext(AppContext);
  const invoiceViewOptions = [
    {
      icon: (
        <div className={css.minWidth20}>
          <div className={css.imgBackground}>
            <img
              className={css.uploadYourBillImg}
              src={UploadYourBillImg}
              alt="Well Done"
            />
          </div>
        </div>
      ),
      title: 'Advance Payments',
      desc: (
        <>
          Upload or Scan your Invoice
          <br />
          directly from your phone
        </>
      ),
      onClick: () => {
        changeSubView('advancePayments');
      },
    },
    {
      icon: (
        <div className={css.minWidth20}>
          <div className={css.imgBackground}>
            <img
              className={css.uploadYourBillImg}
              src={SaveImg}
              alt="Well Done"
            />
          </div>
        </div>
      ),
      title: 'Multiple Payments',
      desc: (
        <>
          Make a Note of your Recent
          <br />
          Transaction
        </>
      ),
      onClick: () => {
        changeSubView('multiplePayments');
      },
    },
    {
      icon: (
        <div className={css.minWidth20}>
          <div className={css.imgBackground}>
            <img
              className={css.uploadYourBillImg}
              src={ReceiptImg}
              alt="Well Done"
            />
          </div>
        </div>
      ),
      title: 'Single Vendor Payments',
      desc: (
        <>
          Create Bills for core Utilites
          <br />
          needed to run your business
        </>
      ),
      onClick: () => {
        changeSubView('singlePayment');
      },
    },
    {
      icon: (
        <div className={css.minWidth20}>
          <div className={css.imgBackground}>
            <img
              className={css.uploadYourBillImg}
              src={ReceiptImg}
              alt="Well Done"
            />
          </div>
        </div>
      ),
      title: 'Effortless Pay',
      desc: (
        <>
          Create Bills for core Utilites
          <br />
          needed to run your business
        </>
      ),
      onClick: () => {
        JSBridge.scanQR();
      },
    },
    {
      icon: (
        <div className={css.minWidth20}>
          <div className={css.imgBackground}>
            <img
              className={css.uploadYourBillImg}
              src={ReceiptImg}
              alt="Well Done"
            />
          </div>
        </div>
      ),
      title: 'Payment History',
      desc: (
        <>
          Create Bills for core Utilites
          <br />
          needed to run your business
        </>
      ),
      onClick: () => {
        changeSubView('paymentHistory');
      },
    },
  ];

  const fillQRdetails = (res) => {
    JSON.parse(res.detail.value);
    changeSubView('effortlessPay');
  };

  // kbtcheck - keeping this to bypass for development purpose - will remove the comment later
  useEffect(() => {
    //  changeSubView('multiplePayments');
    registerEventListeners({ name: 'qrDetails', method: fillQRdetails });
  }, []);

  return (
    <div className={css.paymentViewContainer}>
      <div className={css.paymentsOptions}>
        {invoiceViewOptions.map((i, index) => {
          return index === 0 || index === invoiceViewOptions.length - 1 ? (
            <div key={i.title} className={css.divRule}>
              <div
                className={
                  index === 0 ? css.itemWrapperFirst : css.itemWrapperLast
                }
                aria-hidden="true"
                onClick={i.onClick}
                key={i.title}
              >
                {i.icon}
                <div className={css.itemInfo}>
                  <span className={css.title}>{i.title}</span>
                  <span className={css.desc}>{i.desc}</span>
                </div>
                <div className={css.minWidth15}>
                  <ArrowForwardIosIcon className={css.arrowIcon} />
                </div>
              </div>
            </div>
          ) : (
            <div key={i.title} className={css.divRule}>
              <div
                className={[css.itemWrapper]}
                aria-hidden="true"
                onClick={i.onClick}
                key={i.title}
              >
                {i.icon}
                <div className={css.itemInfo}>
                  <span className={css.title}>{i.title}</span>
                  <span className={css.desc}>{i.desc}</span>
                </div>
                <div className={css.minWidth15}>
                  <ArrowForwardIosIcon className={css.arrowIcon} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentViewContainer;
