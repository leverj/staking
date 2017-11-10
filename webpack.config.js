const path = require('path')
const htmlPlugin = require('html-webpack-plugin')

module.exports = {
   entry: path.join(__dirname, 'src/js', 'index.js'), // Our frontend will be inside the src folder
   output: {
      path: path.join(__dirname, 'dist'),
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
             'targets': { 'node': 'current' }
           }], 'react']
         }
      }]
   },
   plugins: [
      new htmlPlugin({
         title: "Staking User Interface",
         template: "./src/templates/index.ejs",
         hash: true
      })
   ]
}
