class MessageWsService {
    constructor(channelsDAO){
        this.channelsDAO = channelsDAO;
    }
    sendMessage = (id, message) => {
        let channel = this.channelsDAO.getChannelById(id);
        if (channel != null) {
            channel.send(message);
        }
    }

    sendJsonMessage = (id, event) => {
        let channel = this.channelsDAO.getChannelById(id);
        if (channel != null) {
            channel.send(JSON.stringify(event, (key, value) => {
              if (value !== null) return value
          }));
        }
    }
}

module.exports = MessageWsService;