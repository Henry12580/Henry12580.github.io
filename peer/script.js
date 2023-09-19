var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
const selfVideo = document.querySelector('video.self');
const peerVideo = document.querySelector('video.peer');
const myIdSpan = document.querySelector('#my-id');
const controlDialog = document.querySelector('dialog#control-dialog');
const messageDialog = document.querySelector('div#message-dialog');
const peerIdInput = document.querySelector('input.peer-id');
const messageInput = document.querySelector('input.message-input')
const copyMyIdButton = document.querySelector('#copy-my-id');
const confirmPeerIdButton = document.querySelector('#confirm-id');
const sendMessageButton = document.querySelector('#send-message');
const closeMessageDiagButton = document.querySelector('#close-message-dialog')
const closeControlDiagButton = document.querySelector('#close-control-dialog');
const historyButton = document.querySelector('#history-button');
const clearMessageButton = document.querySelector('#clear-message')
const controlBall = document.querySelector('#control-ball');
const messageBall = document.querySelector('#message-ball');

const throttleInterval = 30;
const debounceInterval = 200;

const states = {
  _layout: 'equal',
  _show_message_dialog: false,
  set layout(newLayout) {
    if (newLayout !== this._layout) {
      document.querySelector('#' + newLayout + '-layout').dataset.selected = true;
      document.querySelector('#' + this._layout + '-layout').dataset.selected = false;
      this._layout = newLayout;
      if (newLayout === 'equal') {
        peerVideo.dataset.focused = false;
        selfVideo.dataset.focused = false;
      } else {
        peerVideo.dataset.focused = true;
        selfVideo.dataset.focused = false;
      }
    }
  },
  set show_message_dialog(isShow) {
    if (isShow !== this._show_message_dialog) {
      if (isShow) {
        messageDialog.style.visibility = 'visible';
      } else {
        messageDialog.style.visibility = 'hidden';
      }
      this._show_message_dialog = isShow;
    }
  }
}

!function defineProperties() {
  messageDialog.showModal = () => {
    states.show_message_dialog = true;
  };
  messageDialog.close = () => {
    states.show_message_dialog = false;
    messageBall.style.visibility = 'visible';
  }
}()

!function main() {
  let myId = "";
  let peerId = "";
  const peer = new Peer();
  let connection;

  let focusedVideo = null;

  document.querySelector('#equal-layout').addEventListener('click', () => states.layout = 'equal');
  document.querySelector('#focus-layout').addEventListener('click', () => states.layout = 'focus');

  confirmPeerIdButton.addEventListener('click', event => {
    const peerId_new = peerIdInput.value;
    if (peerId !== peerId_new) {
      peerId = peerId_new;
      call();
    }
    controlDialog.close();
  });

  sendMessageButton.addEventListener('click', sendMessage);

  messageInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  })

  closeControlDiagButton.addEventListener('click', e => {
    controlDialog.close();
  });

  closeMessageDiagButton.addEventListener('click', e => {
    messageDialog.close();
  })

  clearMessageButton.addEventListener('click', e => {
    messageInput.value = '';
  })

  controlDialog.addEventListener('close', event => {
    controlBall.style.visibility = 'visible';
  })

  manageMoveBall(controlBall, controlDialog);
  manageMoveBall(messageBall, messageDialog);

  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState !== "visible") {
      if (focusedVideo) {
        await focusedVideo.requestPictureInPicture();
      }
    } else {
      if (document.pictureInPictureElement) document.exitPictureInPicture();
    }
  })

  copyMyIdButton.addEventListener('click', async event => {
    try {
      await navigator.clipboard.writeText(myIdSpan.innerHTML);
      alert('已复制到剪贴板！');
    } catch (err) {
      alert('复制出错，请手动复制！');
    }
  })

  selfVideo.addEventListener('click', event => {
    event.preventDefault();
    selfVideo.dataset.focused = true;
    peerVideo.dataset.focused = false;
    focusedVideo = selfVideo;
    states.layout = 'focus';
  });

  peerVideo.addEventListener('click', event => {
    event.preventDefault();
    peerVideo.dataset.focused = true;
    selfVideo.dataset.focused = false;
    focusedVideo = peerVideo;
    states.layout = 'focus';
  });

  // peer开启后
  peer.on('open', id => {
    myId = id;
    myIdSpan.innerHTML = myId;
    controlDialog.showModal();
  });

  call();

  function call() {
    getUserMedia({ video: true, audio: true }, function (stream) {
      selfVideo.srcObject = stream;

      if (peerId) {
        const call = peer.call(peerId, stream);
        call.on('stream', function (remoteStream) {
          peerVideo.srcObject = remoteStream;
        });

        const conn = peer.connect(peerId);
        conn.on('open', function() { // 连接成功后
          connection = conn;
          conn.send('连接成功！')
          conn.on('data', receiveMessage)
        });
      }

      peer.on('call', function (call) {
        call.answer(stream);
        call.on('stream', function (remoteStream) {
          peerVideo.srcObject = remoteStream;
        })
      });

      peer.on('connection', conn => {
        connection = conn;
        conn.on('data', receiveMessage);
      });

    }, function (err) {
      console.error('Failed to get local stream', err);
    });
  };

  function sendMessage() {
    if (!connection) {
      alert('未建立连接！')
      return;
    }
    if (messageInput.value) {
      connection.send(messageInput.value);
      const sendingMessage = document.createElement('div');
      sendingMessage.className = 'sending-message';
      sendingMessage.innerHTML = messageInput.value;
      document.body.appendChild(sendingMessage);
      messageInput.value = '';
      setTimeout(() => {
        document.body.removeChild(sendingMessage);
      }, 11000);
    }
  }

  function receiveMessage(data) {
    if (data) {
      const comingMessage = document.createElement("div");
      comingMessage.className = 'coming-message';
      comingMessage.innerHTML = data;
      document.body.appendChild(comingMessage);
      setTimeout(() => document.body.removeChild(comingMessage), 11000);
    }
  }

}()

