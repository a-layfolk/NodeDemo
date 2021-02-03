const ws = require('nodejs-websocket');

// 存储连接对象的 map
const connMap = new Map();

const server = ws.createServer((conn) => {

  console.log('[Server] Server startup ...');

  conn.on('text', (str) => {
    // 每次收到客户端发来的消息，先检查是不是新的连接
    // 如果是新的连接， 则先添加到存储连接对象的 map 中
    const obj = JSON.parse(str);
    console.log(obj);
    if(isNewConn(obj)) {
      connMap.set(obj.fromName, conn);
      console.log(obj.fromName + '已经放入了连接对象');
    }

    // 如果不是, 判断发送过来的信息是不是提醒 关闭链接
    if(isCloseConn(obj)) {
      connMap.delete(obj.fromName);
      console.log(obj.fromName + '已关闭');
    }

    // 如果不是， 判断它要发送的消息类型是系统消息还是用户消息
    if(obj.toName === null) {
      broadcast(str);
      console.log('发送广播信息' + str);
    }
    else {
      const toConn = connMap.get(obj.toName);
      if(toConn === undefined) {
        console.log('查无此人');
      }
      else {
        toConn.sendText(str);
        console.log('发送单对单信息' + str);
      }
    }
  });

  conn.on('error', (err) => {
    console.log('服务器错误' + err);
  });

  conn.on('close', (str) => {
    console.log(str);
  })

}).listen(8000);

function isNewConn(obj) {
  const fromName = obj.fromName;
  if(connMap.get(fromName)) {
    return false;
  }
  else {
    return true;
  }
}

function isCloseConn(obj) {
  const isclosed = obj.isclosed;
  return isclosed;
}

function broadcast(str) {
  server.connections.forEach((conn) => {
    conn.sendText(str);
  })
}