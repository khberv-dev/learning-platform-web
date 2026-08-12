import {io} from 'socket.io-client';
import config from '@/shared/config.js';

// One module-level connection shared by every consumer, rather than a socket
// per component: the gateway authenticates once per connection and joins rooms
// by event, so opening several would multiply both the handshake and the
// delivered copies of each message.
//
// The gateway lives on the `/chat` namespace of the API origin - which is the
// API base URL minus its `/api` prefix.
function socketOrigin() {
    return config.apiBaseUrl.replace(/\/api\/?$/, '');
}

let socket = null;
let listeners = new Set();

function ensureSocket() {
    if (socket) return socket;

    socket = io(`${socketOrigin()}/chat`, {
        transports: ['websocket'],
        auth: {token: localStorage.getItem('accessToken')},
    });

    // Every server event is fanned out to subscribers as a single
    // {event, payload} shape, so a consumer can switch on one handler.
    ['message', 'typing', 'stop-typing', 'joined', 'left', 'error'].forEach((event) => {
        socket.on(event, (payload) => {
            listeners.forEach((listener) => listener({event, payload}));
        });
    });

    return socket;
}

// Connects lazily on the first subscriber and tears the connection down when
// the last one leaves, so navigating away from the chat page doesn't leave a
// socket open for the rest of the session.
export function subscribeChatSocket(listener) {
    listeners.add(listener);
    ensureSocket();

    return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && socket) {
            socket.disconnect();
            socket = null;
        }
    };
}

// Emits queue until the socket is up: `join` fired straight after the first
// subscribe would otherwise be dropped, since connecting is asynchronous.
function emitWhenReady(event, payload) {
    const active = ensureSocket();
    if (active.connected) {
        active.emit(event, payload);
    } else {
        active.once('connect', () => active.emit(event, payload));
    }
}

export function joinChatRoom(roomId) {
    emitWhenReady('join', {roomId});
}

export function leaveChatRoom(roomId) {
    emitWhenReady('leave', {roomId});
}

export function emitTyping(roomId) {
    emitWhenReady('typing', {roomId});
}

export function emitStopTyping(roomId) {
    emitWhenReady('stop-typing', {roomId});
}
