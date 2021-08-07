/** @format */

import { ENDLESS_RUNNER_DEEP_LINK } from 'Common/constants'
import React, { useEffect } from 'react'

export default function LoginSuccess(): JSX.Element {
    useEffect(() => {
        window.location.assign(ENDLESS_RUNNER_DEEP_LINK)
    }, [])

    return <></>
}
