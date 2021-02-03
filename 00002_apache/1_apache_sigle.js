var http = require('http');
var fs = require('fs');

var server = http.createServer();

server.on('request', (req, res) => {
  fs.readFile('./template.html', (err, data) => {
    if(err) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('读取文件失败');
    }
    else {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.write(data);
      res.end();
    }
  })
})

server.listen({port: 8000});