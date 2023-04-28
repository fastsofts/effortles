import React, {
  useState,
  useContext,
  // useEffect
} from 'react';
// import { DropdownIcon } from '@components/SvgIcons/SvgIcons.jsx';
import SearchIcon2 from '@assets/search.svg';
import DownloadAgeing from '@assets/DownloadAgeing.svg';
import DownloadIcon from '@mui/icons-material/Download';
import JSBridge from '@nativeBridge/jsbridge';
import SearchIcon from '@material-ui/icons/Search';
import themes from '@root/theme.scss';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import { MESSAGE_TYPE } from '@components/SnackBarContainer/SnackBarContainer.jsx';
// import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet';
import { Grid, makeStyles, Chip } from '@material-ui/core';
import InputAdornment from '@material-ui/core/InputAdornment';
// import CustomFilterPro from '@components/ProCustomFilter/CustomFilterPro';
import {
  DataGridPro,
  GridFilterPanel,
  GridColumnMenuContainer,
  SortGridMenuItems,
  // HideGridColMenuItem,
  // GridColumnsMenuItem,
  GridFilterMenuItem,
} from '@mui/x-data-grid-pro';
import { FormattedAmount } from '@components/formattedValue/FormattedValue';
// import theme from '@root/theme.scss';
import * as Mui from '@mui/material';
import AppContext from '@root/AppContext.jsx';
// import RupeesReceivables from '@assets/WebAssets/RupeesReceivables.svg';
import * as Router from 'react-router-dom';
import moment from 'moment';

import RestApi, { METHOD, BASE_URL } from '@services/RestApi.jsx';
import CssTextField from '../Components/SearchTextfield';
// import ReceivablesPopOver from '../Components/ReceivablesPopover';
import BillAgeingTable from '../Components/BillAgeingTable.jsx';
import css from './Ageing.scss';

export function CustomColumnMenu(props) {
  const { hideMenu, currentColumn, color, ...other } = props;

  return (
    <GridColumnMenuContainer
      hideMenu={hideMenu}
      currentColumn={currentColumn}
      {...other}
    >
      <SortGridMenuItems onClick={hideMenu} column={currentColumn} />
      <GridFilterMenuItem onClick={hideMenu} column={currentColumn} />
      {/* <HideGridColMenuItem onClick={hideMenu} column={currentColumn} /> */}
      {/* <GridColumnsMenuItem onClick={hideMenu} column={currentColumn} /> */}
    </GridColumnMenuContainer>
  );
}

export const CustomFooter = (props) => {
  const { totalVal } = props;
  return (
    <div className={css.divFooter}>
      <div
        style={{
          width: `${
            document.querySelector('div[data-field = name]')?.clientWidth -
              10 || 155
          }px`,
          paddingLeft: 10,
          fontSize: '13px',
        }}
      >
        Total
      </div>
      <div
        style={{
          width: `${
            document.querySelector('div[data-field = net_balance]')
              ?.clientWidth - 10 || 80
          }px`,
          textAlign: 'right',
        }}
        className={
          Number(totalVal?.net_balance) >= 0 ? css.cell1Rec : css.cell1RecRed
        }
      >
        {FormattedAmount(totalVal?.net_balance)}
      </div>
      <div
        style={{
          width: `${
            document.querySelector("div[data-field = 'age_buckets?.not_due']")
              ?.clientWidth - 10 || 80
          }px`,
          textAlign: 'right',
        }}
        className={
          Number(totalVal?.not_due) >= 0 ? css.cell1Rec : css.cell1RecRed
        }
      >
        {FormattedAmount(totalVal?.not_due)}
      </div>
      <div
        style={{
          width: `${
            document.querySelector("div[data-field = 'age_buckets?.1_to_30']")
              ?.clientWidth - 10 || 80
          }px`,
          textAlign: 'right',
        }}
        className={
          Number(totalVal?.['1_to_30']) >= 0 ? css.cell1Rec : css.cell1RecRed
        }
      >
        {FormattedAmount(totalVal?.['1_to_30'])}
      </div>
      <div
        style={{
          width: `${
            document.querySelector("div[data-field = 'age_buckets?.31_to_60']")
              ?.clientWidth - 10 || 80
          }px`,
          textAlign: 'right',
        }}
        className={
          Number(totalVal?.['31_to_60']) >= 0 ? css.cell1Rec : css.cell1RecRed
        }
      >
        {FormattedAmount(totalVal?.['31_to_60'])}
      </div>
      <div
        style={{
          width: `${
            document.querySelector("div[data-field = 'age_buckets?.61_to_120']")
              ?.clientWidth - 10 || 80
          }px`,
          textAlign: 'right',
        }}
        className={
          Number(totalVal?.['61_to_120']) >= 0 ? css.cell1Rec : css.cell1RecRed
        }
      >
        {FormattedAmount(totalVal?.['61_to_120'])}
      </div>
      <div
        style={{
          width: `${
            document.querySelector(
              "div[data-field = 'age_buckets?.121_to_180']",
            )?.clientWidth - 10 || 80
          }px`,
          textAlign: 'right',
        }}
        className={
          Number(totalVal?.['121_to_180']) >= 0 ? css.cell1Rec : css.cell1RecRed
        }
      >
        {FormattedAmount(totalVal?.['121_to_180'])}
      </div>
      <div
        style={{
          width: `${
            document.querySelector(
              "div[data-field = 'age_buckets?.181_to_360']",
            )?.clientWidth - 10 || 80
          }px`,
          textAlign: 'right',
        }}
        className={
          Number(totalVal?.['181_to_360']) >= 0 ? css.cell1Rec : css.cell1RecRed
        }
      >
        {FormattedAmount(totalVal?.['181_to_360'])}
      </div>
      <div
        style={{
          width: `${
            document.querySelector("div[data-field = 'age_buckets?.above_360']")
              ?.clientWidth - 10 || 80
          }px`,
          textAlign: 'right',
        }}
        className={
          Number(totalVal?.above_360) >= 0 ? css.cell1Rec : css.cell1RecRed
        }
      >
        {FormattedAmount(totalVal?.above_360)}
      </div>
      <div
        style={{
          width: `${
            document.querySelector('div[data-field = total_debits]')
              ?.clientWidth - 10 || 80
          }px`,
          textAlign: 'center',
        }}
        className={
          Number(totalVal?.total_debits) >= 0 ? css.cell1Rec : css.cell1RecRed
        }
      >
        {FormattedAmount(totalVal?.total_debits)}
      </div>
      <div
        style={{
          width: `${
            document.querySelector("div[data-field = 'age_buckets?.advance']")
              ?.clientWidth - 10 || 80
          }px`,
          textAlign: 'right',
        }}
        className={
          Number(totalVal?.advance) >= 0 ? css.cell1Rec : css.cell1RecRed
        }
      >
        {FormattedAmount(totalVal?.advance)}
      </div>
      <div
        style={{
          width: `${
            document.querySelector('div[data-field = unsettled_credits]')
              ?.clientWidth - 10 || 80
          }px`,
          textAlign: 'center',
        }}
        className={css.cell1RecRed}
      >
        {FormattedAmount(totalVal?.unsettled_credits)}
      </div>
    </div>
  );
};

