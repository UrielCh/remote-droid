# Remote-droid

- [Docker Image](https://hub.docker.com/r/urielch/remote-droid)
- [npm](https://www.npmjs.com/package/remote-droid)

- *Remote-droid* is on REST API to control multiple android devices using an HTTP and WebSocket request.
- *Remote-droid* uses a single Redis Database as a multipurpose Database.
- If no database is provided *Remote-droid* will still work without access control.

## Global functioning

### Account / global access

When started for the first time, all connected devices are fully accessible without authentification.
The first created account will obtain an admin role and be the only one allowed to access devices. For now, the server will reject all non-authenticated requests.
The following created account will not have any access to any device until the admin account gives the device access using the `POST /users/allow` method.

### Authentification

- administration functions are available using a JWT token.
- Devices control is done using a token provided by `POST /users/token` with a JWT token.
- An account can have up to 3 tokens.

## API

The REST API open API is visible on path `/api`

![Swaager preview](https://github.com/UrielCh/remote-droid/raw/main/doc/swagger.png)

## Features

Currently supported features:
- List Adb connected devices.
- PNG screen capture.
- JPEG screen capture.
- Send touch event.
- Send key event.
- Reboot the device.
- Get device system properties.
- Exec shell command.
- Past clipboard.
- Forward HTTP GET request to any port inside the phone.
- Forward HTTP WebSocket request to any port inside the phone.
- Start activity.
- Send real-time touch events via WebSocket to the device.
- Enable/disable mobile Data.
- Enable / disable wifi Data.
- Enable/disable airplane mode.
- Call iphonesubinfo service.
- Get SMS (rooted phone only)
- track device getting online/offline via WebSocket


Partially implemented features:
- Get screen as Video steam.
- Forward POST / PUT / DELETE request to any port inside the phone.

## TODO:

- Release a docker version.
- Release a front end.

## Prerequisite

- You must have a valid adb binary installed.
- You must install Nodejs 14+ on your system.
- A Redis server with Redis search and Redis JSON enabled.
- A SMTP server to send activation E-Mail. (if you use auth)

## Installation

```bash
$ npm install
$ npm start
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Configuration

### env vars

- JWT_SECRET
Choose a JWT secret token (no default value, refuse to start without this value)

- DATABASE_REDIS_URL:
Redis database to store authentications info (is not defined will keep all access open)

- GLOBAL_PREFIX
Global URL prefix, the default value is `/`

- SERVICE_PORT
The HTTP port the service will listen to

- ADMIN_TOKEN
Define an admin token, so the setup will be locked by default.

## See also

[DeviceFarmer/stf](https://github.com/DeviceFarmer/stf) An older platform that provides similar functions with an older code base.
