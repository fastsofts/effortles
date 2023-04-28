import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@material-ui/core/Grid';
import Box from '@mui/material/Box';
// import IconButton from '@material-ui/core/IconButton';
// import CloseIcon from '@material-ui/icons/Close';
import css from './ConfirmationDialog.scss';

export default function AlertDialog(props) {
  const {
    handleClick,
    name,
    initopen,
    message,
    buttontext1,
    buttontext2,
    ptype,
    // closebutton
  } = props;
  const [openModal, setOpenModal] = React.useState(initopen);
  const [selectedYes, setselectedYes] = useState(false);
  const [buttonselected1, setbuttonselected1] = useState('');
  const answer = { answer: 'No' };

  const handleClose = () => {
    if (
      document.querySelector('[role="presentation"]') &&
      document.querySelector('[role="presentation"]').querySelector('div')
    ) {
      document
        .querySelector('[role="presentation"]')
        .querySelector('div').style.opacity = '.1';
    }
    handleClick(answer);
    setOpenModal(!openModal);
  };

  const handleCloseYes = () => {
    if (
      document.querySelector('[role="presentation"]') &&
      document.querySelector('[role="presentation"]').querySelector('div')
    ) {
      document
        .querySelector('[role="presentation"]')
        .querySelector('div').style.opacity = '.1';
    }
    setselectedYes(true);
  };

  useEffect(() => {
    if (selectedYes) {
      answer.answer = 'Yes';
      setbuttonselected1(
        [css.button1, css.custompopupsButtonsSelected].join(' '),
      );
      handleClick(answer);
      setOpenModal(!openModal);
    }
  }, [selectedYes]);

  useEffect(() => {
    setTimeout(() => {
      if (
        document.querySelector('[role="presentation"]') &&
        document.querySelector('[role="presentation"]').querySelector('div')
      ) {
        document
          .querySelector('[role="presentation"]')
          .querySelector('div').style.opacity = '.1';
      }
    }, 10);
    setbuttonselected1(css.button1);
  }, []);

  const buttonselected2 = [css.button1, css.custompopupsButtonsSelected].join(
    ' ',
  );

  console.log(ptype);
  const dialogstyle =
    ptype === 'mobile'
      ? {
          position: 'absolute',
          bottom: '0',
          padding: '0',
          margin: '0',
          height: '360px',
          width: '100%',
          background: '#FFFFFF',
          boxShadow:
            '0px 4px 44px rgba(114, 92, 193, 0.15), 0px -7px 23px rgba(0, 0, 0, 0.02)',
          borderRadius: '20px 20px 0px 0px',
        }
      : {};

  console.log(dialogstyle);

  return (
    <Box>
      <Dialog
        disableEnforceFocus
        open={openModal}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: dialogstyle,
        }}
        style={{ height: '99vh' }}
        className="dialogBox"
      >
        <DialogTitle id="alert-dialog-title">
          <Grid
            container
            direction="row"
            justify-content="space-between"
            alignItems="center"
          >
            <Grid item xs={11} sm={11}>
              {message}
            </Grid>
            {/* <Grid item xs={1} sm={1}>
              {closebutton?<IconButton aria-label="close" onClick={handleClose}>
                <CloseIcon />
              </IconButton>:''}
            </Grid> */}
          </Grid>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {name}
          </DialogContentText>
          <Box
            className={
              (buttontext1.length === 0 && buttontext2.length !== 0) ||
              (buttontext1.length !== 0 && buttontext2.length === 0)
                ? css.buttonHolder_single
                : css.buttonHolder_double
            }
          >
            {buttontext1.length > 0 ? (
              <Button className={buttonselected1} onClick={handleCloseYes}>
                {buttontext1}
              </Button>
            ) : (
              ''
            )}
            {buttontext2.length > 0 ? (
              <Button className={buttonselected2} onClick={handleClose}>
                {buttontext2}
              </Button>
            ) : (
              ''
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
