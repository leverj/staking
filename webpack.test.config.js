module.exports = {
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
  }
};
