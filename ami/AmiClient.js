const AsteriskAmiClient = require('asterisk-ami-client');

class AmiClient {
    client;

    init(login, password, host, port){
        this.client = new AsteriskAmiClient();
        return this.client.connect(login, password, { host: host, port: port });
    }

    addListener(listenerName, func){
        this.client.on(listenerName, func)
    }

    afterPropertiesSet(){
        this.addListener("connect", () => console.log('connect'));
        this.addListener("response", (res) => console.log(res));
        this.addListener("disconnect", () => console.log('disconnect'));
    }
}

module.exports = AmiClient;