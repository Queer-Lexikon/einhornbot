import { MatrixClient, SimpleFsStorageProvider, AutojoinRoomsMixin, RustSdkCryptoStorageProvider } from "matrix-bot-sdk";
import fetch from 'node-fetch';
import Logger from './logger';
import config from './config';

const logger = new Logger();

const storage = new SimpleFsStorageProvider("bot.json");
// const cryptoStore = new RustSdkCryptoStorageProvider("encrypted");
// const client = new MatrixClient(homeserverUrl, accessToken, storage, cryptoStore);
const client = new MatrixClient(config.homeserverUrl, config.accessToken, storage);
AutojoinRoomsMixin.setupOnClient(client);

(async function () {
  // client.on("room.event", (roomId, event) => {
  //   console.log('Event in room ' + roomId, event);
  // });
  client.on("room.message", (roomId: string, event: any) => {
    if (!event["content"]) {
      return;
    }
    if (roomId !== config.commandRoomId) {
      return;
    }
    const sender = event["sender"];
    const body = event["content"]["body"] as string;
    logger.log(`[CHAT] ${sender}: ${body}`);
    if (sender === config.userId) {
      return;
    }

    if (body.startsWith("!help")) {
      help(roomId);
    } else if (body.startsWith("!lock")) {
      lock(roomId);
    } else if (body.startsWith("!lock")) {
      lock(roomId);
    } else if (body.startsWith("!unlock")) {
      unlock(roomId);
    } else if (body.startsWith("!invite")) {
      invite(roomId, body.substring("!invite".length).trim());
    } else if (body.startsWith("!activate")) {
      deactivate(roomId, body.substring("!activate".length).trim(), false);
    } else if (body.startsWith("!deactivate")) {
      deactivate(roomId, body.substring("!deactivate".length).trim(), true);
    } else if (body.startsWith("!email")) {
      email(roomId, body.substring("!email".length).trim());
    } else if (body.startsWith("!seen")) {
      seen(roomId, body.substring("!seen".length).trim());
    } else if (body.startsWith("!serveradmin")) {
      serveradmin(roomId, body.substring("!serveradmin".length).trim());
    } else if (body.startsWith("!roomadmin")) {
      roomadmin(roomId, body.substring("!roomadmin".length).trim());
    } else if (body.startsWith("!")) {
      commandNotFound(roomId);
    }
  });

  // client.on("room.join", (roomId, joinEvent) => {
  //   console.log('join');
  //   console.log('roomid: ', roomId);
  //   console.log('event: ', joinEvent);
  //   console.log(`Joined ${roomId} as ${joinEvent["state_key"]}`);
  // });

  // client.on("room.leave", (roomId, leaveEvent) => {
  //   console.log('leave');
  //   console.log('roomid: ', roomId);
  //   console.log('event: ', leaveEvent);
  //   console.log(`Left ${roomId} as ${leaveEvent["state_key"]}`);
  // });

  await client.start().then(() => logger.log("Client started!"));
})();

function commandNotFound(roomId: string) {
  client.sendMessage(roomId, {
    "msgtype": "m.notice",
    "body": "Command not found. User !help for help",
  });
}

function help(roomId: string) {
  client.sendMessage(roomId, {
    "msgtype": "m.notice",
    "body": [
      "!help                   - Help",
      "!echo <text>            - Echos the text",
      "!lock                   - Locks the channels",
      "!unlock                 - Unlocks the channels",
      "!invite <username>      - Invotes the user to the channels",
      "!activate <username>    - Activates a deactivated user",
      "!deactivate <username>  - Deactivates a user",
      "!email <username>       - Shows the emails of a user",
      "!seen <username>        - Shows the seen of a user",
      "!serveradmin <username> - Toggles server admin of a user",
      "!roomadmin <username>   - Sets the room admin role for a user",
    ].join("\n"),
  });
}

function echo(roomId: string, command: string) {
  const replyText = command.substring("!echo".length).trim();
  client.sendMessage(roomId, {
    "msgtype": "m.notice",
    "body": replyText,
  });
}

