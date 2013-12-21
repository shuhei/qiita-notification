function fetchNotifications() {
  var req = new XMLHttpRequest();
  req.open('GET', 'https://qiita.com/api/notifications', true);
  req.onload = function () {
    if (req.status === 200) {
      var items;
      try {
        items = JSON.parse(req.responseText);
        notifyRead();
      } catch (e) {
        console.log('Failed to parse notifications JSON. May not be logged in.');
        needLogin();
        return;
      }
      showItems(items);
    } else {
      console.log('Failed to fetch notifications with status ' + req.status + '.');
      showError('通知の取得に失敗しました。');
    }
  };
  req.onerror = function () {
    console.log('Error on fetching notifications.');
    showError('通知の取得に失敗しました。');
  };
  req.send(null);
}

var actions = {
  'stock': {
    before: ' があなたの投稿',
    after: 'を<span class="verb">ストック</span>しました。'
  },
  'update_posted_chunk': {
    before: ' があなたのコメントした投稿',
    after: 'に<span class="verb">コメント</span>しました。'
  },
  'follow_user': {
    body: ' があなたをフォローしました。'
  },
  'reply': {
    before: ' があなたの投稿',
    after: 'に<span class="verb">コメント</span>しました。'
  },
  'receive_patch': {
    before: ' があなたの投稿',
    after: 'へ<span class="verb">編集リクエストを</span>送りました。'
  }
};

function showItems(items) {
  document.body.innerHTML = '';
  items.forEach(function (item) {
    console.log(item);
    var p = document.createElement("p");
    var userNames = item.users.map(function (user) {
      return '<span class="username">' + user.url_name + '</span>';
    }).join(', ');
    var action = actions[item.action];
    var message;
    if (action.before && action.after) {
      message = action.before + '「' + item.short_title + '」' + action.after;
    } else {
      message = action.body;
    }
    p.innerHTML = '<a href="' + item.object + '" target="_blank">' +
      userNames +
      message +
      '<br>' +
      '<span class="created-at">' + item.created_at + '</span>' +
      '</a>';
    p.classList.add(item.seen ? 'seen' : 'unseen');
    document.body.appendChild(p);
  });
}

function notifyRead() {
  var req = new XMLHttpRequest();
  req.open('GET', 'https://qiita.com/api/notifications/read', true);
  req.onload = function () {
    if (req.status === 204) { // Qiita returns 'no content' if successful.
      chrome.extension.sendMessage({ type: 'read' });
    } else if (req.status === 200) {
      console.log('Failed to notify read with status 200. May not be logged in.');
      needLogin();
    } else {
      console.log('Failed to notify read with status ' + req.status + '.');
      // Do nothing.
    }
  };
  req.onerror = function () {
    console.log('Error on notifying read.');
    // Do nothing.
  };
  req.send(null);
}

function needLogin() {
  showMessage('<a href="http://qiita.com/" target="_blank">ログインしてください。</a>');
}

function showError(message) {
  var html = '<span class="no-link">' + message + '</span>';
  showMessage(html);
}

function showMessage(message) {
  document.body.innerHTML = '';
  var p = document.createElement('p');
  p.innerHTML = message;
  document.body.appendChild(p);
}

fetchNotifications();