function debounce(fn, interval) {
  let timer;

  return function () {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, interval);
  }
}

function throttle(fn, interval) {
  let lastTime = 0;
  return function (...args) {
    const now = new Date();
    if (now - lastTime > interval) {
      fn.apply(this, args);
      lastTime = now;
    }
  }
}

function manageMoveBall(ball, dialog) {
  let startX, startY, offsetX, offsetY, width, height;
  let isDragging = false;

  function mousedownEvent(e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    offsetX = ball.offsetLeft;
    offsetY = ball.offsetTop;
    width = ball.getBoundingClientRect().width;
    height = ball.getBoundingClientRect().height;
  }

  function mousemoveEvent(e) {
    if (isDragging) {
      const { clientX, clientY } = e;
      const moveX = clientX - startX, moveY = clientY - startY;
      (offsetY + moveY >= 0) && (offsetY + moveY <= window.innerHeight - height) && (ball.style.top = offsetY + moveY + `px`);
      (offsetX + moveX >= 0) && (offsetX + moveX <= window.innerWidth - width) && (ball.style.left = offsetX + moveX + `px`);
    }
  }

  function mouseupEvent(e) {
    if (isDragging) {
      const { clientX, clientY } = e;
      // 释放鼠标时，如果在元素初始范围内，认为是点击事件
      if (clientX <= offsetX + width && clientX >= offsetX && clientY <= offsetY + height && clientY >= offsetY) {
        dialog.showModal();
        ball.style.visibility = 'hidden';
      }
      isDragging = false;
    }
  }

  ball.addEventListener('mousedown', mousedownEvent);
  ball.addEventListener('touchstart', mousedownEvent, { passive: true });
  document.addEventListener('mousemove', throttle(mousemoveEvent, throttleInterval));
  document.addEventListener('touchmove', throttle(mousemoveEvent, throttleInterval));
  document.addEventListener('mouseup', mouseupEvent);
  document.addEventListener('touchend', mouseupEvent);

  // 防止浏览器视口改变时，按钮跑到视口外面
  window.addEventListener('resize', debounce(function () {
    const { offsetTop, offsetLeft } = ball;
    const { innerWidth, innerHeight } = window;
    if (offsetLeft + width > innerWidth) {
      ball.style.left = innerWidth - width + 'px';
    }
    if (offsetTop + height > innerHeight) {
      ball.style.top = innerHeight - height + 'px';
    }
  }, debounceInterval));
}
