import path from 'path';
import ManifestPlugin from 'webpack-manifest-plugin';

export default {
    context: path.resolve(__dirname, 'src/scripts'),
    entry: {
        index: './index.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    plugins: [new ManifestPlugin()],
    output: {
        path: path.resolve(__dirname, 'dist/js'),
        filename: '[name].[hash].js',
    },
};
