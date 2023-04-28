import React, { useState } from 'react';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import {
  ElectricityIcon,
  InternetIcon,
  WaterIcon,
  RentIcon,
  PhoneIcon,
} from '@components/SvgIcons/SvgIcons.jsx';
import css from './UtilityBillsViewContainer.scss';
import { Rent } from './UtilitySubViews/Rent';
import { Electricity } from './UtilitySubViews/Electricity';
import { Water } from './UtilitySubViews/Water';
import { Phone } from './UtilitySubViews/Phone';
import { Internet } from './UtilitySubViews/Internet';

const listItems = [
  {
    icon: <RentIcon className={css.fontIcon} />,
    title: 'Rent',
    desc: 'Set up your Monthly Rent Payment Process',
  },
  {
    icon: <ElectricityIcon className={css.fontIcon} />,
    title: 'Electricity',
    desc: 'Set up your Monthly Electricity Payment Process',
  },
  {
    icon: <WaterIcon className={css.fontIcon} />,
    title: 'Water',
    desc: 'Set up your Monthly Payment for Water',
  },
  {
    icon: <InternetIcon className={css.fontIcon} />,
    title: 'Internet',
    desc: 'Set up your Monthly Internet Payment Process',
  },
  {
    icon: <PhoneIcon className={css.fontIcon} />,
    title: 'Phone',
    desc: 'Set up your Monthly Phone Payment Process',
  },
];

const UtilityBillsViewContainer = () => {
  const [view, setView] = useState('');
  const onClick = (page) => {
    setView(page);
  };

  return (
    <div className={css.utilityBillsViewContainer}>
      {!view && (
        <div className={css.card}>
          {listItems.map((item) => (
            <div
              key={item.title}
              className={css.listItem}
              onClick={() => onClick(item.title)}
              role="menuitem"
            >
              <div className={css.icon}>{item.icon}</div>
              <div className={css.content}>
                <div className={css.title}>{item.title}</div>
                <div className={css.desc}>{item.desc}</div>
              </div>
              <ArrowForwardIosIcon className={css.arrow} />
            </div>
          ))}
        </div>
      )}
      {view === 'Rent' && <Rent />}
      {view === 'Electricity' && <Electricity />}
      {view === 'Water' && <Water />}
      {view === 'Internet' && <Internet />}
      {view === 'Phone' && <Phone />}
    </div>
  );
};

export default UtilityBillsViewContainer;
