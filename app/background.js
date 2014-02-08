"use strict";

var BackgroundPage = function() {
  this.synthWindow = null;
  this.keyboardWindow = null;
  this.synthWrapper = null;
  this.scene = new Scene.Scene();
  this.instrument = new Instrument.Instrument();
  this.savedInstruments = new SavedInstruments.Manager(this.instrument, this.handleSavedInstrumentsLoaded.bind(this));
}

BackgroundPage.prototype.handleSavedInstrumentsLoaded = function() {
  if (this.synthWrapper)
    this.synthWrapper.handleSavedInstrumentsLoaded();
}

BackgroundPage.prototype.handleLaunch = function() {
  if (this.synthWindow && this.keyboardWindow) {
    this.synthWindow.focus();
    this.keyboardWindow.focus();
  }

  var instrumentParams = {
    width: 444,
    height: 353,
    resizable: false,
    left: 20,
    top: 100,
    id: 'instrumentv2'
  };

  chrome.app.window.create('synthWindow.html', instrumentParams, this.handleSynthWindowCreated.bind(this));
}

BackgroundPage.prototype.handleSynthWindowCreated = function(win) {
  win.contentWindow.gBackgroundPage = this;
  this.synthWindow = win;
  win.onClosed.addListener(this.handleSynthWindowClose.bind(this));
}

BackgroundPage.prototype.handleSynthWindowClose = function() {
  this.synthWindow = null;
  this.synthWrapper = null;
  if (this.keyboardWindow)
    this.keyboardWindow.contentWindow.close();
}

BackgroundPage.prototype.showKeyboard = function() {
  var keyboardParams = {
    width: 800,
    height: 350,
    minWidth: 800,
    minHeight: 350,
    left: 400,
    top: 100,
    id: 'keyboard'
  };

  chrome.app.window.create('keyboardWindow.html', keyboardParams, this.handleKeyboardWindowCreated.bind(this));
}

BackgroundPage.prototype.setSynthWrapper = function(wrapper) {
  this.synthWrapper = wrapper;
  if (this.savedInstruments.loaded)
    this.synthWrapper.handleSavedInstrumentsLoaded();
}

BackgroundPage.prototype.handleKeyboardWindowCreated = function(win) {
  this.keyboardWindow = win;
  win.contentWindow.gBackgroundPage = this;
  win.onClosed.addListener(this.handleKeyboardWindowClosed.bind(this));
}

BackgroundPage.prototype.handleKeyboardWindowClosed = function() {
  this.keyboardWindow = null;
  if (this.synthWindow)
    this.synthWindow.contentWindow.close();
}

var gBackgroundPage = new BackgroundPage();

chrome.app.runtime.onLaunched.addListener(gBackgroundPage.handleLaunch.bind(gBackgroundPage));