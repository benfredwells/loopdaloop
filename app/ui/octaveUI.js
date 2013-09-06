OctaveUI = (function() {

"use strict";
var module = {};

module.Selector = function(container) {
  UI.Control.call(this, container);

  this.div.id = 'octaveSelectorContainer';
  
  var downButton = document.createElement('div');
  downButton.classList.add('octaveShortcut');
  downButton.innerHTML = '&larr;';
  this.div.appendChild(downButton);

  this.backgroundDiv = document.createElement('div');
  this.backgroundDiv.id = 'octaveSelectBackground';
  this.div.appendChild(this.backgroundDiv);

  var upButton = document.createElement('div');
  upButton.classList.add('octaveShortcut');
  upButton.innerHTML = '&rarr;';
  this.div.appendChild(upButton);
}

module.Selector.prototype = Object.create(UI.Control.prototype);

return module;

}());
