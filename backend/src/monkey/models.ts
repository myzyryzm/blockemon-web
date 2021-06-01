/** @format */

import { Schema, model } from 'mongoose'

const monkeySpeciesSchema = new Schema({
    speciesId: { type: Number, required: true },
    gene1: { type: Number, required: true },
    color1: { type: Number, required: true },
    color2: { type: Number, required: true },
    eyeColor: { type: Number, required: true },
})

const MonkeySpecies = model('MonkeySpecies', monkeySpeciesSchema)

export { MonkeySpecies }
// contractAccount.viewFunction(contractName, 'getMonkeys', {})