export const CustomFooterMonth = (props) => {
  const { totalVal, monthList } = props;
  return (
    <div className={css.divFooter}>
      <div
        style={{
          width: `${
            document.querySelector('div[data-field = name]')?.clientWidth -
              10 || 155
          }px`,
          paddingLeft: 10,
        }}
      >
        Total
      </div>
      <div
        style={{
          width: `${
            document.querySelector('div[data-field = net_balance]')
              ?.clientWidth - 10 || 80
          }px`,
          textAlign: 'right',
        }}
        className={
          Number(totalVal?.net_balance) >= 0 ? css.cell1Rec : css.cell1RecRed
        }
      >
        {FormattedAmount(totalVal?.net_balance)}
      </div>

      {monthList?.map((val) => (
        <div
          style={{
            width: `${
              document.querySelector(`div[data-field ='${val?.field}']`)
                ?.clientWidth - 10 || 80
            }px`,
            textAlign: 'right',
          }}
          className={
            Number(totalVal?.[val?.field]) >= 0 ? css.cell1Rec : css.cell1RecRed
          }
        >
          {FormattedAmount(totalVal?.[val?.field])}
        </div>
      ))}

      <div
        style={{
          width: `${
            document.querySelector('div[data-field = earlier_than]')
              ?.clientWidth - 10 || 110
          }px`,
          textAlign: 'right',
        }}
        className={
          Number(totalVal?.earlier_than) >= 0 ? css.cell1Rec : css.cell1RecRed
        }
      >
        {FormattedAmount(totalVal?.earlier_than)}
      </div>

      <div
        style={{
          width: `${
            document.querySelector('div[data-field = total_debits]')
              ?.clientWidth - 10 || 80
          }px`,
          textAlign: 'center',
        }}
        className={
          Number(totalVal?.total_debits) >= 0 ? css.cell1Rec : css.cell1RecRed
        }
      >
        {FormattedAmount(totalVal?.total_debits)}
      </div>

      <div
        style={{
          width: `${
            document.querySelector('div[data-field = unsettled_credits]')
              ?.clientWidth - 10 || 80
          }px`,
          textAlign: 'center',
        }}
        className={css.cell1RecRed}
      >
        {FormattedAmount(totalVal?.unsettled_credits)}
      </div>
    </div>
  );
};

const useStyles = makeStyles(() => ({
  chips: {
    marginRight: '5px',
    '& .MuiChip-root': {
      background: 'white',
      border: '1px solid #f0f0f0',
      flexDirection: 'row-reverse !important',
    },
    '& .MuiChip-icon': {
      marginRight: '2px',
      marginLeft: '2px',
    },
  },
  chipsWeb: {
    marginRight: '20px',
    '& .MuiChip-root': {
      background: 'white',
      flexDirection: 'row-reverse !important',
      justifyContent: 'space-between',
      height: '36px',
      border: '1px solid #999ea566 !important',
      borderRadius: '4px !important',
    },
    '& .MuiChip-icon': {
      marginRight: '12px',
    },
    '& ..MuiChip-label': {
      fontSize: '12px',
      fontWeight: 400,
    },
  },
  searchInput: {
    margin: '0 20px',
    padding: '5px 10px 0 0',
    '& .MuiTextField-root': {
      paddingLeft: '8px',
      marginBottom: '8px',
      border: '1px solid rgb(180 175 174)',
    },
    '& .MuiInput-root': {
      height: '56px !important',
    },
  },
  checkbox: {
    padding: 0,
    paddingTop: 4,
    '& .MuiSvgIcon-root': {
      fontSize: '2.4rem',
      fill: 'transparent',
    },
  },
  selectedchips: {
    minWidth: '80px',
    margin: '0 6px 0 0',
    background: '#fdf1e6',
    color: themes.colorPrimaryButton,
    borderColor: themes.colorPrimaryButton,
  },

  table: {
    minWidth: 650,
  },
  sticky: {
    position: 'sticky',
    left: 0,
    background: 'white',
    borderRight: '1px solid #F5F5F5',
    borderBottom: '1px solid #F5F5F5 !important',
  },
}));

