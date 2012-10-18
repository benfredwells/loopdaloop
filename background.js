var gInstrumentWindow = null;

chrome.app.runtime.onLaunched.addListener(function() {
  var instrumentParams = {
    width: 360,
    height: 500,
    left: 20,
    top: 100
  };

  chrome.app.window.create('instrumentWindow.html', instrumentParams, function(win) {
    win.contentWindow.showKeyboard = showKeyboard;
    gInstrumentWindow = win;
  });
});

function showKeyboard() {
  var keyboardParams = {
    width: 800,
    height: 400,
    minWidth: 800,
    maxWidth: 800,
    minHeight: 400,
    maxHeight: 400,
    left: 400,
    top: 100
  };

  chrome.app.window.create('keyboardWindow.html', keyboardParams, function(win) {
    c = gInstrumentWindow.contentWindow;
    win.contentWindow.gContext = c.gContext;
    win.contentWindow.gCurrentNote = c.gCurrentNote;
    win.contentWindow.gControllerManager = c.gControllerManager;
    win.contentWindow.gOscillatorUI = c.gOscillatorUI;
    win.contentWindow.gFilterUI = c.gFilterUI;
    win.contentWindow.gInstrument = c.gInstrument;
  });
}