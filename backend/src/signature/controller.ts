/** @format */
import { getSignature } from './utils'

/**
 * POST request that requires privateKey in the body.
 * @param req
 * @param res
 * @param next
 */
export async function sign(req, res, next) {
    const { privateKey } = req.body
    const { blockNumber, blockNumberSignature } = await getSignature(privateKey)
    res.json({ blockNumber, blockNumberSignature })
}
