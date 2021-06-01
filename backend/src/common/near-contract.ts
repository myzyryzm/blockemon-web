/** @format */
import fs from 'fs'
import nearAPI from 'near-api-js'
import getConfig from './config'
const { nodeUrl, networkId, contractName, contractMethods } = getConfig()
const {
    keyStores: { InMemoryKeyStore },
    Near,
    Account,
    Contract,
    KeyPair,
} = nearAPI

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

module.exports = {
    near,
    keyStore,
    connection,
    contract,
    contractName,
    contractAccount,
}
