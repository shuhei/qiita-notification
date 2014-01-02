const TEMPLATES = {
  stock:
    '{{user_names}} があなたの投稿「{{short_title}}」を<span class="verb">ストック</span>しました。',
  update_posted_chunk:
    '{{user_names}} があなたのコメントした投稿「{{short_title}}」に<span class="verb">コメント</span>しました。',
  follow_user:
    '{{user_names}} があなたをフォローしました。',
  reply:
    '{{user_names}} があなたの投稿「{{short_title}}」に<span class="verb">コメント</span>しました。',
  receive_patch:
    '{{user_names}} があなたの投稿「{{short_title}}」へ<span class="verb">編集リクエストを</span>送りました。',
  tweet:
    'あなたの投稿「{{short_title}}」が<span class="verb">ツイート</span>されました。',
  new_comment_for_stocker:
    '{{user_names}} があなたのストックした投稿「{{short_title}}」で<span class="verb">コメント</span>しました。'
};
const ITEM_TEMPLATE =
  '<a href="{{object}}" target="_blank">{{message}}<br><span class="created-at">{{created_at}}</span></a>';

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

function renderMessage(item) {
  var template = TEMPLATES[item.action];
  if (template === undefined) {
    console.log('Unknown action ' + item.action + ' on ' + item.short_title);
    return;
  }
  if (item.users !== undefined) {
    item.user_names = renderUsers(item.users);
  }

  return renderTemplate(template, item);
}

function renderUsers(users) {
  return users.map(function (user) {
    return '<span class="username">' + user.url_name + '</span>';
  }).join(', ');
}

// Replace `{{key}}` with `item[key]`.
function renderTemplate(template, context) {
  return template.replace(/\{\{([^\}]+)\}\}/g, function (match, key) {
    return context[key];
  });
}

function showItems(items) {
  document.body.innerHTML = '';
  items.forEach(function (item) {
    console.log(item);
    var itemContext = cloneObject(item);

    itemContext.message = renderMessage(itemContext);
    if (itemContext.message === undefined) {
      return;
    }

    var p = document.createElement("p");
    p.innerHTML = renderTemplate(ITEM_TEMPLATE, itemContext);
    p.classList.add(itemContext.seen ? 'seen' : 'unseen');
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

function cloneObject(original) {
  var clone = {};
  for (var k in original) {
    clone[k] = original[k];
  }
  return clone;
}

fetchNotifications();
