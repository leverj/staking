const path = require('path');
const htmlPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: path.join(__dirname, 'src/client/js', 'index.js'), // Our frontend will be inside the src folder
  output: {
    path: path.join(__dirname, 'dist/src/client/'),
    filename: 'build.js' // The final file will be created in dist/build.js
  },
  module: {
    loaders: [{
      test: /\.css$/, // To load the css in react
      exclude: /node_modules/,
      use: ['style-loader', 'css-loader'],
      include: /src/
    }, {
      test: /\.json$/,
      exclude: /node_modules/,
      loader: 'json-loader'
    }, {
      test: /\.js$/, // To load the js files
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        presets: [['env', {
          'targets': {'node': 'current'}
        }], 'react']
      }
    }]
  },
  plugins: [
    new CleanWebpackPlugin(["./dist"]),
    new CopyWebpackPlugin([
      {from: path.join(__dirname, "build"), to: path.join(__dirname, "dist", "build")},
      {from: path.join(__dirname, "src", "server"), to: path.join(__dirname, "dist", "src", "server")},
      {from: path.join(__dirname, "src", "client", "img"), to: path.join(__dirname, "dist", "src", "client", "img")},
      {from: path.join(__dirname, "package.json"), to: path.join(__dirname, "dist")},
			{from: path.join(__dirname, "config"), to: path.join(__dirname, "dist", "config")}
    ]),
    new htmlPlugin({
      title: "Staking User Interface",
      template: "./src/client/templates/index.ejs",
      hash: true
    })
  ]
};
