const AmiClient = require('asterisk-ami-client');
const client = new AmiClient();

let CreateAmiClient = ({login, password, host, port}, eventHandler)=>{
    client.connect(login, password, { host: host, port: port })
    .then(amiConnection => {
        client
            .on('connect', () => console.log('connect'))
            .on('event', eventHandler.handle)
            .on('disconnect', () => console.log('disconnect'))
            .action({
                Action: 'Ping'
            });
    })
    .catch(error => console.log(error));
}

module.exports = CreateAmiClient;