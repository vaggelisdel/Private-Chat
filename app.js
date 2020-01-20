var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mongoose = require('mongoose');
const Message = require("./models/messageModel");
const User = require("./models/userModel");
mongoose.connect('mongodb+srv://vaggelisdel:6981109687@cluster0-kzkna.mongodb.net/privatechat?retryWrites=true&w=majority', {
  useNewUrlParser: true
});

var indexRouter = require('./routes/index');

var app = express();

var io = require('socket.io')();
app.socket = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

  /*
  * Connect to socket.io
  */
  io.on('connection', function (socket) {

    console.log('Connected to socket.io, ID: ' + socket.id);

    /*
           * Handle enter chat / log on
           */
    socket.on("username", function (username) {
      console.log(username);

      User.find({ username: { $ne: username }}, function (err, res) {
        if (err) throw err;
        socket.emit('users', res);
      });

      User.findOne({username: username}, function (err, res) {
        if (err) throw err;
        if (res === null) {
          var newUser = new User({socketID: socket.id, username: username});
          newUser.save(function (err) {
            if (err) throw err;            // saved!
          });
          socket.broadcast.emit('logonnewuser', {
            socketID: socket.id,
            username: username
          });
        }else{
          socket.broadcast.emit('logon', {
            socketID: socket.id,
            username: username
          });
        }
      });



    });


    // socket.on('getmessages', function (data) {
    //   messages.find({ $or: [ {from: data.from, to: data.to}, {from: data.to, to: data.from} ] }).toArray(function (err, res) {
    //     console.log(res);
    //     if (err) throw err;
    //     socket.emit('messages', res);
    //   });
    // });


    socket.on('disconnect', function () {
      console.log('User ' + socket.id + ' disconnected!');

      // users.deleteOne({socketID: socket.id}, function () {
      //     socket.broadcast.emit('logoff', socket.id);
      // });
    });

    /*
    * Handle chat input
    */
    socket.on('input', function (data) {

      var newMessage = new Message({from: data.username, to: data.receiver, message: data.message, date: data.date});
      newMessage.save(function (err) {
        if (err) throw err;            // saved!
      });


      io.emit('output', data);
    });

    socket.on('secondUserTrigger', function (data) {
      socket.to(data.secondUserID).emit('secondUserChatWindow', data);
    });


  });



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
