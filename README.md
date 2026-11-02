# DSH Remote Control

**English** | [简体中文](README.zh-CN.md)

LAN remote control for DeepSeek Harness: pair your phone over Wi-Fi, lock the desktop behind a takeover mask, unlock with one-time codes, lock Windows from the phone, and browse the project files on mobile.

![LAN](https://img.shields.io/badge/LAN-only%20v0.1-blue)

## Features

- Phone access to the real Harness UI over the local network (no app, no cloud)
- Takeover mask on the desktop; unlock codes generated on the phone (TOTP, offline-capable)
- Yellow warning after 3 failed unlock attempts
- One-tap Windows lock from the phone; the lock icon follows the real lock state
- Re-mask after unlocking
- Mobile file explorer (project tree and file contents)
- Mobile header: title, new session, unlock code, lock, disconnect

## Install

```bash
dsh plugin --profile <profile> add github:zhirai-tech/dsh-remote-control
```

Enable it in your profile patch:

```yaml
- id: remote-control
  config:
    enabled: true
    port: 7466
```

Restart Harness, then open the printed address on a phone in the same Wi-Fi.

## Status

v0.1 — LAN only. Public relay (花生壳/self-hosted) is planned.

## License

UNLICENSED — proprietary.
