// 1. 加载 http 的核心模块
var http = require('http');

// 2. 创建服务器
var server = http.createServer();

// 3. 服务器要提供的服务, 包括:
//    发送请求, 接收请求, 处理请求, 发送响应等等

server.on('request', (request, response) => {    // 注册 request 请求事件
  console.log('收到请求');

  // 通过 request.url 可以判断不同的请求路径
  if(request.url === '/index') {
    response.write('this is index');

    // write 之后一定要用 end 来结束响应
    response.end();
  }
  else if(request.url === '/home') {
    response.write('this is home');
    response.end();
  }

  response.end();
});

// 4. 绑定端口号, 启动服务器
server.listen(8000, () => {
  console.log('启动成功, 服务器已经可以开始访问');
});

