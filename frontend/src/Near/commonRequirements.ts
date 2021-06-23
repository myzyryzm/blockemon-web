/** @format */

import { Account, Contract, Near, WalletConnection } from 'near-api-js'
import { FinalExecutionOutcome } from 'near-api-js/lib/providers'

export interface IConfig {
    networkId: string // default | mainnet
    nodeUrl: string
    walletUrl: string
    helperUrl: string
    contractName: string
    GAS: string
    contractMethods: {
        changeMethods: string[]
        viewMethods: string[]
    }
}

export interface INearHook {
    near: Near
    wallet: WalletConnection
    contractAccount: Account
    contract: Contract
    signIn: () => void
    isSignedIn: () => boolean
    account: any
    functionCallTest: () => Promise<any>
    accountId: () => any
    transactionStatus: (txHash: string) => Promise<any>
    signOut: () => void
}
