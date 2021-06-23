/** @format */
import HttpError from '../common/http-error'
import {
    call,
    getSignedTransactionUrl,
    sendMoney,
    verifyMessage,
} from '../common/utils'
import { config, contract } from '../common/near-contract'
import { IDragon, IDragonResponse } from './models'
import { getDragonPayload } from './utils'

export async function getDragons(req, res, next) {
    const { accountId, message, signedMessage, publicKey } = req.body
    if (!verifyMessage(message, signedMessage, publicKey)) {
        return next(new HttpError('Not signed', 403))
    }
    // todo: add checking of public key to see if user has access
    // @ts-ignore
    const dragons: IDragon[] = await contract.getDragonsForOwner(
        { owner: accountId },
        config.GAS
    )
    const dragonResponse: Array<IDragonResponse> = dragons.map((dragon) => {
        return getDragonPayload(dragon)
    })

    res.status(200).send({ dragons: dragonResponse })
}

export async function getDragonById(req, res, next) {
    try {
        // @ts-ignore
        const dragon: IDragon = await contract.getDragonById(
            { id: parseInt(req.query.dragon_id) },
            config.GAS
        )

        res.status(200).send({ dragon: getDragonPayload(dragon) })
    } catch (e) {
        return next(new HttpError('Not signed', 403))
    }
}

export async function breedDragons(req, res, next) {
    const {
        accountId,
        message,
        signedMessage,
        publicKey,
        dragon1Id,
        dragon2Id,
        privateKey,
    } = req.body
    console.log('dragon ids', dragon1Id, dragon2Id)
    if (!verifyMessage(message, signedMessage, publicKey)) {
        return next(new HttpError('Not signed', 403))
    }
    const isSuccess = await call(accountId, privateKey, '0.25', 'getCEO', {})
    console.log(isSuccess)

    // @ts-ignore
    const newDragon: IDragon = await contract.breedDragons(
        {
            owner: accountId,
            dragon1Id,
            dragon2Id,
        },
        config.GAS
    )
    console.log('new dragon id', newDragon.id)
    res.status(200).send({ dragon: getDragonPayload(newDragon) })
}

export async function breedDragonTxHash(req, res, next) {
    const { accountId, dragon1Id, dragon2Id, privateKey, publicKey } = req.body
    console.log('dragon ids', dragon1Id, dragon2Id)

    const hash = await getSignedTransactionUrl(
        accountId,
        privateKey,
        publicKey,
        '0.25',
        'breedDragons',
        { dragon1Id, dragon2Id, owner: accountId }
    )
    res.status(200).send({ hash })
}

export async function addDragonToMarket(req, res, next) {
    const { accountId, dragonId, price, privateKey } = req.body
    try {
        const isSuccess = await call(
            accountId,
            privateKey,
            undefined,
            'addDragonToMarket',
            { id: dragonId, price: price.toString() }
        )
        console.log(isSuccess)
        res.status(200).send({ res: isSuccess })
    } catch (e) {
        return next(new HttpError('Failed to add dragon to market.', 400))
    }
}

export async function removeDragonFromMarket(req, res, next) {
    const { accountId, dragonId, privateKey } = req.body
    try {
        const isSuccess = await call(
            accountId,
            privateKey,
            undefined,
            'removeDragonFromMarket',
            { id: dragonId }
        )
        console.log(isSuccess)
        res.status(200).send({ res: isSuccess })
    } catch (e) {
        return next(new HttpError('Failed to remove dragon from market.', 400))
    }
}

export async function addDragonToMarketTest(req, res, next) {
    const accountId = 'ryzm.testnet'
    const dragonId = 1
    let price = 1
    let privateKey =
        '2a5YXt6Q9NNazZ7uYTrQ51BxxAhjyLnPTp8M4gvcFpkHBH7PNsuZCR7XfFsM2Qgqx8349D2J4RSCQEazqEEJ4vwG'
    // privateKey =
    //     '2FHGf2HNKa1dHeUgZuT3Xu1eG5Pmn1b9VvXH9EXN2pG86wzpRXgfWKoTLcJjP4Rj9rbknQHa8REfmkTFMkmDXY2Q'
    // const isSuccess = await call(
    //     accountId,
    //     privateKey,
    //     '0.001',
    //     'addDragonToMarket',
    //     { id: dragonId, price: price.toString() }
    // )
    // console.log(isSuccess)
    // res.status(200).send({ res: isSuccess })
    const isSuccess = await sendMoney(accountId, privateKey, '0.1')
    console.log(isSuccess)
    res.status(200).send({ res: isSuccess })
    // try {
    // } catch (e) {
    //     return next(new HttpError('Failed to add', 403))
    // }
}

export async function buyDragon(req, res, next) {
    const { accountId, dragonId, price, privateKey } = req.body

    try {
        const isSuccess = await call(
            accountId,
            privateKey,
            price,
            'buyDragon',
            { id: dragonId }
        )
        console.log(isSuccess)
        // todo: need to then fetch the dragon's info
        res.status(200).send({ res: isSuccess })
    } catch (e) {
        return next(new HttpError('Failed to buy dragon', 403))
    }
}

export async function getDragonsOnMarket(req, res, next) {
    if (req.query.page) {
        try {
            const page = parseInt(req.query.page)
            // @ts-ignore
            const dragons: IDragon[] = await contract.getDragonsOnMarket(
                {
                    page,
                },
                config.GAS
            )
            const dragonResponse: Array<IDragonResponse> = dragons.map(
                (dragon) => {
                    return getDragonPayload(dragon)
                }
            )
            res.status(200).send({ dragons: dragonResponse })
        } catch (e) {
            return next(new HttpError('Failed to get dragons from market', 400))
        }
    } else {
        try {
            // @ts-ignore
            const numberOfDragons: number = await contract.getNumberOfDragonsOnMarket(
                {},
                config.GAS
            )
            res.status(200).send({ numberOfDragons })
        } catch (e) {
            return next(new HttpError('Failed to get number of dragons', 400))
        }
    }
}

export async function getNumberOfDragonsForOwner(req, res, next) {
    // @ts-ignore
    const numberOfDragons: number = await contract.getNumberOfDragonsForOwner(
        {
            owner: req.query.owner,
        },
        config.GAS
    )
    res.status(200).send({ numberOfDragons })
    // try {
    // } catch (e) {
    //     return next(new HttpError('Failed to get dragons from market', 400))
    // }
}

export async function getDragonIdsForOwner(req, res, next) {
    // @ts-ignore
    const dragonIds: number[] = await contract.getDragonIdsForOwner(
        {
            owner: req.query.owner,
        },
        config.GAS
    )
    res.status(200).send({ dragonIds })
    // try {
    // } catch (e) {
    //     return next(new HttpError('Failed to get dragons from market', 400))
    // }
}
