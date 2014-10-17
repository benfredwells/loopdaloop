"use strict";

var SavedInstruments = (function() {

var module = {};

var kSaverTimerInterval = 1000;
var kPresetsFolder = 'presets';
var kUseSyncFS = true;
var kClearStorage = false;
var kUserPresetFileNameBase = 'user_';
var kPresetExtension = '.json';

module.Manager = function(instrument, onInstrumentsLoaded) {
  this.instrument_ = instrument;
  this.presets = [];
  this.loaded = false;
  this.currentPreset = null;
  this.onInstrumentsLoaded = onInstrumentsLoaded;
  this.onCurrentPresetModified = null;
  this.onPresetListChanged = null;
  this.instrument_.setListener(this);
  this.saveTimerId = null;
  this.presetStorage_ = null;
  this.errorCallback_ = null;
  this.currentError_ = '';
  this.domErrorHandlerCallback = this.domErrorHandler_.bind(this);
  this.loadPresets_();
};

module.Manager.prototype.setErrorHandler = function(callback) {
  this.errorCallback_ = callback;
  if (this.currentError_)
    this.errorCallback_(this.currentError_);
};

module.Manager.prototype.updateError_ = function(errorText) {
  this.currentError_ = errorText;
  if (this.errorCallback_)
    this.errorCallback_(this.currentError_);
};

module.Manager.prototype.domErrorHandler_ = function(domError) {
  this.updateError_(domError.message);
};

module.Manager.prototype.presetWithFileName = function(fileName) {
  var match = null;
  this.presets.forEach(function(preset) {
    if (preset.fileName == fileName)
      match = preset;
  });
  return match;
};

module.Manager.prototype.clearStorage_ = function(then) {
  var manager = this;
  var processEntry = function(entry, then) {
    entry.remove(then, manager.domErrorHandlerCallback);
  };

  FileUtil.forEachEntry(this.presetStorage_, processEntry, then, this.domErrorHandlerCallback);
};

module.Manager.prototype.openStorage_ = function(then) {
  var manager = this;
  var requestFileSystemCallback = function(fileSystem) {
    if (chrome.runtime.lastError) {
      manager.updateError_('Error creating file system: ' + chrome.runtime.lastError.message);
      then();
      return;
    };
    manager.presetStorage_ = fileSystem.root;

    chrome.syncFileSystem.onFileStatusChanged.addListener(manager.handleFileStatusChanged_.bind(manager));

    if (kClearStorage) {
      manager.clearStorage_(then);
      return;
    }

    then();
  };

  if (kUseSyncFS) {
    chrome.syncFileSystem.requestFileSystem(requestFileSystemCallback);
  } else {
    window.webkitRequestFileSystem(window.PERSISTENT, 10 * 1024 * 1024, requestFileSystemCallback, this.domErrorHandlerCallback);
  }
};

module.Manager.prototype.loadUserPresets_ = function() {
  var processEntry = function(entry, then) {
    if (this.presetWithFileName(entry.name) !== null) {
      then();
      return;
    }

    var preset = new Preset.UserPreset(this, entry.name, this.presetStorage_);
    this.presets.push(preset);
    preset.loadFromEntry(then, entry);
  };

  FileUtil.forEachEntry(this.presetStorage_,
                        processEntry.bind(this),
                        this.handlePresetsLoaded_.bind(this),
                        this.domErrorHandlerCallback);
}

module.Manager.prototype.loadBuiltIns_ = function(builtInsFolder) {
  var processEntry = function(entry, then) {
    var preset = new Preset.BuiltIn(this, entry, this.presetStorage_);
    this.presets.push(preset);
    preset.load(then);
  };

  FileUtil.forEachEntry(builtInsFolder,
                        processEntry.bind(this),
                        this.loadUserPresets_.bind(this),
                        this.domErrorHandlerCallback);
}

module.Manager.prototype.loadPresets_ = function() {
  var manager = this;
  this.openStorage_(function() {
    chrome.runtime.getPackageDirectoryEntry(function(packageEntry) {
      packageEntry.getDirectory(kPresetsFolder,
                                {create: false},
                                manager.loadBuiltIns_.bind(manager),
                                manager.domErrorHandlerCallback);
    });
  });
};

module.Manager.prototype.handlePresetsLoaded_ = function() {
  var manager = this;
  this.presets.forEach(function(preset) {
    if (preset.isDefault)
      manager.usePreset_(preset);
  });

  this.loaded = true;
  this.instrument_.startListening();
  this.onInstrumentsLoaded();
};

module.Manager.prototype.usePresetWithIndex = function(index) {
  this.usePreset_(this.presets[index]);
};

module.Manager.prototype.usePresetWithFileName = function(fileName) {
  this.usePreset_(this.presetWithFileName(fileName));
};

module.Manager.prototype.handleFileUpdated_ = function(entry) {
  console.log('Got updated file ' + entry.name);

  var manager = this;
  var updateInstrumentAndUpdate = function(preset) {
    if (this.currentPreset == preset) {
      console.log('Updating instrument and UI');
      preset.updateInstrument(this.instrument_);
      manager.notifyCurrentPresetModified_();
    }
  };

  this.presets.forEach(function(preset) {
    if (preset.fileName == entry.name && !(preset.isModified || preset.isSaving)) {
      console.log('Found saved instrument to update');
      preset.loadFromEntry(updateInstrumentAndUpdate.bind(manager, preset), entry);
    }
  });
};

module.Manager.prototype.handleFileStatusChanged_ = function(detail) {
  if (detail.status == 'synced' && detail.direction == 'remote_to_local') {
    if (detail.action == 'updated')
      this.handleFileUpdated_(detail.fileEntry);
  }
};

module.Manager.prototype.usePreset_ = function(preset) {
  if (!preset)
    return;

  if (this.currentPreset)
    this.currentPreset.updateFromInstrument(this.instrument_);

  this.currentPreset = preset;
  this.currentPreset.updateInstrument(this.instrument_);
};

module.Manager.prototype.exportCurrent = function(entry) {
  var jsonObject = {};
  jsonObject.instrumentState = InstrumentState.getInstrumentState(this.instrument_);
  var jsonText = JSON.stringify(jsonObject, null, 2);
  FileUtil.writeFile(entry, jsonText, this.domErrorHandlerCallback);
};

// TODO: rename this handleSettingChanged
module.Manager.prototype.onChanged = function() {
  this.currentPreset.isModified = true;
  this.scheduleSave_();
};

module.Manager.prototype.notifyCurrentPresetModified_ = function() {
  if (this.onCurrentPresetModified)
    this.onCurrentPresetModified();
};

module.Manager.prototype.notifyPresetListChanged_ = function() {
  if (this.onPresetListChanged)
    this.onPresetListChanged();
};

module.Manager.prototype.scheduleSave_ = function() {
  if (this.saveTimerId)
    clearTimeout(this.saveTimerId);

  this.saveTimerId = setTimeout(this.doSave_.bind(this), kSaverTimerInterval);
};

module.Manager.prototype.doSave_ = function() {
  this.saveTimerId = null;

  // if any are still saving, back off and schedule another save.
  if (this.presets.some(function(preset) { return preset.isSaving; } )) {
    console.log('Something is saving, backing off.');
    this.scheduleSave_();
    return;
  }

  if (this.currentPreset.isModified)
    this.currentPreset.updateFromInstrument(this.instrument_);

  this.presets.forEach(function(preset) { preset.beginSaveIfNeeded(); } );
};

module.Manager.prototype.getNextUserPresetFileName = function(then) {
  var manager = this;
  var checkFileName = function(uniqueifier) {
    // TODO: add proper error handler.
    var fileName = kUserPresetFileNameBase + uniqueifier + kPresetExtension;
    manager.presetStorage_.getFile(fileName, {create: false},
                                   checkFileName.bind(manager, uniqueifier+1),
                                   then.bind(manager, fileName));
  }
  checkFileName(1);
}

module.Manager.prototype.addUserPreset = function(name) {
  var manager = this;
  var addPresetWithFileName = function(fileName) {
    var userPreset = new Preset.UserPreset(manager,
                                           name,
                                           fileName,
                                           manager.presetStorage_,
                                           manager.currentPreset.instrumentState);
    manager.presets.push(userPreset);
    manager.currentPreset = userPreset;
    manager.notifyPresetListChanged_();
    
    userPreset.isModified = true;
    manager.scheduleSave_();
  }
  this.getNextUserPresetFileName(addPresetWithFileName);
}

return module;

})();