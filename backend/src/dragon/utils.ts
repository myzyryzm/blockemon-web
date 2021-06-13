/** @format */

import { NUMBER_2_LETTER_OFFSET, S3_BASE_URL } from '../common/constants'
import { IDragon, IDragonResponse } from './models'

export function getDragonPayload(dragon: IDragon): IDragonResponse {
    const hasMarkings = dragon.genes[6] === 0
    const numGenes = dragon.genes.length
    const genesLetter: string[] = []
    for (let i = 0; i < numGenes; i++) {
        const gene = dragon.genes[i]
        const letter = String.fromCharCode(NUMBER_2_LETTER_OFFSET + i)
        genesLetter.push(
            gene === 0
                ? `${letter.toLowerCase()}${letter.toLowerCase()}`
                : letter.toUpperCase()
        )
    }
    let markingsPath = `${genesLetter[7]}${genesLetter[8]}${genesLetter[9]}`
    markingsPath = hasMarkings ? markingsPath : markingsPath.toUpperCase()
    const baseName = hasMarkings ? `${dragon.bodyColors[1]}.png` : '0.png'
    const bodyTexture = `${S3_BASE_URL}/${genesLetter[0]}${genesLetter[1]}${genesLetter[2]}/${genesLetter[3]}${genesLetter[4]}${genesLetter[5]}/${genesLetter[6]}/${markingsPath}/${dragon.bodyColors[0]}/${baseName}`
    const hornTexture = `${S3_BASE_URL}/${genesLetter[13]}${genesLetter[14]}${genesLetter[15]}/${dragon.hornColor}.png`
    const backTexture = `${S3_BASE_URL}/${genesLetter[13]}${genesLetter[14]}${genesLetter[15]}/${dragon.backColor}.png`
    const wingTexture = `${S3_BASE_URL}/${genesLetter[16]}${genesLetter[17]}${genesLetter[18]}/${dragon.bodyColors[0]}/${dragon.wingColor}.png`

    let hornType = 0
    const hornGene1 = dragon.genes[10]
    const hornGene2 = dragon.genes[11]
    const hornGene3 = dragon.genes[12]
    if (hornGene1 > 0) {
        if (hornGene2 > 0) {
            if (hornGene3 > 0) {
                hornType = 1
            } else {
                hornType = 5
            }
        } else {
            if (hornGene3 > 0) {
                hornType = 3
            } else {
                hornType = 7
            }
        }
    } else {
        if (hornGene2 > 0) {
            if (hornGene3 > 0) {
                hornType = 2
            } else {
                hornType = 6
            }
        } else {
            if (hornGene3 > 0) {
                hornType = 4
            } else {
                hornType = 8
            }
        }
    }

    return {
        id: dragon.id,
        owner: dragon.owner,
        genes: dragon.genes,
        baseSpeed: dragon.baseSpeed,
        baseAttack: dragon.baseAttack,
        baseDefense: dragon.baseDefense,
        baseHealth: dragon.baseHealth,
        bodyTexture,
        backTexture,
        wingTexture,
        hornTexture,
        hornType,
    }
}
