import React, { useState, useContext } from 'react';
import { Box, Collapse, IconButton, TableCell, TableRow, Link } from "@material-ui/core";
import { makeStyles } from '@material-ui/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { NumberRoundFormatter, PercentageFormatter, PriceFormatter, TimestampDateFormatter } from '../utils';
import ScreenExpandedRow from './ScreenExpandedRow';
import UserContext from '../UserContext';

const useRowStyles = makeStyles({
    root: {
        borderBottom: "2px solid rgba(228, 228, 228, 1)",
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
    const { user } = useContext(UserContext);

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
                <TableCell align="center" padding="none">{TimestampDateFormatter(row.expiration)}<br />({row.days_till_expiration} days)</TableCell>
                <TableCell align="center" padding="none">{PriceFormatter(row.strike)}</TableCell>
                <TableCell align="center" padding="none">{PriceFormatter(row.mark)}</TableCell>
                <TableCell align="center" padding="none">{PriceFormatter(row.last_price)}</TableCell>
                <TableCell align="center" padding="none">{row.volume}</TableCell>
                <TableCell align="center" padding="none">{row.open_interest}</TableCell>
                <TableCell align="center" padding="none">{user && user.subscription ? NumberRoundFormatter(row.vol_oi) : <Link href="/pricing" style={{ display: 'block' }}><LockOutlinedIcon /></Link>}</TableCell>
                <TableCell align="center" padding="none">{PercentageFormatter(row.implied_volatility)}</TableCell>
                <TableCell align="center" padding="none">{NumberRoundFormatter(row.delta)}</TableCell>
                <TableCell align="center" padding="none">{NumberRoundFormatter(row.gamma)}</TableCell>
                <TableCell align="center" padding="none">{NumberRoundFormatter(row.theta)}</TableCell>
                <TableCell align="center" padding="none">{PercentageFormatter(row.itm_probability)}</TableCell>
                <TableCell align="center" padding="none">{PriceFormatter(row.break_even_price)}</TableCell>
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