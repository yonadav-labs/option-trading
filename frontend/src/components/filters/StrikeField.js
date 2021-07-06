import React from "react";
import { TextField, Autocomplete } from "@material-ui/core";
import { PercentageFormatter, GetGaEventTrackingFunc } from "../../utils";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
    customAutocomplete: {
        "& .MuiFilledInput-root": {
            paddingTop: '9px'
        }
    },
    customInput: {
        background: 'rgba(255, 255, 255, 0.15)',
        "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
            "-webkit-appearance": "none",
            margin: 0
        },
        "& input[type=number]": {
            "-moz-appearance": "textfield"
        }
    },
    colorWhite: {
        color: 'white',
        paddingBottom: '9px',
        paddingRight: '8px'
    },
    priceButton: {
        justifyContent: 'space-between',
        background: 'transparent',
        color: 'black',
        '&:hover': {
            background: '#fafafa',
        }
    }
}));

export default function StrikeField({ initialPrice, value, setValue }) {
    const classes = useStyles();

    const priceTargetOptions = [-1, -0.5, -0.2, -0.1, -0.05, -0.02, -0.01, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 9]

    return (
        <>
            <Autocomplete
                className={classes.customAutocomplete}
                value={value}
                onChange={(e, val) => {
                    setValue(Number((initialPrice + (initialPrice * val)).toFixed(2)));
                }}
                filterOptions={(options, param) => options}
                selectOnFocus
                id="test-auto"
                options={priceTargetOptions}
                getOptionLabel={(option) => option.toString()}
                renderOption={(props, option) => {
                    return (<li {...props} style={{ display: "flex", justifyContent: "space-between" }}><span>${(initialPrice + (initialPrice * option)).toFixed(2)}</span> <span style={{ color: "#8f8f8f" }}>{option > 0 ? "+" : null}{option * 100}%</span></li>)
                }}
                freeSolo
                disableClearable
                renderInput={(params) => {
                    return (<TextField {...params}
                        className={classes.customInput}
                        variant="filled" color="secondary"
                        type="number"
                        sx={{ height: "100%" }}
                        onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: "$",
                            endAdornment: (
                                <span style={{ color: "#8f8f8f" }}>
                                    {value - initialPrice > 0 ? "+" : null}{PercentageFormatter((value - initialPrice) / initialPrice)}
                                </span>
                            ),
                            className: classes.colorWhite
                        }}
                    />);
                }}
            />
        </>
    );
}
