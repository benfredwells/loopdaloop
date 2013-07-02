PlayedNote = (function() {

"use strict";
var module = {};

////////////////////////////////////////////////////////////////////////////////
// Envelope class

module.Envelope = function() {
  this.attackDelay = 0;
  this.attack = 0;
  this.attackHold = 0;
  this.decay = 0;
  this.sustain = 1;
  this.sustainHold = 0;
  this.release = 0;
}

////////////////////////////////////////////////////////////////////////////////
// NoteSection class

module.NoteSection = function(inputNode) {
  this.inputNode = inputNode;
  this.outputNode = inputNode;
  this.allNodes = [];
  if (inputNode)
    this.allNodes.push(inputNode);
  this.oscillatorNodes = [];
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

module.NoteSection.prototype.connect = function(otherSection) {
  if (this.outputNode && otherSection.inputNode)
    this.outputNode.connect(otherSection.inputNode);
}

module.NoteSection.prototype.noteOn = function(when) {
  this.oscillatorNodes.forEach(function (oscillator) {
    oscillator.noteOn(when);
  });
}

module.NoteSection.prototype.noteOff = function(when) {
  this.oscillatorNodes.forEach(function (oscillator) {
    oscillator.noteOff(when);
  });
}

module.NoteSection.prototype.dismantle = function() {
  this.allNodes.forEach(function (node) {
    node.disconnect();
  });
}

////////////////////////////////////////////////////////////////////////////////
// PlayedNote class

module.Note = function(context,
                       destinationNode,
                       envelope) {
  this.context_ = context;
  this.sections = [];
  this.currentSections = [];
  this.gainNode = null;
  this.destinationNode = destinationNode;
  this.envelope_ = envelope;
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

module.Note.prototype.start = function() {
  var note = this;
  this.currentSections.forEach(function(section) {
    section.outputNode.connect(note.gainNode);
  });
  this.gainNode.connect(this.destinationNode);
  var nextTime = this.context_.currentTime;
  this.gainNode.gain.setValueAtTime(0, nextTime); nextTime += this.envelope_.attackDelay;
  this.gainNode.gain.setValueAtTime(0, nextTime); nextTime += this.envelope_.attack;
  this.gainNode.gain.linearRampToValueAtTime(1, nextTime); nextTime += this.envelope_.attackHold;
  this.gainNode.gain.setValueAtTime(1, nextTime); nextTime += this.envelope_.decay;
  this.gainNode.gain.linearRampToValueAtTime(this.envelope_.sustain, nextTime);
  this.sustainStart_ = nextTime;
  this.sections.forEach(function (section) {
    section.noteOn(0);
  });
}

module.Note.prototype.stop = function() {
  var nextTime = this.context_.currentTime;
  if (nextTime < this.sustainStart_)
    nextTime = this.sustainStart_;
  nextTime += this.envelope_.sustainHold;
  this.gainNode.gain.setValueAtTime(this.envelope_.sustain, nextTime); nextTime += this.envelope_.release;
  this.gainNode.gain.linearRampToValueAtTime(0, nextTime);
  var thisNote = this;
  setTimeout(function() {
    thisNote.sections.forEach(function(section) {
      section.noteOff(0);
      section.dismantle();
    });
  }, (this.envelope_.sustainHold + this.envelope_.release) * 1000 + 3000);
}

return module;

})();
