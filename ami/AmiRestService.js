class AmiRestService {
    constructor(client){
        this.client = client;
    }

    callback(number){
        this.client.action({
            "Action":'Originate',
            "Channel":'SIP/1001',
            "Exten":number,
            "Priority":1,
            "Context":'mango-out',
            "CallerID":'ami_client'
        });  
    }
}
  
  
module.exports = AmiRestService;