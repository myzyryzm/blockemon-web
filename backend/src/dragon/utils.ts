/** @format */

import { NUMBER_2_LETTER_OFFSET, S3_BASE_URL } from '../common/constants'
import { IDragon, IDragonResponse } from './models'

// bodyBase (8) => ABC (ABC => scales; aBC => no scales; AbC => alt1; abC => alt2; ABc => alt3; aBc => alt4; Abc => alt5; abc => alt6)
// bodyUnder (5) => DEF (D => no belly; dEF => belly; deF => alt1; dEf => alt2;  def => alt3)
// markings (9) => GHIJ (G => no markings; gHIJ => spots1; ghIJ => spots2; gHiJ => spots3; ghiJ => alt1; gHIj => alt2; ghIj => alt3; gHij => alt4; ghij => alt5)
// horns (8) => KLM (KLM => Horn1; kLM => Horn2; KlM => Horn3; klM => Horn4; KLm => Horn5; kLm => Horn6; Klm => Horn7; klm => Horn8)
// hornStyle (8) => NOP (NOP => solid; nOP => striped; NoP => alt1; noP => alt2; NOp => alt3; nOp => alt4; Nop => alt5; nop => alt6)
// wingStyle (8) => QRS (QRS => 1 color; qRS => 2 color; QrS => alt1; qrS => alt2; QRs => alt3; qRs => alt4; Qrs => alt5; qrs => alt6)
// TUVWX => tbd (just use them as fillers for rn)

export function getDragonPayload(dragon: IDragon): IDragonResponse {
    const hasBelly = dragon.genes[3] === 0
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
    const bodyPath = `${genesLetter[0]}${genesLetter[1]}${genesLetter[2]}`
    let bellyPath = `${genesLetter[3]}${genesLetter[4]}${genesLetter[5]}`
    bellyPath = hasBelly ? bellyPath : bellyPath.toUpperCase()
    let markingsPath = `${genesLetter[6]}${genesLetter[7]}${genesLetter[8]}${genesLetter[9]}`
    markingsPath = hasMarkings ? markingsPath : markingsPath.toUpperCase()
    let finalPath = ''
    if (hasBelly && hasMarkings) {
        finalPath = `${dragon.bodyColors[0]}/${dragon.bodyColors[1]}/${dragon.bodyColors[2]}/0.png`
    } else if (hasBelly) {
        finalPath = `${dragon.bodyColors[0]}/${dragon.bodyColors[1]}/none/0.png`
    } else if (hasMarkings) {
        finalPath = `${dragon.bodyColors[0]}/none/${dragon.bodyColors[2]}/0.png`
    } else {
        finalPath = `${dragon.bodyColors[0]}/none/none/0.png`
    }
    const bodyTexture = `${S3_BASE_URL}/${bodyPath}/${bellyPath}/${markingsPath}/${finalPath}`
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
