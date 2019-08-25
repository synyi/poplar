const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    mode: 'development',
    entry: './src/Test/test.ts',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist'
    },
    module: {
        rules: [{
            test: /\.html$/,
            loader: 'html-loader'
        }, {
            test: /\.ts$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/Test/index.html'
        })
    ],
    resolve: {
        extensions: [".ts", ".js"]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: 'Poplar',
        libraryTarget: "umd"
    }
};
