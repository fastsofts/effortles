/* @flow */
/**
 * @fileoverview  Fill in organizational Details
 */

import React, { useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';

import { Helmet } from 'react-helmet';
import ArrowBackIosOutlinedIcon from '@material-ui/icons/ArrowBackIosOutlined';
import { Button, makeStyles } from '@material-ui/core';
import * as Mui from '@mui/material';

import AppContext from '@root/AppContext';

import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet';

import sel from '../../assets/allcompsel.svg';

import css from './DashboardViewContainer.scss';
import OrganizationList from '../Notification/OrganizationList';

const useStyles = makeStyles({
  submitButton: {
    borderRadius: '18px',
    backgroundColor: 'var(--colorPrimaryButton)',
    margin: '15px 0',
    color: 'var(--colorWhite)',
    minWidth: '90px',
    textTransform: 'none',
    fontSize: '14px',
    fontWeight: '500',
    '&:hover': {
      backgroundColor: 'var(--colorPrimaryButton)',
    },
  },
  pageTitle: {
    fontSize: '24px !important',
    fontWeight: 'normal',
  },
});

const PageTitle = ({ title, actionBtnLabel, onClick, onClickAction }) => {
  const classes = useStyles();
  const themes = Mui.useTheme();
  const device = localStorage.getItem('device_detect');
  const desktopView = Mui.useMediaQuery(themes.breakpoints.up('sm'));
  const [searchCompany, setSearchCompany] = useState(false);
  const { selectedOrg } = useContext(AppContext);

  const { pathname } = useLocation();

  return (
    <div
      className={`${css.pageTitleContainer} ${
        desktopView && css.pageTitleContainerDesktop
      }`}
    >
      {onClick && (
        <ArrowBackIosOutlinedIcon
          onClick={onClick}
          className={(!desktopView && css.icon) || css.icon2}
        />
      )}
      <div
        className={
          title === 'Dashboard'
            ? (desktopView && `${css.pageTitle2}`) ||
              `${css.pageTitle} ${classes.pageTitle}`
            : (desktopView && `${css.pageTitle3}`) ||
              `${css.pageTitle} ${classes.pageTitle}`
        }
      >
        <Helmet>
          <title>{title}- Effortless</title>
        </Helmet>
        {title}

        {pathname === '/notification' && device === 'mobile' && (
          <Mui.IconButton
            sx={{ width: '28px', height: '28px' }}
            onClick={() => setSearchCompany(true)}
          >
            {selectedOrg === 'all' && <Mui.Avatar src={sel} />}
            {selectedOrg !== 'all' && (
              <>
                {selectedOrg.logo ? (
                  <Mui.Avatar src={selectedOrg.log} />
                ) : (
                  <Mui.Avatar>
                    {selectedOrg?.short_name?.charAt(0).toUpperCase()}
                  </Mui.Avatar>
                )}
              </>
            )}
          </Mui.IconButton>
        )}
      </div>

      <div>
        {actionBtnLabel && (
          <Button
            variant="outlined"
            className={classes.submitButton}
            onClick={onClickAction}
            size="medium"
          >
            {actionBtnLabel}
          </Button>
        )}
      </div>

      <SelectBottomSheet
        triggerComponent
        open={searchCompany}
        name="Select Organization"
        onClose={() => setSearchCompany(false)}
        addNewSheet
      >
        <OrganizationList onClose={() => setSearchCompany(false)} />
      </SelectBottomSheet>
    </div>
  );
};

export default PageTitle;
