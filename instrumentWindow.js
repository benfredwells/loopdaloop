"use strict";

var gContext = null;
var gCurrentNote = null;
var gControllerManager = null;
var gOscillatorUI = null;
var gFilter0UI = null;
var gFilter1UI = null;
var gEnvelopeUI = null;
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
  gFilter0UI = new FilterUI.UI(
      gInstrument.filters[0], 'Filter A',
      document.getElementById('settings'));
  gFilter1UI = new FilterUI.UI(
      gInstrument.filters[1], 'Filter B',
      document.getElementById('settings'));
  gEnvelopeUI = new EnvelopeUI.UI(
      gInstrument,
      document.getElementById('settings'));

  gOscillatorUI.onresize = updateSize;
  gFilter0UI.onresize = updateSize;
  gFilter1UI.onresize = updateSize;
  gEnvelopeUI.onresize = updateSize;
  updateSize();

  // Defined by background page.
  window.showKeyboard();
}

function updateSize() {
  var height = gOscillatorUI.element.clientHeight +
               gFilter0UI.element.clientHeight +
               gFilter1UI.element.clientHeight +
               gEnvelopeUI.element.clientHeight +
               cHeightPadding;
  window.resizeTo(window.outerWidth, height);
}

window.onload = init;