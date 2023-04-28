import React from 'react';
import {
  Box,
  // IconButton,
  Stack,
  // Table,
  // TableBody,
  // TableCell,
  // TableHead,
  // TableRow,
  Typography,
} from '@mui/material';
// import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
// import LoanAmount from '@assets/loanamt.svg';
// import EMIStart from '@assets/emistart.svg';
// import Period from '@assets/period.svg';
// import InterestRate from '@assets/interestrate.svg';
import css from './bankingnew.scss';
import OtherBorrowing from './OtherBorrowing';

const BorrowinsLists = () => {
  return (
    <Box className={css.brcontainer}>
      <Stack className={css.brcontainer_header}>
        {/* <IconButton sx={{ padding: '0px', marginRight: '8px' }}>
          <KeyboardArrowLeftRoundedIcon sx={{ color: '#000000' }} />
        </IconButton> */}
        <Typography variant="h4" className={css.headertext}>
          Borrowings/ EMI
        </Typography>
      </Stack>
      {/* <Stack className={css.borrowlistwrp}>
        <Typography className={css.borrowtype}>Term Loans</Typography>
        <Box className={css.borrowlistitem}>
          <Stack className={css.borrowel}>
            <Typography className={css.borrowel_header}>Lender Name</Typography>
            <Typography className={css.borrowel_value}>Mr.Loki</Typography>
          </Stack>
          <Stack className={css.borrowel}>
            <Typography className={css.borrowel_header}>Purpose</Typography>
            <Typography className={css.borrowel_value}>Mobile</Typography>
          </Stack>
          <Stack className={css.borrowel}>
            <Typography className={css.borrowel_header}>Loan Amount</Typography>
            <Typography className={css.borrowel_value}>₹50019.00</Typography>
          </Stack>
          <Stack className={css.borrowel}>
            <Typography className={css.borrowel_header}>
              Interest Rate
            </Typography>
            <Typography className={css.borrowel_value}>15%</Typography>
          </Stack>
          <Stack className={css.borrowel}>
            <Typography className={css.borrowel_header}>
              Outstanding Amount
            </Typography>
            <Typography className={css.borrowel_value}>₹41922.35</Typography>
          </Stack>
          <Stack className={css.borrowel}>
            <Typography className={css.borrowel_header}>EMI’s Paid</Typography>
            <Typography className={css.borrowel_value}>2/24</Typography>
          </Stack>
        </Box>
        <Box className={css.borrowlistitem}>
          <Stack className={css.borrowel}>
            <Typography className={css.borrowel_header}>Lender Name</Typography>
            <Typography className={css.borrowel_value}>Mr.Loki</Typography>
          </Stack>
          <Stack className={css.borrowel}>
            <Typography className={css.borrowel_header}>Purpose</Typography>
            <Typography className={css.borrowel_value}>Mobile</Typography>
          </Stack>
          <Stack className={`${css.borrowel} ${css.flex_}`}>
            <Stack sx={{ flexDirection: 'row', alignItems: 'center' }}>
              <Typography className={css.spaccountbadge} />
              <Typography className={css.borrowel_header}>
                Pending for SuperAccountant
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Box className={css.borrowlistitem}>
          <Stack className={css.borrowel}>
            <Typography className={css.borrowel_header}>Lender Name</Typography>
            <Typography className={css.borrowel_value}>Mr.Loki</Typography>
          </Stack>

          <Stack className={css.borrowel}>
            <Typography className={css.borrowel_header}>Loan Amount</Typography>
            <Typography className={css.borrowel_value}>₹50019.00</Typography>
          </Stack>
          <Stack className={css.borrowel}>
            <Typography className={`${css.borrowel_header} ${css.mr_40}`}>
              Interest Rate
            </Typography>
            <Typography className={`${css.borrowel_value} ${css.mr_40}`}>
              15%
            </Typography>
          </Stack>
          <Stack className={css.borrowel}>
            <Typography className={css.borrowel_header}>
              Outstanding Amount
            </Typography>
            <Typography className={css.borrowel_value}>₹41922.35</Typography>
          </Stack>
        </Box>
      </Stack> */}
      {/* <Stack className={css.bodycontainer}>
        <Stack sx={{ padding: '24px', marginBottom: '7px' }}>
          <Stack className={css.lenderwrp}>
            <Typography className={css.lenderlabel}>Lender Name</Typography>
            <Typography className={css.lendervalue}>Mr.Loki</Typography>
          </Stack>
          <Stack className={css.puposewrp}>
            <Typography className={css.purposelabel}>Purpose</Typography>
            <Typography className={css.purposevalue}>Apple iPhone</Typography>
          </Stack>
          <Stack className={css.emidetail}>
            <Stack className={css.emailitemwrp}>
              <img
                src={LoanAmount}
                alt="Loan Amount"
                width="32px"
                height="32px"
              />
              <Stack sx={{ marginLeft: '16px' }}>
                <Typography className={css.itemlabel}>Loan Amount</Typography>
                <Typography className={css.itemvalue}>₹50019.00</Typography>
              </Stack>
            </Stack>
            <Stack className={css.emailitemwrp}>
              <img
                src={EMIStart}
                alt="EMI Start Date"
                width="32px"
                height="32px"
              />
              <Stack sx={{ marginLeft: '16px' }}>
                <Typography className={css.itemlabel}>
                  EMI Start Date
                </Typography>
                <Typography className={css.itemvalue}>02 Feb 2023</Typography>
              </Stack>
            </Stack>
            <Stack className={css.emailitemwrp}>
              <img src={Period} alt="Period" width="32px" height="32px" />
              <Stack sx={{ marginLeft: '16px' }}>
                <Typography className={css.itemlabel}>Period</Typography>
                <Typography className={css.itemvalue}>6 Months</Typography>
              </Stack>
            </Stack>
            <Stack className={css.emailitemwrp}>
              <img
                src={InterestRate}
                alt="Interest Date"
                width="32px"
                height="32px"
              />
              <Stack sx={{ marginLeft: '16px' }}>
                <Typography className={css.itemlabel}>Interest Rate</Typography>
                <Typography className={css.itemvalue}>10%</Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow className={css.emitableheadrow}>
              <TableCell>Date</TableCell>
              <TableCell>Opening Balance</TableCell>
              <TableCell>Principal</TableCell>
              <TableCell>Interest</TableCell>
              <TableCell>EMI Payment</TableCell>
              <TableCell>Closing Balance</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4].map(() => (
              <TableRow className={css.emitablebodyrow}>
                <TableCell>20/07/2021</TableCell>
                <TableCell>₹50019.00</TableCell>
                <TableCell>₹8096.65</TableCell>
                <TableCell>₹875.30</TableCell>
                <TableCell>₹8971.95</TableCell>
                <TableCell>₹ 41922.35</TableCell>
                <TableCell>
                  <span className={css.paidbadge}> Unpaid</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack> */}
      <OtherBorrowing />
    </Box>
  );
};

export default BorrowinsLists;
