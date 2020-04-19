const WebSocket = require('ws');
const url = require('url');

let СreateWsServer = ({port}, channelsDAO) => {
  const wss = new WebSocket.Server({ port: port });
  wss.on('connection', function connection(ws, req) {
    let id = req.url.split("/").slice(-1)[0];
    console.log(id);
    channelsDAO.addChannel(id, ws);
  });
}

module.exports = СreateWsServer;