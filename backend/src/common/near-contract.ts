/** @format */
import fs from 'fs'
import * as nearAPI from 'near-api-js'
import getConfig from './config'

const {
    keyStores,
    Near,
    Account,
    Contract,
    KeyPair,
    utils,
    connect,
    providers,
} = nearAPI

const config = getConfig()
const { nodeUrl, networkId, contractName, contractMethods } = config

const credentials = JSON.parse(
    // @ts-ignore
    fs.readFileSync(
        process.env.HOME +
            '/.near-credentials/testnet/' +
            contractName +
            '.json'
    )
)

const keyStore = new keyStores.InMemoryKeyStore()
keyStore.setKey(
    networkId,
    contractName,
    KeyPair.fromString(credentials.private_key)
)
const near = new Near({
    networkId,
    nodeUrl,
    deps: { keyStore },
})
const { connection } = near
const contractAccount = new Account(connection, contractName)
const contract = new Contract(contractAccount, contractName, contractMethods)

export {
    keyStore,
    keyStores,
    near,
    connection,
    contractAccount,
    contract,
    config,
    utils,
    connect,
    providers,
}
