import * as React from 'react';
import SearchIcon from '@material-ui/icons/Search';
import AppContext from '@root/AppContext.jsx';
import RestApi, { METHOD } from '@services/RestApi.jsx';
import css from './employeeList.scss';

export const EmployeeList = ({handleClick}) => {
    const {
        organization,
        user,
        enableLoading,
        // openSnackBar,
        // loading,
        currentUserInfo
    } = React.useContext(AppContext);
    const [EmployeeData, setEmployeeData] = React.useState([]);
  const [query, setQuery] = React.useState('');
    const [employeePagination, setEmployeePagination] = React.useState({
        currentPage: 1,
        totalPage: 1,
    });

    const fetchTeamApi = (searchVal, pagenum) => {
        enableLoading(!!(searchVal || !pagenum || pagenum === 1));
        RestApi(`organizations/${organization.orgId}/entities?type[]=employee&search=${searchVal || ''}&page=${pagenum || 1}`,
          {
            method: METHOD.GET,
            headers: {
              Authorization: `Bearer ${user.activeToken}`,
            },
          },
        )
          .then((res) => {
            enableLoading(!!(searchVal || !pagenum || pagenum === 1));
            if (res && !res.error) {
              setEmployeePagination({
                currentPage: res?.page,
                totalPage: res?.pages,
              });
              if (pagenum > 1) {
                setEmployeeData((prev) => [...prev, ...res?.data]);
              } else {
                setEmployeeData(res.data);
              }
            }
            enableLoading(false);
          })
          .catch(() => {
            enableLoading(false);
          });
    };
    
    React.useEffect(() => {
        if (employeePagination.totalPage > 1) {
          if (employeePagination?.currentPage < employeePagination?.totalPage) {
            setTimeout(() => {
              fetchTeamApi('', employeePagination?.currentPage + 1);
            }, 1000);
          }
        } else {
            fetchTeamApi();
        }
    }, [employeePagination.totalPage, employeePagination.currentPage]);
  
  // React.useEffect(() => { 
  //   const temp = EmployeeData?.filter((ele) => ele?.name?.toLocaleLowerCase()?.includes(query?.toLocaleLowerCase()));
  //   setFilterData(temp);
  // }, [EmployeeData, query]);

    return (<div className={css.employeeList}>
        <p className={css.headerText}>Paid By</p>
        <p className={css.subHeader}>Select who has paid the bill</p>
        <div className={css.searchFilterFull}>
          <SearchIcon className={css.searchFilterIcon} />{' '}
          <input
            onChange={(event) => {
            setQuery(event.target.value);
            if (event?.target?.value?.length >= 3) {
              fetchTeamApi(event?.target?.value);
            } else if (event?.target?.value?.length === 0) {
              fetchTeamApi();
            }
            }}
            placeholder="Search Employee"
            value={query}
            className={css.searchFilterInputBig}
            autoFocus
          />
        </div>
        <div className={css.scrollDiv}>
        {EmployeeData?.length > 0 && EmployeeData?.map((val) => <div className={css.employeeDiv} onClick={() => handleClick(val)}>
          <p className={css.employeeP}>{val?.name} {currentUserInfo?.entity_id === val?.id && '(YOU)'}</p>
        </div>)}
        {EmployeeData?.length === 0 && <p className={css.noData}>No Data Found</p>}
        </div>
    </div>
    );
};