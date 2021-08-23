/** @format */

import { Market, Dragon, DragonMarket } from './models'
import { MAIN_LOOKUP_TYPES } from './constants'
import {
    IFilter,
    IMarketDragon,
    IMarketDragonResponse,
    IMarketFilter,
} from './commonRequirements'

function transformToMarketDragon(
    res: IMarketDragonResponse,
    price: string
): IMarketDragon {
    return {
        owner: res.owner,
        id: res.id,
        primaryColor: res.primaryColor,
        secondaryColor: res.secondaryColor,
        bodyGenes: res.bodyGenes,
        wingGenes: res.wingGenes,
        hornGenes: res.hornGenes,
        hornType: res.hornType,
        media: res.media,
        price,
    }
}

export async function modifyDragonMarket(
    marketDragon: IMarketDragonResponse,
    action: 'add' | 'remove'
) {
    const dragon = transformToMarketDragon(marketDragon, marketDragon.price)
    let oldPrice: string = ''
    if (marketDragon.oldPrice) {
        const intPrice = parseInt(marketDragon.oldPrice)
        if (intPrice > 0) {
            oldPrice = marketDragon.oldPrice
        }
    }
    const oldDragon = transformToMarketDragon(marketDragon, oldPrice)
    const filters: IMarketFilter[] = getMarketDragonFilters(dragon)
    if (action === 'add') {
        if (oldPrice) {
            if (oldPrice != dragon.price) {
                await DragonMarket.bulkWrite(
                    getBulkPriceWrites(filters, dragon)
                )
            }
        } else {
            await DragonMarket.bulkWrite(getBulkWrites(filters, dragon, action))
        }
    } else {
        await DragonMarket.bulkWrite(getBulkWrites(filters, oldDragon, action))
    }
}

function getBulkPriceWrites(filters: IMarketFilter[], dragon: IMarketDragon) {
    const updates: any[] = []
    filters.forEach((filter) => {
        updates.push({
            updateOne: {
                filter: { ...filter, 'dragons.id': dragon.id },
                update: { $set: { 'dragons.$.price': dragon.price } },
            },
        })
    })
    return updates
}

function getBulkWrites(
    filters: IMarketFilter[],
    dragon: IMarketDragon,
    action: 'add' | 'remove'
) {
    const updates: any[] = []
    filters.forEach((filter) => {
        const update =
            action === 'add'
                ? { $addToSet: { dragons: dragon } }
                : { $pull: { dragons: dragon } }
        updates.push({
            updateOne: {
                filter,
                update,
                upsert: true,
            },
        })
    })
    return updates
}

export async function modifyMarket(
    marketDragon: IMarketDragonResponse,
    action: 'add' | 'remove'
) {
    const options = { upsert: true, new: true, setDefaultsOnInsert: true }
    const dragon = transformToMarketDragon(marketDragon, marketDragon.price)
    let oldPrice: string = ''
    if (marketDragon.oldPrice) {
        const intPrice = parseInt(marketDragon.oldPrice)
        if (intPrice > 0) {
            oldPrice = marketDragon.oldPrice
        }
    }
    const oldDragon = transformToMarketDragon(marketDragon, oldPrice)

    MAIN_LOOKUP_TYPES.forEach(async (type) => {
        const query: any = {
            lookupType: type,
            lookupValue: marketDragon[type],
        }
        if (action === 'add') {
            if (oldPrice) {
                if (oldPrice != dragon.price) {
                    query['dragons.id'] = dragon.id
                    await Market.findOneAndUpdate(query, {
                        $set: { 'dragons.$.price': dragon.price },
                    })
                }
            } else {
                await Market.findOneAndUpdate(
                    query,
                    // @ts-ignore addToSet
                    {
                        $addToSet: {
                            dragonIds: marketDragon.id.toString(),
                            dragons: dragon,
                        },
                    },
                    options
                )
            }
        } else {
            await Market.findOneAndUpdate(
                query,
                // @ts-ignore
                {
                    $pull: {
                        // @ts-ignore
                        dragonIds: marketDragon.id.toString(),
                        dragons: oldDragon,
                    },
                },
                options
            )
        }
    })
    if (action === 'add') {
        const query = {
            id: marketDragon.id.toString(),
        }
        await Dragon.findOneAndUpdate(
            query,
            // @ts-ignore
            {
                $set: {
                    id: marketDragon.id.toString(),
                    price: marketDragon.price,
                    media: marketDragon.media,
                    owner: marketDragon.owner,
                    bodyGenes: marketDragon.bodyGenes,
                    wingGenes: marketDragon.wingGenes,
                    hornGenes: marketDragon.hornGenes,
                    hornType: marketDragon.hornType,
                    primaryColor: marketDragon.primaryColor,
                    secondaryColor: marketDragon.secondaryColor,
                },
            },
            options
        )
        const newQuery: any = { lookupType: 'all' }
        if (oldPrice) {
            if (oldPrice != dragon.price) {
                newQuery['dragons.id'] = dragon.id
                await Market.findOneAndUpdate(newQuery, {
                    $set: { 'dragons.$.price': dragon.price },
                })
            }
        } else {
            await Market.findOneAndUpdate(
                newQuery,
                // @ts-ignore
                {
                    $addToSet: {
                        dragonIds: marketDragon.id.toString(),
                        dragons: dragon,
                    },
                },
                options
            )
        }
    } else {
        const query = {
            id: marketDragon.id.toString(),
        }
        await Dragon.findOneAndRemove(query)
        const newQuery = { lookupType: 'all' }
        await Market.findOneAndUpdate(
            newQuery,
            // @ts-ignore
            {
                $pull: {
                    // @ts-ignore
                    dragonIds: marketDragon.id.toString(),
                    dragons: oldDragon,
                },
            },
            options
        )
    }
}