async function lock(commandRoomId: string) {
  logger.log('Locking rooms')
  let locked: string[] = [];
  let failed: string[] = [];

  for (let roomId in config.lockRoomInclude) {
    logger.log('Locking room:', roomId, config.lockRoomInclude[roomId]);
    try {
      let resp = await client.getRoomStateEvent(roomId, 'm.room.power_levels', '');
      resp.events['m.reaction'] = config.lockLevel;
      resp.events_default = config.lockLevel;
      await client.sendStateEvent(roomId, 'm.room.power_levels', '', resp);

      locked.push(config.lockRoomInclude[roomId]);
    } catch (error) {
      logger.error(error);
      failed.push(config.lockRoomInclude[roomId]);
    }
  }

  client.sendMessage(commandRoomId, {
    "msgtype": "m.notice",
    "body": "Rooms locked: " + locked.join(", ") + (failed.length ? "\nFailed to lock: " + failed.join(", ") : ""),
  });
}

async function unlock(commandRoomId: string) {
  logger.log('Unlocking rooms')

  let unlocked: string[] = [];
  let failed: string[] = [];
  for (let roomId in config.lockRoomInclude) {
    logger.log('Unlocking room:', roomId, config.lockRoomInclude[roomId]);
    try {
      let resp = await client.getRoomStateEvent(roomId, 'm.room.power_levels', '')
      resp.events['m.reaction'] = 0;
      resp.events_default = 0;
      await client.sendStateEvent(roomId, 'm.room.power_levels', '', resp);

      unlocked.push(config.lockRoomInclude[roomId]);
    } catch (error) {
      logger.error(error);
      failed.push(config.lockRoomInclude[roomId]);
    }
  }

  client.sendMessage(commandRoomId, {
    "msgtype": "m.notice",
    "body": "Rooms unlocked: " + unlocked.join(", ") + (failed.length ? "\nFailed to unlock: " + failed.join(", ") : ""),
  });
}

async function invite(commandRoomId: string, username: string) {
  let userid = '@' + username + ':' + config.servername;
  logger.log('Inviting', userid, 'into rooms');

  let invited: string[] = [];
  let failed: string[] = [];
  for (let roomId in config.inviteRoomInclude) {
    logger.log('Inviting', userid, 'room: ', roomId, config.inviteRoomInclude[roomId])
    try {
      await client.inviteUser(userid, roomId);

      invited.push(config.lockRoomInclude[roomId]);
    } catch (error) {
      logger.error(error);
      failed.push(config.lockRoomInclude[roomId]);
    }
  }

  client.sendMessage(commandRoomId, {
    "msgtype": "m.notice",
    "body": "Invited " + userid + " into rooms: " + invited.join(", ") + (failed.length ? "\nFailed to invite into: " + failed.join(", ") : ""),
  });
}

async function deactivate(commandRoomId: string, username: string, deactivate: boolean) {
  logger.log((deactivate ? "Dea" : "A") + "ctivating user", username);
  try {
    let userid = '@' + username + ':' + config.servername;

    //check if account exists
    {
      let resp = await fetch(config.homeserverUrl + '/_synapse/admin/v2/users/' + userid, {
        headers: { 'Authorization': 'Bearer ' + config.accessToken }
      });
      if (resp.status !== 200) {
        client.sendMessage(commandRoomId, {
          "msgtype": "m.notice",
          "body": "User " + username + " does not exist",
        });
        return;
      }

      let j: any = await resp.json();
      if (j.deactivated === deactivate) {
        client.sendMessage(commandRoomId, {
          "msgtype": "m.notice",
          "body": "User " + username + " already " + (deactivate ? "de" : "") + "activated",
        });
        return;
      }
    }

    //(de)activate
    {
      let resp = await fetch(config.homeserverUrl + '/_synapse/admin/v2/users/' + userid, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + config.accessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ deactivated: deactivate }),
      });
      if (resp.status === 200) {
        client.sendMessage(commandRoomId, {
          "msgtype": "m.notice",
          "body": "User " + username + " " + (deactivate ? "de" : "") + "activated",
        });
      } else {
        logger.error(await resp.text());
        client.sendMessage(commandRoomId, {
          "msgtype": "m.notice",
          "body": "Failed to " + (deactivate ? "de" : "") + "activate user " + username,
        });
      }
    }
  } catch (error) {
    logger.error(error);
    client.sendMessage(commandRoomId, {
      "msgtype": "m.notice",
      "body": "Error while " + (deactivate ? "de" : "") + "activating user " + username,
    });
  }
}

