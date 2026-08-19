const fs = require('fs');
const fsPromise = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const dotenv =require('dotenv');

//.envファイルを見る
// const ENV_PATH = path.join(__dirname, './.env');
// dotenv.config({ path: ENV_PATH });

const targetDir = process.env.targetDir;

const inputDir = path.join(__dirname, `./public/images/`);
const distDir = path.join(__dirname, `./dist/`);
let outputDir = path.join(__dirname, `./dist/images/`);

//distディレクトリが無ければ作る
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function readImages(targetDir, outputDir){

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await fs.readdir(targetDir, (err, files) => {
    if (err) {
      console.error("入力ディレクトリの読み込みエラー:", err);
      return;
    }

    for (const file of files) {

      const inputFile = path.join(targetDir, file);
      const outputFile = path.join(outputDir, file);

      if(/.jpg|.jpeg/.test(file)) {

        sharp(inputFile)
          .toFormat("jpeg", { quality: 80 })
          .toFile(outputFile, (err, info) => {
            if (err) {
              console.error("ファイル処理エラー:", err);
            } else {
              console.log("ファイル処理完了:", info);
            }
          });
      }else if(/.png/.test(file)) {

        sharp(inputFile)
          .toFormat("png", { quality: 80 })
          .toFile(outputFile, (err, info) => {
            if (err) {
              console.error("ファイル処理エラー:", err);
            } else {
              console.log("ファイル処理完了:", info);
            }
          });
      }else {
        if(!/DS_Store/.test(file)) {
          const isDir = checkDir(inputFile, outputFile, file);
        }else {
        }
      }

    }

  });

}

async function checkDir(inputFile, outputFile, file) {
  const stats = await fsPromise.stat(inputFile);
  const isDir = stats.isDirectory();

  //ディレクトリだったら、中のファイルをチェックする
  if(isDir == true) {
    readImages(`${inputFile}/`, `${outputFile}/`);

  //ディレクトリじゃなかったら、distディレクトリにコピーする
  }else {
    fs.copyFileSync(inputFile, outputFile);
  }
  return isDir;
}

readImages(inputDir, outputDir);
