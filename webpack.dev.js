import * as webpack from "webpack";

const path = require('path');
module.exports = {
    mode: 'development',
    entry: './src/Test/index.ts',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'poplar.js',
        library: 'Poplar'
    }
};