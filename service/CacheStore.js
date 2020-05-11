class CacheStore {
    _data = {}
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