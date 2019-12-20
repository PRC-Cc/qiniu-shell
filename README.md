# 七牛云操作工具
> 基于 [qiniu](https://github.com/qiniu/nodejs-sdk) 封装

## 安装

从 npm 安装

```markdown
$ npm install qiniu-shell --save-dev
```

## 功能
- [上传](#上传)
- [下载](#下载)
- [删除](#删除)
- [文件刷新](#文件刷新)
- [目录刷新](#目录刷新)
- [文件预取](#文件预取)
- [查看帮助](#查看帮助)

---
- **<a id="上传">上传</a>**
```markdown
$ cshell upload -a accessKey -s secretKey -b bucket -p prefix/ -o originDirectoryPath -f -z huan
```
上传originDirectoryPath目录下文件到bucket下的prefix目录下

**options:**
```markdown
  -a, --accessKey [value]            AccessKey
  -s, --secretKey [value]            SecretKey
  -b, --bucket [value]               Bucket
  -p, --prefix [value]               Prefix of files
  -f, --force                        Whether to overwrite upload.
  -z --zone [value]                  Online zone. one of "huad"、"huab"、"huan"、"beim"、"z0"、"z1"、"z2"、"na0"
  -o, --originDirectoryPath [value]  Directory's path of the files to upload, default is "dist"
  -n, --concurrencyNumber [value]    Concurrency number of action. default is 40
  -h, --help                         output usage information
```

注："huad"、"z0"为华东；"huab"、"z1"为华北；"huan"、"z2"为华南；"beim"、"na0"为北美

---
- **<a id="下载">下载</a>**
```markdown
$ cshell download -a accessKey -s secretKey -b bucket -p prefix -o originDirectoryPath -d publicDomain
```
下载publicDomain或privateDomain域名下prefix开头的文件到originDirectoryPath目录

**options:**
```markdown
  -a, --accessKey [value]            AccessKey
  -s, --secretKey [value]            SecretKey
  -b, --bucket [value]               Bucket
  -d, --publicDomain [value]         Public domain of bucket
  --privateDomain [value]            Private domain of bucket. If set this, "-d" will be useless
  -p, --prefix [value]               Prefix of files
  -o, --outputDirectoryPath [value]  The path of the downloaded file, default is "dist"
  -h, --help                         output usage information
```

---
- **<a id="删除">删除</a>**
```markdown
$ cshell delete -a accessKey -s secretKey -b bucket -p prefix
```
删除bucket下以prefix开头的文件

**options:**

```markdown
  -a, --accessKey [value]  AccessKey
  -s, --secretKey [value]  SecretKey
  -b, --bucket [value]     Bucket
  -p, --prefix [value]     Prefix of files. If don't set it, all files of buckt will be deleted.
  -h, --help               output usage information
```

---
- **<a id="文件刷新">文件刷新</a>**

1.使用cmd
```markdown
$ cshell refresh -a accessKey -s secretKey -u https://xxx/demo/a.js,https://xxx/demo/b.js
```
<p>
    刷新https://xxx/demo/a.js, https://xxx/demo/b.js 两个文件
</p>


2.使用配置文件
```markdown
$ cshell refresh -a accessKey -s secretKey -c ./refreshFiles.js
```

refreshFiles.js:（CommonJs；String or Array）
```js
module.exports = ['https://xxx/demo/a.js','https://xxx/demo/b.js' ]
```

<p>
    刷新https://xxx/demo/a.js, https://xxx/demo/b.js 两个文件.
</p>


**options:**

```markdown
  -a, --accessKey [value]  AccessKey
  -s, --secretKey [value]  SecretKey
  -u, --urls [value]       Urls of refresh files. Split by ","
  -c, --configFile [path]  Path of refresh urls file. If set this, "-u" will be useless
  -h, --help               output usage information
```

---
- **<a id="目录刷新">目录刷新</a>**

操作同文件刷新，命令为: refreshDir

---
- **<a id="文件预取">文件预取</a>**

操作同文件刷新，命令为: prefetch

---
- **<a id="查看帮助">查看帮助</a>**

```markdown
$ cshell -h
$ cshell [command] -h
```