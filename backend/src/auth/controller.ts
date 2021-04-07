/** @format */
import { validationResult } from 'express-validator'
import { v4 as uuidv4 } from 'uuid'
import { addAccessKey, canAccessContract } from './utils'
import { Credentials } from './models'
import HttpError from '../common/http-error'

/**
 * Check if the user has access to the contract. Will be run every time the user accesses the app from their device.
 * @param req
 * @param res
 * @param next
 * @returns
 */
export async function isLoggedIn(req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        )
    }
    const { accountId, privateKey } = req.body
    if (!(await canAccessContract(accountId, privateKey))) {
        return res.status(403).json({ error: 'Account does not have access' })
    }
    res.status(200).json({ msg: 'ok' })
}

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
        credentials = await Credentials.find({ temporaryId: id })
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

/**
 * This will run after authorizing an account with near.  A user passes in their accountId and privateKey and a temporaryId will be created.  The temporaryId is returned to the frontend where the user can copy it and paste it into whatever device they are using.
 * @param req
 * @param res
 * @param next
 * @returns
 */
export async function createCredentials(req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        )
    }
    const { accountId, privateKey } = req.body

    const temporaryId = uuidv4()

    const createdCredentials = new Credentials({
        temporaryId,
        accountId,
        privateKey,
    })

    try {
        await createdCredentials.save()
    } catch (err) {
        const error = new HttpError('Creating credentials failed.', 500)
        return next(error)
    }

    res.status(200).send({ credentials: createdCredentials })
}

/**
 * This endpoint creates an access key
 * @deprecated this never worked
 * @param req
 * @param res
 * @param next
 */
export async function createAccessKey(req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        )
    }
    const { accountId, privateKey } = req.body
    if (!(await addAccessKey(accountId, privateKey))) {
        return res.status(400).send({ error: 'couldnt create' })
    }
    res.send({ msg: 'added' })
}