export async function getMarketDragonResponse(
    dragonIds: string[],
    maxDragons: number = 10
): Promise<IMarketDragon[]> {
    const marketDragons: IMarketDragon[] = []
    let numIds = dragonIds.length
    numIds = numIds < maxDragons ? numIds : maxDragons
    for (let i = 0; i < numIds; i++) {
        const id = dragonIds[i]
        const query = { id }
        const dragon: any = await Dragon.findOne(query)
        if (dragon) {
            marketDragons.push({
                price: dragon.price,
                id: dragon.id,
                media: dragon.media,
                owner: dragon.owner,
                primaryColor: dragon.primaryColor,
                secondaryColor: dragon.secondaryColor,
                bodyGenes: dragon.bodyGenes,
                wingGenes: dragon.wingGenes,
                hornGenes: dragon.hornGenes,
                hornType: dragon.hornType,
            })
        }
    }
    return marketDragons
}

export async function getFilteredDragons(
    filter: IMarketFilter,
    secondaryFilter: Partial<IMarketFilter>
): Promise<{ dragons: IMarketDragon[]; dragonIds: string[] }> {
    const result: any = await DragonMarket.findOne(filter, 'dragons').sort({
        'dragons.price': 1,
    })
    if (result && result.dragons.length > 0) {
        const dragons: IMarketDragon[] = result.dragons
        const secondaryKeys = Object.keys(secondaryFilter)
        const numSecKeys = secondaryKeys.length
        const dragonIds: string[] = []
        if (secondaryKeys.length > 0) {
            const filteredDragons = dragons.filter((dragon) => {
                let shouldKeep = true
                for (let i = 0; i < numSecKeys; i++) {
                    const secKey = secondaryKeys[i]
                    if (dragon[secKey] != secondaryFilter[secKey]) {
                        shouldKeep = false
                        break
                    }
                }
                if (shouldKeep) {
                    dragonIds.push(dragon.id)
                }
                return shouldKeep
            })
            return { dragons: filteredDragons, dragonIds }
        } else {
            dragons.forEach((dragon) => {
                dragonIds.push(dragon.id)
            })
            return { dragons, dragonIds }
        }
    } else {
        return { dragons: [], dragonIds: [] }
    }
}

export async function getFilteredDragonIds(
    filters: IFilter[]
): Promise<Array<any[]>> {
    const allDragonIds: Array<any[]> = []
    const numFilters = filters.length
    for (let i = 0; i < numFilters; i++) {
        const query = filters[i]
        const result: any = await Market.findOne(query, 'dragons').sort({
            'dragons.price': 1,
        })
        if (result && result.dragons.length > 0) {
            allDragonIds.push(result.dragons.map((dragon) => dragon.id))
        }
    }
    return allDragonIds
}

export function getOverlappingIds(filteredDragonIds: Array<any[]>): any[] {
    let numFilteredDragonIds = filteredDragonIds.length
    let dragonIdsResponse: any[] = []
    if (numFilteredDragonIds > 0) {
        const firstIds = filteredDragonIds[0]
        if (numFilteredDragonIds === 1) {
            dragonIdsResponse = firstIds
        } else {
            const numFirstIds = firstIds.length
            for (let i = 0; i < numFirstIds; i++) {
                const currentId = firstIds[i]
                let hasValue = true
                for (let j = 1; j < numFilteredDragonIds; j++) {
                    const id = filteredDragonIds[j].find(
                        (id) => id === currentId
                    )
                    if (id == undefined) {
                        hasValue = false
                        break
                    }
                }
                if (hasValue) {
                    dragonIdsResponse.push(currentId)
                }
            }
        }
    }
    return dragonIdsResponse
}

