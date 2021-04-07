/**
 * /* eslint-disable no-unused-vars
 *
 * @format
 */

const path = require('path')
const getModuleRules = require('./webpack.module.rules.config').default
const getPlugins = require('./webpack.plugins.config').default
const TerserPlugin = require('terser-webpack-plugin')

// Default config options needed across all builds
const baseConfig = {
    entry: './src/index.js',
    resolve: {
        // tells webpack where to look for modules
        modules: ['node_modules', 'src'],
        //extensions that should be used to resolve modules
        extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx'],
        alias: {
            wavesurfer: require.resolve('wavesurfer.js'),
        },
    },
}

module.exports = [
    // DEVELOPMENT
    {
        ...baseConfig,

        name: 'dev',
        mode: 'development',
        devServer: {
            contentBase: path.join(__dirname, '../build/static'),
            compress: true,
            inline: true,
            hot: true,
            proxy: [
                {
                    context: ['/api'],
                    target: 'http://localhost:8080',
                },
            ],
            watchContentBase: true,
            historyApiFallback: true,
            port: 3000,
            host: '0.0.0.0',
        },
        output: {
            filename: '[name].[hash].js',
            path: path.resolve('../build/static/'),
            chunkFilename: '[name].[hash].js',
            publicPath: '/',
        },
        devtool: 'eval-source-map',
        plugins: getPlugins(false),
        module: {
            rules: getModuleRules(false),
        },
        node: {
            fs: 'empty',
        },
    },
    // new prod setup for elastic beanstalk with docker
    {
        ...baseConfig,
        name: 'prod',
        mode: 'production',
        devtool: 'nosources-source-map',
        output: {
            filename: '[name].[contenthash].js',
            path: path.resolve('../build/static/'),
            chunkFilename: '[name].[contenthash].js',
            publicPath: '/static/',
        },
        plugins: getPlugins(true),
        module: {
            rules: getModuleRules(true),
        },
        optimization: {
            runtimeChunk: 'single',
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /node_modules/,
                        name: 'vendors',
                        chunks: 'all',
                    },
                    common: {
                        name: 'common',
                        minChunks: 2,
                        chunks: 'async',
                        priority: 10,
                        reuseExistingChunk: true,
                        enforce: true,
                    },
                },
            },
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: true,
                        },
                        mangle: true,
                        output: {
                            comments: false,
                            beautify: false,
                        },
                        ecma: 6,
                    },
                    sourceMap: true,
                }),
            ],
        },
        node: {
            fs: 'empty',
        },
    },
    // QA SERVER
    {
        ...baseConfig,
        name: 'qa',
        mode: 'none',
        devtool: 'eval-source-map',
        output: {
            filename: '[name].[hash].js',
            path: path.resolve('../build/static/'),
            chunkFilename: '[name].[contenthash].js',
            publicPath: '/static/',
        },
        plugins: getPlugins(true),
        module: {
            rules: getModuleRules(true),
        },
        optimization: {
            runtimeChunk: 'single',
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /node_modules/,
                        name: 'vendors',
                        chunks: 'all',
                    },
                    common: {
                        name: 'common',
                        minChunks: 2,
                        chunks: 'async',
                        priority: 10,
                        reuseExistingChunk: true,
                        enforce: true,
                    },
                },
            },
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: false,
                        },
                        mangle: true,
                        output: {
                            comments: false,
                            beautify: false,
                        },
                        ecma: 6,
                    },
                    sourceMap: true,
                }),
            ],
        },
        node: {
            fs: 'empty',
        },
    },
]
