const PATH = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const config = {
    entry: './src/Test/app.js',
    output: {
        path: PATH.join(__dirname, "dist"),
        filename: 'app.bundle.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'demo.html',
            inject: 'body',
        })],
    devServer: {
        contentBase: PATH.join(__dirname, "dist"),
        compress: true,
        port: 8086
    },
    mode: 'development',
    watchOptions: {
        poll: 1000,
        ignored: /node_modules/
    }
};
module.exports = config;