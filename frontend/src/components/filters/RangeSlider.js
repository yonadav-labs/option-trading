import React from "react";
import { Typography, Grid, TextField, Slider, Autocomplete } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import PropTypes from "prop-types";
import MetricLabel from "../MetricLabel";

const useStyles = makeStyles(theme => ({
    spinnerless: {
        "&.MuiOutlinedInput-root input[type=number]": {
            '-moz-appearance': 'textfield',
        },
        '&.MuiOutlinedInput-root input::-webkit-outer-spin-button': {
            '-webkit-appearance': 'none',
            margin: 0,
        },
        '&.MuiOutlinedInput-root input::-webkit-inner-spin-button': {
            '-webkit-appearance': 'none',
            margin: 0,
        },
        color: 'white'
    }
}));

export default function RangeSlider(props) {
    const classes = useStyles();
    const { range, setRange, min, max, step, id, label, valueText, endAdornment, startAdornment, minOptions, maxOptions, minRenderOption, maxRenderOption, marks } = props;

    const handleMaxInputChange = (val) => {
        let newVal = val === '' ? '' : Number(val);

        if (Number.isInteger(newVal) && newVal < min) {
            newVal = min;
        } else if (Number.isInteger(newVal) && newVal > max) {
            newVal = max;
        }
        setRange(prevState => [prevState[0], newVal]);
    }

    const handleMinInputChange = (val) => {
        let newVal = val === '' ? '' : Number(val);

        if (Number.isInteger(newVal) && newVal < min) {
            newVal = min;
        } else if (Number.isInteger(newVal) && newVal > max) {
            newVal = max;
        }
        setRange(prevState => [newVal, prevState[1]]);
    }

    const handleMaxInputBlur = (e) => {
        let newVal = range[1];
        if (e.target.value === '') {
            newVal = max;
        }
        if (range[0] > newVal) {
            setRange(prevState => [Math.round(Number(newVal) * 1e2) / 1e2, prevState[0]]);
        } else {
            setRange(prevState => [prevState[0], Math.round(Number(newVal) * 1e2) / 1e2]);
        }
    }

    const handleMinInputBlur = (e) => {
        let newVal = range[0];
        if (e.target.value === '') {
            newVal = min;
        }
        if (newVal > range[1]) {
            setRange(prevState => [prevState[1], Math.round(Number(newVal) * 1e2) / 1e2]);
        } else {
            setRange(prevState => [Math.round(Number(newVal) * 1e2) / 1e2, prevState[1]]);
        }
    }

    return (
        <>
            <Typography id={`${id}-range-slider`} variant="button" gutterBottom><MetricLabel label={label} /></Typography>
            <Grid container alignItems="center" columnSpacing={1}>
                <Grid container item xs={12} alignItems="center">
                    <Slider
                        id={`${id}-slider`}
                        getAriaLabel={() => `${id}-slider`}
                        value={range}
                        onChange={(e, v) => setRange(v)}
                        min={min}
                        max={max}
                        step={step}
                        marks={marks}
                        valueLabelDisplay="auto"
                        valueLabelFormat={valueText}
                        getAriaValueText={valueText}
                    />
                </Grid>
                <Grid item xs={5.75}>
                    <Autocomplete
                        id={`${id}-min-input`}
                        value={range[0].toString()}
                        onChange={(e, v) => handleMinInputChange(v)}
                        onBlur={handleMinInputBlur}
                        filterOptions={(options, param) => options}
                        selectOnFocus
                        options={minOptions}
                        getOptionLabel={(option) => option.toString()}
                        renderOption={minRenderOption}
                        freeSolo
                        disableClearable
                        renderInput={(params) => {
                            return (
                                <TextField {...params}
                                    label="min"
                                    variant="outlined"
                                    type="number"
                                    sx={{ height: "100%" }}
                                    onChange={e => handleMinInputChange(e.target.value)}
                                    InputLabelProps={{
                                        shrink: true,
                                        sx: { color: 'white' }
                                    }}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: endAdornment,
                                        startAdornment: startAdornment,
                                        className: classes.spinnerless,
                                        min: min,
                                        max: max,
                                    }}
                                />
                            );
                        }}
                    />
                </Grid>
                <Grid container item xs={0.5} alignItems="center" justifyContent="center"> - </Grid>
                <Grid item xs={5.75}>
                    <Autocomplete
                        id={`${id}-max-input`}
                        value={range[1].toString()}
                        onChange={(e, v) => handleMaxInputChange(v)}
                        onBlur={handleMaxInputBlur}
                        filterOptions={(options, param) => options}
                        selectOnFocus
                        options={maxOptions}
                        getOptionLabel={(option) => option.toString()}
                        renderOption={maxRenderOption}
                        freeSolo
                        disableClearable
                        renderInput={(params) => {
                            return (
                                <TextField {...params}
                                    label="max"
                                    variant="outlined"
                                    type="number"
                                    sx={{ height: "100%" }}
                                    onChange={e => handleMaxInputChange(e.target.value)}
                                    InputLabelProps={{
                                        shrink: true,
                                        sx: { color: 'white' }
                                    }}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: endAdornment,
                                        startAdornment: startAdornment,
                                        className: classes.spinnerless,
                                        min: min,
                                        max: max,
                                    }}
                                />
                            );
                        }}
                    />
                </Grid>
            </Grid>
        </>
    );
}

RangeSlider.defaultProps = {
    min: 0,
    max: 100,
    step: 1,
    id: "",
    label: "",
    valueText: (value) => value,
    endAdornment: "",
    startAdornment: "",
    minOptions: [],
    maxOptions: [],
    minRenderOption: null,
    maxRenderOption: null,
    marks: []
};

RangeSlider.propTypes = {
    range: PropTypes.array.isRequired,
    setRange: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    label: PropTypes.string,
    valueText: PropTypes.func,
    endAdornment: PropTypes.node,
    startAdornment: PropTypes.node,
    minOptions: PropTypes.array,
    maxOptions: PropTypes.array,
    minRenderOption: PropTypes.func,
    maxRenderOption: PropTypes.func,
    marks: PropTypes.array
};
