/** @format */

import React, { useEffect, useState } from 'react'
import './App.css'
import NearContext from 'Near/NearContext'
import useNear from 'Near/useNear'
import WebGL from 'WebGL/WebGL'
import Routes from 'Routes'

export default function App() {
    const near = useNear()
    // const currentUrl = new URL(window.location.href)
    // const publicKey = currentUrl.searchParams.get('public_key') || ''
    // const allKeys = (currentUrl.searchParams.get('all_keys') || '').split(',')
    // const accountId = currentUrl.searchParams.get('account_id') || ''

    return (
        <NearContext.Provider value={near}>
            {/* <WebGL /> */}
            <Routes />
        </NearContext.Provider>
    )
}
