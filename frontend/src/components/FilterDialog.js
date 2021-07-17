import React, { forwardRef } from "react";
import {
    Dialog, Slide, Typography, DialogTitle, IconButton, Grid
} from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from "prop-types";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
})

export default function FilterDialog(props) {
    const { open, setOpen, children } = props;

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={setOpen}
            TransitionComponent={Transition}
            sx={{
                '& .MuiDialog-paper': {
                    backgroundColor: '#333741',
                    color: 'white'
                },
            }}
        >
            <DialogTitle>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Typography variant="h5">Filters</Typography>
                    <IconButton
                        color="inherit"
                        onClick={setOpen}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                </Grid>
            </DialogTitle>
            {children}
        </Dialog>
    );
}

FilterDialog.defaultProps = {
    open: false,
    setOpen: () => { },
};

FilterDialog.propTypes = {
    open: PropTypes.bool,
    setOpen: PropTypes.func,
};