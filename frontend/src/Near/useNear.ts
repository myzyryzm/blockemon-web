/** @format */
import * as nearAPI from 'near-api-js'
import { INearHook } from './commonRequirements'
import getConfig from './config'
import bs58 from 'bs58'

const {
    keyStores,
    Near,
    Account,
    Contract,
    WalletAccount,
    providers,
    utils,
} = nearAPI

//network config (replace testnet with mainnet or betanet)

//   const TX_HASH = "9av2U6cova7LZPA9NPij6CTUrpBbgPG6LKVkyhcCqtk3";
//   // account ID associated with the transaction
//   const ACCOUNT_ID = "sender.testnet";

//   getState(TX_HASH, ACCOUNT_ID);

//   async function getState(txHash, accountId) {
//     const result = await provider.txStatus(txHash, accountId);
//     console.log("Result: ", result);
//   }

export default function useNear(): INearHook {
    const config = getConfig()
    const {
        nodeUrl,
        networkId,
        contractName,
        contractMethods,
        walletUrl,
    } = config
    const near = new Near({
        networkId,
        nodeUrl,
        walletUrl,
        deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() },
    })
    // @ts-ignore
    const wallet = new WalletAccount(near, undefined)

    const contractAccount = new Account(near.connection, contractName)
    const contract = new Contract(
        contractAccount,
        contractName,
        contractMethods
    )

    function signOut() {
        wallet.signOut()
    }

    function signIn() {
        wallet.requestSignIn(contractName, 'Dragon Breeding')
    }

    function isSignedIn() {
        return wallet.isSignedIn()
    }

    function accountId() {
        return wallet.getAccountId()
    }

    async function functionCallTest() {
        const functionCallResponse = await wallet.account().functionCall(
            contractName,
            'addDragonToMarket',
            { id: 1, price: '1' },
            // @ts-ignore
            config.GAS,
            // @ts-ignore
            utils.format.parseNearAmount('0.1')
        )
        console.log(functionCallResponse)
        const result = providers.getTransactionLastResult(functionCallResponse)
        return result
    }

    async function transactionStatus(txHash: string) {
        if (isSignedIn()) {
            const txStatus = await near.connection.provider.txStatus(
                // @ts-ignore
                bs58.decode(txHash),
                accountId()
            )
            const result = providers.getTransactionLastResult(txStatus)
            // console.log('result', result)
            return result
        }
        return undefined
    }

    return {
        near,
        wallet,
        contractAccount,
        contract,
        signIn,
        isSignedIn,
        account: wallet.account(),
        functionCallTest,
        accountId,
        transactionStatus,
        signOut,
    }
}
