const fs = require("fs");
const path = require('path');

/*var Foo = function(){
  var _acctNum = '';

  return {
    getAcctNum: function(){
      return _acctNum;
    },
    setAcctNum: function(newAcctNum){
      _acctNum = newAcctNum;
    }
  }
}*/

module.exports = function(file, force = false){
  const _this = this;
  this.file = file;
  this.force = force;
  this.cachedDatabaseObject = null;

  this.get = function(key) {
    if(!path.isAbsolute(_this.file)){
      if(!_this.force){
        console.log("This is not a valid absolute path!");
        return null;
      } else {
        _this.file = path.resolve(_this.file);
      }
    }
    var keys = key.split(".");
    var object = _this.cachedDatabaseObject;
    if(object == null) {
      object = _loadDatabaseObject(_this.file);
      _this.cachedDatabaseObject = object;
      if(object == null){
        console.log("Could not get object from file!");
        return null;
      }
    }
    var result;
    for(var _key of keys){
      if(result == null) {
        result = object[_key];
      } else {
        result = result[_key];
      }
    }
    return result;
  }

  this.set = function(key, value) {
    if(!path.isAbsolute(_this.file)){
      if(!_this.force){
        console.log("This is not a valid absolute path!");
        return null;
      } else {
        _this.file = path.resolve(_this.file);
      }
    }
    var object = _this.cachedDatabaseObject;
    if(object == null) {
      object = _loadDatabaseObject(_this.file);
      _this.cachedDatabaseObject = object;
      if(object == null){
        console.log("Could not get object from file!");
        return null;
      }
    }
    var keys = key.split('.');
    _insertValue(object, keys, value);
    _writeDatabaseObject(_this.file, object, _this.force);
  }

  this.unset = function(key){
    if(!path.isAbsolute(_this.file)){
      if(!_this.force){
        console.log("This is not a valid absolute path!");
        return null;
      } else {
        _this.file = path.resolve(_this.file);
      }
    }
    var object = _this.cachedDatabaseObject;
    if(object == null) {
      object = _loadDatabaseObject(_this.file);
      _this.cachedDatabaseObject = object;
      if(object == null){
        console.log("Could not get object from file!");
        return null;
      }
    }
    var keys = key.split('.');
    _deleteKey(object, keys);
    _writeDatabaseObject(_this.file, object, _this.force);
  }
}

_get = function(file, key, force = false) {
  if(!path.isAbsolute(file)){
    if(!force){
      console.log("This is not a valid absolute path!");
      return null;
    } else {
      file = path.resolve(file);
    }
  }
  var keys = key.split(".");
  var object = _loadDatabaseObject(file);
  var result;
  for(var _key of keys){
    if(result == null) {
      result = object[_key];
    } else {
      result = result[_key];
    }
  }
  return result;
}

_set = function(file, key, value, force = false) {
  if(!path.isAbsolute(file)){
    if(!force){
      console.log("This is not a valid absolute path!");
      return null;
    } else {
      file = path.resolve(file);
    }
  }
  var object = _loadDatabaseObject(file);
  var keys = key.split('.');
  _insertValue(object, keys, value);
  _writeDatabaseObject(file, object, force);
}
_unset = function(file, key, force = false){
  if(!path.isAbsolute(file)){
    if(!force){
      console.log("This is not a valid absolute path!");
      return null;
    } else {
      file = path.resolve(file);
    }
  }
  var object = _loadDatabaseObject(file);
  var keys = key.split('.');
  _deleteKey(object, keys);
  _writeDatabaseObject(file, object, force);
}

_deleteKey = function(object, keys){
  if(object == null) return; // if the key doesn't exist just leave. :D
  if(keys.length == 1) delete object[[keys[0]]]; // Pass by sharing magic! :)
  else object = _deleteKey(object[[keys[0]]], keys.splice(1, keys.length));
}

_insertValue = function(object, keys, value){
  if(keys.length == 0) return value; // Pass by sharing magic? :O
  if([keys[0]] in object) object[[keys[0]]] = _insertValue(object[[keys[0]]], keys.slice(1, keys.length), value);
  else object[[keys[0]]] = _insertValue(new Object(), keys.slice(1, keys.length), value);
  return object;
}

_loadDatabaseObject = function(file) {
  var object;
  try {
    var string = fs.readFileSync(file, 'utf8');
    object = JSON.parse(string);
  } catch (err) {
    object = new Object();
  }
  return object;
}

_writeDatabaseObject = function(file, object, force) {
  if(force) {
    var dir = file.substring(0, file.lastIndexOf("/"));
    fs.promises.mkdir(dir, { recursive: true })
      .catch(err => {
        console.log("Something went wrong creating subdirectories! " + err);
      });
  }
  fs.promises.writeFile(file, JSON.stringify(object))
    .catch(err => {
      return console.log("Write error: " + err);
    });
}
