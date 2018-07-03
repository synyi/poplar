const PATH = require('path');
const config = {
    entry: './src/test/app.js',
    mode: 'development',
    devServer: {
        contentBase: PATH.join(__dirname, "dist"),
        compress: true,
        port: 9000
    },
    watchOptions: {
        poll: 1000,
        ignored: /node_modules/
    }
};
module.exports = config;