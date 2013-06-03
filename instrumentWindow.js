"use strict";

var gContext = null;
var gCurrentNote = null;
var gControllerManager = null;
var gInstrumentUIs = [];
var gInstrument = null;

var kHeightPadding = 100;
var kCompressorThreshold = -30;
var kCompressorKnee = 10;

////////////////////////////////////////////////////////////////////////////////
// Initialization

function init() {
  gContext = new webkitAudioContext();
  gControllerManager = new ParamController.Manager(gContext);
  var compressor = gContext.createDynamicsCompressor();
  compressor.threshold.value = kCompressorThreshold;
  compressor.knee.value = kCompressorKnee;
  compressor.connect(gContext.destination);
  gInstrument = new Instrument.Instrument(gContext, compressor);

  // Instrument UI setup
  gInstrumentUIs.push(new OscillatorUI.UI(
      gInstrument,
      document.getElementById('settings')));
  gInstrumentUIs.push(new FilterUI.UI(
      gInstrument.filters[0], 'Filter A',
      document.getElementById('settings')));
  gInstrumentUIs.push(new FilterUI.UI(
      gInstrument.filters[1], 'Filter B',
      document.getElementById('settings')));
  gInstrumentUIs.push(new EnvelopeUI.UI(
      gInstrument,
      document.getElementById('settings')));

  gInstrumentUIs.forEach(function (ui) {
    ui.onCollapseChanged = collapseChanged;
  });
  updateSize();

  // Defined by background page.
  window.showKeyboard();
}

function collapseChanged(sender) {
  gInstrumentUIs.forEach(function (ui) {
    if (ui != sender)
      ui.setCollapsed(true);
  });
  updateSize();
}

function updateSize() {
  var height = 0;
  gInstrumentUIs.forEach(function(ui) {
    height = height + ui.element.clientHeight;
  });
  height = height + kHeightPadding;
  window.resizeTo(window.outerWidth, height);
}

window.onload = init;