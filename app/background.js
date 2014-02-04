var gSynthWindow = null;
var gKeyboardWindow = null;

chrome.app.runtime.onLaunched.addListener(function() {
  if (gSynthWindow && gKeyboardWindow) {
    gSynthWindow.focus();
    gKeyboardWindow.focus();
  }

  var instrumentParams = {
    width: 444,
    height: 353,
    resizable: false,
    left: 20,
    top: 100,
    id: 'instrumentv2'
  };

  chrome.app.window.create('synthWindow.html', instrumentParams, function(win) {
    win.contentWindow.showKeyboard = showKeyboard;
    gSynthWindow = win;
    win.onClosed.addListener(function() {
      gSynthWindow = null;
      if (gKeyboardWindow)
        gKeyboardWindow.contentWindow.close();
    });
  });
});

function showKeyboard() {
  var keyboardParams = {
    width: 800,
    height: 350,
    minWidth: 800,
    minHeight: 350,
    left: 400,
    top: 100,
    id: 'keyboard'
  };

  chrome.app.window.create('keyboardWindow.html', keyboardParams, function(win) {
    gKeyboardWindow = win;
    c = gSynthWindow.contentWindow;
    win.contentWindow.gInstrument = c.gInstrument;
    win.contentWindow.gContext = c.gContext;
    win.onClosed.addListener(function() {
      gKeyboardWindow = null;
      if (gSynthWindow)
        gSynthWindow.contentWindow.close();
    });
  });
}