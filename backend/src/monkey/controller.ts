/** @format */
import { validationResult } from 'express-validator'
import { v4 as uuidv4 } from 'uuid'
import { MonkeySpecies } from './models'
import HttpError from '../common/http-error'

/**
 * user sends a temporary id (prolly a uuid) from their client which retrieves their near account name and their secret key from mongodb.  once retrieved it deletes the entry from the mongodb database (the id is single usage).
 * @param req
 * @param res
 * @param next
 */
export async function getCredentials(req, res, next) {
    const id = req.params.cid

    let credentials
    try {
        credentials = await MonkeySpecies.find({ speciesId: id })
    } catch (err) {
        const error = new HttpError('Couldnt fetch', 500)
        return next(error)
    }

    if (!credentials || credentials.length === 0) {
        return next(new HttpError('no creds.', 404))
    } else if (credentials.length > 1) {
        return next(new HttpError('y', 404))
    }
    const cred = credentials[0]
    const credObj = cred.toObject({ getters: true })
    // delete the credentials
    try {
        await cred.remove()
    } catch (e) {
        // todo: figure out how to handle this
    }
    res.status(200).send({
        credentials: credObj,
    })
}
