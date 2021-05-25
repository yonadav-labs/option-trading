import React, { useState } from 'react';
import { makeStyles, Box, Collapse, IconButton, TableCell, TableRow } from "@material-ui/core";
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { NumberRoundFormatter, PercentageFormatter, PriceFormatter, TimestampDateFormatter } from '../utils';
import ScreenExpandedRow from './ScreenExpandedRow';

const useRowStyles = makeStyles({
    root: {
        "&:hover": {
            backgroundColor: "rgba(255, 212, 58,0.3) !important",
            cursor: "pointer",
        }
    },
});

export default function ScreenRow(props) {
    const { row } = props;
    const [open, setOpen] = useState(false);
    const classes = useRowStyles();

    return (
        <React.Fragment>
            <TableRow
                hover
                onClick={() => setOpen(!open)}
                className={classes.root}
                style={row.in_the_money ? { backgroundColor: "rgba(242, 246, 255, 1)" } : null}
            >
                <TableCell component="th" scope="row" >
                    <span style={{ display: "flex" }}>
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setOpen(!open)}
                        >
                            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                        {row.is_call ? "Call" : "Put"}
                    </span>
                </TableCell>
                <TableCell align="center">{TimestampDateFormatter(row.expiration)} ({row.days_till_expiration}d)</TableCell>
                <TableCell align="center">{PriceFormatter(row.strike)}</TableCell>
                <TableCell align="center">{PriceFormatter(row.mark)}</TableCell>
                <TableCell align="center">{PriceFormatter(row.last_price)}</TableCell>
                <TableCell align="center">{row.percent_change >= 0 ? '+' : '-'}{NumberRoundFormatter(Math.abs(row.percent_change))}%</TableCell>
                <TableCell align="center">{row.volume}</TableCell>
                <TableCell align="center">{row.open_interest}</TableCell>
                <TableCell align="center">{NumberRoundFormatter(row.vol_oi)}</TableCell>
                <TableCell align="center">{PercentageFormatter(row.implied_volatility)}</TableCell>
                <TableCell align="center">{NumberRoundFormatter(row.delta)}</TableCell>
                <TableCell align="center">{NumberRoundFormatter(row.gamma)}</TableCell>
                <TableCell align="center">{NumberRoundFormatter(row.theta)}</TableCell>
                <TableCell align="center">{PercentageFormatter(row.itm_probability)}</TableCell>
                <TableCell align="center">{PriceFormatter(row.break_even_price)}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={15}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <ScreenExpandedRow contract={row} />
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}