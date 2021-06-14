/** @format */

import express from 'express'
import { check } from 'express-validator'
import { breedDragons, getDragons } from './controller'

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

router.post(
    '/breed',
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
        check('dragon1Id')
            .not()
            .isEmpty(),
        check('dragon2Id')
            .not()
            .isEmpty(),
    ],
    breedDragons
)

export default router
