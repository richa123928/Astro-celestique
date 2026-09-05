// Single shared in-memory store for active chat/call sessions.
// Both server/index.js (Socket.io handlers) and consultationController.js
// (REST billing endpoints) read/write this SAME object — previously each
// file had its own separate copy, which silently broke wallet billing
// since sessions registered via sockets were invisible to the billing code.
module.exports = {};