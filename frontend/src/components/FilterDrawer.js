import React from "react";
import {
    Paper
} from "@material-ui/core";
import PropTypes from "prop-types";

export default function FilterDrawer(props) {
    const { open, children } = props;

    if (open) {
        return (
            <Paper
                square
                sx={{
                    backgroundColor: '#333741',
                    color: 'white',
                    width: '100%',
                }}
            >
                {children}
            </Paper>
        );
    }

    return null;
}

FilterDrawer.defaultProps = {
    open: false,
};

FilterDrawer.propTypes = {
    open: PropTypes.bool,
};