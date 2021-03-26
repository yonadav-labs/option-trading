import React, {useState} from "react";
import { OutlinedInput, makeStyles, InputAdornment, IconButton } from "@material-ui/core";
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

const useStyles = makeStyles((theme) => ({
    root: {
        background: "#53555d",
        borderRadius: 5,
        color: "white"
    }
}));

export default function MaterialTextField({ onFilterChange }) {
    const classes = useStyles();
    const [value, setValue] = useState('')

    const changeHandler = (e) => {
        let input = e.target.value;
        if (
            !input ||
            (input[input.length - 1].match("[0-9]") && input[0].match("[1-9]"))
        )
            setValue(input);
    };

    return (
        <OutlinedInput
            className={classes.root}
            placeholder="$0 (optional)"
            fullWidth
            value={value}
            onChange={changeHandler}
            endAdornment={
                <InputAdornment position="end">
                    <IconButton
                        edge="end"
                        onClick={() => onFilterChange(value, 'cash')}
                    >
                        <ArrowForwardIosIcon color="secondary"/>
                    </IconButton>
                </InputAdornment>
            }
        />
    );
}
