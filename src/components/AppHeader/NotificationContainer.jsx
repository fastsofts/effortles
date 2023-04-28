import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Backdrop, Modal, Fade, Button, Stack } from '@mui/material';
import { Typography } from '@material-ui/core';
import NotificationTabs from '@components/NotificationTabs/NotificationTabs';

import css from './NotificationContainer.scss';

const style = {
  position: 'absolute',
  top: '80px',
  right: '45px',
  width: 480,
  bgcolor: '#FFFFFF',
  borderRadius: '16px',
  boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.08)',
  outline: 'none',
};

const NotificationContainer = ({ open, handleClose }) => {
  const navigate = useNavigate();

  return (
    <Box>
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Stack sx={{ position: 'relative' }}>
              <Typography variant="h4" className={css.notificationheader}>
                Notifications
              </Typography>
              <NotificationTabs onClose={handleClose} />
              <Button
                className={css.viewAllbtn}
                onClick={() => {
                  navigate('/notification');
                  handleClose();
                }}
              >
                View All
              </Button>
            </Stack>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default NotificationContainer;
