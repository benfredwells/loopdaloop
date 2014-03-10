"use strict";

var SavedInstruments = (function() {

var module = {};

var kSaverTimerInterval = 1000;
var kPresetsFolder = 'presets';
var kPresetSuffix = '.preset';
var kUseSyncFS = true;
var kClearStorage = false;

var Preset = function(manager, originalFileEntry, storageDirectoryEntry) {
  this.name = '';
  this.manager_ = manager;
  this.isDefault = false;
  this.isModified = false;
  this.isSaving = false;
  this.instrumentState = null;
  this.originalFileEntry_ = originalFileEntry;
  this.storageDirectoryEntry = storageDirectoryEntry;
  this.fileName = this.originalFileEntry_.name + kPresetSuffix;
};

Preset.prototype.updateInstrument = function(instrument) {
  instrument.stopListening();
  InstrumentState.updateInstrument(instrument, this.instrumentState);
  instrument.startListening();
};

Preset.prototype.updateFromInstrument_ = function(instrument) {
  this.instrumentState = InstrumentState.getInstrumentState(instrument);
};

Preset.prototype.updateFromJSON_ = function(then, jsonText) {
  var fromJSON = JSON.parse(jsonText);
  this.name = fromJSON.name;
  this.instrumentState = fromJSON.instrumentState;
  this.isDefault = fromJSON.default;
  then();
};

Preset.prototype.loadFromEntry = function(then, entry) {

  this.instrumentState = null;
  FileUtil.readFile(entry, this.updateFromJSON_.bind(this, then), this.manager_.domErrorHandlerCallback);
};

Preset.prototype.load_ = function(then) {
  if (this.storageDirectoryEntry) {
    this.storageDirectoryEntry.getFile(this.fileName, {create: false}, this.loadFromEntry.bind(this, then),
                                       this.loadFromEntry.bind(this, then, this.originalFileEntry_),
                                       this.manager_.domErrorHandlerCallback);
  }
  else
    this.loadFromEntry(entry, this.originalFileEntry_);
}

Preset.prototype.beginSaveIfNeeded_ = function() {
  if (!this.isModified)
    return;

  this.isModified = false;
  if (!this.storageDirectoryEntry)
    return;

  this.isSaving = true;
  this.manager_.notifyObserver();

  var jsonObject = {};
  jsonObject.instrumentState = this.instrumentState;
  jsonObject.default = this.isDefault;
  jsonObject.name = this.name;
  var jsonText = JSON.stringify(jsonObject, null, 2);
  var preset = this;
  this.storageDirectoryEntry.getFile(this.fileName, {create: true}, function(entry) {
    FileUtil.writeFile(entry, jsonText, preset.finishedSaving_.bind(preset), preset.manager_.domErrorHandlerCallback);
  }, this.manager_.domErrorHandlerCallback);
};

Preset.prototype.finishedSaving_ = function() {
  this.isSaving = false;
  this.manager_.notifyObserver();
};

module.Manager = function(instrument, onInstrumentsLoaded) {
  this.instrument_ = instrument;
  this.presets = [];
  this.loaded = false;
  this.currentPreset = null;
  this.onInstrumentsLoaded = onInstrumentsLoaded;
  this.onPresetStateChanged = null;
  this.instrument_.setListener(this);
  this.saveTimerId = null;
  this.presetStorage_ = null;
  this.errorCallback_ = null;
  this.currentError_ = '';
  this.domErrorHandlerCallback = this.domErrorHandler.bind(this);
  this.loadPresets();
};

module.Manager.prototype.setErrorHandler = function(callback) {
  this.errorCallback_ = callback;
  if (this.currentError_)
    this.errorCallback_(this.currentError_);
};

module.Manager.prototype.updateError = function(errorText) {
  this.currentError_ = errorText;
  if (this.errorCallback_)
    this.errorCallback_(this.currentError_);
};

module.Manager.prototype.domErrorHandler = function(domError) {
  this.updateError(domError.message);
};

module.Manager.prototype.clearStorage = function(then) {
  var manager = this;
  var processEntry = function(entry, then) {
    entry.remove(then, manager.domErrorHandlerCallback);
  };

  FileUtil.forEachEntry(this.presetStorage_, processEntry, then, this.domErrorHandlerCallback);
}

module.Manager.prototype.openStorage = function(then) {
  var manager = this;
  var requestFileSystemCallback = function(fileSystem) {
    if (chrome.runtime.lastError) {
      manager.updateError('Error creating syncFS: ' + chrome.runtime.lastError.message);
      then();
      return;
    };
    manager.presetStorage_ = fileSystem.root;

    chrome.syncFileSystem.onFileStatusChanged.addListener(manager.handleFileStatusChanged_.bind(manager));

    if (kClearStorage) {
      manager.clearStorage(then);
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

module.Manager.prototype.loadPresets = function() {
  var manager = this;
  this.openStorage(function() {
    chrome.runtime.getPackageDirectoryEntry(function(packageEntry) {
      packageEntry.getDirectory(kPresetsFolder, {create: false}, function(presetsEntry) {
        var processEntry = function(entry, then) {
          var preset = new Preset(manager, entry, manager.presetStorage_);
          manager.presets.push(preset);
          preset.load_(then);
        };

        FileUtil.forEachEntry(presetsEntry, processEntry, manager.handlePresetsLoaded.bind(manager), manager.domErrorHandlerCallback);
      }, manager.domErrorHandlerCallback);
    });
  });
};

module.Manager.prototype.handlePresetsLoaded = function() {
  var manager = this;
  this.presets.forEach(function(preset) {
    if (preset.isDefault)
      manager.usePreset(preset);
  });

  this.loaded = true;
  this.instrument_.startListening();
  this.onInstrumentsLoaded();
};

module.Manager.prototype.usePresetWithIndex = function(index) {
  this.usePreset(this.presets[index]);
};

module.Manager.prototype.handleFileUpdated_ = function(entry) {
  var manager = this;
  var updateInstrumentAndUpdate = function(preset) {
    preset.updateInstrument(this.instrument_);
    manager.notifyObserver();
  }

  this.presets.forEach(function(preset) {
    if (preset.fileName == entry.name)
      preset.loadFromEntry(updateInstrumentAndUpdate.bind(manager, preset), entry);
  });
};

module.Manager.prototype.handleFileStatusChanged_ = function(detail) {
  if (detail.status == 'synced' && detail.direction == 'remote_to_local') {
    if (detail.action == 'updated')
      this.handleFileUpdated_(detail.fileEntry);
  }
};

module.Manager.prototype.usePreset = function(preset) {
  if (this.currentPreset)
    this.currentPreset.updateFromInstrument_(this.instrument_);

  this.currentPreset = preset;
  this.currentPreset.updateInstrument(this.instrument_);
};

module.Manager.prototype.exportCurrent = function(entry) {
  var jsonObject = {};
  jsonObject.instrumentState = InstrumentState.getInstrumentState(this.instrument_);
  var jsonText = JSON.stringify(jsonObject, null, 2);
  FileUtil.writeFile(entry, jsonText, this.domErrorHandlerCallback);
};

module.Manager.prototype.onChanged = function() {
  this.currentPreset.isModified = true;
  this.scheduleSave_();
  this.notifyObserver();
};

module.Manager.prototype.notifyObserver = function() {
  if (this.onPresetStateChanged)
    this.onPresetStateChanged();
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
    this.currentPreset.updateFromInstrument_(this.instrument_);

  this.presets.forEach(function(preset) { preset.beginSaveIfNeeded_(); } );
  this.notifyObserver();
};

return module;

})();