/** @format */

import React, { useEffect, useState } from 'react'
import './App.css'
import NearContext from 'Near/NearContext'
import useNear from 'Near/useNear'
import WebGL from 'WebGL/WebGL'
import Modal from 'Modal/Modal'

export default function App() {
    const near = useNear()
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const currentUrl = new URL(window.location.href)
    // const publicKey = currentUrl.searchParams.get('public_key') || ''
    // const allKeys = (currentUrl.searchParams.get('all_keys') || '').split(',')
    // const accountId = currentUrl.searchParams.get('account_id') || ''
    const transactionHashes =
        currentUrl.searchParams.get('transactionHashes') || ''

    useEffect(() => {
        async function getTransaction() {
            const status = await near.transactionStatus(transactionHashes)
            console.log('status', status)
            if (status) {
                setModalOpen(true)
            }
        }
        if (transactionHashes) {
            getTransaction()
        }
    }, [transactionHashes])

    return (
        <NearContext.Provider value={near}>
            <Modal
                open={modalOpen}
                close={() => {
                    setModalOpen(true)
                }}
            />
            <WebGL />
            <div className='App'>
                <button onClick={near.signIn}>Login With Near</button>
                <button
                    onClick={async () => {
                        const res = await near.functionCallTest()
                        console.log('res', res)
                    }}
                >
                    Function Call Test
                </button>
            </div>
        </NearContext.Provider>
    )
}
