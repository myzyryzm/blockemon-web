/** @format */

import bs58 from 'bs58'
import { Account, WalletAccount } from 'near-api-js'
import { FinalExecutionOutcome } from 'near-api-js/lib/providers'
import tweetnacl_1 from 'tweetnacl'
import { utils, config, keyStores, connect, providers } from './near-contract'

function baseDecode(value) {
    return Buffer.from(bs58.decode(value))
}

function uint8ToString(myUint8Arr) {
    return String.fromCharCode.apply(null, myUint8Arr)
}

export function verifyMessage(
    message: string,
    signedMessage: number[],
    publicKey: string
): boolean {
    const decodedPublic = baseDecode(publicKey)
    const signedMsgArray = new Uint8Array(signedMessage)
    const openedMessage = uint8ToString(
        tweetnacl_1.sign.open(signedMsgArray, decodedPublic)
    )

    return message === openedMessage
}

export async function getAccountByKey(accountId, privateKey) {
    privateKey = privateKey.replace('"', '')

    const keyPair = utils.KeyPair.fromString(privateKey)
    const keyStore = new keyStores.InMemoryKeyStore()
    keyStore.setKey(config.networkId, accountId, keyPair)

    const near = await connect({
        networkId: config.networkId,
        deps: { keyStore },
        masterAccount: accountId,
        nodeUrl: config.nodeUrl,
        walletUrl: config.walletUrl,
    })

    return await near.account(accountId)
}
// 'ed25519:7Kv5pZGHUz2ih8gaTDBUG781PzNRL7Yma1xCjEL3PHyp'
export async function getWalletAccountByKey(accountId, privateKey, publicKey) {
    // publicKey = 'ed25519:7Kv5pZGHUz2ih8gaTDBUG781PzNRL7Yma1xCjEL3PHyp'
    privateKey = privateKey.replace('"', '')

    const keyPair = utils.KeyPair.fromString(privateKey)
    const keyStore = new keyStores.InMemoryKeyStore()
    keyStore.setKey(config.networkId, accountId, keyPair)

    const near = await connect({
        networkId: config.networkId,
        deps: { keyStore },
        masterAccount: accountId,
        nodeUrl: config.nodeUrl,
        walletUrl: config.walletUrl,
    })
    const authData = {
        allKeys: [publicKey],
        accountId,
    }
    // @ts-ignore
    const wallet = new WalletAccount(near, undefined, authData)
    return await wallet.account()
}

export async function call(accountId, privateKey, tokens, method, params) {
    const account: Account = await getAccountByKey(accountId, privateKey)
    let functionCallResponse: FinalExecutionOutcome | undefined
    if (!tokens) {
        functionCallResponse = await account.functionCall(
            config.contractName,
            method,
            params,
            // @ts-ignore
            config.GAS
        )
    } else {
        functionCallResponse = await account.functionCall(
            config.contractName,
            method,
            params,
            // @ts-ignore
            config.GAS,
            // @ts-ignore
            utils.format.parseNearAmount(tokens)
        )
    }

    const result = providers.getTransactionLastResult(functionCallResponse)
    return result
}

export async function getSignedTransactionUrl(
    accountId,
    privateKey,
    publicKey,
    tokens,
    method,
    params
) {
    const walletAccount = await getWalletAccountByKey(
        accountId,
        privateKey,
        publicKey
    )
    const functionCallResponse = await walletAccount.functionCall(
        config.contractName,
        method,
        params,
        // @ts-ignore
        config.GAS,
        // @ts-ignore
        utils.format.parseNearAmount(tokens)
    )
    return functionCallResponse
}

export async function sendMoney(accountId, privateKey, tokens) {
    const account: Account = await getAccountByKey(accountId, privateKey)
    const b = await account.getAccountBalance()
    const functionCallResponse = await account.sendMoney(
        config.contractName,
        // @ts-ignore
        utils.format.parseNearAmount(tokens)
    )
    const result = providers.getTransactionLastResult(functionCallResponse)
    return result
}
