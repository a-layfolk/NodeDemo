var http = require('http');
var fs = require('fs');

var server = http.createServer();

server.on('request', (req, res) => {
  var url = req.url;
  
  switch (url) {
    case '/text': // 通过设置文件类型和编码方法可以解决中文乱码
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('中文不会乱码啦');
      break;
    case '/html': // 通过设置类型可以解析 html 字符串
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end('<h1>HTML</h1>');
      break;
    case '/file':
      fs.readFile('./index.html', (err, data) => {  // 还可以结合文件模块 返回文件
        if (err) {
          res.setHeader('Content-Type', 'text/plain; charset=utf8');
          res.end('读取文件失败');
        }
        else {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(data);  // 二进制也可以直接解析
        }
      })
      break;
    case '/img':
      fs.readFile('./people.png', (err, data) => {  // 也可以返回图片
        if (err) {
          res.setHeader('Content-Type', 'text/plain; charset=utf8');
          res.end('读取图片失败');
        }
        else {
          res.setHeader('Content-Type', 'image/png');
          res.end(data);  // 二进制也可以直接解析
        }
      })
      break;
    default:
      break;
  }
});

server.listen(8000, () => {
  console.log('服务器启动成功');
})


