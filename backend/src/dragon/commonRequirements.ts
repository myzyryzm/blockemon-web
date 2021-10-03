/** @format */

export interface IMarketDragon {
    id: string
    owner: string
    primaryColor: string
    secondaryColor: string
    bodyGenes: string
    wingGenes: string
    hornGenes: string
    hornType: string
    price: number
}

export interface IDragonResponse {
    id: string
    owner: string
    parent1: number
    parent2: number
    genes: number[]
    colors: number[]
    price: string | null
    oldPrice: string | null
}

export interface IDragon {
    id: string
    owner: string
    parent1: number
    parent2: number

    primaryColor: number
    secondaryColor: number

    bodyGenes: number[]
    wingGenes: number[]
    hornGenes: number[]
    hornTypeGenes: number[]
    moveGenes: number[]

    bodyTexture: string
    wingTexture: string
    backTexture: string
    hornTexture: string
    hornType: number | string

    bodyGenesSequence: string
    wingGenesSequence: string
    hornGenesSequence: string
    moveGenesSequence: string

    price: string

    media: string
}

export interface IMarketFilter {
    primaryColor: string
    bodyGenes: string
    wingGenes: string
    secondaryColor: string
    hornGenes: string
    hornType: string
    chunk?: number
}

export interface IMarketFilterVersion extends IMarketFilter {
    numberOfEntries: number
}

export interface IMarketFilterVersionMap {
    [key: string]: IMarketFilterVersion
}
