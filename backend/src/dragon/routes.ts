/** @format */

import express from 'express'
import { check } from 'express-validator'
import {
    addDragonToMarket,
    breedDragons,
    breedDragonTxHash,
    buyDragonTxHash,
    getDragonById,
    getDragonIdsForOwner,
    getDragons,
    getDragonsOnMarket,
    removeDragonFromMarket,
} from './controller'

const router = express.Router()

router.get('', getDragonById)

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
        check('privateKey')
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

router.post(
    '/breed-tx-hash',
    [
        check('privateKey')
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
    breedDragonTxHash
)

router.post(
    '/buy-tx-hash',
    [
        check('privateKey')
            .not()
            .isEmpty(),
        check('accountId')
            .not()
            .isEmpty(),
        check('id')
            .not()
            .isEmpty(),
        check('dragon2Id')
            .not()
            .isEmpty(),
    ],
    buyDragonTxHash
)

router.post(
    '/add-to-market',
    [
        check('privateKey')
            .not()
            .isEmpty(),
        check('accountId')
            .not()
            .isEmpty(),
        check('dragonId')
            .not()
            .isEmpty(),
        check('price')
            .not()
            .isEmpty(),
    ],
    addDragonToMarket
)

router.post(
    '/remove-from-market',
    [
        check('privateKey')
            .not()
            .isEmpty(),
        check('accountId')
            .not()
            .isEmpty(),
        check('dragonId')
            .not()
            .isEmpty(),
    ],
    removeDragonFromMarket
)

router.get('/market', getDragonsOnMarket)

router.get('/ids', getDragonIdsForOwner)

export default router
