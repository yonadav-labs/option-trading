import React from 'react'
import { Backdrop, CircularProgress } from "@material-ui/core";

function LoadingModal({ active }) {
    return (
        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={active}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
    )
}

export default LoadingModal