/** @format */
import HttpError from '../common/http-error'
import { verifyMessage } from '../common/utils'
import { config, contract } from '../common/near-contract'
import { IDragon, IDragonResponse } from './models'
import { getDragonPayload } from './utils'

export async function getDragons(req, res, next) {
    const { accountId, message, signedMessage, publicKey } = req.body
    if (!verifyMessage(message, signedMessage, publicKey)) {
        return next(new HttpError('Not signed', 403))
    }
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

export async function breedDragons(req, res, next) {
    const {
        accountId,
        message,
        signedMessage,
        publicKey,
        dragon1Id,
        dragon2Id,
    } = req.body
    if (!verifyMessage(message, signedMessage, publicKey)) {
        return next(new HttpError('Not signed', 403))
    }
    // @ts-ignore
    const newDragon: IDragon = await contract.breedDragons(
        { owner: accountId, dragon1Id, dragon2Id },
        config.GAS
    )

    res.status(200).send({ dragon: getDragonPayload(newDragon) })
}
