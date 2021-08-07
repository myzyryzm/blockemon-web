/** @format */
import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import Typography from '@material-ui/core/Typography'

export interface IModal {
    open: boolean
    close: () => void
    type: 'success' | 'fail'
}

const useStyles = makeStyles({
    dialogRoot: {
        padding: 20,
        textAlign: 'center',
        width: 450,
    },
    dialogTitle: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
        fontWeight: 500,
    },
    dialogText: {
        fontSize: 14,
        marginTop: 10,
        textAlign: 'center',
    },
})

export default function Modal({
    open = false,
    close = () => {},
    type = 'success',
}: IModal) {
    const classes = useStyles()

    const text: string =
        type === 'success'
            ? 'Transaction signed! You can navigate to the previous window and close this one.'
            : 'Unable to sign transaction.  Your account was not charged.  Please close this window and try again.'

    return (
        <Dialog
            id='transaction-modal'
            open={open}
            classes={{
                paperWidthLg: classes.dialogRoot,
            }}
            onClose={close}
            aria-describedby='url-description'
            maxWidth='lg'
        >
            <Typography className={classes.dialogText}>{text}</Typography>
            <DialogActions disableSpacing={true}>
                <Button onClick={close} color='primary'>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}