async function email(commandRoomId: string, username: string) {
  logger.log('Fetching emails of', username);
  try {
    let userid = '@' + username + ':' + config.servername;
    let resp = await fetch(config.homeserverUrl + '/_synapse/admin/v2/users/' + userid, {
      headers: { 'Authorization': 'Bearer ' + config.accessToken }
    });
    let j: any = await resp.json();
    let emails = (j.threepids as any[]).filter(e => e.medium === 'email').map(e => e.address);

    client.sendMessage(commandRoomId, {
      "msgtype": "m.notice",
      "body": "Emails of " + username + ": " + emails.join(', '),
    });
  } catch (error) {
    logger.error(error);
    client.sendMessage(commandRoomId, {
      "msgtype": "m.notice",
      "body": "Error while fetching emails of " + username,
    });
  }
}

async function seen(commandRoomId: string, username: string) {
  logger.log('Fetching seen of', username);
  try {
    let userid = '@' + username + ':' + config.servername;
    let resp = await fetch(config.homeserverUrl + '/_synapse/admin/v2/users/' + userid, {
      headers: { 'Authorization': 'Bearer ' + config.accessToken }
    });
    let j: any = await resp.json();
    let created = new Date(j.creation_ts * 1000);

    client.sendMessage(commandRoomId, {
      "msgtype": "m.notice",
      "body": "Created user " + username + " on: " + created.toLocaleString(),
    });
  } catch (error) {
    logger.error(error);
    client.sendMessage(commandRoomId, {
      "msgtype": "m.notice",
      "body": "Error while fetching seen of " + username,
    });
  }
}

async function serveradmin(commandRoomId: string, username: string) {
  logger.log('Toggling server admin of', username);
  try {
    let userid = '@' + username + ':' + config.servername;
    let resp = await fetch(config.homeserverUrl + '/_synapse/admin/v2/users/' + userid, {
      headers: { 'Authorization': 'Bearer ' + config.accessToken }
    });
    let j: any = await resp.json();

    //toggle admin
    {
      let resp = await fetch(config.homeserverUrl + '/_synapse/admin/v2/users/' + userid, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + config.accessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin: !j.admin }),
      });
      if (resp.status === 200) {
        client.sendMessage(commandRoomId, {
          "msgtype": "m.notice",
          "body": "User " + username + " " + (j.admin ? "is no admin no more" : "is now admin"),
        });
      } else {
        logger.error(await resp.text());
        client.sendMessage(commandRoomId, {
          "msgtype": "m.notice",
          "body": "Failed to toggle admin for user " + username,
        });
      }
    }
  } catch (error) {
    logger.error(error);
    client.sendMessage(commandRoomId, {
      "msgtype": "m.notice",
      "body": "Error while fetching seen of " + username,
    });
  }
}

async function roomadmin(commandRoomId: string, username: string) {
  logger.log('Setting room admin for', username);
  let userid = '@' + username + ':' + config.servername;

  let success: string[] = [];
  let failed: string[] = [];
  for (let roomId in config.roomAdminRoomInclude) {
    try {
      let resp = await fetch(config.homeserverUrl + '/_synapse/admin/v1/rooms/' + roomId + '/make_room_admin', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + config.accessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userid }),
      });
      if (resp.status === 200) {
        success.push(config.roomAdminRoomInclude[roomId]);
      } else {
        logger.error(await resp.text());
        failed.push(config.roomAdminRoomInclude[roomId]);
      }
    } catch (error) {
      logger.error(error);
      failed.push(config.roomAdminRoomInclude[roomId]);
    }
  }
  client.sendMessage(commandRoomId, {
    "msgtype": "m.notice",
    "body": "Admin role set in rooms: " + success.join(", ") + (failed.length ? "\nFailed to set admin in: " + failed.join(", ") : ""),
  });
}
