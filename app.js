const СreateWsServer = require("./ws/СreateWsServer");
const MessageWsService = require("./ws/MessageWsService");
const ChannelsDAO = require("./ws/ChannelsDAO");
const EventHandler = require('./ami/EventHandler');
const EventConverter = require('./mapper/EventConverter');
const CreateAmiClient = require('./ami/CreateAmiClient');
const CacheStore = require('./service/CacheStore');
require('dotenv').config();

const AMI_LOGIN = process.env.AMI_LOGIN;
const AMI_PASSWORD = process.env.AMI_PASSWORD;
const AMI_HOST = process.env.AMI_HOST;
const AMI_PORT = process.env.AMI_PORT;
const WS_PORT = process.env.WS_PORT;

let channelsDAO = new ChannelsDAO();
let cacheStore = new CacheStore();
let eventConverter = new EventConverter(cacheStore);
let messageWsService = new MessageWsService(channelsDAO);
let eventHandler = new EventHandler(messageWsService, eventConverter);
CreateAmiClient({login: AMI_LOGIN, password: AMI_PASSWORD, host: AMI_HOST, port: AMI_PORT}, eventHandler);
СreateWsServer({port: WS_PORT}, channelsDAO);