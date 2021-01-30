const path = require('path');
const webpack = require('webpack');
const packageJson = require('./package.json');
const envVars = require('./.env.json');

const { version } = packageJson;

const webpackConfig = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    main: './main.js',
  },
  output: {
    publicPath: 'scripts/',
    path: path.resolve(__dirname, 'dist', 'scripts'),
    filename: '[name].bundle.js',
    sourceMapFilename: '[name].map',
    chunkFilename: '[id].chunk.js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.css$|\.html$|\.worker.js$|\.vert$|\.frag$/,
        exclude: [
          {
            test: path.resolve(__dirname, 'node_modules'),
            exclude: path.resolve(__dirname, 'node_modules/leaflet/dist/leaflet.css')
          }
        ],
        loader: 'raw-loader'
      },
    ]
  },
  devServer: {
    port: 3001,
    contentBase: path.resolve(__dirname, 'src'),
  },
  mode: process.env.WEBPACK_SERVE ? 'development' : 'production',
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(version),
      ENV: JSON.stringify(envVars),
    }),
  ]
};

module.exports = webpackConfig;
