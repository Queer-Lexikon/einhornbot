# einhornbot
einhornbot is a utility bot, based on [matrix-bot-sdk](https://github.com/turt2live/matrix-bot-sdk), we use for moderation of our 2 chats, [Regenbogenchat](https://queer-lexikon.net/regenbogenchat/) and [Queerchat](https://queer-lexikon.net/queer-chat/)

## Setup
1. Copy config.sample.ts to config.ts
2. Adjust necessary settings, as described in [the sample configuration](config.sample.ts)
3. run ./build.sh
4. Start the bot with ./run.sh

## Usage
In your command channel, send in the command you want to use. See [Commands](#Commands) for a list of valid commands and what they do.

## Commands
Commands are all prefixed with `!`. Arguments in `<>` are required arguments

#### `!help`
Displays all available commands

#### `!lock`
Sets the required power level for sending messages and sending reactions to `lockLevel` for the rooms specified in `lockRoomInclude` in your config.

#### `!unlock`
Sets the required power level for sending messages and sending reactions to 0 for the rooms in `lockRoomInclude` in your config.

#### `!invite <user>`
Invites `<user>` into the rooms specified in `inviteRoomInclude` in your config. `<user>` must be the username, without server or symbols (for `@aurora:queer-lexikon.net` the `<user>` would be `aurora`, for example). This command uses `servername` from the config.

#### `!deactivate <user>`
[Deactivates](https://matrix-org.github.io/synapse/latest/admin_api/user_admin_api.html#deactivate-account) a given `<user>`.

#### `!activate <user>`
Re-aktivates a given `<user>`.

#### `!email <user>`
Shows the e-mail address of the given `<user>`.

#### `!seen <user>`
Check [whois](https://matrix-org.github.io/synapse/latest/admin_api/user_admin_api.html#query-current-sessions-for-a-user) and [devices](https://matrix-org.github.io/synapse/latest/admin_api/user_admin_api.html#list-all-devices) of user to calculate the lastseen of the given user

#### `!serveradmin <user>`
Sets the given `<user>` to [server admin](https://matrix-org.github.io/synapse/latest/admin_api/user_admin_api.html#change-whether-a-user-is-a-server-administrator-or-not)

#### `!roomadmin <user>`
Sets the given `<user>` to [room admin](https://matrix-org.github.io/synapse/latest/admin_api/rooms.html#make-room-admin-api) in the rooms defined in `roomAdminRoomInclude` in the config.
