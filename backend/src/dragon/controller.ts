/** @format */
import HttpError from '../common/http-error'
import {
    call,
    getSignedTransactionUrl,
    sendMoney,
    verifyMessage,
} from '../common/utils'
import { config, contract } from '../common/near-contract'
import { IDragon } from './models'

export async function getDragons(req, res, next) {
    const { accountId, message, signedMessage, publicKey } = req.body
    // if (!verifyMessage(message, signedMessage, publicKey)) {
    //     return next(new HttpError('Not signed', 403))
    // }
    // todo: add checking of public key to see if user has access
    try {
        // @ts-ignore
        const dragons: IDragon[] = await contract.getDragonsForOwner(
            { owner: accountId },
            config.GAS
        )

        res.status(200).send({ dragons })
    } catch (e) {
        return next(new HttpError('Not signed', 403))
    }
}

export async function getDragonById(req, res, next) {
    try {
        // @ts-ignore
        const dragon: IDragon = await contract.getDragonById(
            { id: parseInt(req.query.dragon_id) },
            config.GAS
        )

        res.status(200).send({ dragon })
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
    res.status(200).send({ dragon: newDragon })
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

export async function buyDragonTxHash(req, res, next) {
    const { accountId, privateKey, publicKey, price, id } = req.body
    console.log('here ya know')
    const hash = await getSignedTransactionUrl(
        accountId,
        privateKey,
        publicKey,
        price.toString(),
        'buyDragon',
        { id }
    )
    console.log('hash ya know', hash)
    res.status(200).send({ hash })
}

export async function addDragonToMarket(req, res, next) {
    console.log('bueno noches mamcita')
    const { accountId, id, price, privateKey } = req.body

    console.log(price, id)
    try {
        const isSuccess = await call(
            accountId,
            privateKey,
            undefined,
            'addDragonToMarket',
            { id: parseInt(id), price: price.toString() }
        )
        console.log(isSuccess)
        res.status(200).send({ isSuccess })
    } catch (e) {
        return next(new HttpError('Failed to add dragon to market.', 400))
    }
}

export async function removeDragonFromMarket(req, res, next) {
    const { accountId, id, privateKey } = req.body
    try {
        const isSuccess = await call(
            accountId,
            privateKey,
            undefined,
            'removeDragonFromMarket',
            { id }
        )
        console.log(isSuccess)
        res.status(200).send({ isSuccess })
    } catch (e) {
        return next(new HttpError('Failed to remove dragon from market.', 400))
    }
}

export async function getDragonsOnMarket(req, res, next) {
    if (req.query.page) {
        try {
            const page = parseInt(req.query.page)
            // @ts-ignore
            const dragons: IDragon[] = await contract.getDragonsOnMarket({
                page,
            })
            console.log('dragons from market', dragons)
            res.status(200).send({ dragons })
        } catch (e) {
            return next(new HttpError('Failed to get dragons from market', 400))
        }
    } else {
        try {
            // @ts-ignore
            const numberOfDragons: number = await contract.getNumberOfDragonsOnMarket()
            res.status(200).send({ numberOfDragons })
        } catch (e) {
            return next(new HttpError('Failed to get number of dragons', 400))
        }
    }
}

export async function getNumberOfDragonsForOwner(req, res, next) {
    try {
        // @ts-ignore
        const numberOfDragons: number = await contract.getNumberOfDragonsForOwner(
            {
                owner: req.query.owner,
            }
        )
        res.status(200).send({ numberOfDragons })
    } catch (e) {
        return next(new HttpError('Failed to get dragons from market', 400))
    }
}

export async function getDragonIdsForOwner(req, res, next) {
    try {
        // @ts-ignore
        const dragonIds: number[] = await contract.getDragonIdsForOwner({
            owner: req.query.owner,
        })
        res.status(200).send({ dragonIds })
    } catch (e) {
        return next(new HttpError('Failed to get dragons from market', 400))
    }
}
