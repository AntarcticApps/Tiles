var webpack = require('webpack');
var DedupePlugin = new webpack.optimize.DedupePlugin();
var UglifyPlugin = new webpack.optimize.UglifyJsPlugin({
    compress: {
        warnings: false
    }
});

module.exports = {
    entry: {
        src: './src/Tiles'
    },
    output: {
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx$/,
                loader: 'jsx-loader?harmony'
            }
        ],
    },
    plugins: [
        DedupePlugin,
        UglifyPlugin
    ]
};
