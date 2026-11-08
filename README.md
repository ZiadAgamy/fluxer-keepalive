# Fluxer KeepAlive
A self-bot that makes your Fluxer personal account online for 24/7 hours.

## How to use it?
1. Download this project.
2. Rename `env.example` to `.env`.
3. Edit `.env`:
```txt
FLUXER_USER_TOKEN=YOUR_USER_SESSION_TOKEN
FLUXER_GATEWAY_URL=wss://YOUR_GATEWAY_HOST/?v=1&encoding=json
```
4. Run this to install the required packages from `package.json`, and run the project:
```bash
npm install && npm start
```
## How to get my account token and the gateway?
### Token:
1. On your Fluxer web, hit `F12` to enter the Developer Mode
2. Go to Applications -> Local Storage -> Token and take the token from its field. 
> [!CAUTION]
> DO NOT paste the token anywhere else, anyone can use your token and login to your account without any notice. If your token got leaked, you have to reset your password to regenerate another token.
3. Paste the token in `FLUXER_USER_TOKEN`.
### Gateway:
- If you are running a self-hosted instance, you can put `wss://YOUR_GATEWAY_HOST/?v=1&encoding=json` in `.env`
- The default gateway for Fluxer is `wss://gateway.fluxer.com/?v=1&encoding=json`
- Wether if it's an instance or fluxer.com, put the gateway in `FLUXER_GATEWAY_URL`.
## Frequently asked questions
- **Is this code safe?**
The code is 100% pure from any malicious code. Only project from `https://github.com/ZiadAgamy/fluxer-keepalive/` is safe. I'm not responsible for any other projects that are copied from here.
- Can I add multiple tokens in project?
*SOON*

## License 
`fluxer-keepalive` is licensed with [MIT](LICENSE). Anyone can edit the code, update it, or edit it. Do NOT use under it's name. Beware from any malicious codes that isn't from me.
