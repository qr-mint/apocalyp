const webpack = require('webpack');
const path = require("path");
const phaserModulePath = path.join(__dirname, '/node_modules/phaser/');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const dotenv = require('dotenv').config({ path: './.env' });
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.module\.scss$/, // Для файлов с именем "*.module.scss"
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true,
                localIdentName: '[name]__[local]___[hash:base64:5]', // Правильный синтаксис для localIdentName
              },
            },
          },
          'sass-loader', // Компилируем SCSS в CSS
        ],
      },
      {
        test: /\.scss$/, // Для обычных SCSS файлов
        exclude: /\.module\.scss$/, // Исключаем модули
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.css$/, // Для обычных CSS файлов
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif|mp3|ogg|svg)$/, // For asset files (images, audio)
        use: [
          {
            loader: 'file-loader', // Handle files like images and audio
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/', // Output assets to assets folder
            },
          },
        ],
      },
      {
        test: /\.(js|jsx)$/, // Применение к js и jsx файлам
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: require.resolve('phaser'),
        loader: 'expose-loader',
        options: { exposes: { globalName: 'Phaser', override: true } }
      },
      {
        test: require.resolve(path.join(phaserModulePath, 'build/custom/pixi.js')),
        use: [{
          loader: 'expose-loader',
          options: {
            exposes: 'PIXI', // Exposing PIXI globally
          },
        }],
      },
      {
        test: require.resolve(path.join(phaserModulePath, 'build/custom/phaser-split.js')),
        use: [{
          loader: 'expose-loader',
          options: {
            exposes: 'Phaser', // Exposing Phaser globally
          },
        }],
      },
      {
        test: require.resolve(path.join(phaserModulePath, 'build/custom/p2.js')),
        use: [{
          loader: 'expose-loader',
          options: {
            exposes: 'p2', // Exposing p2 globally
          },
        }],
      }
      // },
      // {
      //   test: /\.svg$/i,
      //   issuer: /\.[jt]sx?$/,
      //   use: ['@svgr/webpack'],
      // },
    ],
  },
  devServer: {
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 8080,
    open: false,
    allowedHosts: "all"
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      'phaser': path.join(phaserModulePath, 'build/custom/phaser-split.js'),
      'pixi': path.join(phaserModulePath, 'build/custom/pixi.js'),
      'p2': path.join(phaserModulePath, 'build/custom/p2.js'),
    },
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "os": require.resolve("os-browserify"),
      "path": require.resolve("path-browserify"),
      "vm": require.resolve("vm-browserify"),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // Use this HTML template for the build
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'public', // Копируем файлы из папки public
          globOptions: {
            ignore: ['**/index.html'], // Игнорируем index.html
          },
        },
      ],
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.parsed), // передаем переменные среды из .env файла
    }),
  ]
};
