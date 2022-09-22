let instance;


class GlobalDataFile {
    readString (key, defValue) {
        let value = cc.sys.localStorage.getItem(key);
        return value === null ? defValue : value;
    }
    
    
    writeString (key, value) {
        cc.sys.localStorage.setItem(key, value);
    }


    readBool (key, defValue) {
        switch(this.readString(key)) {
            case 'true':
                return true;
            case 'false':
                return false;
            default:
                return defValue;
        }
    }


    writeBool (key, value) {        
        this.writeString(key, value ? 'true' : 'false');
    }


    readInt (key, defValue) {
        let value = parseInt(this.readString(key));
        return isNaN(value) ? defValue : value;
    }


    writeInt (key, value) {
        this.writeString(key, value.toString());
    }


    readFloat (key, defValue) {
        let value = parseFloat(this.readString(key));
        return isNaN(value) ? defValue : value;
    }


    writeFloat (key, value) {
        this.writeString(key, value.toString());
    }


    readObject (key, defDataObject) {
        let str = this.readString(key);
        return str === undefined
          ? Object.assign({}, defDataObject) 
          : JSON.parse(str);
    }


    writeObject (key, dataObject) {
        this.writeString(key, JSON.stringify(dataObject));
    }


    readArray (key, defDataArray) {
        let str = this.readString(key);
        if (str !== undefined) {
            return JSON.parse(str);
        }        
        return Array.isArray(defDataArray)
          ? defDataArray.slice()
          : defDataArray;
    }


    writeArray (key, dataArray) {
        this.writeString(key, JSON.stringify(dataArray));
    }
};

export default {
    getInstance () {
        if (!instance) {
            instance = new GlobalDataFile();
        }
        return instance;
    }
}
