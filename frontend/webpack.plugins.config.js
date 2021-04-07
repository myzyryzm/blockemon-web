/** @format */

const webpack = require('webpack')
const BundleTracker = require('webpack-bundle-tracker')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const Dotenv = require('dotenv-webpack')

/**
 * Decentralized configuration for webpack plugins
 * @param {boolean} productionMode
 * @param {object} env - env variable object
 * @return {Array.<object>} an array of plugins to be used in `webpack.config.js`
 */
exports.default = function(productionMode) {
    let pluginsArrays = []
    if (productionMode) {
        // Define PRODUCTION variables
        pluginsArrays.push(
            new webpack.DefinePlugin({
                'process.env.REACT_APP_ENV': JSON.stringify('prod'),
            })
        )
    } else {
        pluginsArrays.push(
            new webpack.DefinePlugin({
                'process.env.REACT_APP_ENV': JSON.stringify('dev'),
            })
        )
        // Define DEVELOPMENT variables
        // Enable HMR
        pluginsArrays.push(new webpack.LoaderOptionsPlugin({ debug: true }))
        pluginsArrays.push(new webpack.HotModuleReplacementPlugin())
    }

    pluginsArrays.push(new Dotenv())

    pluginsArrays.push(new webpack.HashedModuleIdsPlugin())

    pluginsArrays.push(
        new BundleTracker({
            filename: '../build/webpack-stats.json',
        })
    )
    pluginsArrays.push(new webpack.ProvidePlugin({ ReactGA: 'react-ga' }))
    pluginsArrays.push(new CleanWebpackPlugin())
    pluginsArrays.push(
        new HtmlWebPackPlugin({
            template: './src/index.html',
            filename: 'index.html',
            title: 'Blockemon',
        })
    )
    pluginsArrays.push(
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].css',
            chunkFilename: '[id].css',
        })
    )
    pluginsArrays.push(new CompressionPlugin())

    // wavesurfer.js is required to produce waveforms for audio
    pluginsArrays.push(
        new webpack.ProvidePlugin({
            WaveSurfer: 'wavesurfer.js',
        })
    )
    return pluginsArrays
}
