/** @format */
import fs from 'fs'
import nearAPI from 'near-api-js'
import getConfig from './config'

const {
    keyStores: { InMemoryKeyStore },
    Near,
    Account,
    Contract,
    KeyPair,
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

const keyStore = new InMemoryKeyStore()
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

export { keyStore, near, connection, contractAccount, contract, config }
