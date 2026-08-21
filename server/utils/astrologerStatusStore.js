/**
 * In-memory tracker for which astrologers are currently online/busy via
 * Socket.io. Shared between index.js (which updates it as socket events
 * happen) and astrologerController.js (which reads it for the /status API
 * the frontend polls). Simple Map-based store — fine for a single server
 * instance; if you ever scale to multiple server instances behind a load
 * balancer, this would need to move to Redis or similar shared storage.
 */

const statusMap = new Map();
const socketToAstrologer = new Map();

function setOnline(astrologerId, socketId) {
  statusMap.set(astrologerId, { status: 'online', socketId });
  socketToAstrologer.set(socketId, astrologerId);
}

function setBusy(astrologerId) {
  const existing = statusMap.get(astrologerId);
  if (existing) {
    statusMap.set(astrologerId, { ...existing, status: 'busy' });
  }
}



function setAvailable(astrologerId) {
  const existing = statusMap.get(astrologerId);
  if (existing) {
    statusMap.set(astrologerId, { ...existing, status: 'online' });
  }
}

function setStatus(astrologerId, status) {
  const existing = statusMap.get(astrologerId);
  if (existing) {
    statusMap.set(astrologerId, { ...existing, status });
  } else {
    // Not connected via socket yet — store status anyway so it's ready
    // once they do connect
    statusMap.set(astrologerId, { status, socketId: null });
  }
}

function removeBySocketId(socketId) {
  const astrologerId = socketToAstrologer.get(socketId);
  if (astrologerId) {
    statusMap.delete(astrologerId);
    socketToAstrologer.delete(socketId);
  }
  return astrologerId;
}

function getStatusSnapshot() {
  const onlineAstrologers = [];
  const busyAstrologers = [];
  statusMap.forEach((info, astrologerId) => {
    if (info.status === 'online') onlineAstrologers.push(astrologerId);
    if (info.status === 'busy') busyAstrologers.push(astrologerId);
  });
  return { onlineAstrologers, busyAstrologers };
}

module.exports = {
  setOnline,
  setBusy,
  setAvailable,
  setStatus,
  removeBySocketId,
  getStatusSnapshot
};