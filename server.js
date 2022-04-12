const express = require('express');
const cors = require('cors');
// const bodyParser = require('body-parser');
// const socketIO = require('socket.io');
const moment = require('moment');
const numeral = require('numeral');
const app = express();
let corsOptions = {
  // origin: 'https://maruay95.com'
}
app.use(cors(corsOptions));
// const port = 3005;
let port = normalizePort(process.env.PORT || '3000');
let userData = [];
let countUser = 0;
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//   extended: true
// }));
app.get('/', (req, res) => {
  res.send(`socket.io:${port}`);
});
let server = app.listen(port, () => {
  console.log(`socket.io:${port}`);
});
const io = require('socket.io')(server);

io.on('connection', socket => {

  socket.on('userConnect', (data) => {
    // console.log('connection', socket.connected);
    socket.userId = data.id;
    socket.join('userRoom');
    // let userFind = userData.find(item => item == data);
    // if (!userFind) {
    //   userData.push(data);
    // }
    let userFind = userData.find(item => item.id == data.id);
    if (!userFind) {
      let user = {
        id: data.id,
        username: data.username
      };
      if (data.fullName) {
        user.fullName = data.fullName;
      }
      userData.push(user);
    }
    io.to('staffRoom').emit('userOnline', {
      countUser: numeral(userData.length).format('0,0'),
      date: moment().format('YYYY-MM-DD HH:mm:ss'),
      data: userData
    });
  });
  socket.on('staffConnect', (data) => {
    console.log(userData);
    socket.join('staffRoom');
    io.to('staffRoom').emit('userOnline', {
      countUser: numeral(userData.length).format('0,0'),
      date: moment().format('YYYY-MM-DD HH:mm:ss'),
      data: userData
    });
  });
  socket.on('withdraw', (data) => {
    io.to('staffRoom').emit('notification', {
      username: data.username,
      amount: data.amount,
      date: data.date,
      text: 'มีรายการถอนเงิน ' + numeral(data.amount).format('0,0.00')
    });
  });
  socket.on('disconnecting', () => {
    // console.log("disconnect", socket.connected);
    const room = Object.keys(socket.rooms);
    userData = userData.filter(item => item.id != socket.userId);
    io.to('staffRoom').emit('userOnline', {
      countUser: numeral(userData.length).format('0,0'),
      date: moment().format('YYYY-MM-DD HH:mm:ss'),
      data: userData
    });
    // if (room[1] == 'userRoom') {
    //   countUser = countUser - 1;
    //   socket.to('staffRoom').emit('userOnline', {
    //     countUser,
    //     date: moment().format('YYYY-MM-DD HH:mm:ss')
    //   });
    // }
  });
});

function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}