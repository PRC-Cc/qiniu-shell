const path = require("path");
const fs = require("fs");
const qiniu = require("qiniu");
const r = require("request");
const colors = require("colors");
const { isEmpty, log, mkdirsSync } = require("../utils");

const request = r.defaults({ pool: { maxSockets: 200 } });

let bucket;
let prefix; // 目录前缀
let outputDirectoryPath; // 源目录路径

function download(program) {
  const accessKey = program.accessKey;
  const secretKey = program.secretKey;
  bucket = program.bucket;
  prefix = isEmpty(program.prefix) ? "" : program.prefix;
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  outputDirectoryPath = path.resolve(
    !isEmpty(program.outputDirectoryPath)
      ? program.outputDirectoryPath.replace(/\\/g, "/")
      : "dist"
  );

  mkdirsSync(outputDirectoryPath);

  const config = new qiniu.conf.Config();
  config.zone = qiniu.zone.Zone_z2;
  const bucketManager = new qiniu.rs.BucketManager(mac, config);
  bucketManager.listPrefix(
    bucket,
    {
      prefix
    },
    function(err, respBody, respInfo) {
      if (err) {
        log.error(err);
      }
      if (respInfo.statusCode == 200) {
        const items = respBody.items;
        items.forEach(function(item, index) {
          const publicDownloadUrl = isEmpty(program.privateDomain)
            ? bucketManager.publicDownloadUrl(program.publicDomain, item.key)
            : bucketManager.privateDownloadUrl(
                program.privateDomain,
                item.key,
                parseInt(Date.now() / 1000) + 3600
              );

          handleDownload(
            item.key.indexOf("/") !== -1
              ? item.key.replace(/(.*)\/[^/]*$/, "$1")
              : "",
            publicDownloadUrl,
            item.key
          );
        });
      } else {
        log.fail(
          `List ${bucket} ${prefix} error. ${respInfo.statusCode} ${respBody.error}`
        );
      }
    }
  );
}

function handleDownload(dirPath, publicDownloadUrl, fileKey) {
  /**
   * 1.创建本地目录
   * 2.请求数据
   * 3.写入文件
   */
  mkdirs(outputDirectoryPath, dirPath, function() {
    request.get(publicDownloadUrl, function(err, res, body) {
      if (err) {
        log.fail(`Fetch ${publicDownloadUrl} error. ${err.message}`);
        return;
      }
      const filePath = path.join(outputDirectoryPath, fileKey);
      fs.writeFile(filePath, body, null, function(err) {
        if (err) {
          log.fail(`Write file ${filePath} error. ${err.message}`);
        } else {
          log.success(`Write file ${filePath} success.`);
        }
      });
    });
  });
}

//创建目录结构
function mkdirs(targetPathIn, dirpath, _callback) {
  const targetPath = targetPathIn || "";
  const dirArray = dirpath.split("/");
  const exists = fs.existsSync(path.join(targetPath, dirpath));
  if (!exists) {
    mkdir(targetPath, 0, dirArray, function() {
      log.success(`Make directory ${path.join(targetPath, dirpath)} success.`);
      _callback();
    });
  } else {
    _callback();
  }
}

//创建文件夹
function mkdir(targetPath, pos, dirArray, _callback) {
  let currentDir = "";
  for (let i = 0; i <= pos; i++) {
    if (i != 0) currentDir += "/";
    if (dirArray[i] == null) {
      _callback();
      return;
    }
    currentDir += dirArray[i];
  }
  currentDir = path.join(targetPath, currentDir);
  const exists = fs.existsSync(currentDir);

  if (!exists) {
    fs.mkdirSync(currentDir);
    mkdir(targetPath, pos + 1, dirArray, _callback);
  } else {
    mkdir(targetPath, pos + 1, dirArray, _callback);
  }
}

module.exports = download;
