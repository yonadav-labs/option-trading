import React from "react";
import {
    Select, FormControl, MenuItem, Chip, Box
} from "@material-ui/core";
import { makeStyles } from '@material-ui/styles';
import CancelIcon from '@material-ui/icons/Cancel';
import PropTypes from "prop-types";

const useStyles = makeStyles({
    select: {
        "&.MuiOutlinedInput-root": {
            color: 'white',
            background: 'rgba(255, 255, 255, 0.15)',
        }
    },
    chip: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        marginRight: 2,
        color: 'white',
        "&.MuiChip-root .MuiChip-deleteIcon": {
            color: 'inherit'
        }
    },
});

export default function ExpirationMultiSelect(props) {
    const {
        selectedTimestamps,
        setSelectedTimestamps,
        onExpirationSelectionChange,
        deleteExpirationChip,
        expirationTimestampsOptions,
        variant,
    } = props;
    const classes = useStyles();

    return (
        <>
            <FormControl fullWidth>
                <Select
                    id="expiration-dates"
                    value={selectedTimestamps}
                    fullWidth
                    multiple
                    placeholder="Select an expiration date"
                    onChange={(e) => setSelectedTimestamps(e.target.value)}
                    onClose={(e) => onExpirationSelectionChange(selectedTimestamps)}
                    variant={variant}
                    className={classes.select}
                    MenuProps={{
                        style: {
                            maxHeight: "300px",
                        },
                        anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "center"
                        },
                        getContentAnchorEl: () => null,
                    }}
                    renderValue={
                        (selectedTimestamps) => {
                            let sorted = selectedTimestamps.sort((a, b) => (a.value > b.value) ? 1 : -1)
                            return (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                                    {sorted.map((date) => (
                                        <Chip
                                            key={date.value}
                                            label={date.label}
                                            className={classes.chip}
                                            clickable
                                            deleteIcon={
                                                <CancelIcon
                                                    onMouseDown={(event) => event.stopPropagation()}
                                                />
                                            }
                                            onDelete={(e) => deleteExpirationChip(e, date.value)}
                                        />
                                    ))}
                                </Box>)
                        }}
                >
                    {expirationTimestampsOptions.map((date, index) => <MenuItem value={date} key={index}> {date.label} </MenuItem>)}
                </Select>
            </FormControl>
        </>
    );
}

ExpirationMultiSelect.defaultProps = {
    variant: "standard",
};

ExpirationMultiSelect.propTypes = {
    selectedTimestamps: PropTypes.array.isRequired,
    setSelectedTimestamps: PropTypes.func.isRequired,
    onExpirationSelectionChange: PropTypes.func.isRequired,
    deleteExpirationChip: PropTypes.func.isRequired,
    expirationTimestampsOptions: PropTypes.array.isRequired,
    variant: PropTypes.string,
};