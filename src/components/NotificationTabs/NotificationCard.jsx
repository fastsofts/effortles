import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Avatar, Box, Grid, Stack, Typography, Button } from '@mui/material';

import AppContext from '@root/AppContext';

import Expenses from '../../assets/NotificationIcons/Expenses.svg';
import invoice from '../../assets/NotificationIcons/invoice.svg';
// import Banking from '../../assets/NotificationIcons/Banking.svg';
// import Funding from '../../assets/NotificationIcons/Funding.svg';
// import payable from '../../assets/NotificationIcons/payable.svg';
// import Payment from '../../assets/NotificationIcons/Payment.svg';
// import PayRoll from '../../assets/NotificationIcons/PayRoll.svg';
// import People from '../../assets/NotificationIcons/People.svg';
// import Receivables from '../../assets/NotificationIcons/Receivables.svg';
// import Report from '../../assets/NotificationIcons/Report.svg';
// import Settings from '../../assets/NotificationIcons/Settings.svg';

import css from './notificationtabs.scss';

const NotificationCard = ({ dataitem, onClose }) => {
  const navigate = useNavigate();
  const { addOrganization, openSnackBar } = useContext(AppContext);
  const { data } = JSON.parse(localStorage.getItem('user_info'));

  const notifyDuration = (date) => {
    const dateformat = moment(date).format('YYYY-MM-DD hh:mm:ss');
    const duration = moment(dateformat, 'YYYY-MM-DD hh:mm:ss').fromNow();

    return `${duration.charAt(0)}${duration.charAt(2)}`;
  };

  const notificationRoute = () => {
    const orgDetail = data.filter(
      (item) => item.id === dataitem.organization_id,
    );

    if (orgDetail.length === 1) {
      const orgId = orgDetail[0]?.id ? orgDetail[0]?.id : '';
      const orgName = orgDetail[0]?.name ? orgDetail[0]?.name : '';
      const shortName = orgDetail[0]?.short_name;

      localStorage.setItem(
        'selected_organization',
        JSON.stringify({
          orgId,
          orgName,
          shortName,
        }),
      );
      addOrganization({ orgId, orgName, shortName });
    } else {
      openSnackBar({
        message: 'Organization not found.',
        type: 'error',
      });
      return;
    }

    if (dataitem.notification_type === 'assign_bill_to_super_accountant')
      navigate(`/bill-queue?id=${dataitem.parent_id}`);
    else if (dataitem.notification_type === 'agreement_created')
      navigate(`/invoice-recurring-view?id=${dataitem.parent_id}`);
    if (onClose) onClose();
  };

  const setRouteIcons = () => {
    let icon;
    switch (dataitem.notification_type) {
      case 'assign_bill_to_super_accountant':
        icon = Expenses;
        break;
      case 'agreement_created':
        icon = invoice;
        break;
      default:
    }
    return icon;
  };
  return (
    <Box
      className={css.notificationcard}
      key={dataitem.id}
      onClick={notificationRoute}
    >
      {Object.keys(dataitem).length > 0 ? (
        <Grid container spacing={2}>
          <Grid item xs={1.5} md={1.5}>
            <Stack>
              <Avatar src={setRouteIcons()} alt="route icon" />
            </Stack>
          </Grid>
          <Grid item xs={9} md={9.5}>
            <Stack>
              <Typography variant="h3" className={css.notifytitle}>
                {dataitem.subject}
              </Typography>
              <Typography className={css.notifydesc}>
                {dataitem.body}
              </Typography>
              <Stack className={css.notifylinks}>
                {dataitem.category !== 'notification' && (
                  <Button className={css.actionbtn}>View More</Button>
                )}
                <Button className={css.organization}>
                  {dataitem.organization_name}
                </Button>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={1.5} md={1}>
            <Stack>
              <Typography className={css.notifytime}>
                {notifyDuration(dataitem.created_at)}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography>No data found.</Typography>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default NotificationCard;
