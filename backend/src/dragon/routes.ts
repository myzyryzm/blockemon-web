/** @format */

import express from 'express'
import { check } from 'express-validator'
import { getDragons } from './controller'

const router = express.Router()

router.post(
    '',
    [
        check('message')
            .not()
            .isEmpty(),
        check('signedMessage')
            .not()
            .isEmpty(),
        check('publicKey')
            .not()
            .isEmpty(),
        check('accountId')
            .not()
            .isEmpty(),
    ],
    getDragons
)

export default router
