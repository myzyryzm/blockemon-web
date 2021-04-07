/** @format */

import { Account, Near, keyStores, KeyPair, utils } from 'near-api-js'
import getConfig from '../common/config'
const { networkId, nodeUrl, contractName } = getConfig()

const { InMemoryKeyStore } = keyStores
const { parseNearAmount } = utils.format

/**
 * checks if an account has access to the contract (i.e. is logged in)
 *
 * @format
 * @param accountId
 * @param privateKey
 */
export async function canAccessContract(
    accountId: string,
    privateKey: string
): Promise<boolean> {
    const keyStore = new InMemoryKeyStore()
    let kp: KeyPair
    try {
        kp = KeyPair.fromString(privateKey)
    } catch (e) {
        return false
    }
    const near = new Near({
        networkId,
        nodeUrl,
        deps: { keyStore },
    })
    const account = new Account(near.connection, accountId)
    const accessKeys = await account.getAccessKeys()
    const publicKey = kp.getPublicKey().toString()
    return accessKeys.some((key) => {
        return (
            key.access_key.permission === 'FullAccess' &&
            key.public_key === publicKey
        )
    })
    // below is more fitting b/c it checks if the user has access to the contract, not just if the privateKey/publicKey exists and has full access (as seen above)
    return accessKeys.some((key) => {
        const permission = key.access_key.permission
        return (
            permission &&
            permission.FunctionCall &&
            permission.FunctionCall.receiver_id === contractName &&
            key.public_key === publicKey
        )
    })
}

/**
 * Adds an access key for the given account for the contract.
 * TODO: add some type of authentication to these routes cuz this is a dangerous route to keep public.
 * THIS DOESNT WORK
 * @deprecated
 * @param accountId
 * @param privateKey
 */
export async function addAccessKey(accountId: string, privateKey: string) {
    const keyStore = new InMemoryKeyStore()
    const kp = KeyPair.fromString(privateKey)
    await keyStore.setKey(networkId, accountId, kp)
    const near = new Near({
        networkId,
        nodeUrl,
        deps: { keyStore },
    })

    const account = new Account(near.connection, accountId)

    // if able to add key then want to return true
    await account.addKey(
        kp.getPublicKey(),
        account.accountId,
        [],
        // @ts-ignore (parseNearAmount returns a string but the argument needs to be of type BN)
        parseNearAmount('0.1')
    )
    try {
        return true
    } catch (e) {
        return false
    }
}
