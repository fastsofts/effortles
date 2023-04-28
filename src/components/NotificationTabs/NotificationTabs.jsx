import React, { useState, useContext, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import CircularProgress, {
  circularProgressClasses,
} from '@mui/material/CircularProgress';
import { Box, Tab } from '@mui/material';
import { makeStyles } from '@material-ui/core/styles';
import { TabList, TabContext, TabPanel } from '@mui/lab';

import RestApi, { METHOD } from '@services/RestApi';
import AppContext from '@root/AppContext';

import NotificationCard from './NotificationCard';

import css from './notificationtabs.scss';

const useStyles = makeStyles({
  tabs: {
    '& .MuiTabs-indicator': {
      backgroundColor: '#F08B32',
      height: 2,
    },
    '& .MuiTab-root.Mui-selected': {
      color: '#F08B32',
    },
  },
  tabPanel: {
    padding: '0px !important',
    overflow: 'auto',
  },
});

const FacebookCircularProgress = (props) => {
  return (
    <Box
      sx={{
        position: 'relative',
        height: '400px',
        top: '100px',
        left: '50%',
      }}
    >
      <CircularProgress
        variant="determinate"
        sx={{
          color: (theme) =>
            theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
        }}
        size={30}
        thickness={4}
        {...props}
        value={100}
      />
      <CircularProgress
        variant="indeterminate"
        disableShrink
        sx={{
          color: (theme) =>
            theme.palette.mode === 'light' ? '#F08B32' : '#F08B32',
          animationDuration: '550ms',
          position: 'absolute',
          left: 0,
          [`& .${circularProgressClasses.circle}`]: {
            strokeLinecap: 'round',
          },
        }}
        size={30}
        thickness={4}
        {...props}
      />
    </Box>
  );
};

const NotificationTabs = ({ maxheight, onClose }) => {
  const classes = useStyles();
  const device = localStorage.getItem('device_detect');
  const { user, openSnackBar, enableLoading, selectedOrg } =
    useContext(AppContext);

  const [notifications, setNotifications] = useState([]);
  const [notificationsData, setNotificationsData] = useState([]);
  const [value, setValue] = useState(1);
  const [hasMoreItems, sethasMoreItems] = useState(true);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('all');

  const handleChange = (e, newValue) => {
    e.stopPropagation();

    setValue(newValue);
    if (newValue === 1) setCategory('all');
    else if (newValue === 2) setCategory('action');
    else if (newValue === 3) setCategory('notify');
  };

  const getAllNotifications = async () => {
    let org = '';
    if (selectedOrg !== 'all') org = `?organization_id=${selectedOrg.id}`;

    await RestApi(`notifications${org}`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        setNotifications(res);
        enableLoading(false);
      })
      .catch((e) => {
        openSnackBar({
          message: e?.message || 'Unknown error occured',
          type: 'error',
        });
        enableLoading(false);
      });
  };

  const notificationsFilter = async () => {
    let org = '';
    let cat = '';
    if (selectedOrg !== 'all') org = `organization_id=${selectedOrg.id}&`;
    if (category !== 'all') cat = `category=${category}&`;

    const params = `${org}${cat}page=${page}`;

    await RestApi(`notifications?${params}`, {
      method: METHOD.GET,
      headers: {
        Authorization: `Bearer ${user.activeToken}`,
      },
    })
      .then((res) => {
        setNotificationsData((prev) => [...prev, ...res.data]);
        if (res.data.length === 0) sethasMoreItems(false);
        enableLoading(false);
      })
      .catch((e) => {
        openSnackBar({
          message: e?.message || 'Unknown error occured',
          type: 'error',
        });
        enableLoading(false);
      });
  };

  const nextData = () => {
    if (page >= notifications.pages) sethasMoreItems(false);
    else setPage((prev) => prev + 1);
  };

  useEffect(() => {
    getAllNotifications();
    setNotifications([]);
  }, [selectedOrg]);

  useEffect(() => {
    notificationsFilter();
    setNotificationsData([]);
    sethasMoreItems(true);
  }, [page, category, selectedOrg]);

  return (
    <Box sx={{ width: '100%' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList
            onChange={handleChange}
            className={`${classes.tabs} ${css.tablist}`}
          >
            <Tab
              label={
                <>
                  All
                  <span
                    className={
                      value === 1
                        ? css.notifiactionactive
                        : css.notifiactioncount
                    }
                  >
                    {notifications.total_count || 0}
                  </span>
                </>
              }
              value={1}
              className={css.tabButtons}
            />
            <Tab
              label={
                <>
                  Actions
                  <span
                    className={
                      value === 2
                        ? css.notifiactionactive
                        : css.notifiactioncount
                    }
                  >
                    {notifications.action_count || 0}
                  </span>
                </>
              }
              value={2}
              className={css.tabButtons}
            />
            <Tab
              label={
                <>
                  Notifications
                  <span
                    className={
                      value === 3
                        ? css.notifiactionactive
                        : css.notifiactioncount
                    }
                  >
                    {notifications.notification_count || 0}
                  </span>
                </>
              }
              value={3}
              className={css.tabButtons}
            />
          </TabList>
        </Box>
        <TabPanel
          value={1}
          className={classes.tabPanel}
          sx={
            maxheight
              ? {
                  height:
                    device === 'mobile'
                      ? 'calc(100vh - 176px)'
                      : 'calc(100vh - 205px)',
                }
              : { height: '500px', marginBottom: '40px' }
          }
          id="allnotification"
        >
          <InfiniteScroll
            dataLength={notificationsData.length}
            next={nextData}
            loader={<FacebookCircularProgress />}
            hasMore={hasMoreItems}
            scrollableTarget="allnotification"
          >
            {notificationsData?.map((item) => (
              <NotificationCard dataitem={item} onClose={onClose} />
            ))}
          </InfiniteScroll>
        </TabPanel>
        <TabPanel
          value={2}
          className={classes.tabPanel}
          sx={
            maxheight
              ? {
                  height:
                    device === 'mobile'
                      ? 'calc(100vh - 176px)'
                      : 'calc(100vh - 205px)',
                }
              : { height: '500px', marginBottom: '40px' }
          }
          id="action"
        >
          <InfiniteScroll
            dataLength={notificationsData.length}
            next={nextData}
            loader={<FacebookCircularProgress />}
            // endMessage={
            //   <p style={{ textAlign: 'center' }}>
            //     <b>Yay! You have seen it all</b>
            //   </p>
            // }
            hasMore={hasMoreItems}
            className={css.infinitdata}
            scrollableTarget="action"
          >
            {notificationsData?.map((item) => (
              <NotificationCard dataitem={item} onClose={onClose} />
            ))}
          </InfiniteScroll>
        </TabPanel>
        <TabPanel
          value={3}
          className={classes.tabPanel}
          sx={
            maxheight
              ? {
                  height:
                    device === 'mobile'
                      ? 'calc(100vh - 176px)'
                      : 'calc(100vh - 205px)',
                }
              : { height: '500px', marginBottom: '40px' }
          }
          id="notification"
        >
          <InfiniteScroll
            dataLength={notificationsData.length}
            next={nextData}
            loader={<FacebookCircularProgress />}
            hasMore={hasMoreItems}
            scrollableTarget="notification"
          >
            {notificationsData?.map((item) => (
              <NotificationCard dataitem={item} onClose={onClose} />
            ))}
          </InfiniteScroll>
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default NotificationTabs;
