const CacheStore = require('./CacheStore');

class CacheStoreFactory {
    constructor(){
        if(this.instance){
            return this.instance;
        }
        this._data = {};
        this.instance = this;
    }

    /**
     * 
     * @param {string} k 
     */
    get(k){
       let cacheStore = this._data[k];
       if (cacheStore == null){
         this._data[k] = new CacheStore();
       }
       return this._data[k];
    }
}
  
  
module.exports = CacheStoreFactory;