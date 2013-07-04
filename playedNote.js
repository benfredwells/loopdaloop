PlayedNote = (function() {

"use strict";
var module = {};

////////////////////////////////////////////////////////////////////////////////
// Private note cleanup code

var releasedNotes = [];

function isNextFinishedNote() {
  if (releasedNotes.length == 0)
    return false;

  return releasedNotes[0].isFinished();
}

function dismantleFinishedNotes() {
  while (isNextFinishedNote()) {
    var note = releasedNotes.shift();
    note.dismantle();
    console.log('Dismantled!');
  }
}

////////////////////////////////////////////////////////////////////////////////
// NoteSection class

module.NoteSection = function(inputNode) {
  // TODO: make these all private.
  this.inputNode = inputNode;
  this.outputNode = inputNode;
  this.allNodes = [];
  if (inputNode)
    this.allNodes.push(inputNode);
  this.oscillatorNodes = [];
  this.contours = [];
}

module.NoteSection.prototype.pushNode = function(node) {
  if (this.outputNode)
    this.outputNode.connect(node);
  this.outputNode = node;
  this.allNodes.push(node);
}

module.NoteSection.prototype.pushOscillator = function(node) {
  this.pushNode(node);
  this.oscillatorNodes.push(node);
}

module.NoteSection.prototype.addContour = function(contour) {
  this.contours.push(contour);
}

module.NoteSection.prototype.connect = function(otherSection) {
  if (this.outputNode && otherSection.inputNode)
    this.outputNode.connect(otherSection.inputNode);
}

module.NoteSection.prototype.noteOn = function(when) {
  this.oscillatorNodes.forEach(function (oscillator) {
    oscillator.noteOn(when);
  });
  this.contours.forEach(function (contour) {
    contour.contourOn(when);
  });
}

module.NoteSection.prototype.releaseTrigger = function(when) {
  this.contours.forEach(function (contour) {
    contour.contourOff(when);
  });
}

module.NoteSection.prototype.dismantle = function() {
  this.oscillatorNodes.forEach(function (oscillator) {
    oscillator.noteOff(0);
  });
  this.allNodes.forEach(function (node) {
    node.disconnect();  
  });
}

module.NoteSection.prototype.finishTime = function(offTime) {
  var result = offTime;
  this.contours.forEach(function (contour) {
    var contourFinish = contour.contourFinishTime(offTime);
    if (contourFinish > result)
      result = contourFinish;
  });
  return result;
}

////////////////////////////////////////////////////////////////////////////////
// PlayedNote class

module.Note = function(context,
                       destinationNode) {
  this.context_ = context;
  this.sections = [];
  this.currentSections = [];
  this.destinationNode = destinationNode;
}

module.Note.prototype.pushSections = function(sectionArray) {
  var note = this;
  sectionArray.forEach(function (newSection) {
    note.sections.push(newSection);
    note.currentSections.forEach(function (currentSection) {
      currentSection.connect(newSection);
    });
  });
  this.currentSections = sectionArray;
}

module.Note.prototype.noteOn = function(time) {
  var note = this;
  this.currentSections.forEach(function(section) {
    section.outputNode.connect(note.destinationNode);
  });
  this.sections.forEach(function (section) {
    section.noteOn(time);
  });
}

// This will be longer than needed.
// TODO: clarify naming for relative times versus absolute
module.Note.prototype.updateFinishTime_ = function(releaseTime) {
  var finishDelay = releaseTime;
  this.sections.forEach(function (section) {
    var sectionFinish = section.finishTime(releaseTime);
    if (sectionFinish > finishDelay)
      finishDelay = sectionFinish;
  });
  this.finishTime = this.context_.currentTime + finishDelay;
}

module.Note.prototype.noteOff = function(time) {
  var thisNote = this;
  thisNote.sections.forEach(function(section) {
    section.releaseTrigger(time);
  });
  this.updateFinishTime_(time);
  releasedNotes.push(this);
  dismantleFinishedNotes(this.context);
}

module.Note.prototype.isFinished = function() {
  if (!this.finishTime)
    return false;

  return (this.finishTime < this.context_.currentTime);
}

module.Note.prototype.dismantle = function() {
  this.sections.forEach(function(section) {
    section.dismantle();
  });
}

return module;

})();
