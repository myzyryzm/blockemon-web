/** @format */

export interface IConfig {
    networkId: string // default | mainnet
    nodeUrl: string
    walletUrl: string
    helperUrl: string
    contractName: string
    GAS?: string
    contractMethods?: {
        changeMethods: string[]
        viewMethods: string[]
    }
}
