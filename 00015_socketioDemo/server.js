var http = require('http');　// 内置的http模块提供了HTTP服务器和客户端功能
var fs = require('fs');  // 内置的fs模块提供了与文件系统相关的功能
var path = require('path');  // 内置的path模块提供了与文件系统路径相关的功能
var mime = require('mime');  // 附加的mime模块有根据文件扩展名得出MIME类型的能力
var cache = {};  // cache是用来缓存文件内容的对象

function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'}); 
  response.write('Error 404: resource not found.'); 
  response.end();
}

function sendFile(response, filePath, fileContents) { 
  response.writeHead(
    200,
    {"content-type": mime.lookup(path.basename(filePath))} );
  response.end(fileContents); 
}

function serveStatic(response, cache, absPath) {
  if (cache[absPath]) {  //检查文件是否缓存在内存中
    sendFile(response, absPath, cache[absPath]);  //从内存中返回文件
  }
  else {
    fs.exists(absPath, function(exists) {  //检查文件是否存在
      if (exists) {
        fs.readFile(absPath, function(err, data) {  //从硬盘中读取文件
          if (err) {
            send404(response);
          } 
          else {
            cache[absPath] = data;
              sendFile(response, absPath, data);  //从硬盘中读取文件并返回
          }
        });
      } 
      else {
        send404(response);  //发送HTTP 404响应
      }
    });
  }
}

var server = http.createServer(function(request, response) {　　//创建HTTP服务器，用匿名函数定义对每个请求的处理行为
  var filePath = false;
  if (request.url == '/') {
    filePath = 'public/index.html';  //确定返回的默认HTML文件
  } 
  else {
    filePath = 'public' + request.url;  //将URL路径转为文件的相对路径
  }

  var absPath = './' + filePath;
  serveStatic(response, cache, absPath);  //返回静态文件
});


server.listen(3000, () => { 
  console.log("Server listening on port 3000.");
});

var chatServer = require('./lib/chat_server'); 
chatServer.listen(server);

