ParamController = (function() {

"use strict";
var module = [];

// This controls how often all param values get updated, in seconds.
var kUpdateInterval = 5;

////////////////////////////////////////////////////////////////////////////////
// ParamController interface
//
// ParamController.updateParam(atLeastToTime)

////////////////////////////////////////////////////////////////////////////////
// ControllerManager class

module.Manager = function (context) {
  this.context_ = context;
  this.paramControllers_ = [];
  this.updateParams();
}

module.Manager.prototype.updateParams = function() {
  var manager = this;
  manager.updateTo_ = manager.context_.currentTime + kUpdateInterval * 2;
  manager.paramControllers_.forEach(function(controller) {
    controller.updateParam(manager.updateTo_);
  });
  setTimeout(function() {
    manager.updateParams();
  }, kUpdateInterval * 1000);
}

// frequency in Hz
// phase in radians
// dc is the average value of the param
// ac is the max positive offset from the dc average
module.Manager.prototype.newLFO = function(param, frequency, phase, dc, ac) {
  var lfo = new LFO(this.context_, param, frequency, phase, dc, ac);
  lfo.updateParam(this.updateTo_);
  this.paramControllers_.push(lfo);
}

module.Manager.prototype.removeController = function(controller) {
  var index = this.paramControllers_.indexOf(controller);
  if (index != -1)
    this.paramControllers_.splice(index, 1);
}

////////////////////////////////////////////////////////////////////////////////
// LFO class

function LFO(context, param, frequency, phase, dc, ac) {
  this.context_ = context;
  this.param_ = param;
  this.frequency_ = frequency;
  this.phase_ = phase;
  this.dc_ = dc;
  this.ac_ = ac;
  if (frequency == 0)
    this.bufferLength = 1;
  else
    this.bufferLength_ = this.context_.sampleRate / frequency;
  this.buffer_ = new Float32Array(this.bufferLength_);
  for (var i = 0; i < this.bufferLength_; ++i)
    this.buffer_[i] = dc + ac * Math.sin((2 * Math.PI * i / this.bufferLength_) - phase);
  this.lastTime_ = this.context_.currentTime;
  this.bufferSeconds_ = this.bufferLength_ / this.context_.sampleRate;
}

LFO.prototype.updateParam = function(atLeastToTime) {
  if (this.frequency_ == 0) {
    this.param_.value = this.buffer_[0];
    return;
  }
  while (this.lastTime_ < atLeastToTime) {
    this.param_.setValueCurveAtTime(this.buffer_, this.lastTime_, this.bufferSeconds_);
    this.lastTime_ =this.lastTime_ + this.bufferSeconds_;
  }
}

return module;

})();
