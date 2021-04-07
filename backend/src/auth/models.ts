/** @format */

import { Schema, model } from 'mongoose'

const credentialsSchema = new Schema({
    temporaryId: { type: String, required: true },
    accountId: { type: String, required: true },
    privateKey: { type: String, required: true },
})

const Credentials = model('Credentials', credentialsSchema)

export { Credentials }
