const express = require('express')
const app = express()
const MessageWsService = require("./ws/MessageWsService")
const WsServer = require("./ws/WsServer")
const ChannelsStore = require("./ws/ChannelsStore")
const EventHandler = require('./ami/EventHandler')
const AmiClient = require('./ami/AmiClient')
const AmiRestService = require('./ami/AmiRestService')
require('dotenv').config()


const AMI_LOGIN = process.env.AMI_LOGIN;
const AMI_PASSWORD = process.env.AMI_PASSWORD;
const AMI_HOST = process.env.AMI_HOST;
const AMI_PORT = process.env.AMI_PORT;

let channelsStore = new ChannelsStore();
let messageWsService = new MessageWsService(channelsStore);
let eventHandler = new EventHandler(messageWsService);
let amiClient = new AmiClient();
WsServer(channelsStore);


(async () => {
    await amiClient.init({login: AMI_LOGIN, password: AMI_PASSWORD, host: AMI_HOST, port: AMI_PORT})
    amiClient.addListener("event", eventHandler.handle);
    amiClient.afterPropertiesSet();

    let amiRestService = new AmiRestService(amiClient.client);
    app.get('/', function (req, res) {
        amiRestService.callback("79153979336");
        res.send('Hello World')
    })
})()

   
app.listen(3000)