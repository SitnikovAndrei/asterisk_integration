const bent = require('bent');
const getJSON = bent('json');
const postJSON = bent('POST', 'json');


class AmoRestService {
    cachePhoneFieldInfo = null;

    constructor({baseUrl, login, hash}) {
        this.url = "https://" + baseUrl + "/api/v2/";
        this.auth = "USER_LOGIN=" + login + "&USER_HASH=" + hash
    }

    async createContact(number){
        let phoneFieldsInfo = await this.getPhoneFieldsInfo();
        let contactsPhoneFieldInfo = phoneFieldsInfo.contacts

        let data = {
            add: [{
                    name: "Звонок с номера " + number,
                    custom_fields: [{id: contactsPhoneFieldInfo.id, values: [{"value":number,"enum": contactsPhoneFieldInfo.enums["WORK"]}], is_system: true}]
                }]
        };
        await postJSON(this.url + "contacts?" + this.auth, JSON.stringify(data));
    }

    async getCustomFieldsInfo(){
        let resp = await getJSON(this.url + "account?with=custom_fields&" + this.auth);
        return resp._embedded.custom_fields;
    }

    async getPhoneFieldsInfo(){
        if (this.cachePhoneFieldInfo != null) return this.cachePhoneFieldInfo;

        let convertEntityPhoneEnums = (enums) => {
            let _enums = {};
            Object.keys(enums).forEach(el => {
                _enums[enums[el]] = el;
            });
            return _enums;
        }

        let customFieldsInfo = await this.getCustomFieldsInfo();
        let entitiesPhoneFieldInfo = Object.keys(customFieldsInfo).reduce((result, key)=>{
            let entityInfo = customFieldsInfo[key];
            let entityPhoneFieldInfo = Object.values(entityInfo).filter((el) => el.code === "PHONE")[0];
            if (entityPhoneFieldInfo != null) {
                let entityPhoneFieldId = entityPhoneFieldInfo.id;
                let entityPhoneFieldEnums = convertEntityPhoneEnums(entityPhoneFieldInfo.enums);

                result[key] = {id: entityPhoneFieldId, enums: entityPhoneFieldEnums};
            }
            return result;
        }, {})
        return entitiesPhoneFieldInfo;
    }

    
}
  
  
module.exports = AmoRestService;