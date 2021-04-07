/** @format */

import express from 'express'
import { check } from 'express-validator'
import { sign } from './controller'

const router = express.Router()

// this route requires secretKey in the body
router.post(
    '/',
    [
        check('privateKey')
            .not()
            .isEmpty(),
    ],
    sign
)

export default router
