"use strict";

var gContext = null;
var gCurrentNote = null;
var gInstrumentUIs = [];
var gInstrument = null;

var kHeightPadding = 100;
var kCompressorThreshold = -30;
var kCompressorKnee = 10;
var kCompressorAttack = 0.01;
var kCompressorRelease = 1;

var kOscillatorAID = 'oscillatora';
var kOscillatorBID = 'oscillatorb';
var kOscillatorCID = 'oscillatorc';
var kFilterAID = 'fitlera';
var kFilterBID = 'filterb';
var kEnvelopeID = 'envelope';

var kExpandedFieldKey = 'instrumentWindowExpandedField';

////////////////////////////////////////////////////////////////////////////////
// Initialization

function init() {
  gContext = new webkitAudioContext();
  var compressor = gContext.createDynamicsCompressor();
  compressor.threshold.value = kCompressorThreshold;
  compressor.knee.value = kCompressorKnee;
  compressor.attack.value = kCompressorAttack;
  compressor.release.value = kCompressorRelease;
  compressor.connect(gContext.destination);
  gInstrument = new Instrument.Instrument(gContext, compressor);
  InstrumentState.updateInstrument(gInstrument, DefaultInstrumentState.Default());

// Temporarily turned off because debugging with this sucks
//  chrome.storage.local.get(kExpandedFieldKey, function(items) {
//    var expandedID = items[kExpandedFieldKey];
    var expandedID = kOscillatorAID;
// End temporary hack
    // Instrument UI setup
    var categoriesEl = document.getElementById('categories');
    var detailsEl = document.getElementById('details');
    gInstrumentUIs.push(new OscillatorUI.UI(
        kOscillatorAID,
        gInstrument.oscillators[0], 'Oscillator A',
        categoriesEl,
        detailsEl,
        kOscillatorAID != expandedID));
    gInstrumentUIs.push(new OscillatorUI.UI(
        kOscillatorBID,
        gInstrument.oscillators[1], 'Oscillator B',
        categoriesEl,
        detailsEl,
        kOscillatorBID != expandedID));
    gInstrumentUIs.push(new OscillatorUI.UI(
        kOscillatorCID,
        gInstrument.oscillators[2], 'Oscillator C',
        categoriesEl,
        detailsEl,
        kOscillatorCID != expandedID));
    gInstrumentUIs.push(new FilterUI.UI(
        kFilterAID,
        gInstrument.filters[0], 'Filter A',
        categoriesEl,
        detailsEl,
        kFilterAID != expandedID));
    gInstrumentUIs.push(new FilterUI.UI(
        kFilterBID,
        gInstrument.filters[1], 'Filter B',
        categoriesEl,
        detailsEl,
        kFilterBID != expandedID));
    gInstrumentUIs.push(new EnvelopeUI.UI(
        kEnvelopeID,
        gInstrument, 'Envelope',
        categoriesEl,
        detailsEl,
        kEnvelopeID != expandedID));

    gInstrumentUIs.forEach(function (ui) {
      ui.onCollapseChanged = collapseChanged;
// Temporary hack continued
//    });

    updateTitle();
    updateSize();
  });

// Defined by background page.
  window.showKeyboard();
}

function saveState() {
  var expandedID = '';
  gInstrumentUIs.forEach(function (ui) {
    if (!ui.isCollapsed())
      expandedID = ui.id;
  });
  var setting = {};
  setting[kExpandedFieldKey] = expandedID;
  chrome.storage.local.set(setting);
}

function updateTitle(ui) {
  gInstrumentUIs.forEach(function (ui) {
    if (!ui.isCollapsed())
      document.getElementById('synthesizerItemTitle').innerHTML = ui.title;
  });
}

function collapseChanged(sender) {
  gInstrumentUIs.forEach(function (ui) {
    if (ui != sender) {
      ui.setCollapsed(true);
    }
  });
  updateTitle();
  updateSize();
  saveState();
}

function updateSize() {
  //var height = 0;
  //gInstrumentUIs.forEach(function(ui) {
  //  height = height + ui.element.clientHeight;
  //});
  //height = height + kHeightPadding;
  //window.resizeTo(window.outerWidth, height);
}

window.onload = init;