export default {
  homeserverUrl: "https://matrix.example.com", //no slash at the end
  servername: 'example.com', 
  userId: '@user:example.com', //the userID the bot should use
  accessToken: "<token>", //a valid access token for that user


  //command room id
  commandRoomId: "!channelid:example.com", //room for commands, must be unencrypted

  //lock/unlock
  lockLevel: 50, // power level to set send messages and add reactions for the given channels
  lockRoomInclude: {
    '!someroom:example.com': 'Channel 1',
  }, 

  //invite to all rooms
  inviteRoomInclude: {
    '!someroom:example.com': 'Channel 1',
  },

  //roomAdminRoomInclude
  roomAdminRoomInclude: {
    '!someroom:example.com': 'Channel 1',
  },
}
