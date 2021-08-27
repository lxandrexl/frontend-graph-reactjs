const socket = new WebSocket('wss://38x2c6f54d.execute-api.us-east-1.amazonaws.com/production');

export function webSockets() {
  socket.addEventListener('open', () => {
    console.log('Websocket is connected');
  });

  socket.addEventListener('close', () => {
    console.log('Websocket is closed');
  });

  socket.addEventListener('error', (e) => console.log('Websocket is in error', e));

  //   socket.addEventListener('message', (e) => {
  //     console.log('Message received', JSON.parse(e.data).message, JSON.parse(e.data).date);
  //   });

  window.start = () => {
    const payload = {
      action: 'message',
      msg: ''
    };

    socket.send(JSON.stringify(payload));
  };
}

export const ws = socket;
