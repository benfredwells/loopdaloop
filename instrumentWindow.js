"use strict";

var gContext = null;
var gCurrentNote = null;
var gControllerManager = null;
var gOscillatorUI = null;
var gFilterUI = null;
var gInstrument = null;

var cHeightPadding = 100;

////////////////////////////////////////////////////////////////////////////////
// Initialization

function init() {
  gContext = new webkitAudioContext();
  gControllerManager = new ParamController.Manager(gContext);
  var compressor = gContext.createDynamicsCompressor();
  compressor.connect(gContext.destination);
  gInstrument = new Instrument.Instrument(gContext, compressor);

  // Instrument UI setup
  gOscillatorUI = new OscillatorUI.UI(
      gInstrument,
      document.getElementById('settings'));
  gFilterUI = new FilterUI.UI(
      gInstrument,
      document.getElementById('settings'));

  gOscillatorUI.onresize = updateSize;
  gFilterUI.onresize = updateSize;
  updateSize();

  // Defined by background page.
  window.showKeyboard();
}

function updateSize() {
  var height = gOscillatorUI.element.clientHeight +
               gFilterUI.element.clientHeight +
               cHeightPadding;
  window.resizeTo(window.outerWidth, height);
}

window.onload = init;