export default function Agening({userRoles}) {
  const classes = useStyles();
  const navigate = Router.useNavigate();

  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [totals, setTotals] = useState([]);
  const [month, setMonth] = useState('By Bucket ( Days )');
  const [value2, setValue2] = useState('');
  const device = localStorage.getItem('device_detect');

  const { organization, enableLoading, user, loading, openSnackBar } =
    useContext(AppContext);
  const [anchorElDateP, setAnchorElDateP] = React.useState({
    value: new Date(),
    opened: null,
  });

  const [columnHeader, setColumnHeader] = React.useState('');

  const [filterCustListTemp, setFilterCustListTemp] = React.useState([]);

  const [anchorElMonth, setAnchorElMonth] = React.useState(null);

  React.useEffect(() => {
    if (Object.keys(userRoles?.['Vendor Ageing'] || {})?.length > 0 && userRoles?.['Vendor Ageing']?.view_payable_ageing) {
      enableLoading(true);
      RestApi(
        `organizations/${organization.orgId}/payables/ageing?${`date=${moment(
          anchorElDateP.value,
        ).format('YYYY-MM-DD')}`}${value2 && `&report_view=${value2}`}`,
        {
          method: METHOD.GET,
          headers: {
            Authorization: `Bearer ${user.activeToken}`,
          },
        },
      )
        .then((res) => {
          if (res && !res.error && !res?.message) {
            setTotals(res?.totals);
            setData(res?.data);
            setData2(res);
          }
          enableLoading(false);
        })
        .catch(() => {
          enableLoading(false);
          openSnackBar({
            message: `Sorry we will look into in`,
            type: MESSAGE_TYPE.ERROR,
          });
        });
    }
  }, [organization.orgId, user.activeToken, anchorElDateP.value, value2, userRoles?.['Vendor Ageing']]);

  const triggerDownlaod = () => {
    if (device === 'mobile') {
      JSBridge.downloadWithAuthentication(
        `${BASE_URL}/organizations/${organization.orgId}/payables/ageing.xlsx${
          value2 && `?report_view=${value2}`
        }`,
      );
    } else {
      enableLoading(true);
      fetch(
        // `${BASE_URL}/organizations/${organization.orgId}/receivables/ageing.xlsx`,
        // `${BASE_URL}/organizations/${organization.orgId}/receivables/ageing.xlsx?report_view=monthwise`,
        `${BASE_URL}/organizations/${organization.orgId}/payables/ageing.xlsx${
          value2 && `?report_view=${value2}`
        }`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.activeToken}`,
          },
        },
      )
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'ageing';
          document.body.appendChild(a);
          a.click();
          a.remove();
        });
      enableLoading(false);
    }
  };

  const [searchValue, setSearchValue] = React.useState('');
  const [filteredUsers, setFilteredUsers] = React.useState([]);

  // const sortedData =
  //   value === 'Ascending'
  //     ? data?.sort((a, b) => a?.total_amount - b?.total_amount)
  //     : data?.sort((a, b) => b?.total_amount - a?.total_amount);

  React.useEffect(() => {
    if (searchValue?.length === 0) {
      setFilteredUsers(data);
    } else {
      const temp = data.filter((val) => {
        return val?.name?.toLowerCase().includes(searchValue?.toLowerCase());
      });
      setFilteredUsers(temp);
    }
  }, [searchValue, data]);

  React.useEffect(() => {
    if (filterCustListTemp?.length === 0) {
      setFilteredUsers(data);
    } else {
      const temp = data.filter((val) => {
        return filterCustListTemp?.includes(val.id);
      });
      setFilteredUsers(temp);
    }
  }, [filterCustListTemp]);

  React.useEffect(() => { 
    setData([]);
      setData2([]);
      setTotals([]);
  }, [value2]);

  const Bucket = (e) => {
    setMonth(e);
    if (e === 'By Bucket ( Days )') {
      setValue2('');
    } else if (e === 'By Billing Month') {
      setValue2('monthwise');
    }
    setAnchorElMonth(null);
  };

  const handleClick = (ids, tab) => {
    navigate('/payables-ageing-view', {
      state: {
        tableId: ids,
        selectedDate: anchorElDateP.value,
        wise: value2,
        tabState: tab || 'total',
      },
    });
  };

  const getLength = (val, age) => {
    let tempLen;
    if (age) {
      tempLen = FormattedAmount(
        filteredUsers
          .map((v) => v?.age_buckets?.[val])
          .reduce((b, a) => b + a, 0),
      );
    } else {
      tempLen = FormattedAmount(
        filteredUsers.map((v) => v?.[val]).reduce((b, a) => b + a, 0),
      );
    }
    if (tempLen?.toString()?.length > 9) {
      return 10 * tempLen?.toString()?.length - 20;
    }
    return 75;
  };

  const columnsAgeingDay = [
    {
      field: 'name',
      headerName: 'Name',
      renderCell: (params) => {
        return (
          <div onClick={() => handleClick(params.row.id)}>
            <p style={{ whiteSpace: 'break-spaces' }}>{params.row?.name}</p>
          </div>
        );
      },
      maxWidth: 350,
      width: 165,
    },
    {
      field: 'net_balance',
      headerName: 'Net Balance',
      minWidth: getLength('net_balance'),
      flex: 1,
      type: 'number',
      renderCell: (params) => {
        return (
          <div onClick={() => handleClick(params.row.id)}>
            <p
              style={{
                color:
                  Number(params.row?.net_balance) >= 0 ? '#000' : '#950909',
              }}
            >
              {FormattedAmount(params.row?.net_balance)}
            </p>
          </div>
        );
      },
      headerClassName: 'left-align--header',
    },
    {
      field: 'age_buckets?.not_due',
      headerName: 'Not Due',
      minWidth: getLength('not_due', true),
      flex: 1,
      type: 'number',
      valueGetter: (params) => params.row.age_buckets?.not_due,
      renderCell: (params) => {
        return (
          <div onClick={() => handleClick(params.row.id, 'not_due_cr')}>
            <p
              style={{
                color:
                  Number(params.row.age_buckets?.not_due) >= 0
                    ? '#000'
                    : '#950909',
              }}
            >
              {FormattedAmount(params.row?.age_buckets?.not_due)}
            </p>
          </div>
        );
      },
      headerClassName: 'left-align--header',
    },
    {
      field: 'age_buckets?.1_to_30',
      headerName: '1 To 30',
      minWidth: getLength('1_to_30', true),
      flex: 1,
      type: 'number',
      valueGetter: (params) => params.row.age_buckets?.['1_to_30'],
      renderCell: (params) => {
        return (
          <div onClick={() => handleClick(params.row.id, '1_to_30_cr')}>
            <p
              style={{
                color:
                  Number(params.row.age_buckets?.['1_to_30']) >= 0
                    ? '#000'
                    : '#950909',
              }}
            >
              {FormattedAmount(params.row?.age_buckets?.['1_to_30'])}
            </p>
          </div>
        );
      },
      headerClassName: 'left-align--header',
    },
    {
      field: 'age_buckets?.31_to_60',
      headerName: '31 To 60',
      minWidth: getLength('31_to_60', true),
      flex: 1,
      type: 'number',
      valueGetter: (params) => params.row.age_buckets?.['31_to_60'],
      renderCell: (params) => {
        return (
          <div onClick={() => handleClick(params.row.id, '31_to_60_cr')}>
            <p
              style={{
                color:
                  Number(params.row.age_buckets?.['31_to_60']) >= 0
                    ? '#000'
                    : '#950909',
              }}
            >
              {FormattedAmount(params.row?.age_buckets?.['31_to_60'])}
            </p>
          </div>
        );
      },
      headerClassName: 'left-align--header',
    },
    {
      field: 'age_buckets?.61_to_120',
      headerName: '61 To 120',
      minWidth: getLength('61_to_120', true),
      flex: 1,
      type: 'number',
      valueGetter: (params) => params.row.age_buckets?.['61_to_120'],
      renderCell: (params) => {
        return (
          <div onClick={() => handleClick(params.row.id, '61_to_120_cr')}>
            <p
              style={{
                color:
                  Number(params.row.age_buckets?.['61_to_120']) >= 0
                    ? '#000'
                    : '#950909',
              }}
            >
              {FormattedAmount(params.row?.age_buckets?.['61_to_120'])}
            </p>
          </div>
        );
      },
      headerClassName: 'left-align--header',
    },
    {
      field: 'age_buckets?.121_to_180',
      headerName: '121 To 180',
      minWidth: getLength('121_to_180', true),
      flex: 1,
      type: 'number',
      valueGetter: (params) => params.row.age_buckets?.['121_to_180'],
      renderCell: (params) => {
        return (
          <div onClick={() => handleClick(params.row.id, '121_to_180_cr')}>
            <p
              style={{
                color:
                  Number(params.row.age_buckets?.['121_to_180']) >= 0
                    ? '#000'
                    : '#950909',
              }}
            >
              {FormattedAmount(params.row?.age_buckets?.['121_to_180'])}
            </p>
          </div>
        );
      },
      headerClassName: 'left-align--header',
    },
    {
      field: 'age_buckets?.181_to_360',
      headerName: '181 To 360',
      minWidth: getLength('181_to_360', true),
      flex: 1,
      type: 'number',
      valueGetter: (params) => params.row.age_buckets?.['181_to_360'],
      renderCell: (params) => {
        return (
          <div onClick={() => handleClick(params.row.id, '181_to_360_cr')}>
            <p
              style={{
                color:
                  Number(params.row.age_buckets?.['181_to_360']) >= 0
                    ? '#000'
                    : '#950909',
              }}
            >
              {FormattedAmount(params.row?.age_buckets?.['181_to_360'])}
            </p>
          </div>
        );
      },
      headerClassName: 'left-align--header',
    },
    {
      field: 'age_buckets?.above_360',
      headerName: 'Above 360',
      type: 'number',
      minWidth: getLength('above_360', true),
      flex: 1,
      // editable: true,
      valueGetter: (params) => params.row.age_buckets?.above_360,
      renderCell: (params) => {
        return (
          <div onClick={() => handleClick(params.row.id, 'above_360_cr')}>
            <p
              style={{
                color:
                  Number(params.row.age_buckets?.above_360) >= 0
                    ? '#000'
                    : '#950909',
              }}
            >
              {FormattedAmount(params.row?.age_buckets?.above_360)}
            </p>
          </div>
        );
      },
      headerClassName: 'left-align--header',
    },
    {
      field: 'total_debits',
      headerName: 'Total Credits',
      type: 'number',
      minWidth: getLength('total_debits'),
      flex: 1,
      editable: true,
      renderCell: (params) => {
        return (
          <div onClick={() => handleClick(params.row.id)}>
            <p
              style={{
                color:
                  Number(params.row.total_debits) >= 0 ? '#000' : '#950909',
              }}
            >
              {FormattedAmount(params.row?.total_debits)}
            </p>
          </div>
        );
      },
      headerClassName: 'left-align--header',
      align: 'center',
    },
    {
      field: 'age_buckets?.advance',
      headerName: 'Advance',
      minWidth: getLength('advance', true),
      flex: 1,
      type: 'number',
      valueGetter: (params) => params.row.age_buckets?.advance,
      renderCell: (params) => {
        return (
          <div onClick={() => handleClick(params.row.id, 'advance_cr')}>
            <p
              style={{
                color:
                  Number(params.row.age_buckets?.advance) >= 0
                    ? '#000'
                    : '#950909',
              }}
            >
              {FormattedAmount(params.row?.age_buckets?.advance)}
            </p>
          </div>
        );
      },
      headerClassName: 'left-align--header',
    },
    {
      field: 'unsettled_credits',
      headerName: 'Unsettled Debits',
      minWidth: getLength('unsettled_credits'),
      flex: 1,
      type: 'number',
      renderCell: (params) => {
        return (
          <div onClick={() => handleClick(params.row.id, 'unsettled_cr')}>
            <p style={{ color: '#950909' }}>
              {FormattedAmount(params.row?.unsettled_credits)}
            </p>
          </div>
        );
      },
      headerClassName: 'left-align--header',
      align: 'center',
      color: '#950909 ',
    },
  ];

  const customerList = (props) => {
    const { head, setFilterCustListTempPro } = props;
    const [searchValueFilter, setSearchValueFilter] = React.useState('');
    const [filterCustListPro, setFilterCustListPro] = React.useState([]);

    const filterPro = searchValueFilter
      ? data.filter((val) => {
          return val?.name
            ?.toLowerCase()
            .includes(searchValueFilter?.toLowerCase());
        })
      : data;

    const handleCustList = (ids) => {
      if (
        filterCustListPro?.length === 0 ||
        !filterCustListPro?.includes(ids)
      ) {
        setFilterCustListPro((prev) => [...prev, ids]);
      } else if (filterCustListPro?.includes(ids)) {
        const temp = filterCustListPro?.filter((item) => item !== ids);
        setFilterCustListPro(temp);
      }
    };

    return (
      <>
        {(head === 'name' && (
          // <CustomFilterPro viewType="customer" setFilterCustListTempPro={setFilterCustListTempPro} data={data} />
          <div>
            <div className={css.searchFilterPro}>
              <SearchIcon style={{ color: '#af9d9d' }} />{' '}
              <input
                placeholder="Search for"
                onChange={(event) => {
                  event.persist();
                  setSearchValueFilter(event.target.value);
                }}
                value={searchValueFilter}
                className={css.textFieldFocus}
              />
            </div>
            <div className={css.datagridProFilter}>
              {filterPro?.map((val) => (
                <Mui.FormControlLabel
                  label={val?.name}
                  control={
                    <Mui.Checkbox
                      checked={
                        filterCustListPro?.length === 0
                          ? false
                          : filterCustListPro?.includes(val?.id)
                      }
                      value={val?.id}
                      onChange={(e) => {
                        handleCustList(e?.target?.value);
                      }}
                      style={{ color: '#f08b32' }}
                    />
                  }
                  // onClick=(())
                />
              ))}
            </div>
            <div className={css.buttonProDiv}>
              <Mui.Button
                className={css.submitButtonPro}
                onClick={() => {
                  setFilterCustListTempPro(filterCustListPro);
                }}
              >
                Apply Filters
              </Mui.Button>
            </div>
          </div>
        )) || <GridFilterPanel />}
      </>
    );
  };

  return (
    <div className={css.ageing}>
      {device === 'mobile' ? (
        <>
          <Mui.Typography className={css.titleHead}>
            Vendor Ageing
          </Mui.Typography>
          <Grid item xs={12} className={css.mainContainer}>
            <CssTextField
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <img src={SearchIcon2} alt="Well Done" />
                  </InputAdornment>
                ),
                // endAdornment: (
                //   <InputAdornment position="end">
                //     <div
                //       className={css.monthSelection}
                //       onClick={() => setDrawer(true)}
                //     >
                //       <div className={css.text}>Sort by</div>
                //       <DropdownIcon className={css.icon} />
                //     </div>
                //   </InputAdornment>
                // ),
                style: {
                  backgroundColor: '#F2F2F0',
                  borderRadius: 20,
                  height: '40px',
                },
              }}
              placeholder="Search for a Vendor"
              fullWidth
              variant="outlined"
              className={css.MuiOutlinedInputRoot}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </Grid>
          <>
            <Mui.Stack
              direction="row"
              className={css.dropDownsOverflow}
              alignItems="center"
              sx={{
                margin: '3% 0 0 2%',
                width: '96%',
              }}
            >
              <Mui.Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                className={css.marginSortBy}
              >
                <div className={classes.chips}>
                  <Chip
                    label={
                      <Mui.Grid
                        style={{
                          fontSize: '10px',
                          width: '100px',
                          textOverflow: 'elipsis',
                        }}
                      >
                        Report View : {month}
                      </Mui.Grid>
                    }
                    icon={<KeyboardArrowDown />}
                    className={css.chipLabel2}
                    onClick={(event) => setAnchorElMonth(event.currentTarget)}
                  />
                </div>
              </Mui.Stack>
              <Mui.Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                className={css.marginSortBy}
              >
                <div className={classes.chips}>
                  <Chip
                    label={
                      <Mui.Grid
                        style={{
                          fontSize: '10px',
                          width: '90px',
                          textOverflow: 'elipsis',
                        }}
                      >
                        As of{' '}
                        {moment(anchorElDateP.value).format('DD MMM YYYY')}
                      </Mui.Grid>
                    }
                    icon={<KeyboardArrowDown />}
                    className={css.chipLabel2}
                    onClick={(event) =>
                      setAnchorElDateP({
                        value: anchorElDateP.value,
                        opened: event.currentTarget,
                      })
                    }
                  />
                </div>
              </Mui.Stack>
              {filteredUsers?.length > 0 && (
                <div
                  className={css.dowloadIcon}
                  onClick={() => triggerDownlaod()}
                  style={{ marginLeft: '10px' }}
                >
                  <img src={DownloadAgeing} width="30px" alt="Well Done" />
                </div>
              )}
            </Mui.Stack>
          </>
          {!loading && filteredUsers?.length > 0 ? (
            <Grid item xs={12} style={{ margin: '10px 0 0 0px' }}>
              {filteredUsers.map((val) => (
                <>
                  <BillAgeingTable
                    value={value2}
                    anchorElDateP={anchorElDateP}
                    data={val}
                    key={`${val.id}`}
                  />
                </>
              ))}
            </Grid>
          ) : (
            <Grid item xs={12}>
              <Mui.Typography sx={{ m: '25%' }} align="center">
                {loading ? 'Data is being fetched' : 'No data Found '}
              </Mui.Typography>
            </Grid>
          )}
        </>
      ) : (
        <>
          {/* WEB */}
          <Mui.Typography className={css.ageingTitle}>
            {' '}
            Vendor Ageing
          </Mui.Typography>

          <Mui.Stack
            direction="row"
            className={css.searchAndSort}
            alignItems="center"
          >
            <Mui.Grid className={css.searchFilterPaya}>
              <SearchIcon style={{ color: '#af9d9d' }} />{' '}
              <input
                placeholder="Search For a Vendor"
                onChange={(event) => setSearchValue(event.target.value)}
                value={searchValue}
                className={css.textFieldFocus}
                style={{
                  border: 'none',
                  overflow: 'auto',
                  fontSize: '110px',
                  height: '30px',
                  width: '100%'
                }}
              />
            </Mui.Grid>

            <>
              <Mui.Stack
                direction="row"
                className={css.dropDownsOverflow}
                alignItems="center"
              >
                <Mui.Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  className={css.marginSortBy}
                >
                  <div className={classes.chipsWeb}>
                    <Chip
                      style={{ width: '270px' }}
                      label={
                        <p style={{ margin: 0 }}>
                          Report View :{' '}
                          <span style={{ color: '#F08B32' }}>{month}</span>
                        </p>
                      }
                      icon={<KeyboardArrowDown />}
                      className={css.chipLabel2}
                      onClick={(event) => setAnchorElMonth(event.currentTarget)}
                    />
                  </div>
                </Mui.Stack>
                <Mui.Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  className={css.marginSortBy}
                >
                  <div className={classes.chipsWeb}>
                    <Chip
                      style={{ width: '178px' }}
                      label={
                        <p style={{ margin: 0 }}>
                          As of{' '}
                          {moment(anchorElDateP.value).format('DD MMM YYYY')}
                        </p>
                      }
                      icon={<KeyboardArrowDown />}
                      className={css.chipLabel2}
                      onClick={(event) =>
                        setAnchorElDateP({
                          value: anchorElDateP.value,
                          opened: event.currentTarget,
                        })
                      }
                    />
                  </div>
                </Mui.Stack>
                {filteredUsers?.length > 0 && (
                  <Mui.Tooltip title="Download" placement="bottom-end">
                    <div
                      className={css.dowloadIconWeb}
                      onClick={() => triggerDownlaod()}
                    >
                      <DownloadIcon style={{ color: '#FFF' }} />
                      <p style={{ margin: 0, color: '#fff' }}>Download</p>
                    </div>
                  </Mui.Tooltip>
                )}
              </Mui.Stack>
            </>
          </Mui.Stack>
          {value2 === 'monthwise' ? (
            <THead
              totals={totals}
              filteredUsers={filteredUsers}
              data2={data2}
              anchorElDateP={anchorElDateP}
              wise={value2}
              columnHeader={columnHeader}
              setColumnHeader={setColumnHeader}
              setFilterCustListTemp={setFilterCustListTemp}
              customerList={customerList}
            />
          ) : (
            <>
              {/* {!loading && filteredUsers?.length > 0 ? ( */}
              <Mui.Box
                sx={{
                  height: '80%',
                  width: '100%',
                  '& .left-align--header': {
                    '.MuiDataGrid-columnHeaderDraggableContainer': {
                      flexDirection: 'row !important',
                    },
                    '.MuiDataGrid-columnHeaderTitleContainer': {
                      flexDirection: 'row !important',
                    },
                    textAlign: 'left',
                  },
                }}
              >
                <DataGridPro
                  rows={filteredUsers}
                  columns={columnsAgeingDay}
                  // loading={data.rows.length === 0}
                  getRowHeight={() => 'auto'}
                  rowHeight={75}
                  disableColumnReorder
                  // hideFooter
                  // checkboxSelection
                  disableSelectionOnClick
                  Footer={CustomFooter}
                  onFilterModelChange={(item) =>
                    setColumnHeader(item?.items?.[0]?.columnField)
                  }
                  components={{
                    FilterPanel: customerList,
                    Footer: CustomFooter,
                    ColumnMenu: CustomColumnMenu,
                    // Header: CustomFooter
                    // ColumnMenu: CustomFooter
                    NoRowsOverlay: () => (
                      <Mui.Stack
                        height="100%"
                        alignItems="center"
                        justifyContent="center"
                      >
                        No Data Found
                      </Mui.Stack>
                    ),
                  }}
                  componentsProps={{
                    filterPanel: {
                      head: columnHeader,
                      setFilterCustListTempPro: setFilterCustListTemp,
                    },
                    footer: {
                      totalVal: {
                        net_balance: `${filteredUsers
                          .map((v) => v?.net_balance)
                          .reduce((b, a) => b + a, 0)}`,

                        not_due: `${filteredUsers
                          .map((v) => v?.age_buckets?.not_due)
                          .reduce((b, a) => b + a, 0)}`,

                        '1_to_30': `${filteredUsers
                          .map((v) => v?.age_buckets?.['1_to_30'])
                          .reduce((b, a) => b + a, 0)}`,

                        '31_to_60': `${filteredUsers
                          .map((v) => v?.age_buckets?.['31_to_60'])
                          .reduce((b, a) => b + a, 0)}`,

                        '61_to_120': `${filteredUsers
                          .map((v) => v?.age_buckets?.['61_to_120'])
                          .reduce((b, a) => b + a, 0)}`,

                        '121_to_180': `${filteredUsers
                          .map((v) => v?.age_buckets?.['121_to_180'])
                          .reduce((b, a) => b + a, 0)}`,

                        '181_to_360': `${filteredUsers
                          .map((v) => v?.age_buckets?.['181_to_360'])
                          .reduce((b, a) => b + a, 0)}`,

                        above_360: `${filteredUsers
                          .map((v) => v?.age_buckets?.above_360)
                          .reduce((b, a) => b + a, 0)}`,

                        total_debits: `${filteredUsers
                          .map((v) => v?.total_debits)
                          .reduce((b, a) => b + a, 0)}`,

                        advance: `${filteredUsers
                          .map((v) => v?.advance)
                          .reduce((b, a) => b + a, 0)}`,

                        unsettled_credits: `${filteredUsers
                          .map((v) => v?.unsettled_credits)
                          .reduce((b, a) => b + a, 0)}`,
                      },
                    },
                  }}
                  sx={{
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #D6D8DB',
                    '& .MuiDataGrid-columnHeadersInner': {
                      background: '#F7F7F7',
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                      whiteSpace: 'break-spaces',
                      textAlign: 'center',
                      lineHeight: '20px',
                      fontFamily: 'Lexend !important',
                      fontWeight: '400 !important',
                      fontSize: '13px',
                    },
                    '& .MuiDataGrid-cell': {
                      fontFamily: 'Lexend !important',
                      fontWeight: '400 !important',
                      fontSize: '13px',
                    },
                    '& .MuiDataGrid-main + div': { overflow: 'overlay' },
                    '& .MuiDataGrid-row': {
                      cursor: 'pointer',
                      borderBottom: '1px solid #D6D6D6 !important',
                    },
                    '& .MuiDataGrid-cell--textRight, .MuiDataGrid-cell--textCenter':
                      {
                        whiteSpace: 'nowrap',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      borderRadius: '8px 8px 0 0'
                    }
                  }}
                />
              </Mui.Box>
              {/* ) : (
                <Mui.Typography align="center">
                  {loading ? 'Data is being fetched' : 'No data Found '}
                </Mui.Typography>
              )} */}
            </>
          )}
        </>
      )}
      <Mui.Popover
        style={{ cursor: 'pointer' }}
        id="basic-menu-sort"
        anchorEl={anchorElMonth}
        PaperProps={{
          sx: {
            width: device === 'mobile' ? '148px' : '270px',
            border: '0.5px solid #C7C7C7',
            boxShadow: '0px 0px 16px rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            marginTop: '10px'
          },
        }}
        open={Boolean(anchorElMonth)}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        onClose={() => setAnchorElMonth(null)}
      >
        <div>
          {['By Bucket ( Days )', 'By Billing Month'].map((val) =>
            <div onClick={() => Bucket(val)} className={css.DivTagPopover}>
              <p className={css.PTagPopover}>{val}</p>
            </div>)}
        </div>
      </Mui.Popover>

      <Mui.Popover
        id="basic-menu-sort"
        anchorEl={anchorElDateP.opened}
        open={Boolean(anchorElDateP.opened)}
        PaperProps={{
          sx: {
            width: device === 'mobile' ? '37vw' : '178px',
            border: '0.5px solid #C7C7C7',
            boxShadow: '0px 0px 16px rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            marginTop: '10px'
          }
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        onClose={() => setAnchorElDateP((prev) => ({ ...prev, opened: null }))}
        sx={{ cursor: 'pointer', width: '100%' }}
      >
        <div>
        {[-1, 0, 1, 2, 3, 4].map((i) => (
          <div onClick={() =>
            setAnchorElDateP({
              value:
                i === -1
                  ? new Date()
                  : new Date(
                      new Date().getFullYear(),
                      new Date().getMonth() - i,
                      0,
                    ),
              opened: null,
            })
          } className={css.DivTagPopover}>
            <p className={css.PTagPopover}>
            {i === -1
              ? moment().format('DD MMM YYYY')
              : moment(
                  new Date(
                    new Date().getFullYear(),
                    new Date().getMonth() - i,
                    0,
                  ),
                ).format('DD MMM YYYY')}
          </p>
          </div>
        ))}
        </div>
      </Mui.Popover>
    </div>
  );
}

export const THead = ({
  totals,
  filteredUsers,
  anchorElDateP,
  wise,
  columnHeader,
  setColumnHeader,
  setFilterCustListTemp,
  customerList,
}) => {
  const navigate = Router.useNavigate();
  const [monthList, setMonthList] = React.useState([]);
  const [totalMonth, setTotalMonth] = React.useState({});

  const handleClick = (ids, tab) => {
    navigate('/payables-ageing-view', {
      state: {
        tableId: ids,
        selectedDate: anchorElDateP.value,
        wise,
        tabState: tab || 'total',
      },
    });
  };

  const getLength = (val, month) => {
    let tempLen;
    if (month) {
      tempLen = FormattedAmount(
        filteredUsers.map((v) => v?.months?.[val]).reduce((b, a) => b + a, 0),
      );
    } else {
      tempLen = FormattedAmount(
        filteredUsers.map((v) => v?.[val]).reduce((b, a) => b + a, 0),
      );
    }
    if (tempLen?.toString()?.length > 9) {
      return 10 * tempLen?.toString()?.length - 20;
    }
    return 75;
  };

  const monthCal = () => {
    Object.keys(totals)
      ?.slice()
      ?.reverse()
      ?.filter(
        (text) =>
          text !== 'net_balance' &&
          text !== 'total_debits' &&
          text !== 'unsettled_credits' &&
          text !== 'earlier_than',
      )
      ?.map((text) =>
        setMonthList((prev) => [
          ...prev,
          {
            field: text,
            headerName: moment(text).format('MMM-YYYY'),
            minWidth: getLength(text, true),
            type: 'number',
            renderCell: (params) => {
              return (
                <div
                  onClick={() =>
                    handleClick(
                      params.row.id,
                      moment(text).format('MMM_YYYY')?.toLocaleLowerCase(),
                    )
                  }
                >
                  <p
                    style={{
                      color:
                        Number(params.row?.months?.[text]) >= 0
                          ? '#000'
                          : '#950909',
                    }}
                  >
                    {FormattedAmount(params.row?.months?.[text])}
                  </p>
                </div>
              );
            },
            headerClassName: 'left-align--header',
          },
        ]),
      );
  };
  React.useEffect(() => {
    setMonthList([]);
    monthCal();
  }, [totals, filteredUsers]);

  React.useEffect(() => {
    Object.keys(totals)
      ?.slice()
      ?.reverse()
      ?.filter(
        (text) =>
          text !== 'net_balance' &&
          text !== 'total_debits' &&
          text !== 'unsettled_credits' &&
          text !== 'earlier_than',
      )
      ?.map((text) =>
        setTotalMonth((prev) => ({
          ...prev,
          [text]: `${filteredUsers
            .map((v) => v?.months?.[text])
            .reduce((b, a) => b + a, 0)}`,
        })),
      );
  }, [filteredUsers]);

  const Earlier = new Date(
    Object.keys(totals)
      ?.slice()
      ?.reverse()
      ?.filter(
        (text) =>
          text !== 'net_balance' &&
          text !== 'total_debits' &&
          text !== 'unsettled_credits' &&
          text !== 'earlier_than',
      )
      .slice(-1)[0],
  ).toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  const columnsAgeingMonth = [
    {
      field: 'name',
      headerName: 'Name',
      renderCell: (params) => {
        return (
          <div onClick={() => handleClick(params.row.id)}>
            <p style={{ whiteSpace: 'break-spaces' }}>{params.row?.name}</p>
          </div>
        );
      },
      maxWidth: 350,
      width: 165,
    },
    {
      field: 'net_balance',
      headerName: 'Net Balance',
      minWidth: getLength('net_balance'),
      type: 'number',
      renderCell: (params) => {
        return (
          <div onClick={() => handleClick(params.row.id)}>
            <p
              style={{
                color:
                  Number(params.row?.net_balance) >= 0 ? '#000' : '#950909',
              }}
            >
              {FormattedAmount(params.row?.net_balance)}
            </p>
          </div>
        );
      },
      headerClassName: 'left-align--header',
    },
    ...monthList,
    {
      field: 'earlier_than',
      headerName: `Earlier Than ${Earlier?.replace(' ', '-')}`,
      minWidth: getLength('earlier_than'),
      type: 'number',
      renderCell: (params) => {
        return (
          <div
            onClick={() =>
              handleClick(
                params.row.id,
                `earlier_than_${Earlier?.replace(
                  ' ',
                  '_',
                )?.toLocaleLowerCase()}`,
              )
            }
          >
            <p
              style={{
                color:
                  Number(params.row?.months?.earlier_than) >= 0
                    ? '#000'
                    : '#950909',
              }}
            >
              {FormattedAmount(params.row?.months?.earlier_than)}
            </p>
          </div>
        );
      },
      headerClassName: 'left-align--header',
    },
    {
      field: 'total_debits',
      headerName: 'Total Credits',
      type: 'number',
      minWidth: getLength('total_debits'),
      editable: true,
      renderCell: (params) => {
        return (
          <div onClick={() => handleClick(params.row.id)}>
            <p
              style={{
                color:
                  Number(params.row.total_debits) >= 0 ? '#000' : '#950909',
              }}
            >
              {FormattedAmount(params.row?.total_debits)}
            </p>
          </div>
        );
      },
      headerClassName: 'left-align--header',
      align: 'center',
    },
    {
      field: 'unsettled_credits',
      headerName: 'Unsettled Debits',
      minWidth: getLength('unsettled_credits'),
      type: 'number',
      renderCell: (params) => {
        return (
          <div onClick={() => handleClick(params.row.id, 'unsettled_cr')}>
            <p style={{ color: '#950909' }}>
              {FormattedAmount(params.row?.unsettled_credits)}
            </p>
          </div>
        );
      },
      headerClassName: 'left-align--header',
      align: 'center',
      color: '#950909 ',
    },
  ];
  return (
    <>
      <Mui.Box
        sx={{
          height: '80%',
          width: '100%',
          '& .left-align--header': {
            '.MuiDataGrid-columnHeaderDraggableContainer': {
              flexDirection: 'row !important',
            },
            '.MuiDataGrid-columnHeaderTitleContainer': {
              flexDirection: 'row !important',
            },
            textAlign: 'left',
          },
        }}
      >
        <DataGridPro
          rows={filteredUsers}
          columns={columnsAgeingMonth}
          // loading={data.rows.length === 0}
          getRowHeight={() => 'auto'}
          rowHeight={75}
          disableColumnReorder
          // hideFooter
          // checkboxSelection
          disableSelectionOnClick
          Footer={CustomFooterMonth}
          onFilterModelChange={(item) =>
            setColumnHeader(item?.items?.[0]?.columnField)
          }
          components={{
            FilterPanel: customerList,
            Footer: CustomFooterMonth,
            ColumnMenu: CustomColumnMenu,
            NoRowsOverlay: () => (
              <Mui.Stack
                height="100%"
                alignItems="center"
                justifyContent="center"
              >
                No Data Found
              </Mui.Stack>
            ),
          }}
          componentsProps={{
            filterPanel: {
              head: columnHeader,
              setFilterCustListTempPro: setFilterCustListTemp,
            },
            footer: {
              totalVal: {
                net_balance: `${filteredUsers
                  .map((v) => v?.net_balance)
                  .reduce((b, a) => b + a, 0)}`,

                ...totalMonth,

                earlier_than: `${filteredUsers
                  .map((v) => v?.months?.earlier_than)
                  .reduce((b, a) => b + a, 0)}`,

                total_debits: `${filteredUsers
                  .map((v) => v?.total_debits)
                  .reduce((b, a) => b + a, 0)}`,

                unsettled_credits: `${filteredUsers
                  .map((v) => v?.unsettled_credits)
                  .reduce((b, a) => b + a, 0)}`,
              },
              monthList,
            },
          }}
          sx={{
            background: '#fff',
            borderRadius: '8px',
            border: '1px solid #D6D8DB',
            '& .MuiDataGrid-columnHeadersInner': {
              background: '#F7F7F7',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              whiteSpace: 'break-spaces',
              textAlign: 'center',
              lineHeight: '20px',
              fontFamily: 'Lexend !important',
              fontWeight: '400 !important',
              fontSize: '13px',
            },
            '& .MuiDataGrid-cell': {
              fontFamily: 'Lexend !important',
              fontWeight: '400 !important',
              fontSize: '13px',
            },
            '& .MuiDataGrid-main + div': { overflow: 'overlay' },
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
              borderBottom: '1px solid #D6D6D6 !important',
            },
            '& .MuiDataGrid-cell--textRight': {
              whiteSpace: 'nowrap',
            },
            '& .MuiDataGrid-columnHeaders': {
              borderRadius: '8px 8px 0 0'
            }
          }}
        />
      </Mui.Box>
    </>
  );
};
