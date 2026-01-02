"use client";
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000'; // Environment variable in real app

export const socket = io(SOCKET_URL, {
    autoConnect: false,
});
