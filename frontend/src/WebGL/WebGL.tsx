/** @format */

import NearContext from 'Near/NearContext'
import React, { useEffect, useContext } from 'react'
import Unity, { UnityContent } from 'react-unity-webgl'

const unityContext = new UnityContent(
    './Build/dragon-breeding.json',
    './Build/UnityLoader.js'
)

export default function WebGL() {
    const { signOut } = useContext(NearContext)

    useEffect(function() {
        unityContext.on('SignOut', function() {
            signOut()
        })
    }, [])

    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            <Unity unityContent={unityContext} />
        </div>
    )
}
