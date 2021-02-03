var socketio = require('socket.io'); 
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = []; 
var currentRoom = {};

exports.listen = (server) => {
  io = socketio.listen(server);   // 启动Socket.IO服务器，允许它搭载在已有的HTTP服务器上
  io.set('log level', 1);
  io.sockets.on('connection', (socket) => {  // 定义每个用户连接的处理逻辑

    // 1. 在用户连接上来时赋予其一个访客名
    guestNumber = assignGuestName(socket, guestNumber,nickNames, namesUsed);  
    // 2. 在用户连接上来时把他放入默认聊天室中
    joinRoom(socket, 'Default Chat Room');  
    // 3. 处理用户的消息，更名，以及聊天室的创建和变更
    handleMessageBroadcasting(socket, nickNames); 
    handleNameChangeAttempts(socket, nickNames, namesUsed);
    handleRoomJoining(socket);
    // 4. 当用户发出请求时，向其提供已经被占用的聊天室的列表
    socket.on('rooms', () => {  
      socket.emit('rooms', io.sockets.manager.rooms);
    });
    // 5. 定义用户断开连接后的清除逻辑
    handleClientDisconnection(socket, nickNames, namesUsed); 
  });
};


function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
  // 1. 生成新昵称
  var name = '新人-' + guestNumber;  
  // 2. 把用户昵称跟客户端连接ID关联上
  nickNames[socket.id] = name; 
  // 3. 让用户知道他们的昵称
  socket.emit('nameResult', {  
    success: true,
    name: name
  });
  // 4. 存放已经被占用的昵称
  namesUsed.push(name);  
    return guestNumber + 1;  // 增加用来生成昵称的计数器
}

function joinRoom(socket, room) {
  // 1. 让用户进入房间
  socket.join(room);  
  // 2. 记录用户的当前房间
  currentRoom[socket.id] = room;  
  // 3. 让用户知道他们进入了新的房间
  socket.emit('joinResult', {room: room});  
  // 4. 让房间里的其他用户知道有新用户进入了房间
  socket.broadcast.to(room).emit('message', {  
    text: nickNames[socket.id] + ' has joined ' + room + '.'
  });
  // 5. 确定有哪些用户在这个房间里
  var usersInRoom = io.sockets.clients(room);  
  if (usersInRoom.length > 1) {  // 如果不止一个用户在这个房间里，汇总下都是谁
    var usersInRoomSummary = 'Users currently in ' + room + ': ';
    for (var index in usersInRoom) {
      var userSocketId = usersInRoom[index].id;
      if (userSocketId != socket.id) {
        if (index > 0) {
          usersInRoomSummary += ', ';
        }
        usersInRoomSummary += nickNames[userSocketId];
      }
    }
    usersInRoomSummary += '.';
    socket.emit('message', {text: usersInRoomSummary});  // 将房间里其他用户的汇总发送给这个用户
  }
}

function handleNameChangeAttempts(socket, nickNames, namesUsed) {
  // 1. 添加 nameAttempt 事件的监听器
  socket.on('nameAttempt', (name) => {　　
    if (name.indexOf('Guest') == 0) {  // 昵称不能以Guest开头
      socket.emit('nameResult', {
        success: false,
        message: 'Names cannot begin with "Guest".'
      }); 
    } else {
      if (namesUsed.indexOf(name) == -1) {  // 如果昵称还没注册就注册上
        var previousName = nickNames[socket.id];
        var previousNameIndex = namesUsed.indexOf(previousName); 
        namesUsed.push(name);
        nickNames[socket.id] = name;
        delete namesUsed[previousNameIndex];  // 删掉之前用的昵称，让其他用户可以使用
        socket.emit('nameResult', {
          success: true,
          name: name
        });
        socket.broadcast.to(currentRoom[socket.id]).emit('message', {
          text: previousName + ' is now known as ' + name + '.'
        });
      } 
      else {
        socket.emit('nameResult', {  // 如果昵称已经被占用，给客户端发送错误消息
        success: false,
          message: 'That name is already in use.'
        });
      }
    }
  }); 
}

function handleMessageBroadcasting(socket) {
  socket.on('message', function (message) {
    socket.broadcast.to(message.room).emit('message', {
      text: nickNames[socket.id] + ': ' + message.text
    });
  });
}

function handleRoomJoining(socket) {
  socket.on('join', (room) => {
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom);
  });
}

function handleClientDisconnection(socket) {
  socket.on('disconnect', () => {
    var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
  }); 
}