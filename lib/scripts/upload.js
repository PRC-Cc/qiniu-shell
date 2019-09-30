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
function uploadFile(filedir, fileNameIn, prefix = "") {
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
      log.error(respErr);
    }
    if (respInfo.statusCode == 200) {
      log.success(`Upload ${bucket} ${fileName} success`);
    } else {
      log.fail(
        `Upload ${bucket} ${fileName} fail. ${respInfo.statusCode} ${respBody.error}`
      );
    }
  });
}

/**
 * 遍历目录
 * @param {String} filePath 初始目录
 */
function fileDisplay(filePath) {
  fs.readdir(filePath, function(err, files) {
    if (err) {
      log.error(err);
    } else {
      files.forEach(function(filename) {
        const filedir = path.join(filePath, filename);
        fs.stat(filedir, function(eror, stats) {
          if (eror) {
            log.error(error);
          } else {
            const isFile = stats.isFile();
            const isDir = stats.isDirectory();
            if (isFile) {
              const fileName = filedir.replace(
                `${originDirectoryPath}${path.sep}`,
                ""
              );
              // .replace(/\\/g, "/");
              uploadFile(filedir, fileName, prefix);
            } else if (isDir) {
              fileDisplay(filedir);
            }
          }
        });
      });
    }
  });
}

function upload(program) {
  const accessKey = program.accessKey;
  const secretKey = program.secretKey;
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

  originDirectoryPath = path.resolve(
    !isEmpty(program.originDirectoryPath)
      ? program.originDirectoryPath.replace(/\\/g, "/")
      : "dist"
  );
  fileDisplay(originDirectoryPath);
}

module.exports = upload;
