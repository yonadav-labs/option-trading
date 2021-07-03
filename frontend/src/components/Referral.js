import React, { useState, useEffect } from 'react';
import { FaFacebook, FaTwitter } from 'react-icons/fa';
import { AiOutlineMail } from 'react-icons/ai';
import { FacebookShareButton, TwitterShareButton, EmailShareButton } from "react-share";
import { Button, Grid, IconButton, Typography, Dialog, DialogContent, DialogContentText, DialogActions, Box, Tooltip } from '@material-ui/core';
import { makeStyles, withStyles } from "@material-ui/styles";
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import CloseIcon from '@material-ui/icons/Close';

const styles = (theme) => ({
    closeButton: {
        position: 'absolute',
        right: '8px',
        top: '8px',
        color: '#333333',
    },

});

const useStyles = makeStyles((theme) => ({
    shareButton: {
        display: 'inline-flex',
        margin: '5px 10px !important',
        color: '#FFFFFF !important',
        padding: '8px 20px !important',
        valign: 'middle',
        borderRadius: '4px',

        "& p": {
            fontSize: "12px !important",
            fontWeight: '700'
        },

        '&:hover': {
            background: 'red',
            boxShadow: 'none',
        }
    },

    socialIcon: {
        height: '1em',
        width: '1em'
    },

    referralLinkBox: {
        border: '1px solid #E4E4E4',
        borderRadius: '5px',
        backgroundColor: '#FFFFFF',
        fontSize: '.7em'
    },

    CustomDialogContent: {
        padding: '8px',
    }
}));

const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});


function Referral({ referralLink, openStatus, setOpenStatus }) {
    const [tooltipOpen, setTooltipOpen] = useState(false);

    const classes = useStyles();

    const handleRefClose = () => {
        setOpenStatus(false);
    };

    const copyReferralLink = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(referralLink);
        setTooltipOpen(true);
        setTimeout(function () {
            setTooltipOpen(false);
        }, 1000);
    }

    return (
        <div style={{ backgroundColor: '#FAFAFA' }}>
            <Dialog
                open={openStatus}
                onClose={handleRefClose}
                aria-labelledby="draggable-dialog-title"
                PaperProps={{
                    style: {
                        backgroundColor: '#FAFAFA',
                    },
                }}
            >
                <Box textAlign="center">
                    <img src="/referral_hero.png" width="45%" />
                </Box>
                <DialogTitle textAlign="center" style={{ cursor: 'move' }} id="draggable-dialog-title" onClose={handleRefClose}>
                    Refer a Friend
                </DialogTitle>
                <DialogContent className={classes.CustomDialogContent} style={{ textAlign: 'center' }}>
                    <DialogContentText textAlign="center" pl={{ xs: 0, sm: 0, md: 10 }} pr={{ xs: 0, sm: 0, md: 10 }} pb={{ xs: 0, sm: 0, md: 2 }} style={{ color: '#000000' }}>
                        Get a free month of Pro membership for you and your friends through referral.
                    </DialogContentText>
                    <FacebookShareButton className={classes.shareButton} style={{ backgroundColor: '#1877F2' }}
                        url={referralLink}
                        quote={'Sign up for Tigerstance and get a free month of Pro!'}
                    >
                        <FaFacebook className={classes.socialIcon} />
                        <Typography ml={1} >SHARE</Typography>
                    </FacebookShareButton>
                    <TwitterShareButton className={classes.shareButton} style={{ backgroundColor: '#1DA1F2' }}
                        url={referralLink}
                        title={'Sign up for Tigerstance and get a free month of Pro!'}
                        via={'TheTigerStance'}
                    >
                        <FaTwitter className={classes.socialIcon} />
                        <Typography ml={1} >TWITTER</Typography>
                    </TwitterShareButton>
                    <EmailShareButton className={classes.shareButton} style={{ backgroundColor: '#8A8A8A' }}
                        subject={'A free month of Pro from Tigerstance!'}
                        body={`Hey!\n\rSign up for Tigerstance and get a free month of Pro:`}
                        separator={'\n\r'}
                        url={referralLink}
                    >
                        <AiOutlineMail className={classes.socialIcon} />
                        <Typography ml={1} >EMAIL</Typography>
                    </EmailShareButton>
                    <DialogContentText textAlign="center" pl={{ xs: 0, sm: 0, md: 10 }} pr={{ xs: 0, sm: 0, md: 10 }} pt={{ xs: 0, sm: 0, md: 2 }} pb={3} style={{ color: '#000000' }}>
                        Or copy the link to share anywhere.
                    </DialogContentText>
                    <Grid container justifyContent="center">
                        <Grid item xs={12} md={6}>
                            <DialogContentText className={classes.referralLinkBox} textAlign="center" pt={1} pb={1} pl={{ xs: 1, md: 2 }} pr={{ xs: 1, md: 2 }} >
                                {referralLink}
                            </DialogContentText>
                        </Grid>
                        <Grid item xs={12} md={3} ml={{ md: 3 }} mt={{ xs: 2, sm: 0, md: 0 }}>
                            <Tooltip
                                PopperProps={{
                                    disablePortal: true,
                                }}
                                onClose={() => setTooltipOpen(false)}
                                open={tooltipOpen}
                                disableFocusListener
                                disableHoverListener
                                disableTouchListener
                                title="Link copied to clipboard"
                            >
                                <Button onClick={copyReferralLink} variant="contained" size="large">COPY LINK</Button>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Referral
