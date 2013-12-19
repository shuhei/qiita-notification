function fetchNotifications() {
  var req = new XMLHttpRequest();
  req.open("GET", "https://qiita.com/api/notifications", true);
  req.onload = function () {
    if (req.status === 200) {
      var items;
      try {
        items = JSON.parse(req.responseText);
        
        notifyRead();
      } catch (e) {
        needLogin();
        return;
      }
      showItems(items);
    } else {
      // Network error?
      needLogin();
    }
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
  items.forEach(function (item) {
    var p = document.createElement("p");
    var userNames = item.users.map(function (user) {
      return '<span class="username">' + user.url_name + '</span>';
    }).join(', ');
    console.log(item);
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
  req.open("GET", "https://qiita.com/api/notifications/read", true);
  req.onload = function () {
    if (req.status === 200) {
      chrome.extension.sendMessage({ type: 'read' });
    } else {
      // Network error?
      needLogin();
    }
  };
  req.send(null);
}

function needLogin() {
  var p = document.createElement("p");
  p.innerHTML = '<a href="http://qiita.com/" target="_blank">ログインしてください。</a>';
  document.body.appendChild(p);
}

fetchNotifications();
