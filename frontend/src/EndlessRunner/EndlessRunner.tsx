/** @format */

import React from 'react'
import { Route, Switch, Redirect, useRouteMatch } from 'react-router-dom'
import LoginFail from './LoginFail'
import LoginSuccess from './LoginSuccess'
import EndlessRunnerMain from './EndlessRunnerMain'

export default function EndlessRunner() {
    const match = useRouteMatch()

    function runnerUrl(url: string) {
        return `${match.url}/${url}`
    }

    function renderMain(): JSX.Element {
        return <EndlessRunnerMain />
    }

    function renderLoginSuccess() {
        return <LoginSuccess />
    }

    function renderLoginFail() {
        return <LoginFail />
    }

    function renderTransactions() {}

    return (
        <Switch>
            <Route
                exact
                path={runnerUrl('main')}
                render={() => {
                    return renderMain()
                }}
            />
            <Route
                exact
                path={runnerUrl('login-success')}
                render={() => {
                    return renderLoginSuccess()
                }}
            />
            <Route
                exact
                path={runnerUrl('login-fail')}
                render={() => {
                    return renderLoginFail()
                }}
            />
            <Route
                render={() => {
                    return <Redirect to={runnerUrl('main')} />
                }}
            />
        </Switch>
    )
}
