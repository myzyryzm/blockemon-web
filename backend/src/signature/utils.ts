/** @format */
import { Account, Near, keyStores, KeyPair } from 'near-api-js'
import getConfig from '../common/config'
import { ISignature } from './commonRequirements'
const { networkId, nodeUrl, contractName } = getConfig()

const { InMemoryKeyStore } = keyStores

/**
 * Method that from frontend to sign whatever transaction.  A client (phone, tablet, computer...) will make an api request with their private key to sign their message. The blockNumber and blockNumberSignature are returned from this function
 * @param privateKey
 * @param accountId
 */
export const getSignature = async (
    privateKey: string,
    accountId: string = contractName
): Promise<ISignature> => {
    // construct account from privateKey
    const keyStore = new InMemoryKeyStore()
    const kp = KeyPair.fromString(privateKey)
    await keyStore.setKey(networkId, contractName, kp)
    const near = new Near({
        networkId,
        nodeUrl,
        deps: { keyStore },
    })
    const account = new Account(near.connection, accountId)
    const block = await account.connection.provider.block({ finality: 'final' })
    const blockNumber = block.header.height.toString()
    // need ts-ignore b/c inMemorySigner does not exist on account
    // @ts-ignore
    const signer = account.inMemorySigner || account.connection.signer
    const signed = await signer.signMessage(
        Buffer.from(blockNumber),
        accountId,
        networkId
    )
    const blockNumberSignature = Buffer.from(signed.signature).toString(
        'base64'
    )
    return { blockNumber, blockNumberSignature }
}

/**
 * Input an account, a blockNumber and a blockNumberSignature to see if whatever request that is being made is signed for.
 * @param accountId
 * @param blockNumber
 * @param blockNumberSignature
 */
export async function verifySignature(
    accountId: string,
    blockNumber: string,
    blockNumberSignature: string
) {}
