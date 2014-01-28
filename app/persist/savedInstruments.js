SavedInstruments = (function() {

"use strict"

var module = {}

var SavedInstrument = function(name, isPreset, instrumentState) {
  this.name = name;
  this.isPreset = isPreset;
  this.instrumentState = instrumentState;
}

module.Manager = function(onInstrumentsLoaded) {
  this.presets = [];
  this.onInstrumentsLoaded = onInstrumentsLoaded;
  this.loadPresets();
}

function errorHandler(e) {
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

module.Manager.prototype.loadPresets = function() {
  var manager = this;
  chrome.runtime.getPackageDirectoryEntry(function(packageEntry) {
    packageEntry.getDirectory('presets', {create: false}, function(presetsEntry) {
      var presetsReader = presetsEntry.createReader();
      var fileEntries = [];

      var addInstrument = function(instrumentText) {
        var fromJSON = JSON.parse(instrumentText);
        manager.presets.push(new SavedInstrument(fromJSON.name, true, fromJSON.instrumentState));
        if (fromJSON.default)
          manager.default = manager.presets[manager.presets.length-1];
      }

      var processNextFile = function() {
        if (!fileEntries.length) {
          manager.onInstrumentsLoaded();
          return;
        }
        var fileEntry = fileEntries.shift();
        fileEntry.file(function(file) {
          var fileReader = new FileReader();
 
          fileReader.onloadend = function(e) {
            addInstrument(this.result);
            processNextFile();
          };
 
          fileReader.readAsText(file);
        }, errorHandler);
      };

      var readFileEntries = function() {
        presetsReader.readEntries (function(results) {
          if (!results.length) {
            processNextFile();
          } else {
            fileEntries = fileEntries.concat(results);
            readFileEntries();
          }
        }, errorHandler);
      };

      readFileEntries();
    });
    //manager.presets.push(new SavedInstrument(gClassic.name, true, gClassic.instrumentState));
    //manager.presets.push(new SavedInstrument(gBassline.name, true, gBassline.instrumentState));
    //manager.default = manager.presets[0];
    //manager.onInstrumentsLoaded();
  });
}

return module;

})();