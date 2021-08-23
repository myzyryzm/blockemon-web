/** @format */
import HttpError from '../common/http-error'
import {
    call,
    getSignedTransactionUrl,
    sendMoney,
    verifyMessage,
} from '../common/utils'
import { config, contract } from '../common/near-contract'
import { MAIN_LOOKUP_TYPES } from './constants'
import {
    IDragon,
    IFilter,
    IMarketDragon,
    IMarketDragonResponse,
    IMarketFilter,
} from './commonRequirements'
import {
    modifyMarket,
    getMarketDragonResponse,
    getFilteredDragonIds,
    getOverlappingIds,
    modifyDragonMarket,
    getMarketFilter,
    transformMarketFilter,
    getFilteredDragons,
} from './utils'

export async function getDragons(req, res, next) {
    const { accountId } = req.body
    // if (!verifyMessage(message, signedMessage, publicKey)) {
    //     return next(new HttpError('Not signed', 403))
    // }
    // @ts-ignore
    const dragons: IDragon[] = await contract.getDragonsForOwner({
        owner: accountId,
    })
    // console.log('dragons', dragons)
    res.status(200).send({ dragons })
    // // todo: add checking of public key to see if user has access
    // try {
    // } catch (e) {
    //     return next(new HttpError('Not signed', 403))
    // }
}

export async function getDragonById(req, res, next) {
    try {
        // @ts-ignore
        const dragon: IDragon = await contract.getDragonById({
            id: parseInt(req.query.dragon_id),
        })

        res.status(200).send({ dragon })
    } catch (e) {
        return next(new HttpError('Not signed', 403))
    }
}

// export async function breedDragons(req, res, next) {
//     const {
//         accountId,
//         message,
//         signedMessage,
//         publicKey,
//         dragon1Id,
//         dragon2Id,
//         privateKey,
//     } = req.body
//     console.log('dragon ids', dragon1Id, dragon2Id)
//     if (!verifyMessage(message, signedMessage, publicKey)) {
//         return next(new HttpError('Not signed', 403))
//     }

//     // @ts-ignore
//     const newDragon: IDragon = await contract.breedDragons(
//         {
//             owner: accountId,
//             dragon1Id,
//             dragon2Id,
//         },
//         config.GAS
//     )
//     console.log('new dragon id', newDragon.id)
//     res.status(200).send({ dragon: newDragon })
// }

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
    const { accountId, id, price, privateKey } = req.body

    console.log(price, id)
    try {
        const dragon: IMarketDragonResponse = await call(
            accountId,
            privateKey,
            undefined,
            'addDragonToMarket',
            { id: parseInt(id), price: price.toString() }
        )
        console.log(dragon)
        await modifyDragonMarket(dragon, 'add')
        await modifyMarket(dragon, 'add')
        res.status(200).send({ dragon })
    } catch (e) {
        return next(new HttpError('Failed to add dragon to market.', 400))
    }
}

export async function removeDragonFromMarket(req, res, next) {
    const { accountId, id, privateKey } = req.body
    try {
        const dragon: IMarketDragonResponse = await call(
            accountId,
            privateKey,
            undefined,
            'removeDragonFromMarket',
            { id }
        )
        console.log(dragon)
        await modifyDragonMarket(dragon, 'remove')
        await modifyMarket(dragon, 'remove')
        res.status(200).send({ dragon })
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

// export async function updateMarketSchema(req, res, next) {
//     const dragon: IDragon = req.body.dragon
//     let action: 'add' | 'remove' | undefined = req.body.action
//     action = !action ? 'add' : action
//     const marketDragon: IMarketDragon = transformDragon(dragon)
//     await modifyMarket(marketDragon, action)
//     res.status(200).send({ h: 'ok' })
// }

export async function queryMarketDragons(req, res, next) {
    let dragons: IMarketDragon[] = []
    if (req.query.dragons) {
        const dragonIds: string[] = req.query.dragons.split(',')
        dragons = await getMarketDragonResponse(dragonIds)
        res.status(200).send({ dragons, dragonIds })
    } else {
        // const filters: IFilter[] = []
        const marketFilter: IMarketFilter = getMarketFilter()
        MAIN_LOOKUP_TYPES.forEach((type) => {
            const value = req.query[type]
            if (value != undefined) {
                marketFilter[type] = value
                // filters.push({ lookupType: type, lookupValue: value })
            }
        })
        const { mainFilter, secondaryFilter } = transformMarketFilter(
            marketFilter
        )
        // const getAll = filters.length === 0
        // if (getAll) {
        //     filters.push({ lookupType: 'all' })
        // }
        const { dragons, dragonIds } = await getFilteredDragons(
            mainFilter,
            secondaryFilter
        )
        // const filteredDragonIds: Array<any[]> = await getFilteredDragonIds(
        //     filters
        // )
        // const dragonIds = getOverlappingIds(filteredDragonIds)
        // dragons = await getMarketDragonResponse(dragonIds)
        res.status(200).send({ dragons, dragonIds })
    }
}
