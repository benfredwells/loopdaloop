"use strict";

var FileUtil = (function() {

var module = {};

module.errorHandler = function(e) {
  console.log('Error: ' + e.message);
  console.trace();
}

module.readFile = function(fileEntry, callback, errorHandler) {
  var theErrorHandler = errorHandler;
  if (!theErrorHandler)
    theErrorHandler = module.errorHandler;

  fileEntry.file(function(file) {
    var fileReader = new FileReader();

    fileReader.onloadend = function(e) {
      callback(this.result);
    };

    fileReader.readAsText(file);
  }, theErrorHandler);
};

module.writeFile = function(fileEntry, data, callback, errorHandler) {
  var theErrorHandler = errorHandler;
  if (!theErrorHandler)
    theErrorHandler = module.errorHandler;

  fileEntry.createWriter(function(fileWriter) {
    fileWriter.onerror = theErrorHandler;
    fileWriter.onwriteend = function() {
      fileWriter.onwriteend = callback;
      var blob = new Blob([data]);
      fileWriter.write(blob);
    };
    fileWriter.truncate(0);
  }, theErrorHandler);
};

module.forEachEntry = function(directoryEntry, callback, then, errorHandler) {
  var entries = [];
  var reader = directoryEntry.createReader();
  var theErrorHandler = errorHandler;
  if (!theErrorHandler)
    theErrorHandler = module.errorHandler;


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
    }, theErrorHandler);
  };

  readEntries();
};

return module;

})();