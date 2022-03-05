export default {
  homeserverUrl: "https://matrix.example.com", //no slash at the end
  servername: 'example.com',
  userId: '@user:example.com',
  accessToken: "<token>",


  //command room id
  commandRoomId: "!channelid:example.com",

  //lock/unlock
  lockLevel: 50,
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