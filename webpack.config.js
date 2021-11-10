const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        main: './src/index.js',
        // espressoTheme: './node_modules/openmct/src/plugins/themes/espresso-theme.scss', // Syntax error with the new `sass` package. WIP: https://github.com/nasa/openmct/issues/4365
        espressoTheme: './node_modules/openmct/dist/espressoTheme.css',
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
            "vue": path.join(__dirname, "node_modules/vue/dist/vue.js"),
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
                use: {
                    loader: 'babel-loader',
                    options: {
                        plugins: [
                            // Class fields (including private fields) syntax
                            // features are supported in every browser (except
                            // for private methods which is release everywhere
                            // except Safari, but coming up).
                            '@babel/plugin-proposal-class-properties',
                            '@babel/plugin-proposal-private-methods',
                        ]
                    },
                },
            },
            // this will apply to both plain `.css` files
            // AND `<style>` blocks in `.vue` files
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            esModule: false
                        }
                    }
                ]
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
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000,
    },
};
