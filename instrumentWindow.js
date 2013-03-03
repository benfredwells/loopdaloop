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

  gOscillatorUI.onCollapseChanged = collapseChanged;
  gFilter0UI.onCollapseChanged = collapseChanged;
  gFilter1UI.onCollapseChanged = collapseChanged;
  gEnvelopeUI.onCollapseChanged = collapseChanged;
  updateSize();

  // Defined by background page.
  window.showKeyboard();
}

function collapseChanged(sender) {
  if (gOscillatorUI != sender)
    gOscillatorUI.setCollapsed(true);
  if (gFilter0UI != sender)
    gFilter0UI.setCollapsed(true);
  if (gFilter1UI != sender)
    gFilter1UI.setCollapsed(true);
  if (gEnvelopeUI != sender)
    gEnvelopeUI.setCollapsed(true);
  updateSize();
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