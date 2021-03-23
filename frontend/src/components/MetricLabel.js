import React from 'react';
import { Tooltip } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles({
    label: {
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});

const HelpTextDict = {
    'target price range': 'The expected share price of stock on expiration day.'
}

export default function MetricLabel(props) {
    let { label, helpText } = props;
    const classes = useStyles();

    if (!helpText) {
        helpText = HelpTextDict[label]
    }

    if (helpText) {
        return (
            (
                <>
                    <Tooltip title={helpText} placement="right-start" arrow>
                        <span className={classes.label}>{label}</span>
                    </Tooltip>
                    <br />
                </>
            )
        );
    } else {
        return (
            (
                <>
                    <span className={classes.label}>{label}</span>
                    <br />
                </>
            )
        );
    }
}