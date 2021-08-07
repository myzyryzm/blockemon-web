/** @format */

import Modal from 'Modal/Modal'
import React, { useEffect, useState } from 'react'

export interface ITransactions {
    transactionStatus(txHash: string): Promise<any>
}

export default function Transactions({
    transactionStatus,
}: ITransactions): JSX.Element {
    const [successModalOpen, setSuccessModalOpen] = useState(false)
    const [failModalOpen, setFailModalOpen] = useState(false)

    const currentUrl = new URL(window.location.href)
    const transactionHashes =
        currentUrl.searchParams.get('transactionHashes') || ''

    useEffect(() => {
        async function getTransaction() {
            const status = await transactionStatus(transactionHashes)
            console.log('status', status)
            setFailModalOpen(!status)
            setSuccessModalOpen(status)
        }
        if (transactionHashes) {
            getTransaction()
        }
    }, [transactionHashes])

    return (
        <div>
            <Modal
                open={successModalOpen}
                close={() => {
                    setSuccessModalOpen(false)
                }}
                type='success'
            />
            <Modal
                open={failModalOpen}
                close={() => {
                    setFailModalOpen(false)
                }}
                type='fail'
            />
        </div>
    )
}
