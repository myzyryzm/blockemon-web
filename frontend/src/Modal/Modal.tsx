/** @format */
import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import { DialogActions, Typography } from '@material-ui/core'

interface IModal {
    open: boolean
    close: () => void
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

/**
 *
 * @param param0
 */
export default function Modal({
    open = false,
    close = () => {},
}: Partial<IModal>) {
    const classes = useStyles()

    return (
        <Dialog
            id='share-url'
            open={open}
            classes={{
                paperWidthLg: classes.dialogRoot,
            }}
            onClose={close}
            aria-describedby='url-description'
            maxWidth='lg'
        >
            <Typography className={classes.dialogText}>
                Transaction signed! You can navigate to the previous window and
                close this one.
            </Typography>
            <DialogActions disableSpacing={true}>
                <Button onClick={close} color='primary'>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}
