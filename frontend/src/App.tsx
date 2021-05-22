/** @format */

import React from 'react'
// @ts-ignore
import logo from './logo.svg'
import './App.css'

export default function App() {
    const currentUrl = new URL(window.location.href)
    const publicKey = currentUrl.searchParams.get('public_key') || ''
    const allKeys = (currentUrl.searchParams.get('all_keys') || '').split(',')
    const accountId = currentUrl.searchParams.get('account_id') || ''
    console.log('publicKey', publicKey)
    console.log('allKeys', allKeys)
    console.log('accountId', accountId)
    return (
        <div className='App'>
            <header className='App-header'>
                <img src={logo} className='App-logo' alt='logo' />
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                    className='App-link'
                    href='https://reactjs.org'
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    Learn React
                </a>
            </header>
        </div>
    )
}
