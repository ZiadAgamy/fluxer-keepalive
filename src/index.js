import 'dotenv/config';
import WebSocket from 'ws';

const TOKEN = process.env.FLUXER_USER_TOKEN;
const GATEWAY_URL = process.env.FLUXER_GATEWAY_URL;

if (!TOKEN || !GATEWAY_URL) {
  console.error('Missing FLUXER_USER_TOKEN or FLUXER_GATEWAY_URL');
  process.exit(1);
}

let socket;
let heartbeat;
let reconnectTimer;
let sequence = null;
let sessionId = null;
let reconnectDelay = 5000;
let intentionalClose = false;

function log(message) {
  console.log(`[KeepAlive] ${new Date().toISOString()} ${message}`);
}

function stopHeartbeat() {
  if (heartbeat) {
    clearInterval(heartbeat);
    heartbeat = null;
  }
}

function send(op, data) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ op, d: data }));
  }
}

function connect() {
  stopHeartbeat();

  log('Connecting to Fluxer Gateway...');

  socket = new WebSocket(GATEWAY_URL);

  socket.on('open', () => {
    log('Gateway connection established.');
  });

  socket.on('message', (raw) => {
    let packet;

    try {
      packet = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (packet.s !== undefined && packet.s !== null) {
      sequence = packet.s;
    }

    switch (packet.op) {
      case 10: {
        const interval = packet.d.heartbeat_interval;

        stopHeartbeat();

        heartbeat = setInterval(() => {
          send(1, sequence);
        }, interval);

        send(1, sequence);

        if (sessionId) {
          send(6, {
            token: TOKEN,
            session_id: sessionId,
            seq: sequence ?? 0
          });
        } else {
          send(2, {
            token: TOKEN,
            properties: {
              os: 'Linux',
              browser: 'Fluxer KeepAlive',
              device: 'desktop'
            },
            presence: {
              status: 'online',
              afk: false,
              mobile: false
            }
          });
        }

        break;
      }

      case 11:
        break;

      case 0:
        if (packet.t === 'READY') {
          sessionId = packet.d.session_id;
          reconnectDelay = 5000;
          log('Account authenticated and online.');
        }

        if (packet.t === 'RESUMED') {
          reconnectDelay = 5000;
          log('Session resumed successfully.');
        }

        break;

      case 7:
        log('Gateway requested reconnection.');
        socket.close();
        break;

      case 9:
        log('Session cannot be resumed. Starting a new session.');
        sessionId = null;
        sequence = null;

        send(2, {
          token: TOKEN,
          properties: {
            os: 'Linux',
            browser: 'Fluxer KeepAlive',
            device: 'desktop'
          },
          presence: {
            status: 'online',
            afk: false,
            mobile: false
          }
        });
        break;
    }
  });

  socket.on('error', (error) => {
    log(`WebSocket error: ${error.message}`);
  });

  socket.on('close', (code) => {
    stopHeartbeat();

    log(`Connection closed (${code}).`);

    if (intentionalClose) return;

    if ([4004, 4012].includes(code)) {
      log('Authentication or protocol error. Check configuration.');
      return;
    }

    scheduleReconnect();
  });
}

function scheduleReconnect() {
  if (reconnectTimer || intentionalClose) return;

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, reconnectDelay);

  reconnectDelay = Math.min(reconnectDelay * 2, 60000);

  log(`Reconnecting in ${reconnectDelay / 2} seconds.`);
}

function shutdown() {
  intentionalClose = true;
  stopHeartbeat();

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  socket?.close();

  log('KeepAlive stopped.');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

connect();
