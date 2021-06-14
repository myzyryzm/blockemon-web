/** @format */

interface IDragon {
    id: string
    owner: string
    parent1: string
    parent2: string
    genes: number[]
    baseSpeed: number
    baseAttack: number
    baseDefense: number
    baseHealth: number
    bodyColors: number[]
    wingColor: number
    hornColor: number
    backColor: number
    toothColor: number
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
}

export { IDragon, IDragonResponse }