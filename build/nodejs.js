/**
 * 执行说明：
 * 直接调用nodejs.bat批量处理
 * 执行前需要安装node环境，
 * 执行 npm install uglify-js
 * npm install uglifycss
 */
var fs = require('fs');
var join = require('path').join;
var UglifyCss = require('uglifycss');
var UglifyJS = require('uglify-js');

// 查找目录
var address = process.argv[2];

//过滤后缀
var minjs = '.min.js';
var mincss = '.min.css';

//创建本地文件夹
var dirJs = './dist';
var dirCss = './dist';

var length = 0;
var pace = 0;

//增加后匹配原型
String.prototype.endWidth = function (endStr) {
  var d = this.length - endStr.length;
  return (d >= 0 && this.lastIndexOf(endStr) === d);
}

/**
 * @param jsonPath 地址
 * @param type = 类型，js和css
 */
function getJsonFiles(jsonPath, type) {
  var jsonFiles = [];

  function findJsonFile(path) {
    var files = fs.readdirSync(path);
    files.forEach(function (item, index) {
      var fPath = join(path, item);
      var stat = fs.statSync(fPath);
      //如果文件存在下一级继续查找
      if (stat.isDirectory() === true) {
        findJsonFile(fPath);
      }
      if (stat.isFile() === true) {

        if (fPath.endWidth(type) && !fPath.endWidth(minjs) && !fPath.endWidth(mincss)) {
          //找到名为.js文件的地址
          jsonFiles.push(fPath);
        }
      }
    });
  }

  findJsonFile(jsonPath);

  return jsonFiles;
}

//获取js文件内容 css文件内容 写入文件
function getJsData(path) {
  for (var i = 0; i < path.length; i++) {
    var pathArr = path[i].split(/[\\/]/);
    var code = fs.readFileSync(path[i], 'utf-8');
    //文件压缩
    var uglifyCode = UglifyJS.minify(code, {warnings: true, ie8: false, toplevel: false});
    //新增文件夹打包
    setDir(dirJs, pathArr, uglifyCode.code);

    //覆盖老文件打包
    // oldFiles(path[i], uglifyCode.code);
  }
}

//获取css文件内容
function getCssData(path) {
  for (var i = 0; i < path.length; i++) {
    //css 文件压缩
    var arr = [path[i]];
    var pathArr = path[i].split(/[\\/]/);
    var uglifyCode = UglifyCss.processFiles(arr, {expandVars: true});
    //新建文件夹打包
    setDir(dirCss, pathArr, uglifyCode);

    //覆盖老文件打包
    // oldFiles(path[i], uglifyCode);
  }
}

//写入文件 新文件
function setDir(dir, pathArr, data) {
  var dir0 = dir + '/' + pathArr.slice(0, pathArr.length - 1).join('/');
  mkdir(dir0);
  var file = dir + '/' + pathArr.join('/');

  var indexOf = file.lastIndexOf('.');
  var suffix = file.substring(indexOf);
  var minFile = file.replace(suffix, '.min' + suffix)

  if (data) {
    fs.writeFileSync(minFile, data, 'utf-8');
    console.log(file + " -----> " + minFile + " [" + (++pace) + "/" + length + "]");
  } else {
    console.log(file + " -----> " + minFile + " [" + (++pace) + "/" + length + "]------->压缩失败！");
  }
}

//覆盖原文件
function oldFiles(name, data) {
  console.log(name + " ===> [" + (++pace) + "/" + length + "]");
  if (data != 'undefined' && data) {
    fs.writeFileSync(name, data, 'utf-8');
  } else {
    console.log(name + " ===> [" + (pace) + "/" + length + "]------->压缩失败！");
  }
}

function mkdir(path) {
  var paths = path.split(/[\/]/);
  for (var i = 1; i <= paths.length; i++) {
    var dir = paths.slice(0, i).join('/');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }
}

//获取所有js文件
var jspath = getJsonFiles(address, '.js');
//获取所有css文件
var csspath = getJsonFiles(address, '.css');
length = jspath.length + csspath.length
getJsData(jspath);
getCssData(csspath);
console.log("压缩完成！");
