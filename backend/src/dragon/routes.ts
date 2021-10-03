/** @format */

import express from 'express'
import { check } from 'express-validator'
import {
    addDragonToMarket,
    breedDragonTxHash,
    buyDragonTxHash,
    getDragonById,
    getDragonIdsForOwner,
    getDragons,
    getDragonsOnMarket,
    queryMarketDragons,
    removeDragonFromMarket,
    seedDatabase,
} from './controller'

const router = express.Router()

router.get('', getDragonById)

router.post(
    '',
    [
        check('accountId')
            .not()
            .isEmpty(),
    ],
    getDragons
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
        check('id')
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
        check('id')
            .not()
            .isEmpty(),
    ],
    removeDragonFromMarket
)

router.post('/seed-database', seedDatabase)

router.get('/market', getDragonsOnMarket)

router.get('/ids', getDragonIdsForOwner)

router.get('/market-query', queryMarketDragons)

export default router
