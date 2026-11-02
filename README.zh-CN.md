# DSH 远程控制 [English](README.md) | **简体中文**

DeepSeek Harness 的局域网手机遥控插件：同一 WiFi 下手机访问 Harness，电脑进入接管遮罩，手机生成一次性解锁码，一键锁定电脑，手机查看项目文件。

## 功能

- 手机访问真实 Harness 界面（不装 App、不走云）
- 桌面接管遮罩 + 手机生成解锁码（TOTP，离线可用）
- 连续输错 3 次变黄警告
- 手机一键锁定 Windows；锁头图标跟随真实锁屏状态
- 解锁后可重新遮挡
- 手机文件结构浏览与文件内容查看
- 手机顶栏：标题、新建会话、解锁码、锁定、断开

## 安装

```bash
dsh plugin --profile <profile> add github:zhirai-tech/dsh-remote-control
```

在 profile 的 cordis.patch.yml 启用：

```yaml
- id: remote-control
  config:
    enabled: true
    port: 7466
```

重启 Harness，手机用同一 WiFi 打开显示的地址。

## 状态

v0.1 仅局域网。公网中转（花生壳/自建）后续版本。

## 许可

UNLICENSED（专有）。
