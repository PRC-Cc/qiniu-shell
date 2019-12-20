const path = require("path");
const fs = require("fs");
const qiniu = require("qiniu");
const colors = require("colors");
const { isEmpty, log } = require("../utils");

let bucket;
let prefix; // 目录前缀
let mac;
let originDirectoryPath; // 源目录路径
let zone;
let force;
let concurrencyNumber = 40; // 并发数
const chain = [];

const zoneMap = {
  huad: "Zone_z0",
  huab: "Zone_z1",
  huan: "Zone_z2",
  beim: "Zone_na0",
  z0: "Zone_z0",
  z1: "Zone_z1",
  z2: "Zone_z2",
  na0: "Zone_na0"
};

/**
 * 上传
 * @param {String} filedir 文件目录
 * @param {String} fileName 文件名
 * @param {String} prefix 前缀
 */
function uploadFile(filedir, fileNameIn, prefix = "", callback) {
  let fileName = prefix + fileNameIn;
  const options = {
    scope: force ? `${bucket}:${fileName}` : bucket
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  const uploadToken = putPolicy.uploadToken(mac);
  const putExtra = new qiniu.form_up.PutExtra();
  const config = new qiniu.conf.Config();
  if (!isEmpty(zone)) {
    config.zone = qiniu.zone[zoneMap[zone]];
  }

  const formUploader = new qiniu.form_up.FormUploader(config);

  formUploader.putFile(uploadToken, fileName, filedir, putExtra, function(
    respErr,
    respBody,
    respInfo
  ) {
    if (respErr) {
      log.fail(`Upload ${bucket} ${fileName} fail.`);
      log.error(respErr);
    }
    if (respInfo.statusCode == 200) {
      log.success(`Upload ${bucket} ${fileName} success.`);
      callback();
    } else {
      log.fail(
        `Upload ${bucket} ${fileName} fail. ${respInfo.statusCode} ${respBody.error}`
      );
      callback();
    }
  });
}

/**
 * 遍历目录
 * @param {String} filePath 初始目录
 */
function fileDisplay(filePath) {
  try {
    const files = fs.readdirSync(filePath);
    files.forEach(function(filename) {
      const filedir = path.join(filePath, filename);
      try {
        const stats = fs.statSync(filedir);
        const isFile = stats.isFile();
        const isDir = stats.isDirectory();
        if (isFile) {
          const fileName = filedir
            .replace(`${originDirectoryPath}${path.sep}`, "")
            .replace(/\\/g, "/");
          chain.push((...args) =>
            uploadFile(filedir, fileName, prefix, ...args)
          );
        } else if (isDir) {
          fileDisplay(filedir);
        }
      } catch (error) {
        log.error(error);
      }
    });
  } catch (error) {
    log.error(error);
  }
}

function upload(program) {
  const accessKey = program.accessKey;
  const secretKey = program.secretKey;
  const pConcurrencyNumber = Number(program.concurrencyNumber);

  bucket = program.bucket;
  prefix = isEmpty(program.prefix) ? "" : program.prefix;
  force = !!program.force;
  zone = program.zone;
  mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

  if (!isEmpty(zone) && zoneMap[zone] == null) {
    log.failAndExit(
      `Zone invalid, expect one of "huad"、"huab"、"huan"、"beim"、"z0"、"z1"、"z2"、"na0", but recieved ${zone}`
    );
  }

  if (Number.isInteger(pConcurrencyNumber)) {
    concurrencyNumber = pConcurrencyNumber;
  }

  originDirectoryPath = path.resolve(
    !isEmpty(program.originDirectoryPath)
      ? program.originDirectoryPath.replace(/\\/g, "/")
      : "dist"
  );
  fileDisplay(originDirectoryPath);
  batchExec(chain, successCallback);
}

/**
 * 成功回调
 * @param {Number} length
 */
function successCallback(length) {
  log.success(`Done, all ${length} files upload success.`);
}

/**
 *
 * @param {Array} chain 执行队列
 */
async function batchExec(chain, callback) {
  const chainLen = chain.length;
  const promises = {};
  let diff;
  let promisesLen;
  let promiseKey;
  let startNum = 0;
  let timer = setInterval(() => {
    if (chain.length === 0) {
      clearInterval(timer);
      timer = null;
      return;
    }
    diff = concurrencyNumber - Object.keys(promises).length;
    if (diff <= 0) return;
    chain.splice(0, diff).forEach(fn => {
      promiseKey = startNum++;
      promises[promiseKey] = true;
      (function(promiseKey) {
        fn(() => {
          delete promises[promiseKey];
          if (Object.keys(promises).length === 0) {
            callback(chainLen);
          }
        });
      })(promiseKey);
    });
  }, 0);
}

module.exports = upload;
