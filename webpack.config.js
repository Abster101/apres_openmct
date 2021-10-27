const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        main: './src/index.js',

        // This file has a syntax error. FIXME at https://github.com/nasa/openmct/issues/4365
        // espressoTheme: './node_modules/openmct/src/plugins/themes/espresso-theme.scss'

        // Load the CSS file instead, because we're not importing the scss code anyway.
        espressoTheme: './node_modules/openmct/dist/espressoTheme.css'
    },
    mode: 'development',
    devtool: 'eval-source-map',
    output: {
        filename: '[name].js',
        library: '[name]',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        alias: {
            "@": path.join(__dirname, "node_modules/openmct"),
            "openmct": path.join(__dirname, "node_modules/openmct/dist/openmct.js"),
            "plotly": path.join(__dirname, "node_modules/plotly.js/dist/plotly.js"),
        }
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[name].css'
        }),
        new CopyWebpackPlugin([
            {
                // This config currently serves no purpose.
                // TODO The index page needs to link the OpenMCT favicons in. Or
                // better yet, we need our own APRES favicons.
                from: 'node_modules/openmct/src/images/favicons',
                to: 'favicons'
            },
            {
                from: 'dist/index.html',
                transform: function (content) {
                    return content.toString().replace(/dist\//g, '');
                }
            }
        ])
    ],
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                loader: 'babel-loader'
            },
            {
                test: /\.(sc|sa|c)ss$/,
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
                type: 'asset/resource',
            },
        ]
    },
    devServer: {
        static: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000,
    },
};
