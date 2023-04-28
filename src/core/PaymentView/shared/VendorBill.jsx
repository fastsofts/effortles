import React, { useState, useContext } from 'react';
import { Button, Typography } from '@material-ui/core';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import AppContext from '@root/AppContext.jsx';
import BillItem from '@core/PaymentView/shared/Bill';
import css from '../MakePayment.scss';

const VendorBill = (props) => {
  const {
    vendorBillsList,
    selectedbills,
    setselectedbillids,
    vendor_id,
    paymentVoucharId,
    deleteVoucher,
    done,
    handleBottomSheetOpen,
  } = props;
  const device = localStorage.getItem('device_detect');
  const [vendorBills, setVendorBills] = useState(vendorBillsList);
  const { organization, user, openSnackBar } = useContext(AppContext);
  const showError = (message) => {
    openSnackBar({
      message: message || 'Unknown Error Occured',
      type: 'error',
    });
  };
  const createVoucherItem = async (data) => {
    const body = {
      vendor_id,
      amount: data.amount,
      document_reference: '',
      description: data.narration,
      txn_line_id: data.txn_line_id,
    };

    await RestApi(
      `organizations/${organization.orgId}/payment_vouchers/${paymentVoucharId}/items`,
      {
        method: METHOD.POST,
        headers: {
          Authorization: `Bearer ${user.activeToken}`,
        },
        payload: { ...body },
      },
    )
      .then(async (res) => {
        if (res && !res.error) {
          if (res.message === 'No vendor bank details is present') {
            // openSnackBar({
            //   message: res.message,
            //   type: MESSAGE_TYPE.WARNING,
            // });
            handleBottomSheetOpen('paymentBank', body.vendor_id);
            return;
          }
          const newItems = await vendorBills.map((item) => {
            if (item.id === data.txn_line_id) {
              const updatedItem = {
                ...item,
                voucher_id: res.id,
                paidAmount: item.net_balance,
                selected: true,
              };
              return updatedItem;
            }

            return { ...item };
          });

          await setVendorBills(newItems);
        } else {
          if (res.error && res.message) {
            if (res.message === 'No vendor bank details is present') {
              // openSnackBar({
              //   message: res.message,
              //   type: MESSAGE_TYPE.WARNING,
              // });
              handleBottomSheetOpen('paymentBank', body.vendor_id);
              return;
            }
          }
          showError(res.message);
        }
      })
      .catch(() => {});
  };

  const handleSelect = async (checked, id) => {
    if (checked === true) {
      const newItems = await vendorBills.map((item) => {
        if (item.id === id) {
          const updatedItem = {
            ...item,
            selected: checked,
            paidAmount: Number(item.net_balance).toFixed(0),
          };
          return updatedItem;
        }

        return { ...item };
      });
      const bill = newItems.find((a) => a.id === id);
      const body = {
        amount: bill.amount,
        document_reference: '',
        description: bill.narration,
        txn_line_id: bill.id,
      };
      setselectedbillids([...selectedbills, id]);
      await createVoucherItem(body);
    } else {
      const bill = vendorBills?.find((a) => a.id === id);
      await deleteVoucher(bill.voucher_id);
      setselectedbillids((prev) => {
        const temp = prev;
        const index = temp.indexOf(bill.id);
        if (index > -1) {
          temp.splice(index, 1);
        }
        return temp;
      });

      const newItems = vendorBills.map((item) => {
        if (item.id === id) {
          const updatedItem = {
            ...item,
            selected: checked,
            voucher_id: null,
            paidAmount: 0,
          };
          return updatedItem;
        }

        return { ...item };
      });

      setVendorBills(newItems);
    }
  };

  const handleAmountChange = (amount, id) => {
    const newItems = vendorBills.map((item) => {
      if (item.id === id) {
        const updatedItem = {
          ...item,
          paidAmount: amount,
        };
        return updatedItem;
      }
      return { ...item };
    });

    setVendorBills(newItems);
  };

  const updateVoucherItem = async (id, amount) => {
    await RestApi(
      `organizations/${organization.orgId}/payment_vouchers/${paymentVoucharId}/items/${id}`,
      {
        method: METHOD.PATCH,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.activeToken}`,
        },
        payload: {
          amount,
        },
      },
    )
      .then((res) => {
        if (res && !res.error) {
          const newItems = vendorBills.map((item) => {
            if (item.voucher_id === id) {
              const updatedItem = {
                ...item,
                paidAmount: amount,
              };
              return updatedItem;
            }
            return { ...item };
          });
          setVendorBills(newItems);
        } else {
          showError(res.error);
        }
      })
      .catch((e) => {
        showError(e);
      });
  };

  return (
    <div
      style={
        {
          // overflow: 'scroll',
          // height: device === 'mobile' ? '75vh' : '700px',
        }
      }
    >
      <div className={`${css.headerContainer} ${css.drawer}`}>
        <div className={css.headerLabel}>Make a Payment</div>
        <span className={css.headerUnderline} />
      </div>
      <div
        className={css.list}
        // style={{ height: device === 'mobile' ? '60vh' : '585px' }}
      >
        {vendorBills &&
          vendorBills.length > 0 &&
          vendorBills.map((v, i) => (
            <div
              className={css.categoryOptions}
              style={{
                marginBottom:
                  i + 1 === vendorBills.length && device === 'mobile'
                    ? '40px'
                    : 0,
              }}
              key={v.id}
              role="menuitem"
            >
              {console.log("vendoe bill",v)}
              <BillItem
                checked={v.selected}
                name={v.vendor_name}
                tabValue={0}
                totalAmount={v.net_balance}
                // day={v.credit_period}
                day={v.age_description}
                descriptionColor={v.age_description_color}
                handleChange={(e) => handleSelect(e.target.checked, v.id)}
                handleAmountChange={(e) => {
                  handleAmountChange(e?.target?.value, v?.id);
                }}
                updateAmount={() =>
                  updateVoucherItem(v.voucher_id, v.paidAmount)
                }
                paidAmount={v.paidAmount}
                id={v.id}
                date={v.date}
              />
            </div>
          ))}
        {vendorBills && vendorBills.length === 0 && (
          <Typography align="center">
            There is No Bill for this Vendor!
          </Typography>
        )}
      </div>
      <div className={device === 'desktop' ? css.actionDesktop : css.action}>
        <Button
          onClick={() => {
            const billCount = vendorBills.filter((a) => a.selected).length;
            const totalAmount = vendorBills
              .filter((a) => a.selected)
              .map((a) => Number(a.paidAmount))
              .reduce((a, b) => a + b, 0);
            done(totalAmount, billCount, vendorBills);
          }}
          size="large"
          disabled={vendorBills.filter((a) => a.selected).length === 0}
          className={
            device === 'desktop'
              ? `${css.submitButtonDesktop} ${
                  vendorBills.filter((a) => a.selected).length === 0
                    ? css.disabled
                    : css.active
                }`
              : `${css.submitButton} ${
                  vendorBills.filter((a) => a.selected).length === 0
                    ? css.disabled
                    : css.active
                }`
          }
        >
          DONE
        </Button>
      </div>
    </div>
  );
};

export default VendorBill;
