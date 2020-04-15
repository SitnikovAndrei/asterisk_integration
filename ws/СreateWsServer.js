const WebSocket = require('ws');
const url = require('url');

let СreateWsServer = ({port}, channelsDAO) => {
  const wss = new WebSocket.Server({ port: port });
  wss.on('connection', function connection(ws, req) {
    channelsDAO.addChannel("1001", ws);
  });
}

module.exports = СreateWsServer;