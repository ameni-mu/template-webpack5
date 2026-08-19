const path = require('path');
const fs = require('fs');
const TerserPlugin = require('terser-webpack-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');

//▼cssのminify用。jsはwebpack5が勝手にminifyしてくれるけど、cssはされないのでこれを入れておく。
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
//▼cssを独立したファイルとして書き出すためのプラグイン
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

require('dotenv').config();

const targetDir = process.env.targetDir;
const outputPath = path.resolve(__dirname, './dist/');
const loadPath = path.resolve(__dirname, `${targetDir}/`);
const pluginHtml = path.resolve(__dirname, `${targetDir}/plugins.config.js`);

const pluginHtmls = require(pluginHtml);

///////////////////////

//エントリーとなるscss、jsファイルを取得する
let entryFilesJS = {};
let entryFilesCSS = {};
if (fs.existsSync(loadPath + '/js/pages/')) {
  let jsFilenames = fs.readdirSync(loadPath + '/js/pages/');
  checkFile(jsFilenames);
}
if (fs.existsSync(loadPath + '/scss/pages/')) {
  let scssFilenames = fs.readdirSync(loadPath + '/scss/pages/');
  checkFile(scssFilenames);
}

function checkFile(filenames) {
  for (let i = 0; i < filenames.length; i++) {
    //filenamesがディレクトリかどうか判定する
    //ディレクトリじゃなかったらファイルを取得しない
    const fileName = filenames[i];

    const regexScss = /.scss$/.test(fileName);
    const regexJS = /.js$/.test(fileName);
    if (regexJS) {
      let rename = fileName.replace('.js', '.bundle');
      Object.assign(entryFilesJS, { [rename]: loadPath + '/js/pages/' + fileName });
    }
    if (regexScss) {
      let entryName = fileName.replace('.scss', '');
      Object.assign(entryFilesCSS, { [entryName]: `${loadPath}/scss/pages/${fileName}` });
    }
  }
}
const entryFiles = Object.assign(entryFilesJS, entryFilesCSS);

///////////////////////

module.exports = function (env, argv) {

  let mode = '';
  let localFilePath = '.';
  let buildPath = '/';

  if (argv.mode === 'development') {
    mode = 'development';
    localFilePath = `${outputPath}/assets`;
    buildPath = `assets/`;
  } else if (argv.mode === 'production') {
    mode = 'production';
    localFilePath = `${outputPath}/assets`;
    buildPath = `assets/`;
  }

  let plugins = [
    new RemoveEmptyScriptsPlugin(),
    new MiniCssExtractPlugin({
      filename: `assets/css/[name].css`,
      chunkFilename: './css/[name].css',
    }),
    ...pluginHtmls
  ];

  return {
    mode: argv.mode,
    devtool: mode == 'production' ? "source-map" : "eval-source-map",
    entry: function () {
      return entryFiles;
    },
    output: {
      filename: function (pathData) {
        return `assets/js/[name].js`;
      },
      path: outputPath,
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.scss$/i,
          use: [ //下から順に実行される
            MiniCssExtractPlugin.loader, //cssをファイルで出力
            //▼webpackでcssをjsとして使用する
            {
              loader: 'css-loader',
              options: {
                sourceMap: mode == 'production' ? false : true,
                url: false,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                implementation: require('sass'),
                sourceMap: mode == 'production' ? false : true,
              }
            },
          ]
        },
        {
          test: /\.ejs$/,
          use: [
            {
              loader: 'html-loader',
              options: {
                sources: false,
              },
            },
            {
              loader: 'template-ejs-loader',
            },
          ],
        },
      ]
    },
    devServer: {
      static: [
        {
          directory: path.resolve(__dirname, 'public'),
          publicPath: '/',
        },

        // {
        //   directory: __dirname,
        //   publicPath: '/',
        //   watch: true,
        // }
      ],
      open: {
        target: [`/`],
      },
      hot: true,
    },
    plugins: plugins,
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,//console.log を削除
            },
            format: {
              comments: true,// コメント削除
            },
          },
          extractComments: false,//ライセンスコメントを別ファイルにしない
        }),
        new CssMinimizerPlugin(),
      ]
    },
    snapshot: {
      managedPaths: [],
    }
  }
};