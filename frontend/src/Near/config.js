/** @format */
const contractName = 'dev-1616732136326-5923628'

module.exports = function getConfig() {
    let config = {
        networkId: 'default',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        contractName,
    }

    if (process.env.REACT_APP_ENV !== undefined) {
        config = {
            ...config,
            GAS: '200000000000000',
            contractMethods: {
                changeMethods: [
                    'createPokemon',
                    'deletePokemon',
                    'transferPokemon',
                    'healPokemon',
                    'trainPokemon',
                ],
                viewMethods: [
                    'getPokemonByOwner',
                    'getPokemonById',
                    'getAllPokemon',
                ],
            },
        }
    }

    if (process.env.REACT_APP_ENV === 'prod') {
        config = {
            ...config,
            networkId: 'mainnet',
            nodeUrl: 'https://rpc.mainnet.near.org',
            walletUrl: 'https://wallet.near.org',
            helperUrl: 'https://helper.mainnet.near.org',
            contractName: 'near',
        }
    }

    return config
}
