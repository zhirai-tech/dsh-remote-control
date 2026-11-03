# DSH Remote Control

**English** | [简体中文](README.zh-CN.md)

Control DeepSeek Harness from a phone. Start connection mode from the desktop, scan a QR code, and the desktop shows a takeover mask until you unlock it. LAN mode is fully featured; remote mode works over cellular through a bundled Cloudflare tunnel.

## Features

- Desktop floating button opens a chooser: **Local (LAN)** or **Remote (external)**
- **Local**: direct Wi-Fi, no public hop, multiple sessions/projects, all features
- **Remote**: works on cellular, free tier single-session, Cloudflare quick tunnel built in (no separate install)
- QR code generated on the desktop for the active mode (public address shown only as QR, not as text)
- Desktop takeover mask; unlock codes generated on the phone (TOTP, offline-capable)
- Yellow warning after 3 failed unlock attempts
- One-tap Windows lock from the phone; lock icon follows the real lock state
- Mask auto-releases ~15s after the phone disconnects (no code needed)
- Mobile file explorer, new workspace creation (drive + folder name), mobile header tuned for small screens

## Install

```bash
dsh plugin --profile <profile> add github:zhirai-tech/dsh-remote-control#v0.2.0
```

Enable in the profile patch:

```yaml
- id: remote-control
  config:
    enabled: true
    port: 7466
```

Restart Harness. A floating phone button appears at the bottom right of the desktop UI.

## Usage

1. Click the phone button → choose **Local** or **Remote**
2. Desktop shows a QR code (Remote waits for the public tunnel address first)
3. Scan with the phone; the desktop is masked automatically
4. Enter the unlock code from the phone to take back the desktop
5. Phone disconnect releases the mask after ~15 seconds

The access key changes on every start; old QR codes stop working.

## License

UNLICENSED — proprietary.
