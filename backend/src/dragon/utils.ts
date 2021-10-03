/** @format */

import { Dragon, DragonMarket, MarketVersion } from './models'
import {
    IDragon,
    IDragonResponse,
    IMarketDragon,
    IMarketFilter,
    IMarketFilterVersion,
} from './commonRequirements'
import {
    ALPHABET,
    DEFAULT_RESOULTION,
    MAX_ENTRIES_PER_CHUNK,
    S3_BASE_URL,
} from '../common/constants'

function transformToMarketDragon(
    response: IDragonResponse,
    price: number
): IMarketDragon {
    const primaryColor = response.colors[0].toString()
    const secondaryColor = response.colors[1].toString()
    const bodyGenes = normalizeGenes(response.genes.slice(0, 4))
    const wingGenes = normalizeGenes(response.genes.slice(4, 7))
    const hornGenes = normalizeGenes(response.genes.slice(7, 10))
    const hornTypeGenes = response.genes.slice(10, 12)

    const hornGene1 = hornTypeGenes[0]
    const hornGene2 = hornTypeGenes[1]
    let hornType = '0'
    if (hornGene1 > 0) {
        if (hornGene2 > 0) {
            hornType = '1'
        } else {
            hornType = '3'
        }
    } else {
        if (hornGene2 > 0) {
            hornType = '2'
        } else {
            hornType = '4'
        }
    }
    return {
        owner: response.owner,
        id: response.id,
        primaryColor,
        secondaryColor,
        bodyGenes,
        wingGenes,
        hornGenes,
        hornType,
        price,
    }
}

export async function modifyDragonMarket(
    dragonResponse: IDragonResponse,
    action: 'add' | 'remove'
) {
    const options = { upsert: true, new: true, setDefaultsOnInsert: true }
    const dragon = transformToMarketDragon(
        dragonResponse,
        parseFloat(dragonResponse.price)
    )
    let oldPrice: number = 0
    if (dragonResponse.oldPrice) {
        const numPrice = parseFloat(dragonResponse.oldPrice)
        if (numPrice > 0) {
            oldPrice = numPrice
        }
    }
    const oldDragon = transformToMarketDragon(dragonResponse, oldPrice)
    const filters: IMarketFilter[] = getMarketDragonFilters(dragon)
    const query = {
        id: dragonResponse.id.toString(),
    }
    if (action === 'add') {
        if (oldPrice > 0) {
            if (oldPrice != dragon.price) {
                await DragonMarket.bulkWrite(
                    getBulkPriceWrites(filters, dragon)
                )
            }
        } else {
            await DragonMarket.bulkWrite(getBulkWrites(filters, dragon, action))
        }
        await Dragon.findOneAndUpdate(
            query,
            // @ts-ignore
            {
                $set: {
                    ...dragon,
                },
            },
            options
        )
    } else {
        await DragonMarket.bulkWrite(getBulkWrites(filters, oldDragon, action))
        await Dragon.findOneAndRemove(query)
    }
}

function getBulkPriceWrites(
    filters: IMarketFilter[],
    dragon: IMarketDragon
): any[] {
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
): any[] {
    const updates: any[] = []
    filters.forEach((filter) => {
        const update =
            action === 'add'
                ? { $push: { dragons: dragon } } // #addToSet
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
            marketDragons.push(dragon)
        }
    }
    return marketDragons
}

