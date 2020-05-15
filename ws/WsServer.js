const WebSocket = require('ws');


let WsServer = (channelsStore) => {
    const wss = new WebSocket.Server({ port: 8080 });
    wss.on('connection', function connection(ws, req) {
      let id = req.url.split("/").slice(-1)[0];
      console.log(id);
      channelsStore.addChannel(id, ws);
    });
}
  
module.exports = WsServer;