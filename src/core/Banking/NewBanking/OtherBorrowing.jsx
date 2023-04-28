import React from 'react';
import {
  Stack,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';

import css from './bankingnew.scss';

const OtherBorrowing = () => {
  return (
    <Stack className={css.bodycontainer}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow className={css.otherborrowheadrow}>
            <TableCell>Promotor Name</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Loan Given</TableCell>
            <TableCell>Loan Amount Repaid</TableCell>
            <TableCell>Outstanding Balance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4].map(() => (
            <TableRow className={css.otherborrowbodyrow}>
              <TableCell>S. Anderson</TableCell>
              <TableCell>Sep 19, 2010</TableCell>
              <TableCell> ₹ 1,211.00 </TableCell>
              <TableCell>₹875.30</TableCell>
              <TableCell>₹ 41922.35</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  );
};

export default OtherBorrowing;