export async function getFilteredDragons(
    filter: IMarketFilter,
    secondaryFilter: Partial<IMarketFilter>,
    sortOrder: 1 | -1 = 1
): Promise<{ dragons: IMarketDragon[]; dragonIds: string[] }> {
    const result: any = await DragonMarket.find(filter, 'dragons')
    if (result) {
        let dragons: IMarketDragon[] = []
        result.forEach((res) => {
            dragons.push(...res.dragons)
        })
        dragons.sort((a, b) => sortOrder * (a.price - b.price))
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

function getDragonChunk(dragon: IMarketDragon): number {
    return Math.ceil(parseInt(dragon.id) / MAX_ENTRIES_PER_CHUNK)
}

function getMarketDragonFilters(dragon: IMarketDragon): IMarketFilter[] {
    const chunk = getDragonChunk(dragon)
    const filters: IMarketFilter[] = []
    filters.push(getMarketFilter({ chunk }))
    filters.push(getMarketFilter({ primaryColor: dragon.primaryColor, chunk }))
    filters.push(getMarketFilter({ bodyGenes: dragon.bodyGenes, chunk }))
    filters.push(getMarketFilter({ wingGenes: dragon.wingGenes, chunk }))
    filters.push(
        getMarketFilter({ secondaryColor: dragon.secondaryColor, chunk })
    )
    filters.push(getMarketFilter({ hornGenes: dragon.hornGenes, chunk }))
    filters.push(getMarketFilter({ hornType: dragon.hornType, chunk }))

    // special filters (in progress i guess)
    filters.push(
        getMarketFilter({
            primaryColor: dragon.primaryColor,
            bodyGenes: dragon.bodyGenes,
            chunk,
        })
    )
    filters.push(
        getMarketFilter({
            primaryColor: dragon.primaryColor,
            wingGenes: dragon.wingGenes,
            chunk,
        })
    )
    filters.push(
        getMarketFilter({
            bodyGenes: dragon.bodyGenes,
            wingGenes: dragon.wingGenes,
            chunk,
        })
    )
    filters.push(
        getMarketFilter({
            primaryColor: dragon.primaryColor,
            bodyGenes: dragon.bodyGenes,
            wingGenes: dragon.wingGenes,
            chunk,
        })
    )
    filters.push(
        getMarketFilter({
            primaryColor: dragon.primaryColor,
            secondaryColor: dragon.secondaryColor,
            chunk,
        })
    )
    filters.push(
        getMarketFilter({
            hornGenes: dragon.hornGenes,
            secondaryColor: dragon.secondaryColor,
            chunk,
        })
    )

    return filters
}

export async function _seedDatabase(dragonResponses: IDragonResponse[]) {
    const map: IMarketFilterMap = {}
    const dragons: IMarketDragon[] = []
    dragonResponses.forEach((res) => {
        const dragon: IMarketDragon = transformToMarketDragon(
            res,
            parseFloat(res.price)
        )
        dragons.push(dragon)
        getMarketFilterMap(map, dragon)
    })
    // getBulkMapWrites(map)
    // console.log(map.all.dragons.length)
    await DragonMarket.bulkWrite(getBulkMapWrites(map))
    await Dragon.bulkWrite(getBulkDragonWrites(dragons))
}

function getBulkMapWrites(map: IMarketFilterMap): any[] {
    const updates: any[] = []
    const filters = Object.values(map)
    filters.forEach((filter) => {
        const update = { $push: { dragons: filter.dragons } }
        updates.push({
            updateOne: {
                filter: transformFilter(filter),
                update,
                upsert: true,
            },
        })
    })
    return updates
}

function transformFilter(filter: IMarketFilterDragon): IMarketFilter {
    return {
        bodyGenes: filter.bodyGenes,
        wingGenes: filter.wingGenes,
        hornGenes: filter.hornGenes,
        hornType: filter.hornType,
        primaryColor: filter.primaryColor,
        secondaryColor: filter.secondaryColor,
        chunk: filter.chunk,
    }
}

function getBulkDragonWrites(dragons: IMarketDragon[]): any[] {
    const updates: any[] = []
    dragons.forEach((dragon) => {
        const update = { $set: { ...dragon } }
        const filter = { id: dragon.id }
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

interface IMarketFilterDragon extends IMarketFilter {
    dragons: IMarketDragon[]
}

interface IMarketFilterMap {
    [key: string]: IMarketFilterDragon
}

function getMarketFilterMap(map: IMarketFilterMap, dragon: IMarketDragon) {
    const chunk = getDragonChunk(dragon)
    const primaryColor = `primaryColor-${dragon.primaryColor}-${chunk}`
    const secondaryColor = `secondaryColor-${dragon.secondaryColor}-${chunk}`
    const bodyGenes = `bodyGenes-${dragon.bodyGenes}-${chunk}`
    const wingGenes = `wingGenes-${dragon.wingGenes}-${chunk}`
    const hornGenes = `hornGenes-${dragon.hornGenes}-${chunk}`
    const hornType = `hornType-${dragon.hornType}-${chunk}`
    const currentDragonMap: IMarketFilterMap = {
        all: { ...getMarketFilter({}), dragons: [dragon] },
        [primaryColor]: {
            ...getMarketFilter({ primaryColor: dragon.primaryColor, chunk }),
            dragons: [dragon],
        },
        [secondaryColor]: {
            ...getMarketFilter({
                secondaryColor: dragon.secondaryColor,
                chunk,
            }),
            dragons: [dragon],
        },
        [bodyGenes]: {
            ...getMarketFilter({ bodyGenes: dragon.bodyGenes, chunk }),
            dragons: [dragon],
        },
        [wingGenes]: {
            ...getMarketFilter({ wingGenes: dragon.wingGenes, chunk }),
            dragons: [dragon],
        },
        [hornGenes]: {
            ...getMarketFilter({ hornGenes: dragon.hornGenes, chunk }),
            dragons: [dragon],
        },
        [hornType]: {
            ...getMarketFilter({ hornType: dragon.hornType, chunk }),
            dragons: [dragon],
        },
        [`${primaryColor}-${bodyGenes}-${chunk}`]: {
            ...getMarketFilter({
                primaryColor: dragon.primaryColor,
                bodyGenes: dragon.bodyGenes,
                chunk,
            }),
            dragons: [dragon],
        },
        [`${primaryColor}-${wingGenes}-${chunk}`]: {
            ...getMarketFilter({
                primaryColor: dragon.primaryColor,
                wingGenes: dragon.wingGenes,
                chunk,
            }),
            dragons: [dragon],
        },
        [`${bodyGenes}-${wingGenes}-${chunk}`]: {
            ...getMarketFilter({
                bodyGenes: dragon.bodyGenes,
                wingGenes: dragon.wingGenes,
                chunk,
            }),
            dragons: [dragon],
        },
        [`${primaryColor}-${bodyGenes}-${wingGenes}-${chunk}`]: {
            ...getMarketFilter({
                primaryColor: dragon.primaryColor,
                bodyGenes: dragon.bodyGenes,
                wingGenes: dragon.wingGenes,
                chunk,
            }),
            dragons: [dragon],
        },
        [`${primaryColor}-${secondaryColor}-${chunk}`]: {
            ...getMarketFilter({
                primaryColor: dragon.primaryColor,
                secondaryColor: dragon.secondaryColor,
                chunk,
            }),
            dragons: [dragon],
        },
        [`${secondaryColor}-${hornGenes}-${chunk}`]: {
            ...getMarketFilter({
                secondaryColor: dragon.secondaryColor,
                hornGenes: dragon.hornGenes,
                chunk,
            }),
            dragons: [dragon],
        },
    }
    const ids = Object.keys(currentDragonMap)

    ids.forEach((id) => {
        if (map[id]) {
            map[id].dragons.push(dragon)
        } else {
            map[id] = currentDragonMap[id]
        }
    })
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
        chunk: filter.chunk ?? 1,
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

export function transformDragonResponse(response: IDragonResponse): IDragon {
    const primaryColor = response.colors[0]
    const secondaryColor = response.colors[1]
    const bodyGenes = response.genes.slice(0, 4)
    const wingGenes = response.genes.slice(4, 7)
    const hornGenes = response.genes.slice(7, 10)
    const hornTypeGenes = response.genes.slice(10, 12)
    const moveGenes = response.genes.slice(12, 16)
    const bodyTexture = geneArrayToString(bodyGenes, primaryColor)
    const wingTexture = geneArrayToString([...wingGenes, 0], primaryColor)
    const hornTexture = geneArrayToString([...hornGenes, 0], secondaryColor)
    const backTexture = hornTexture

    const hornGene1 = hornTypeGenes[0]
    const hornGene2 = hornTypeGenes[1]
    let hornType = '0'
    if (hornGene1 > 0) {
        if (hornGene2 > 0) {
            hornType = '1'
        } else {
            hornType = '3'
        }
    } else {
        if (hornGene2 > 0) {
            hornType = '2'
        } else {
            hornType = '4'
        }
    }

    const media = getS3Url(
        hornType,
        response.genes,
        primaryColor,
        secondaryColor
    )

    const bodyGenesSequence = getSequence(response.genes, 0, 4)
    const wingGenesSequence = getSequence(response.genes, 4, 3)
    const hornGenesSequence =
        getSequence(response.genes, 7, 3) + getSequence(response.genes, 10, 2)
    const moveGenesSequence = getSequence(response.genes, 12, 4)

    return {
        id: response.id,
        owner: response.owner,
        parent1: response.parent1,
        parent2: response.parent2,
        primaryColor,
        secondaryColor,
        bodyGenes,
        wingGenes,
        hornGenes,
        hornTypeGenes,
        moveGenes,
        bodyTexture,
        wingTexture,
        hornTexture,
        backTexture,
        hornType,
        bodyGenesSequence,
        wingGenesSequence,
        moveGenesSequence,
        hornGenesSequence,
        media,
        price: response.price,
    }
}

function normalizeGenes(genes: number[]): string {
    let s: string = ''
    const numGenes = genes.length
    for (let i = 0; i < numGenes; i++) {
        const normalizedGene: number = genes[i] > 0 ? 1 : 0
        s += normalizedGene.toString()
    }
    return s
}

function geneArrayToString(genes: number[], color: number | string): string {
    const s: string = normalizeGenes(genes) + '/' + color.toString()
    return s
}

function getSequence(
    genes: number[],
    start: number,
    numberOfGenes: number
): string {
    let sequence = ''
    for (let i: number = start; i < start + numberOfGenes; i++) {
        const gene: number = genes[i]
        const char: string = ALPHABET[i]
        if (gene === 2) {
            sequence += char.toUpperCase() + char.toUpperCase()
        } else if (gene === 1) {
            sequence += char.toUpperCase() + char.toLowerCase()
        } else {
            sequence += char.toLowerCase() + char.toLowerCase()
        }
    }
    return sequence
}

function getS3Url(
    hornType: string,
    genes: number[],
    primaryColor: number | string,
    secondaryColor: number | string
): string {
    const s: string =
        S3_BASE_URL +
        '/Dragons/' +
        hornType.toString() +
        '/' +
        normalizeGenes(genes.slice(0, 4)) +
        '/' +
        normalizeGenes(genes.slice(4, 7)) +
        '/' +
        normalizeGenes(genes.slice(7, 10)) +
        '/' +
        primaryColor.toString() +
        '/' +
        secondaryColor.toString() +
        '/' +
        DEFAULT_RESOULTION.toString() +
        '.png'
    return s
}
