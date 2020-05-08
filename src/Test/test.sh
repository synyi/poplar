set -e
TS_NODE_COMPILER_OPTIONS='{"compilerOptions": {"target": "es5","lib": ["es6","dom"],"downlevelIteration": true,"sourceMap": true,"declaration": true,"outDir": "dist","resolveJsonModule": true}}'
webpack-dev-server --config webpack.test.js > /dev/null &
mocha --require ts-node/register ./src/Test/e2e.ts --exit
