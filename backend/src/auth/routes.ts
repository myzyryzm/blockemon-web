/** @format */

import express from 'express'
import { check } from 'express-validator'
import {
    isLoggedIn,
    getCredentials,
    createCredentials,
    createAccessKey,
} from './controller'

const router = express.Router()
router.get('/credentials/:cid', getCredentials)

router.post(
    '/login',
    [
        check('privateKey')
            .not()
            .isEmpty(),
        check('accountId')
            .not()
            .isEmpty(),
    ],
    isLoggedIn
)

router.post(
    '/credentials',
    [
        check('privateKey')
            .not()
            .isEmpty(),
        check('accountId')
            .not()
            .isEmpty(),
    ],
    createCredentials
)

router.post(
    '/create-access-key',
    [
        check('privateKey')
            .not()
            .isEmpty(),
        check('accountId')
            .not()
            .isEmpty(),
    ],
    createAccessKey
)

export default router
