const ws = require('nodejs-websocket');

const server = ws.createServer((conn) => {
  console.log('[Server] Server startup ...');
  
  conn.on('text', (str) => {
    console.log(str);

    // 发送信息给客户端
    broadcast(str);
  });

  conn.on('error', (err) => {
    console.log(err);
  });


}).listen(8000);

function broadcast(str) {
  server.connections.forEach((conn) => {
    conn.sendText(str);
  })
}