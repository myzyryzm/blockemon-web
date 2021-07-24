/** @format */

interface IDragon {
    id: string
    owner: string
    parent1: number
    parent2: number

    baseSpeed: number
    baseAttack: number
    baseDefense: number
    baseHealth: number

    bodyColor: number
    wingColor: number
    hornColor: number
    backColor: number
    toothColor: number
    eyeColor: number

    bodyGenes: number[]
    wingGenes: number[]
    hornGenes: number[]
    backGenes: number[]
    hornTypeGenes: number[]
    extraGenes: number[]

    bodyTexture: string
    wingTexture: string
    backTexture: string
    hornTexture: string
    hornType: number

    price?: string
}

interface IDragonResponse {
    id: string
    owner: string
    genes: number[]
    baseSpeed: number
    baseAttack: number
    baseDefense: number
    baseHealth: number
    bodyTexture: string
    wingTexture: string
    backTexture: string
    hornTexture: string
    hornType: number
    price: string
}

export { IDragon, IDragonResponse }
