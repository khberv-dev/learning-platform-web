import {io} from "socket.io-client";
import {baseApiUrl} from "@/services/config.js";

// The chat gateway is mounted at the same origin as the REST API, on namespace /chat.
// baseApiUrl looks like "http://host:port/api" — strip the /api suffix to get the socket origin.
function deriveOrigin() {
    try {
        const u = new URL(baseApiUrl)
        return `${u.protocol}//${u.host}`
    } catch {
        return undefined
    }
}

let socket = null
let connecting = false
const listeners = new Set()

function notify(event, payload) {
    for (const fn of listeners) {
        try { fn(event, payload) } catch { /* listener errors must not crash others */ }
    }
}

function ensureSocket() {
    const token = localStorage.getItem('access_token')
    if (!token) return null
    if (socket && socket.connected) return socket
    if (socket && connecting) return socket

    if (!socket) {
        const origin = deriveOrigin()
        socket = io(`${origin}/chat`, {
            auth: {token},
            transports: ['websocket'],
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        })

        socket.on('connect', () => { connecting = false; notify('connect') })
        socket.on('disconnect', (reason) => notify('disconnect', reason))
        socket.on('connect_error', (err) => { connecting = false; notify('connect_error', err) })
        socket.on('message', (message) => notify('message', message))
        socket.on('joined', (data) => notify('joined', data))
        socket.on('left', (data) => notify('left', data))
        socket.on('error', (data) => notify('error', data))
    }

    if (!socket.connected) {
        // refresh auth in case token changed since last connect
        socket.auth = {token}
        connecting = true
        socket.connect()
    }

    return socket
}

export function subscribeChatSocket(listener) {
    listeners.add(listener)
    ensureSocket()
    return () => {
        listeners.delete(listener)
        if (listeners.size === 0 && socket) {
            socket.disconnect()
            socket = null
            connecting = false
        }
    }
}

export function joinChatRoom(roomId) {
    const s = ensureSocket()
    if (!s) return
    const send = () => s.emit('join', {roomId})
    if (s.connected) send()
    else s.once('connect', send)
}

export function leaveChatRoom(roomId) {
    if (!socket || !socket.connected) return
    socket.emit('leave', {roomId})
}

export function isChatConnected() {
    return !!(socket && socket.connected)
}
