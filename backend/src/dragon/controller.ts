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
    IDragonResponse,
    IMarketDragon,
    IMarketFilter,
} from './commonRequirements'
import {
    getMarketDragonResponse,
    modifyDragonMarket,
    getMarketFilter,
    transformMarketFilter,
    getFilteredDragons,
    transformDragonResponse,
    _seedDatabase,
} from './utils'

export async function getDragons(req, res, next) {
    const { accountId } = req.body
    // if (!verifyMessage(message, signedMessage, publicKey)) {
    //     return next(new HttpError('Not signed', 403))
    // }
    // @ts-ignore
    const responses: IDragonResponse[] = await contract.getDragonsForOwner({
        owner: accountId,
    })
    const dragons: IDragon[] = responses.map((res) =>
        transformDragonResponse(res)
    )
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
        if (req.query.account_id) {
            // @ts-ignore
            const dragonIds: number[] = await contract.getDragonIdsForOwner({
                owner: req.query.account_id,
            })
            const dragons: IDragon[] = []
            const numIds = dragonIds.length
            for (let i = 0; i < numIds; i++) {
                // @ts-ignore
                const response: IDragonResponse = await contract.getDragonById({
                    id: dragonIds[i],
                })
                dragons.push(transformDragonResponse(response))
            }
            res.status(200).send({ dragons })
        } else {
            // @ts-ignore
            const response: IDragonResponse = await contract.getDragonById({
                id: parseInt(req.query.dragon_id),
            })
            res.status(200).send({ dragon: transformDragonResponse(response) })
        }
    } catch (e) {
        return next(new HttpError('Not signed', 403))
    }
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
        const dragon: IDragonResponse = await call(
            accountId,
            privateKey,
            undefined,
            'addDragonToMarket',
            { id: parseInt(id), price: price.toString() }
        )
        console.log(dragon)
        await modifyDragonMarket(dragon, 'add')
        res.status(200).send({ dragon, isSuccess: true })
    } catch (e) {
        return next(new HttpError('Failed to add dragon to market.', 400))
    }
}

export async function seedDatabase(req, res, next) {
    const { startId, numberOfDragons } = req.body
    const endId = startId + numberOfDragons
    const dragons: IDragonResponse[] = []
    for (let i = startId; i < endId; i++) {
        const dragon = createRandoDrago(i)
        dragons.push(dragon)
        // await modifyDragonMarket(dragon, 'add')
    }
    await _seedDatabase(dragons)
    res.status(200).send({ status: 'ok' })
}

function getRandom(maxVal: number) {
    const g = Math.floor(Math.random() * (maxVal + 1))
    return g < maxVal + 1 ? g : maxVal
}

function createRandoDrago(id: number): IDragonResponse {
    const price = Math.ceil(Math.random() * 100).toString()
    const colors = [getRandom(7), getRandom(7)]
    const genes = []
    for (let i = 0; i < 12; i++) {
        genes.push(getRandom(2))
    }

    return {
        id: id.toString(),
        owner: 'ryzm.testnet',
        parent1: 0,
        parent2: 0,
        colors,
        genes,
        price,
        oldPrice: '0',
    }
}

export async function removeDragonFromMarket(req, res, next) {
    const { accountId, id, privateKey } = req.body
    try {
        const dragon: IDragonResponse = await call(
            accountId,
            privateKey,
            undefined,
            'removeDragonFromMarket',
            { id }
        )
        console.log(dragon)
        await modifyDragonMarket(dragon, 'remove')
        res.status(200).send({ dragon, isSuccess: true })
    } catch (e) {
        return next(new HttpError('Failed to remove dragon from market.', 400))
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

export async function queryMarketDragons(req, res, next) {
    let dragons: IMarketDragon[] = []
    if (req.query.dragons) {
        const dragonIds: string[] = req.query.dragons.split(',')
        dragons = await getMarketDragonResponse(dragonIds)
        res.status(200).send({ dragons, dragonIds })
    } else {
        // const t1 = Date.now()
        // const result: any = await Dragon.find({}).sort({ price: 1 })
        // const t2 = Date.now()
        const marketFilter: IMarketFilter = getMarketFilter()
        MAIN_LOOKUP_TYPES.forEach((type) => {
            const value = req.query[type]
            if (value != undefined) {
                marketFilter[type] = value
            }
        })
        const chunk = req.query.chunk ? req.query.chunk : 0
        const { mainFilter, secondaryFilter } = transformMarketFilter(
            marketFilter
        )
        let sortOrder = req.query.sort_order ? req.query.sort_order : 1
        sortOrder = Math.abs(sortOrder) != 1 ? 1 : sortOrder
        const { dragons, dragonIds } = await getFilteredDragons(
            mainFilter,
            secondaryFilter,
            sortOrder
        )
        const dragonRes = dragons.slice(chunk * 1000, (chunk + 1) * 1000)
        // const t3 = Date.now()
        // console.log(result)
        // console.log('first', t2 - t1, 'second', t3 - t2)
        res.status(200).send({ dragons: dragonRes, dragonIds })
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
