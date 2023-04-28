import React,{useEffect,useState,useLayoutEffect,useRef} from 'react';
import AppContext from '@root/AppContext.jsx';
import * as Router from 'react-router-dom';
import SelectBottomSheet from '@components/SelectBottomSheet/SelectBottomSheet';
import Loader from '@components/ProcessLoading';
import { useLocation } from 'react-router-dom';
import css from './BankingCategorizationDetails.scss';
import './MuiAddonStyles.css';
import { CommonDrawer } from '../AccountBalance/CommonDrawer';
import {setTitlesandBalances} from './BankDetails/SetTitlesandBalances';
import {fetchExpenseCategoryDetails,fetchIncomeCategoryDetails,fetchBankTransactions,fetchTowardsDetails,fetchBankDetails} from './BankDetails/GetBankData' ;
import {dataAdjustments, getBankName, toCategorize} from './BankDetails/CustomFunctions' ;
import {BankTransactionsTemplate } from './BankDetails/BankTransactions_Template';
import {processFetchedData} from './BankDetails/ProcessFetchedData';
import {TemplateColumnsDesktop,TemplateColumnsMobile} from './BankDetails/GetTemplateColumns';

let derivedTransactions = {};
let processing = false;
const ispagination = false;
const derivedMasters = {"incomecategories":{"data":[]},"expensecategories":{"data":[]},"towards":{"inflow":{},"outflow":{},"data":[]},"type":[{"name":"Receipt","id":"receipt_from_party"},{"name":"Payment","id":"pauyment_to_party"}]};
let applyclicked_clone = false;
let firsttime_clone = false;
let firsttimeset_clone = false;
let Btype = 0;
let bankName = "";
let bankAccount="";

