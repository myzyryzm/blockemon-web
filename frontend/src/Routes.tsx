/** @format */

import EndlessRunner from 'EndlessRunner/EndlessRunner'
import Home from 'Home/Home'
import NearContext from 'Near/NearContext'
import React, { useContext } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import Transactions from 'Transactions/Transactions'
import WebGL from 'WebGL/WebGL'

export default function Routes(): JSX.Element {
    const { transactionStatus } = useContext(NearContext)

    function renderHome(): JSX.Element {
        return <Home />
    }

    function renderBreed(): JSX.Element {
        return <WebGL />
    }

    function renderEndlessRunner(): JSX.Element {
        return <EndlessRunner />
    }

    function renderTransactions() {
        return <Transactions transactionStatus={transactionStatus} />
    }

    return (
        <Switch>
            <Route
                exact
                path='/home'
                render={() => {
                    return renderHome()
                }}
            />
            <Route
                path='/breed'
                render={() => {
                    return renderBreed()
                }}
            />
            <Route
                path='/endless-runner'
                render={() => {
                    return renderEndlessRunner()
                }}
            />
            <Route
                path='/transactions'
                render={() => {
                    return renderTransactions()
                }}
            />
            <Route
                render={() => {
                    return <Redirect to='/home' />
                }}
            />
        </Switch>
    )
}
