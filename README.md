# Remote-droid

Remote-droid is on REST api to contole multiuple android device using a http and websocket request.

## fetures

Current supported fetures:
- List Adb connected devices.
- PNG screen capture.
- JPEG screen capture.
- Send touch event.
- Send key event.
- Reboot device.
- Get device system properties.
- Exec shell command.
- Past clicpboard.
- Foward http GET request to any port inside the phone.
- Foward http WebSocket request to any port inside the phone.
- Start acitivty.
- Send realtime touch events via WebSocket to the device.
- Enable / disable mobile Data.
- Enable / disable wifi Data.
- Enable / disable airplane mode.
- Call iphonesubinfo service.
- Get SMS (rooted phone only)

Partial implemented fetures:
- Get screen as Video steam.
- Forward POST / PUT / DELETE request to any port inside the phone.

## TODO:

- Release a docker version.
- Release a front end.
- Choose an authentification right managment.

## Prerequisite

- You must have a valid adb binary instaled.
- You must install Nodejs 14+ on your system.
- A Mysql / Postgesql or a docker to provide related database. (if you use auth)
- A SMTP server so send activation E-Mail. (if you use auth)

## Installation

```bash
$ npm install
$ npx prisma generate
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

## See also

[DeviceFarmer/stf](https://github.com/DeviceFarmer/stf) An older platefome that provide similar function, with an older code base.
