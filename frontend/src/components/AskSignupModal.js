import React from 'react'
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

function AskSignupModal(props) {
  const { open } = props;

  const handleClose = () => {
  };

  return (
    <Dialog onClose={handleClose} aria-labelledby="ask-signup-dialog-title" open={open}>
      <DialogTitle id="ask-signup-dialog-title">Sign up for free to continue</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Welcome to Tigerstance! Please sign in to see full results.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button href="/signin" color="primary" autoFocus>
          Sign in
        </Button>
        <Button href="/signin/register" color="primary" autoFocus>
          Sign up
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AskSignupModal;
