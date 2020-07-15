const isProd = process.env.NODE_ENV === 'production'

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { watch } = require('chokidar');

const config = {
  mode: 'development',
  entry: [
    '@babel/polyfill',
    `${__dirname}/src/App.js`,
  ],
  devtool: isProd ? false : 'inline-source-map',
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: `${__dirname}/src/view/index.ejs`,
    }),
  ],
  output: {
    filename: '[name].[hash].js',
    path: `${__dirname}/dist`,
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
};

if (!isProd) {
  config.devServer = {
    before: (app, server) => {
      watch([
        `${__dirname}/src/view`,
      ]).on('all', () => {
        server.sockWrite(server.sockets, 'content-changed')
      })
    },
    contentBase: `${__dirname}/dist`,
  }
}

module.exports = config;