const BankCategoryDetails = () => {
    const {
        organization,
         user,
         openSnackBar,
     } = React.useContext(AppContext);  
    const navigate = Router.useNavigate(); 
    const [BankList, setBankList] = useState({});
    const [SelectedBankID,setSelectedBankID] = useState(null);
    const perDayTimeinMicroSeconds = 24 * 60 * 60 * 1000;
    const [fromDate,setFromDate] = useState(new Date(new Date().getTime() - (31 * perDayTimeinMicroSeconds)));
    const [toDate,setToDate] = useState(new Date());
    const [winWidth,setWinWidth] = useState(window.innerWidth);
    const [pickerType,setPickerType] = useState("");
    const [BankTransactions, setBankTransactions] = useState([]);
    const [GridHeight,setGridHeight] = useState(400);
    const [gridSize,setGridSize] = useState(5);
    const gridElement = useRef();
    const mainElement = useRef();
    const [openingBalance,setopeningBalance] = useState(0);
    const [closingBalance,setclosingBalance] = useState(0);  
    const [rawclosingBalance,setrawclosingBalance] = useState(0);
    const [rawopeningBalance,setrawopeningBalance] = useState(0);
    const [currentPage,setcurrentPage] = useState(-1);
    const [categorization,setCategorization] = useState(false);
    const [totalPages,setTotalPages] = useState(0);
    const [completedPages,setCompletedPages] = useState(1);
    const [previousDataFetch,setpreviousDataFetch] = useState(false);
    const [pageProcessingFromDate,setpageProcessingFromDate] = useState('');
    const [pageProcessingToDate,setpageProcessingToDate] = useState('');
    const [initClosingBalance,setinitClosingBalance] = useState(false);
    const [BankAccountID,setBankAccountID] = useState("");
    const [showLoader,setshowLoader] = useState(0);
    const [tdata,setTdata] = useState({});
    const [edata,setEdata] = useState({});
    const [idata,setIdata] = useState({});
    const [bdata,setBdata] = useState({});
    const [bnkdata,setBnk] = useState({});
    const location = useLocation();
    const [arrowDown,setarrowDown] = useState(false);
    const [arrowUp,setarrowUp] = useState(false);   
    const [arrowClicked,setarrowClicked] = useState(false);
    const [CollapseElementHeight,setCollapseElementHeight] = useState(0);
    const [BottomSheetNumber, setBottomSheetNumber] = useState(false);
    const [Currentrow,setCurrentrow] = useState(-1);
    const [dataSelected,setdataSelected] = useState({});

    let bid = "";
    if (location && location.state && location.state.bandetails){
         bid = location.state.bankdetails.id;
    }   
    let bankaccount = "";
    if (location && location.state && location.state.bank_account_id){
        bankaccount = location.state.bank_account_id;
    }    

    useLayoutEffect(() => {     
      function updateSize() {
        setWinWidth(window.innerWidth);
      }
      window.addEventListener('resize', updateSize);
      updateSize();
      const topelement = mainElement.current.firstChild;  
      const netheight =  mainElement.current.parentNode.parentNode.offsetHeight - topelement.offsetHeight - 40; 
      if (pickerType === "desktop"){ 
          setGridHeight(netheight-30);
      }else{ 
          if (mainElement && mainElement.current && mainElement.current.querySelector("#datagridbox")){
              mainElement.current.querySelector("#datagridbox").style.height = `${netheight}px`; 
          };    
          setGridHeight(netheight);
          setGridSize(5);
          if (document.querySelector(".DashboardViewContainer_appHeader")){
              document.querySelector(".DashboardViewContainer_appHeader").style.display = "flex";  
          }    
          if (document.querySelector(".DashboardViewContainer_dashboardBodyContainerhideNavBar")){
              document.querySelector(".DashboardViewContainer_dashboardBodyContainerhideNavBar").style.height = "100%";
              document.querySelector(".DashboardViewContainer_dashboardBodyContainerhideNavBar").style.background = "#f2f2f0";
          }
      }
      setarrowDown(false);
      setarrowUp(true);
      return () => window.removeEventListener('resize', updateSize);
    }, []);

    const updateFromDate = (date) =>{
        setFromDate(date);
    };

    const updateToDate = (date) =>{
        setToDate(date);
    };    

    const transferData = (data,type) =>{
         if (type === 1){
             setEdata(data);
         }
         if (type === 2){
            setIdata(data);
        }
        if (type === 3){
            setTdata(data);
        }   
        if (data.fdate){        
            setpageProcessingFromDate(data.fdate);
        }   
        if (data.tdata){          
            setpageProcessingToDate(data.tdate);  
        }    
        if (data.fdate){
            updateFromDate(data.fdate);
        }
        if (data.tdata){    
            updateToDate(data.tdate);     
        }         
        if (type === 4 && data && data.res && data.res.data && data.res.data.length > 0){
            Btype = 1;
            setBdata(data.res);
            processing = false;  
        }
        if (type === 4 && (!data || !data.res || !data.res.data || data.res.data.length === 0)){
            processing = false;           
        }    
        if (type === 5){
            setBnk(data);
        }     
           
    };

    const updateGridSize = (pageSize) =>{
        setGridSize(pageSize);
    };

    const updatearrowClicked = (value) =>{
        setarrowClicked(value);
    };

    const updatearrowDown = (value) =>{
        setarrowDown(value);
    };

    const updatearrowUp = (value) =>{
        setarrowUp(value);
    };

    const updateBankName = (value) =>{
        bankName = value;
    };

    const updateBankAccount = (value) =>{
        bankAccount = value;
    };


    const updateshowLoader = (value) =>{
        setshowLoader(value);
    };

    const updateBankTransactions = (value) =>{
        setBankTransactions(value);
    };

    const updateCurrentPage = (value) =>{
         setcurrentPage(value);
    };
    
    const updateTotalPages = (value) =>{
         setTotalPages(value);        
    };
    
    const updateCompletedPages = (value) =>{
         setCompletedPages(value);
    };
    
    const updateApplyClicked = (value) =>{
        applyclicked_clone = value;
    };

    const updatederivedTransactions = (value) =>{
        derivedTransactions = value;
    };

    const updateopeningBalance = (value) =>{
        setopeningBalance(value);
    };

    const updaterawopeningBalance = (value) =>{
        setrawopeningBalance(value);
    };

    const updateclosingBalance = (value) =>{
        setclosingBalance(value);
    };

    const updaterawclosingBalance = (value) =>{
        setrawclosingBalance(value);
    };  

    const updateinitClosingBalance = (value) =>{
        setinitClosingBalance(value);
    };

    const updateCurrentrow = (value) =>{
        setCurrentrow(value);
    };

    const updatedataSelected = (value) =>{
        setdataSelected(value); 
    };
 
    useEffect(()=>{
       if (winWidth <  600){    
           setPickerType("mobile");
       }else{
           setPickerType("desktop");
       }     
       const topelement = mainElement.current.firstChild;
       const netheight =  mainElement.current.parentNode.parentNode.offsetHeight - topelement.offsetHeight - 40;   
       if (pickerType === "desktop"){ 
           setGridHeight(netheight-30);
       }else{ 
           if (mainElement && mainElement.current && mainElement.current.querySelector("#datagridbox")){
                mainElement.current.querySelector("#datagridbox").style.height = `${netheight}px`; 
           }     
           setGridHeight(netheight);
           setGridSize(5);
       }    
    },[winWidth]);


    useEffect(()=>{
      setTimeout(() =>{  
           const topelement = mainElement.current.firstChild;
           setCollapseElementHeight(topelement.firstChild.offsetHeight);
           const netheight =  mainElement.current.parentNode.parentNode.offsetHeight - topelement.firstChild.offsetHeight ;    
           if (pickerType === "desktop"){ 
               if (mainElement && mainElement.current && mainElement.current.querySelector("#datagridbox")){
                   mainElement.current.querySelector("#datagridbox").style.height = `${netheight-30}px`; 
               }    
           }else if (pickerType === "mobile"){ 
               if (mainElement && mainElement.current && mainElement.current.querySelector("#datagridbox")){            
                   mainElement.current.querySelector("#datagridbox").style.height = `${netheight-20}px`; 
               }    
           } 
       },1500);     
    },[pickerType,GridHeight]);


    useEffect(()=>{
      if (arrowDown){
          const netheight =  mainElement.current.parentNode.parentNode.offsetHeight - 80;      
          if (pickerType === "mobile"){ 
             if (mainElement && mainElement.current && mainElement.current.querySelector("#datagridbox")){
                 mainElement.current.querySelector("#datagridbox").style.height = `${netheight}px`; 
             };
          } 
      }
      if (arrowUp){
           const netheight =  mainElement.current.parentNode.parentNode.offsetHeight - CollapseElementHeight - 40;   
           if (pickerType === "mobile"){ 
               if (mainElement && mainElement.current && mainElement.current.querySelector("#datagridbox")){
                   mainElement.current.querySelector("#datagridbox").style.height = `${netheight}px`; 
               };    
           } 
      }
      const elList = document.querySelectorAll("div");
      elList.forEach((el)=>{
        if (el.innerHTML === "MUI X: Invalid license key") {
            el.style.display = "none";
        }
      });
    },[arrowClicked,arrowDown,arrowUp,CollapseElementHeight,pickerType]);



    const resetBankData = () =>{
       setopeningBalance(0);
       setclosingBalance(0);
       setrawclosingBalance(0);
       setrawopeningBalance(0);
       setBankTransactions({});
       derivedTransactions = {};
       setcurrentPage(-1);
    };
    
    useEffect(()=>{
        if (tdata && tdata.data){
            derivedMasters.towards.data = tdata.data; 
            derivedMasters.towards.data.push({"id":"expense","name":"Expenses",inflow_description:"Expense",outflow_description:"Expense"});
            derivedMasters.towards.data.push({"id":"income","name":"Income",inflow_description:"Income",outflow_description:"Income"});
            const newlist1 = {};
            const newlist2 = {};
            tdata.data.forEach((toward)=>{
               newlist1[toward.inflow_description] = toward;
               newlist2[toward.outflow_description] = toward;
            }); 
            derivedMasters.towards.inflow = newlist1;
            derivedMasters.towards.outflow = newlist2;   
        }   
        setshowLoader(0); 
     },[tdata]);

     useEffect(()=>{
        if (idata && idata.data){
            const newdata = idata.data.filter((ecategory)=>{return ecategory.active;});
            derivedMasters.expensecategories.data = newdata;  
        }    
        setshowLoader(0);
     },[edata]);     

     useEffect(()=>{
        if (idata && idata.data){
            const newdata = idata.data.filter((ecategory)=>{return ecategory.active;});
            derivedMasters.incomecategories.data = newdata;  
        }   
        setshowLoader(0); 
     },[idata]);

     useEffect(()=>{
        if (pickerType === "mobile"){
            if (document.querySelector(".DashboardViewContainer_appHeader")){
                document.querySelector(".DashboardViewContainer_appHeader").style.display = "flex";  
            }    
            if (document.querySelector(".DashboardViewContainer_dashboardContainer")){
                document.querySelector(".DashboardViewContainer_dashboardContainer").style.background = "";
            }
        }  
        setshowLoader(1);      
        fetchTowardsDetails(organization,user,openSnackBar,transferData);
        setshowLoader(1);          
        fetchExpenseCategoryDetails(organization,user,openSnackBar,transferData);
        setshowLoader(1);          
        fetchIncomeCategoryDetails(organization,user,openSnackBar,transferData);         
     },[]);
   
       
     useEffect(()=>{
        if (bdata && bdata.data && bdata.data.length > 0){      
            if (Btype === 1){
                if (!applyclicked_clone){
                    processFetchedData(bdata,true,false,false,updateshowLoader,previousDataFetch,updateBankTransactions,updateCurrentPage,updateTotalPages,updateCompletedPages,updateApplyClicked,completedPages,BankTransactions,derivedTransactions,updatederivedTransactions,derivedTransactions,bankName,bankAccount);  
                }else{
                    processFetchedData(bdata,firsttime_clone,firsttimeset_clone,applyclicked_clone,updateshowLoader,previousDataFetch,updateBankTransactions,updateCurrentPage,updateTotalPages,updateCompletedPages,updateApplyClicked,completedPages,BankTransactions,derivedTransactions,updatederivedTransactions,derivedTransactions);  
                    firsttimeset_clone = false;
                    firsttime_clone = false;
                }    
            }
            if (Btype === 8){
                processFetchedData(bdata,true,false,false,updateshowLoader,previousDataFetch,updateBankTransactions,updateCurrentPage,updateTotalPages,updateCompletedPages,updateApplyClicked,completedPages,BankTransactions,derivedTransactions,updatederivedTransactions,derivedTransactions); 
            }
        }
     },[bdata]);

    useEffect(()=>{
       if (completedPages <= totalPages){
           if (previousDataFetch){
               if (currentPage < 0){
                   setshowLoader(1);
                   Btype = 1;
                   fetchBankTransactions(true,pageProcessingFromDate,pageProcessingToDate,SelectedBankID,fromDate,toDate,completedPages,organization,user,openSnackBar,transferData);   
                }else{
                   setshowLoader(1);
                   Btype = 2;
                   fetchBankTransactions(true,pageProcessingFromDate,pageProcessingToDate,SelectedBankID,fromDate,toDate,completedPages,organization,user,openSnackBar,transferData);            
                };
           }else if (currentPage < 0){
                  setshowLoader(1);
                  Btype = 3;
                  fetchBankTransactions(true,pageProcessingFromDate,pageProcessingToDate,SelectedBankID,fromDate,toDate,completedPages,organization,user,openSnackBar,transferData);
           }else{
                  setshowLoader(1);
                  Btype = 4;  
                  fetchBankTransactions(true,pageProcessingFromDate,pageProcessingToDate,SelectedBankID,fromDate,toDate,completedPages,organization,user,openSnackBar,transferData);                             
           };
       } else if (previousDataFetch){   
              if (derivedTransactions.data){  
                   const newtransactions = derivedTransactions.data.concat(BankTransactions.data);
                   const ntransactions  = {};
                   Object.keys(BankTransactions).forEach((datakey)=>{
                     if (datakey !== "data"){
                         ntransactions[datakey] = BankTransactions[datakey];
                     }  
                   }); 
                   ntransactions.data = newtransactions;
                   setBankTransactions(ntransactions);
               }    
               setpreviousDataFetch(false);
               setTotalPages(0);
               setCompletedPages(1);
               derivedTransactions = {};
               Object.keys(BankTransactions).forEach((datakey)=>{
                  if (datakey !== "data"){
                      derivedTransactions[datakey] = BankTransactions[datakey];
                  };    
              });
      } else {        
           setTotalPages(0);        
           setCompletedPages(1);
      };
    },[completedPages,totalPages]);


    const processBankDetails = (res1) =>{
        const res = {};
        res.data = [];
        res.data = res1.data.filter((rest)=>rest.id);
        setinitClosingBalance(true);
        resetBankData();     
        setBankList(res);
        setshowLoader(0);
        let returndata = localStorage.getItem("bankdetails");
        let selectedbankid = "";
        if (!returndata){
            if (!bid){
                selectedbankid = res && res.data && res.data[0].id;
            }else{
                selectedbankid = bid;
            }    
        }    
        if (res && res.data){
            if (!returndata){                    
                if (!bid){
                    res.data.forEach((bank)=>{
                       if (bank.account_type.lowerCase !== "fd"){ 
                           selectedbankid = bank.id;
                       }
                    });
                }    
            };    
        };        
        if (returndata){
            returndata = JSON.parse(returndata);
            selectedbankid = returndata.bankID;
            localStorage.setItem("bankdetails","");
        }
        if (!returndata){
            if (!bid){
                setSelectedBankID(res && res.data && res.data.length > 0 ? selectedbankid : null);    
            }else{
                setBankAccountID(bankaccount);
                setSelectedBankID(bid);
            }    
        }else{
            setBankAccountID(returndata.bankaccountid);    
            setSelectedBankID(returndata.bankID);    
        }    
    };


    useEffect(()=>{
       if (bnkdata && bnkdata.data &&  bnkdata.data.length > 0){
           processBankDetails(bnkdata);
       }
    },[bnkdata]);


    useEffect(()=>{
            setinitClosingBalance(false);
            setshowLoader(1);
            fetchBankDetails(organization,user,openSnackBar,transferData);
    },[]);

    const getData = (data)=>{
        setBankAccountID(data.bank_account_id);
        setSelectedBankID(data.id);
        setBottomSheetNumber(!BottomSheetNumber);
    };

    useEffect(()=>{
       if (SelectedBankID){
           resetBankData();
           setTimeout(()=>{
              setshowLoader(1);
              fetchBankTransactions(true,pageProcessingFromDate,pageProcessingToDate,SelectedBankID,fromDate,toDate,completedPages,organization,user,openSnackBar,transferData);
              Btype = 8;
            },1000);   
       }
    },[SelectedBankID]);



    const reProcessData = (firsttime,restricttodate,fdate,tdate,firsttimeset,resetdata,applyclicked,bankid) =>{
      if (resetdata){
          resetBankData();          
      }
      if (currentPage < 0){
          firsttime_clone = firsttime;
          firsttimeset_clone = firsttimeset;
          applyclicked_clone = applyclicked;
          setshowLoader(1);
          Btype = 5;
          fetchBankTransactions(restricttodate,fdate,tdate,bankid,fromDate,toDate,completedPages,organization,user,openSnackBar,transferData);  
      }else if (currentPage >= 0){
          if (resetdata){
              firsttime_clone = firsttime;
              firsttimeset_clone = firsttimeset;
              applyclicked_clone = applyclicked;         
              setshowLoader(1);
              Btype = 6;
              fetchBankTransactions(restricttodate,fdate,tdate,bankid,fromDate,toDate,completedPages,organization,user,openSnackBar,transferData);         
          }else{
              firsttime_clone = firsttime;
              firsttimeset_clone = firsttimeset;
              applyclicked_clone = applyclicked;         
              setshowLoader(1);
              Btype = 7;
              fetchBankTransactions(restricttodate,fdate,tdate,bankid,fromDate,toDate,completedPages,organization,user,openSnackBar,transferData);    
          }    
      }    
    };

 
    useEffect(() => {
        let returndata = localStorage.getItem("bankdetails");
        if (returndata){
            resetBankData();
            returndata = JSON.parse(localStorage.getItem("bankdetails")); 
            setFromDate(new Date(returndata.fromdate));
            setToDate(new Date(returndata.todate));
            let selectedcategorization = false;
            if (returndata.categorization===1){
                selectedcategorization = true;
            }
            setCategorization(selectedcategorization);
            setcurrentPage(returndata.currentpage+1);
            setBankList(returndata.banklist);
            setSelectedBankID(returndata.bankID);            
        }   
    },[location]);



    const loadAdditionalPrevmonthDate = (e) =>{
      if (processing){
          return;
      }  
      e.stopPropagation();
      e.preventDefault();
      processing = true;
      setpreviousDataFetch(true);
      let currentdate = fromDate;
      currentdate = new Date(currentdate.getTime() - (31 * perDayTimeinMicroSeconds));
      reProcessData(false,true,currentdate,new Date(fromDate.getTime()-(1 * perDayTimeinMicroSeconds)),true,false,false,SelectedBankID);
      setFromDate(currentdate);
    };

    useEffect(()=>{
         const opvar = setTitlesandBalances(pickerType,ispagination,rawclosingBalance,closingBalance,mainElement);
         setTimeout(()=>{
            if (mainElement.current.querySelector(".MuiDataGrid-footerContainer")){
                mainElement.current.querySelector(".MuiDataGrid-footerContainer").querySelector("div").innerHTML = opvar;
                if (mainElement.current.querySelector("#closingbalancebutton")){
                    mainElement.current.querySelector("#closingbalancebutton").addEventListener('click', loadAdditionalPrevmonthDate);
                }    
            }
         },500);    
    },[pickerType,closingBalance,initClosingBalance]);


    const toNavigate = (alldata) =>{
        navigate('/bankingcategorization',{state: {status:!dataSelected.categorized?"Add":"Edit",bankaccountid:BankAccountID,selectedtype: "others",row:Currentrow,alldata,bankname:bankName,bankaccount:bankAccount,bankid:SelectedBankID,selecteddata:dataSelected,masterslist:derivedMasters} });
    };


    const BankTransactionSelected = (eve) =>{
        toCategorize(BankTransactions,mainElement,updateinitClosingBalance,BankAccountID,eve,categorization,fromDate,toDate,SelectedBankID,currentPage,BankList,initClosingBalance,toNavigate,updateCurrentrow,updatedataSelected);
    };


      const displayBankpopup = () =>{
         setBottomSheetNumber(true);
      };

      const handlePageChange = (d) =>{
           if (currentPage > -1){
               setcurrentPage(d);
           }   
      };

      const getUnCategorized = (d) =>{
           setCategorization(d.target.checked);
      };

      useEffect(()=>{
        if (BankTransactions && BankTransactions.data && BankTransactions.data.length > 0){
            dataAdjustments(updateopeningBalance,updaterawopeningBalance,updateclosingBalance,updaterawclosingBalance,BankTransactions,mainElement,gridSize,currentPage,pickerType);
        }
      },[currentPage,gridSize,BankTransactions,SelectedBankID]);


     return (
         <div className={css.bankCategorizationWrapper} ref={mainElement}>
           <Loader showloader={showLoader}/>
           <BankTransactionsTemplate  pickerType = {pickerType} displayBankpopup = {displayBankpopup}  updateBankName={ updateBankName} updateBankAccount={updateBankAccount}  SelectedBankID = {SelectedBankID} BankList = {BankList} updateFromDate = {updateFromDate} updateToDate = {updateToDate} fromDate = {fromDate} toDate = {toDate} getUnCategorized = {getUnCategorized} reProcessData = {reProcessData} Banktransactions = {BankTransactions} categorization = {categorization} BankTransactionSelected={BankTransactionSelected} updateGridSize={updateGridSize}  transactionColumnsMobile = {TemplateColumnsMobile(loadAdditionalPrevmonthDate,rawopeningBalance)} transactionColumnsDesktop = {TemplateColumnsDesktop(loadAdditionalPrevmonthDate,rawopeningBalance,openingBalance)} updatearrowClicked={updatearrowClicked} updatearrowDown={updatearrowDown} updatearrowUp={updatearrowUp} arrowClicked={arrowClicked} arrowDown={arrowDown} arrowUp={arrowUp} gridElement={gridElement} handlePageChange={handlePageChange} getBankName={getBankName}/>
           {BottomSheetNumber?
            <SelectBottomSheet
              name="Bank List"
              addNewSheet
             // triggerComponent={<div style={{ display: 'none' }} />}
              open={BottomSheetNumber}
              onClose={() => setBottomSheetNumber(false)}
              maxHeight="45vh"
            >
]             <CommonDrawer
                 state="BANKLIST"
                 handleClick={getData}
                 setBottomSheetNumber={setBottomSheetNumber}
              />
             </SelectBottomSheet>:
           ''}
         </div> 
     );
};
export default BankCategoryDetails;