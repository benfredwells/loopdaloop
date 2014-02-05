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
  }
}

////////////////////////////////////////////////////////////////////////////////
// NoteSection class

module.NoteSection = function(inputNode) {
  this.inputNode_ = inputNode;
  this.outputNode = inputNode;
  this.allNodes_ = [];
  if (inputNode)
    this.allNodes_.push(inputNode);
  this.oscillatorNodes_ = [];
  this.contours_ = [];
}

module.NoteSection.prototype.addNode = function(node) {
  this.allNodes_.push(node);
}

module.NoteSection.prototype.pushNode_ = function(node) {
  if (this.outputNode)
    this.outputNode.connect(node);
  this.outputNode = node;
}

module.NoteSection.prototype.pushNode = function(node) {
  this.pushNode_(node);
  this.addNode(node);;
}

module.NoteSection.prototype.addOscillator = function(node) {
  this.addNode(node);
  this.oscillatorNodes_.push(node);
}

module.NoteSection.prototype.pushOscillator = function(node) {
  this.pushNode_(node);
  this.addOscillator(node);
}

module.NoteSection.prototype.addContour = function(contour) {
  this.contours_.push(contour);
}

module.NoteSection.prototype.connect = function(otherSection) {
  if (this.outputNode && otherSection.inputNode_)
    this.outputNode.connect(otherSection.inputNode_);
}

module.NoteSection.prototype.noteOn = function(time) {
  this.oscillatorNodes_.forEach(function (oscillator) {
    oscillator.noteOn(time);
  });
  this.contours_.forEach(function (contour) {
    contour.contourOn(time);
  });
}

module.NoteSection.prototype.releaseTrigger = function(time) {
  this.contours_.forEach(function (contour) {
    contour.contourOff(time);
  });
}

module.NoteSection.prototype.dismantle = function() {
  this.oscillatorNodes_.forEach(function (oscillator) {
    oscillator.noteOff(kLatency);
  });
  this.allNodes_.forEach(function (node) {
    node.disconnect();  
  });
}

module.NoteSection.prototype.finishTime = function(offTime) {
  var result = offTime;
  this.contours_.forEach(function (contour) {
    var contourFinish = contour.contourFinishTime(offTime);
    if (contourFinish > result)
      result = contourFinish;
  });
  return result;
}

////////////////////////////////////////////////////////////////////////////////
// PlayedNote class

// Always delay note on and off by this amount to account for the underlying
// context getting ahead. Without this, the context can get ahead of us leading
// to nasty effects occasionally.
var kLatency = 0.02;

module.Note = function(scene) {
  this.scene_ = scene;
  this.sections = [];
  this.currentSections = [];
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

module.Note.prototype.noteOn = function(delay) {
  var note = this;
  var onTime = this.scene_.context.currentTime + delay + kLatency;
  this.currentSections.forEach(function(section) {
    section.outputNode.connect(note.scene_.destinationNode);
  });
  this.sections.forEach(function (section) {
    section.noteOn(onTime);
  });
}

// This will be longer than needed.
module.Note.prototype.updateFinishTime_ = function(releaseTime) {
  var note = this;
  note.finishTime = releaseTime;
  note.sections.forEach(function (section) {
    var sectionFinish = section.finishTime(note.finishTime);
    if (sectionFinish > note.finishTime)
      note.finishTime = sectionFinish;
  });
}

module.Note.prototype.noteOff = function(delay) {
  var thisNote = this;
  var releaseTime = this.scene_.context.currentTime + delay + kLatency;
  thisNote.sections.forEach(function(section) {
    section.releaseTrigger(releaseTime);
  });
  this.updateFinishTime_(releaseTime);
  releasedNotes.push(this);
  dismantleFinishedNotes(this.scene_.context);
}

module.Note.prototype.isFinished = function() {
  if (!this.finishTime)
    return false;

  return (this.finishTime + kLatency < this.scene_.context.currentTime);
}

module.Note.prototype.dismantle = function() {
  this.sections.forEach(function(section) {
    section.dismantle();
  });
}

return module;

})();
