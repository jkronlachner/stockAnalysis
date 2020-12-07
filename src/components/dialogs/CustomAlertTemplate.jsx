import React from 'react'
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

// the style contains only the margin given as offset
// options contains all alert given options
// message is the alert message
// close is a function that closes the alert
export const AlertTemplate = ({ style, options, message, close }) => (
    <Dialog open={true}>
        <DialogTitle>
            {options.title}
        </DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-description">
                {message}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => close()}>
                {options.closeCopy}
            </Button>
            {options.actions.map(x => {
                return (<Button onClick={x.onClick} color="primary">
                    {x.copy}
                    </Button>)
            })}
        </DialogActions>
    </Dialog>
)
