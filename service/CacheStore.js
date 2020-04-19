class CacheStore {
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
     * @param {any} v 
     */
    put(k, v){
        this._data[k] = v;
    }

    /**
     * 
     * @param {string} k 
     */
    get(k){
       return this._data[k];
    }
}
  
  
module.exports = CacheStore;