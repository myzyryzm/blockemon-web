/** @format */

export interface IMarketDragonResponse extends IMarketDragon {
    oldPrice: string
}

export interface IMarketDragon {
    id: string
    owner: string
    primaryColor: string
    secondaryColor: string
    bodyGenes: string
    wingGenes: string
    hornGenes: string
    hornType: string
    price: string
    media: string
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
    hornType: number

    bodyGenesSequence: string
    wingGenesSequence: string
    hornGenesSequence: string
    moveGenesSequence: string

    price: string

    media: string
    media_hash: string
}

export interface IFilter {
    lookupType: string
    lookupValue?: string
}

export interface IMarketFilter {
    primaryColor: string
    bodyGenes: string
    wingGenes: string
    secondaryColor: string
    hornGenes: string
    hornType: string
}
