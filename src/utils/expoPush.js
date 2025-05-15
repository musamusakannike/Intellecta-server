// Utility to send push notifications using Expo
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

/**
 * Send push notification(s) via Expo
 * @param {string[]} pushTokens - Array of Expo push tokens
 * @param {object} messageData - { title, body, data }
 * @returns {Promise}
 */
async function sendExpoPush(pushTokens, messageData) {
  const messages = [];
  for (let pushToken of pushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) continue;
    messages.push({
      to: pushToken,
      sound: 'default',
      title: messageData.title,
      body: messageData.body,
      data: messageData.data || {},
    });
  }
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }
  return tickets;
}

module.exports = { sendExpoPush };
