/** @format */
import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import Typography from '@material-ui/core/Typography'
import { ENDLESS_RUNNER_DEEP_LINK } from 'Common/constants'

export interface IModal {
    open: boolean
    close: () => void
    type: 'success' | 'fail'
    game: 'endless-runner' | 'breeding'
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
    game = 'breeding',
}: IModal) {
    const classes = useStyles()

    function getTransactionText() {
        if (type === 'success') {
            if (game === 'breeding') {
                return 'Transaction signed! You can navigate to the previous window and close this one.'
            }
            return 'Transaction Success!'
        } else {
            if (game === 'breeding') {
                return 'Unable to sign transaction.  Your account was not charged.  Please close this window and try again.'
            }
            return 'Transaction failed. Please Try Again'
        }
    }

    function buttonText() {
        return game === 'breeding' ? 'Close' : 'Open Game'
    }

    function closeModal() {
        close()
        if (game === 'endless-runner') {
            window.location.assign(ENDLESS_RUNNER_DEEP_LINK)
        }
    }

    return (
        <Dialog
            id='transaction-modal'
            open={open}
            classes={{
                paperWidthLg: classes.dialogRoot,
            }}
            onClose={closeModal}
            aria-describedby='url-description'
            maxWidth='lg'
        >
            <Typography className={classes.dialogText}>
                {getTransactionText()}
            </Typography>
            <DialogActions disableSpacing={true}>
                <Button onClick={closeModal} color='primary'>
                    {buttonText()}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
