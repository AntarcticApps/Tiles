var webpack = require('webpack');
var DedupePlugin = new webpack.optimize.DedupePlugin();

module.exports = {
    entry: {
        tiles: './src/Tiles.js'
    },
    output: {
        filename: './bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx$/,
                loader: 'jsx-loader?harmony'
            }
        ]
    },
    plugins: [
        DedupePlugin
    ]
};
