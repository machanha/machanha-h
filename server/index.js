const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const request = require('./request');
const app = express();
const CORS = require('cors');

const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(CORS());


const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws, req) {
  const location = url.parse(req.url, true);
  let online = wss.clients.size || 0;
  if (online) {
      online = JSON.stringify({ online });
      wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
          client.send(online);
      }
    });
  }
  ws.on('message', function incoming(message) {
    // const bufffer = JSON.parse(message.toString());
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        console.log(message);
        client.send(message);
      }
    });
  });
});

app.use('/message', (req, res, next) => {
  // const content = req.body.content;
  console.log(req.body, 'onpost');
  res.send('test');
  next();
  // request.http(content, (message) => {
  //   wss.clients.forEach(function each(client) {
  //     if (client.readyState === WebSocket.OPEN) {
  //       client.send(message);
  //     }
  //   });
  // });
})

server.listen(8080, function listening() {
  console.log('Listening on %d', server.address().port);
});

// const WebSocket = require('ws');

// const wss = new WebSocket.Server({ port: 8080 });
// console.log('has connected');

// // Broadcast to all.
// wss.broadcast = function broadcast(data) {
//   wss.clients.forEach(function each(client) {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(data);
//     }
//   });
// };

// wss.on('connection', function connection(ws) {
//   ws.on('message', function incoming(data) {
//     // Broadcast to everyone else.
//     wss.clients.forEach(function each(client) {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(data);
//       }
//     });
//   });
// });