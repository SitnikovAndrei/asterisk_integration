class MessageWsService {
    constructor(channelsStore){
        this.channelsStore = channelsStore;
    }
    sendMessage = (id, message) => {
        let channel = this.channelsStore.getChannelById(id);
        if (channel != null) {
            channel.send(message);
        }
    }

    sendJsonMessage = (id, event) => {
        let channel = this.channelsStore.getChannelById(id);
        if (channel != null) {
            channel.send(JSON.stringify(event, (key, value) => {
              if (value !== null) return value
          }));
        }
    }
}

module.exports = MessageWsService;