const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            },
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: 'Poplar',
        libraryTarget: "umd"
    },
    optimization: {
        minimizer: [new UglifyJsPlugin()]
    }
};
