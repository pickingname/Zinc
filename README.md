# get

## what does this app do??
this app fetches a website from your config, then it will just repeatly fetches

## funcions
- ping monitoring
- offline / online notifcation
- uptime / downtime monitoring

## planned
- save the config into the disk
- save the uptime/downtime data into the disk
- ping graphs

## running from source

### `git clone https://github.com/pickingname/get`
- this will clone the repo into your local matchine

### `npm install`
- this will install the depencies that the app will use
- use `pnpm i` for pnpm users

### `npm run tauri dev`
- runs the application in the tauri window, this will not work if you run it using nextjs localhost:3000 method
- **make sure to install tauri in your local matchine**
- use `pnpm tauri dev` for pnpm users
