const СreateWsServer = require("./ws/СreateWsServer");
const MessageWsService = require("./ws/MessageWsService");
const ChannelsDAO = require("./ws/ChannelsDAO");
const EventListener = require('./ami/EventListener');
const EventHandler = require('./ami/EventHandler');
const CreateAmiClient = require('./ami/CreateAmiClient');
const CacheStoreFactory = require('./service/CacheStoreFactory');
require('dotenv').config();

const AMI_LOGIN = process.env.AMI_LOGIN;
const AMI_PASSWORD = process.env.AMI_PASSWORD;
const AMI_HOST = process.env.AMI_HOST;
const AMI_PORT = process.env.AMI_PORT;
const WS_PORT = process.env.WS_PORT;

let channelsDAO = new ChannelsDAO();
let cacheStoreFactory = new CacheStoreFactory();
let messageWsService = new MessageWsService(channelsDAO);
// let eventHandler = new EventHandler(cacheStoreFactory, messageWsService);
// eventHandler.init();

let eventListener = new EventListener(messageWsService);
CreateAmiClient({login: AMI_LOGIN, password: AMI_PASSWORD, host: AMI_HOST, port: AMI_PORT}, eventListener);
СreateWsServer({port: WS_PORT}, channelsDAO);