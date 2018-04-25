import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import CleanWebPackPlugin from 'clean-webpack-plugin';

// Ensure that, despite 'target:node', webpack will respect the imports/requires for the
// node_modules folder
const nodeModules = {};
fs
    .readdirSync('node_modules')
    .filter(module => {
        // Skip the .bin folder from node_modules
        return ['.bin'].indexOf(module) === -1;
    })
    .forEach(module => {
        // Pass 'commonjs <modulename>' so webpack knows how to resolve this
        nodeModules[module] = `commonjs ${module}`;
    });

export default {
    context: path.resolve(__dirname, 'src'),
    entry: {
        cli: ['babel-polyfill', './bin/drew.js'],
    },
    target: 'node',
    externals: nodeModules,
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
    plugins: [
        new CleanWebPackPlugin(['bin']),
        // Add the bang header to properly run this via CLI
        new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
    ],
    output: {
        path: path.resolve(__dirname),
        filename: 'bin/[name]',
    },
};
