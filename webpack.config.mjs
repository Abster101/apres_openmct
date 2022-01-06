import path from 'path';
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import { VueLoaderPlugin } from "vue-loader";
import { fileURLToPath } from 'url';

/** @typedef {import('webpack-dev-server')} */

/** @type {import('webpack').Configuration} */
const config = {
    entry: {
        main: './src/index.js',
        // espressoTheme: './node_modules/openmct/src/plugins/themes/espresso-theme.scss', // Syntax error with the new `sass` package. WIP: https://github.com/nasa/openmct/issues/4365
    },
    optimization: {
        minimize: false
    },
    output: {
        filename: '[name].js',
        library: '[name]',
        libraryTarget: 'umd',
        path: path.resolve(__dirname(), 'dist'),

        // If we don't specify a hash function here, the default causes Webpack to crash in Node 17. https://github.com/webpack/webpack/issues/14532
        hashFunction: 'xxhash64',
    },
    resolve: {
        alias: {
            "openmct": path.join(__dirname(), "node_modules/openmct/dist/openmct.js"),
            "vue": path.join(__dirname(), "node_modules/vue/dist/vue.js"),
            "plotly.js": path.join(__dirname(), "node_modules/plotly.js/dist/plotly.js"),
        }
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[name].css'
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'node_modules/openmct/src/images/favicons', to: 'favicons' },
                { from: 'node_modules/openmct/dist/espressoTheme.css', to: './' },
                { from: 'node_modules/openmct/dist/images', to: 'images' },
                { from: 'node_modules/openmct/dist/fonts', to: 'fonts' },
                {
                    from: 'src/index.html',
                    transform: function (content) {
                        return content.toString().replace(/dist\//g, '');
                    },
                    to: './'
                }
            ]
        })
    ],
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                include: path.resolve(__dirname(), 'src'),
                use: {
                    loader: 'babel-loader',
                    options: {
                        plugins: [
                            // Webpack+Babel need these plugins to understand class field syntax.
                            // Note that class fields syntax features are supported in
                            // every browser (except for private methods in Safari, coming
                            // soon), but even so, we cannot use the syntax without these
                            // plugins.
                            '@babel/plugin-proposal-class-properties',
                            '@babel/plugin-proposal-private-methods',
                        ]
                    },
                },
            },
            // this will apply to both plain `.css` files except
            // espressoTheme.css AND `<style>` blocks in `.vue` files
            {
                test: /(?<!espressoTheme)\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                ]
            },
            {
                test: /\.(sc|sa)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'fast-sass-loader'
                ]
            },
            {
                test: /\.html$/,
                use: 'html-loader'
            },
            {
                test: /\.(jpg|jpeg|png|svg|ico|woff2?|eot|ttf)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath(url, resourcePath, context) {
                        if (/\.(jpg|jpeg|png|svg)$/.test(url)) {
                            return `images/${url}`
                        }
                        if (/\.ico$/.test(url)) {
                            return `icons/${url}`
                        }
                        if (/\.(woff2?|eot|ttf)$/.test(url)) {
                            return `fonts/${url}`
                        } else {
                            return `${url}`;
                        }
                    }
                }
            }
        ]
    },
    devServer: {
        static: {
            directory: path.join(__dirname(), 'dist'),
        },
        compress: true,
        port: 9000,
    },
};

export default config;

function __dirname() {
    return path.dirname(fileURLToPath(import.meta.url))
}