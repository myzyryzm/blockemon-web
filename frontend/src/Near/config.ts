/** @format */

import { IConfig } from './commonRequirements'
const devContract = 'dev-1627145896878-80992661467411'
const prodContract = ''

export default function getConfig(): IConfig {
    let config: IConfig = {
        networkId: 'default',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        contractName: devContract,
        GAS: '200000000000000',
        contractMethods: {
            changeMethods: [
                'breedDragons',
                'addDragonToMarket',
                'removeDragonFromMarket',
                'buyDragon',
            ],
            viewMethods: [
                'getDragonsForOwner',
                'getDragonsOnMarket',
                'getNumberOfDragonsOnMarket',
            ],
        },
    }
    // @ts-ignore
    // if (process.env.REACT_APP_ENV === 'prod') {
    //     config = {
    //         ...config,
    //         networkId: 'mainnet',
    //         nodeUrl: 'https://rpc.mainnet.near.org',
    //         walletUrl: 'https://wallet.near.org',
    //         helperUrl: 'https://helper.mainnet.near.org',
    //         contractName: prodContract,
    //     }
    // }

    return config
}
