class ChannelsStore {
    channels = {};
    addChannel(id, channel){
        this.channels[id] = channel;
    }

    getChannelById(id){
        return this.channels[id];
    }

    getChannels(){
        return this.channels;
    }

    deleteChannels(){
        this.channels = null;
    }
}

module.exports = ChannelsStore;