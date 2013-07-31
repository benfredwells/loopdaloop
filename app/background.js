var gInstrumentWindow = null;
var gKeyboardWindow = null;

chrome.app.runtime.onLaunched.addListener(function() {
  if (gInstrumentWindow && gKeyboardWindow) {
    gInstrumentWindow.focus();
    gKeyboardWindow.focus();
  }

  var instrumentParams = {
    width: 1000,
    height: 1000,
    left: 20,
    top: 100,
    id: 'instrumentv2'
  };

  chrome.app.window.create('app/instrumentWindow.html', instrumentParams, function(win) {
    win.contentWindow.showKeyboard = showKeyboard;
    gInstrumentWindow = win;
    win.onClosed.addListener(function() {
      gInstrumentWindow = null;
      if (gKeyboardWindow)
        gKeyboardWindow.contentWindow.close();
    });
  });
});

function showKeyboard() {
  var keyboardParams = {
    width: 800,
    height: 400,
    minWidth: 800,
    minHeight: 400,
    left: 400,
    top: 100,
    id: 'keyboard'
  };

  chrome.app.window.create('app/keyboardWindow.html', keyboardParams, function(win) {
    gKeyboardWindow = win;
    c = gInstrumentWindow.contentWindow;
    win.contentWindow.gInstrument = c.gInstrument;
    win.onClosed.addListener(function() {
      gKeyboardWindow = null;
      if (gInstrumentWindow)
        gInstrumentWindow.contentWindow.close();
    });
  });
}