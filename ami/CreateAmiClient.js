const AmiClient = require('asterisk-ami-client');
const client = new AmiClient();

let CreateAmiClient = async ({login, password, host, port}, eventListener)=>{
    await client.connect(login, password, { host: host, port: port })
    .then(amiConnection => {
        client
            .on('connect', () => console.log('connect'))
            .on('event', eventListener.accept)
            .on('disconnect', () => console.log('disconnect'))
            .action({
                Action: 'Ping'
            });
    })
    .catch(error => console.log(error));
}

module.exports = CreateAmiClient;