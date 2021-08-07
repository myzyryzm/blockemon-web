/** @format */

import Breed from 'Breed/Breed'
import EndlessRunner from 'EndlessRunner/EndlessRunner'
import Home from 'Home/Home'
import NearContext from 'Near/NearContext'
import React, { useContext } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import Transactions from 'Transactions/Transactions'

export default function Routes(): JSX.Element {
    const { transactionStatus } = useContext(NearContext)

    function renderHome(): JSX.Element {
        return <Home />
    }

    function renderBreed(): JSX.Element {
        return <Breed />
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
                exact
                path='/breed'
                render={() => {
                    return renderBreed()
                }}
            />
            <Route
                exact
                path='/endless-runner'
                render={() => {
                    return renderEndlessRunner()
                }}
            />
            <Route
                exact
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
