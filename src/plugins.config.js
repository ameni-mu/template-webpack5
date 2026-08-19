const path = require('path');
require('dotenv').config();
const targetDir = process.env.targetDir;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const loadPath = path.resolve(__dirname, './html/pages/');
let htmlBuildePath = `../`;

const mode = process.env.NODE_ENV;

console.log(`▼mode`);
console.log(mode);

if(/prod|dev/.test(mode)) {
  htmlBuildePath = `./html/`;
}

console.log(`🍎🍎`);
console.log('⭐️' + htmlBuildePath + `index.html`);

module.exports = [
  new HtmlWebpackPlugin({
    template: `${loadPath}/index.ejs`,
    filename: `index.html`,
    inject: false,
    cache: true,
    minify: false,
  }),
  // new HtmlWebpackPlugin({
  //   template: `${loadPath}/contact/index.ejs`,
  //   filename: `contact/index.html`,
  //   inject: false,
  //   cache: true,
  //   minify: false,
  // }),
  // new HtmlWebpackPlugin({
  //   template: `${loadPath}/profile/index.ejs`,
  //   filename: `profile/index.html`,
  //   inject: false,
  //   cache: true,
  //   minify: false,
  // }),
  // new HtmlWebpackPlugin({
  //   template: `${loadPath}/works/index.ejs`,
  //   filename: `works/index.html`,
  //   inject: false,
  //   cache: true,
  //   minify: false,
  // })
];