function getMarketDragonFilters(dragon: IMarketDragon): IMarketFilter[] {
    const filters: IMarketFilter[] = []
    filters.push(getMarketFilter())
    filters.push(getMarketFilter({ primaryColor: dragon.primaryColor }))
    filters.push(getMarketFilter({ bodyGenes: dragon.bodyGenes }))
    filters.push(getMarketFilter({ wingGenes: dragon.wingGenes }))
    filters.push(getMarketFilter({ secondaryColor: dragon.secondaryColor }))
    filters.push(getMarketFilter({ hornGenes: dragon.hornGenes }))
    filters.push(getMarketFilter({ hornType: dragon.hornType }))

    // special filters (in progress i guess)
    filters.push(
        getMarketFilter({
            primaryColor: dragon.primaryColor,
            bodyGenes: dragon.bodyGenes,
        })
    )
    filters.push(
        getMarketFilter({
            primaryColor: dragon.primaryColor,
            wingGenes: dragon.wingGenes,
        })
    )
    filters.push(
        getMarketFilter({
            bodyGenes: dragon.bodyGenes,
            wingGenes: dragon.wingGenes,
        })
    )
    filters.push(
        getMarketFilter({
            primaryColor: dragon.primaryColor,
            bodyGenes: dragon.bodyGenes,
            wingGenes: dragon.wingGenes,
        })
    )
    filters.push(
        getMarketFilter({
            primaryColor: dragon.primaryColor,
            secondaryColor: dragon.secondaryColor,
        })
    )
    filters.push(
        getMarketFilter({
            hornGenes: dragon.hornGenes,
            secondaryColor: dragon.secondaryColor,
        })
    )

    return filters
}

export function getMarketFilter(
    filter: Partial<IMarketFilter> = {}
): IMarketFilter {
    return {
        primaryColor: filter.primaryColor ?? 'all',
        bodyGenes: filter.bodyGenes ?? 'all',
        wingGenes: filter.wingGenes ?? 'all',
        secondaryColor: filter.secondaryColor ?? 'all',
        hornGenes: filter.hornGenes ?? 'all',
        hornType: filter.hornType ?? 'all',
    }
}

export function transformMarketFilter(
    filter: IMarketFilter
): { mainFilter: IMarketFilter; secondaryFilter: Partial<IMarketFilter> } {
    const mainFilter = getMarketFilter()
    const bodyGenes = filter.bodyGenes
    const primaryColor = filter.primaryColor
    const wingGenes = filter.wingGenes
    const secondaryColor = filter.secondaryColor
    const hornGenes = filter.hornGenes
    const hornType = filter.hornType

    if (bodyGenes !== 'all') {
        if (primaryColor !== 'all' || wingGenes !== 'all') {
            mainFilter.bodyGenes = bodyGenes
            mainFilter.primaryColor = primaryColor
            mainFilter.wingGenes = wingGenes
        } else if (secondaryColor !== 'all' && hornGenes !== 'all') {
            mainFilter.secondaryColor = secondaryColor
            mainFilter.hornGenes = hornGenes
        } else {
            mainFilter.bodyGenes = bodyGenes
        }
    } else if (primaryColor !== 'all') {
        mainFilter.primaryColor = primaryColor
        if (secondaryColor !== 'all') {
            mainFilter.secondaryColor = secondaryColor
        } else {
            mainFilter.wingGenes = wingGenes
        }
    } else if (filter.secondaryColor !== 'all') {
        mainFilter.secondaryColor = secondaryColor
        mainFilter.hornGenes = hornGenes
    } else if (filter.wingGenes !== 'all') {
        mainFilter.wingGenes = wingGenes
    } else if (filter.hornGenes !== 'all') {
        mainFilter.hornGenes = hornGenes
    } else if (filter.hornType !== 'all') {
        mainFilter.hornType = hornType
    }

    return {
        mainFilter,
        secondaryFilter: getSecondaryFilter(filter, mainFilter),
    }
}

function getSecondaryFilter(
    filter: IMarketFilter,
    mainFilter: IMarketFilter
): Partial<IMarketFilter> {
    const secondaryFilter: Partial<IMarketFilter> = {}
    const keys = Object.keys(filter)
    keys.forEach((key) => {
        if (filter[key] != mainFilter[key]) {
            if (filter[key] != 'all') {
                secondaryFilter[key] = filter[key]
            }
        }
    })
    return secondaryFilter
}
