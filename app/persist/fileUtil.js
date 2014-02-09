"use strict";

var FileUtil = (function() {

var module = {};

module.errorHandler = function(e) {
  console.log('Error: ' + e.message);
  console.trace();
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
    fileWriter.onerror = module.errorHandler;
    fileWriter.onwriteend = function() {
      fileWriter.onwriteend = callback;
      var blob = new Blob([data]);
      fileWriter.write(blob);
    };
    fileWriter.truncate(0);
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