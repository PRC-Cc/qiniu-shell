const path = require("path");
const fs = require("fs");
const qiniu = require("qiniu");
const colors = require("colors");
const { isEmpty, log } = require("../utils");

const TYPE_METHOD_MAP = {
  refresh: "refreshUrls",
  refreshDir: "refreshDirs",
  prefetch: "prefetchUrls"
};

function flush(program, type) {
  const types = ["refresh", "refreshDir", "prefetch"];
  if (!types.includes(type)) {
    log.failAndExit(
      `Flush type error, expect one of refresh,refreshDir and prefetch.But recieved ${type}`
    );
  }
  const method = TYPE_METHOD_MAP[type];
  const accessKey = program.accessKey;
  const secretKey = program.secretKey;
  const urls = program.urls;
  let config = program.configFile;
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  const cdnManager = new qiniu.cdn.CdnManager(mac);

  let urlsToFlush = [];

  if (isEmpty(config)) {
    urlsToFlush = urls.split(",");
  } else {
    config = config.replace(/\\/g, "/");
    try {
      const configModule = require(path.resolve(config));
      if (Array.isArray(configModule) || typeof configModule === "string") {
        urlsToFlush = urlsToFlush.concat(configModule);
      } else {
        log.failAndExit(
          'Config file is invalid, expect module standard is "CommonJs" and "exports" is "String" or "Array"'
        );
      }
    } catch (error) {
      log.failAndExit(error.message);
    }
  }

  if (urlsToFlush.length === 0) {
    log.failAndExit("Flush urls is null, please checkout your config");
  }

  cdnManager[method](urlsToFlush, function(err, respBody, respInfo) {
    if (err) {
      log.error(err);
    }
    if (respInfo.statusCode == 200) {
      log.success(`${type} ${urlsToFlush} success`);
    } else {
      const jsonBody = JSON.parse(respBody);
      log.fail(
        `${type} ${urlsToFlush} fail. ${respInfo.statusCode} ${jsonBody.error}`
      );
    }
  });
}

module.exports = {
  flush
};
