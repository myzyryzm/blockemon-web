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
}

export { IDragon }
