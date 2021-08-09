/** @format */

import React from 'react'
import NearContext from 'Near/NearContext'
import useNear from 'Near/useNear'
import Routes from 'Routes'
import { BrowserRouter } from 'react-router-dom'

export default function App() {
    const near = useNear()
    // const currentUrl = new URL(window.location.href)
    // const publicKey = currentUrl.searchParams.get('public_key') || ''
    // const allKeys = (currentUrl.searchParams.get('all_keys') || '').split(',')
    // const accountId = currentUrl.searchParams.get('account_id') || ''

    return (
        <BrowserRouter>
            <NearContext.Provider value={near}>
                <Routes />
            </NearContext.Provider>
        </BrowserRouter>
    )
}
