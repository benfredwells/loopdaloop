FileUtil = (function() {

"use strict"

var module = {};

module.errorHandler = function(e) {
  var msg = '';

  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };

  console.log('Error: ' + msg);
}

module.readFile = function(fileEntry, callback) {
  fileEntry.file(function(file) {
    var fileReader = new FileReader();

    fileReader.onloadend = function(e) {
      callback(this.result);
    };

    fileReader.readAsText(file);
  }, module.errorHandler);
};

module.writeFile = function(fileEntry, data, callback) {
  fileEntry.createWriter(function(fileWriter) {
    fileWriter.onwriteend = callback;
    fileWriter.onerror = module.errorHandler;

    var blob = new Blob([data]);
    fileWriter.write(blob);
  }, module.errorHandler);
};

module.forEachEntry = function(directoryEntry, callback, then) {
  var entries = [];
  var reader = directoryEntry.createReader();

  var handleEachEntry = function() {
    if (!entries.length) {
      then();
      return;
    }

    callback(entries.shift(), handleEachEntry);
  };

  var readEntries = function() {
    reader.readEntries (function(results) {
      if (!results.length) {
        handleEachEntry();
      } else {
        entries = entries.concat(results);
        readEntries();
      }
    }, module.errorHandler);
  };

  readEntries();
};

return module;

})();