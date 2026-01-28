# ONES App Examples

<div align="center">

![ONES App](https://img.shields.io/badge/ONES-App-blue)
![ONESApp Examples](https://img.shields.io/badge/ONESApp-Examples-lightgray)
![License](https://img.shields.io/badge/license-MIT-green)

A collection of example ONES Apps demonstrating various capabilities and best practices for ONES App development.

[Examples](#📚-examples) • [Prerequisites](#🚀-prerequisites) • [Feedback & Support](#💬-feedback--support)

</div>

---

## 📖 About

This repository contains a collection of example ONES Apps that demonstrate how to build applications that extend and enhance the ONES platform. Each example focuses on different use cases, capabilities, and implementation patterns.

These examples serve as **starter templates** and **learning resources** for developers building ONES Apps.

## 📚 Examples

### Available Examples
> More examples coming soon...

| Example | Description | Technologies | Status |
|---------|-------------|--------------|--------|
| [Auto Watcher](./auto-watcher/README.md) | Automatically add watchers to newly created issues based on configurable rules | NestJS, React, TypeScript, SQLite | ✅ Ready |

### Example Details

#### [Auto Watcher](./auto-watcher/README.md)

An automation app that demonstrates event-driven automation by automatically adding watchers to newly created issues.

**Key Features:**
- Event-driven automation (`ones:project:issue:created`)
- Settings page for rule configuration
- ONES OpenAPI integration
- JWT authentication
- SQLite database persistence

**Technologies:** NestJS, React, TypeScript, Vite, SQLite, TypeORM

[View Documentation →](./auto-watcher/README.md)

## 🚀 Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0

**Install (recommended):**

- **macOS / Windows**: download and install the LTS Node.js installer from `https://nodejs.org/`, or use a version manager:
  - `fnm` (Fast Node Manager) - cross-platform, fast
  - `Volta` - cross-platform, manages Node/npm/yarn
  - `nvm` (macOS/Linux) or `nvm-windows` (Windows)
- **macOS (alternative)**: install via Homebrew: `brew install node`
- **Linux**: use your distro package manager or a version manager

**Verify:**

```bash
node -v
npm -v
```

### Expose your local service (for webhooks & callbacks)

When developing ONES Apps, you may need to expose your local server (e.g. `localhost:3000`) to the public internet. It the necessary let ONES platform access your local service.

**Recommended: Cloudflare Tunnel (cloudflared)**

```bash
# macOS (Homebrew)
brew install cloudflared

# Windows (winget)
winget install -e --id Cloudflare.cloudflared
```

Linux (Debian/Ubuntu/RHEL, etc.): see Cloudflare’s downloads/docs: `https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/`


**Quick run:**

```bash
cloudflared tunnel --url http://localhost:3000
```

See More: [Expose Your App Service →](./EXPOSE_YOUR_APP.md)


## 📄 License

This project is licensed under the [MIT License](./LICENSE).

## 🔗 Related Links

- [ONES Developer Documentation](https://docs.ones.com/developer)
- [ONES OpenPlatform Capabilities Reference](https://docs.ones.com/developer/abilities/reference)
- [ONES App Manifest Documentation](https://docs.ones.com/developer/app-manifest)

## 💬 Feedback & Support

If you encounter any issues or have suggestions, please:

- Open an [Issue](https://github.com/ones-com/ones-app-examples/issues)
- See the main [README](../README.md) for more information about this examples repository

---

<div align="center">

**⭐ If this repository helps you, please give it a Star!**

Made with ❤️ for ONES developers

</div>
