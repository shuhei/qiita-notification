var grayColor = [30, 30, 30, 255];
var redColor = [200, 0, 0, 255];
var countUrl = "https://qiita.com/api/notifications/count";
var interval = 1000 * 60 * 5;

function fetchCount() {
  var req = new XMLHttpRequest();
  req.open("GET", countUrl, true);
  req.addEventListener('load', function () {
    if (req.status === 200) {
      // Get count from JSON.
      var json;
      try {
        json = JSON.parse(req.responseText);
      } catch (e) {
        showNothing();
        tryAgain();
        return;
      }
      var count = json.count;
      if (count == null) {
        showNothing();
        tryAgain();
        return;
      }
      // Schedule next fetch.
      interval = 1000 * 60 * 5;
      setTimeout(fetchCount, interval);
      showCount(count);      
    } else {
      console.log('API Changed?', req.status, req.statusText);
      showNothing();
      tryAgain();
    }
  }, false);
  req.addEventListener('error', function () {
    console.log('Failed to fetch count.');
    showNothing();
    tryAgain();
  }, false);
  req.send(null);
}

function showCount(count) {
  chrome.browserAction.setBadgeText({ text: String(count) });
  if (count > 0) {
    chrome.browserAction.setBadgeBackgroundColor({ color: redColor });
  } else {
    chrome.browserAction.setBadgeBackgroundColor({ color: grayColor });
  }
}

function showNothing() {
  chrome.browserAction.setBadgeText({ text: "..." });
  chrome.browserAction.setBadgeBackgroundColor({ color: grayColor });
}

function tryAgain() {
  interval += 1000 * 60 * 5;
  setTimeout(fetchCount, interval);
}

// Update count when the popup is read.
chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === 'read') {
    showCount(0);
  }
});

// Start!
fetchCount();
