/** @format */
import { Schema, model } from 'mongoose'
import { MAIN_LOOKUP_TYPES, NEW_LOOKUP_TYPES } from './constants'

const dragonSchema = new Schema({
    id: String,
    media: String,
    owner: String,
    price: String,
    bodyGenes: String,
    wingGenes: String,
    hornGenes: String,
    hornType: String,
    primaryColor: String,
    secondaryColor: String,
})

const Dragon = model('Dragon', dragonSchema)

const marketSchema = new Schema({
    lookupType: {
        type: String,
        enum: [...MAIN_LOOKUP_TYPES, 'all', ...NEW_LOOKUP_TYPES],
        required: true,
    },
    lookupValue: { type: String, required: true },
    dragonIds: [String],
    dragons: [dragonSchema],
    // primaryColor: String,
    // bodyGenes: String,
    // wingGenes: String,
    // secondaryColor: String,
    // hornGenes: String,
    // hornType: String,
})

marketSchema.index({ 'dragons.price': 1 })

const Market = model('Market', marketSchema)

const dragonMarketSchema = new Schema({
    dragons: [dragonSchema],
    primaryColor: String, // 8
    bodyGenes: String, // 16
    wingGenes: String, // 8
    secondaryColor: String, // 8
    hornGenes: String, // 8
    hornType: String, // 4
})

dragonMarketSchema.index({ 'dragons.price': 1 })

const DragonMarket = model('DragonMarket', dragonMarketSchema)

export { Market, Dragon, DragonMarket }
