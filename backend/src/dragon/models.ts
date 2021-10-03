/** @format */
import { Schema, model } from 'mongoose'

const dragonSchema = new Schema({
    id: String,
    owner: String,
    price: Number,
    bodyGenes: String,
    wingGenes: String,
    hornGenes: String,
    hornType: String,
    primaryColor: String,
    secondaryColor: String,
})

dragonSchema.index({ price: 1 })

const Dragon = model('Dragon', dragonSchema)

const dragonMarketSchema = new Schema({
    dragons: [dragonSchema],
    primaryColor: String, // 8
    bodyGenes: String, // 16
    wingGenes: String, // 8
    secondaryColor: String, // 8
    hornGenes: String, // 8
    hornType: String, // 4
    chunk: Number,
})

const DragonMarket = model('DragonMarket', dragonMarketSchema)

const marketVersionSchema = new Schema({
    primaryColor: String,
    bodyGenes: String,
    wingGenes: String,
    secondaryColor: String,
    hornGenes: String,
    hornType: String,
    version: Number,
    numberOfEntries: Number,
})

const MarketVersion = model('MarketVersion', marketVersionSchema)

export { Dragon, DragonMarket, MarketVersion }
