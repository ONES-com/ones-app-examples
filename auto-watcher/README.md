# Auto Watcher - ONES App Example

<div align="center">

![ONES App](https://img.shields.io/badge/ONES-App-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![NestJS](https://img.shields.io/badge/NestJS-11.x-red)
![React](https://img.shields.io/badge/React-17.x-61dafb)
![License](https://img.shields.io/badge/license-MIT-green)

A complete ONES App development example demonstrating how to build automation apps that enhance ONES platform functionality.

[← Back to Examples](../README.md) • [Quick Start](#-quick-start) • [Configuration](#-configuration) • [API Documentation](#-api-documentation)

</div>

---

## 📖 About

**Auto Watcher** is an ONES App example project that demonstrates how to automatically add watchers to newly created issues through event-driven automation. This project serves as a **starter template** for ONES App development.

### Core Features

- **Rule Configuration**: Admins can select team, project, and watcher users in the settings page
- **Event-Driven Automation**: Listens to `ones:project:issue:created` events and automatically adds watchers
- **Smart Matching**: Only adds watchers to issues in the configured project
- **Data Persistence**: Uses SQLite database to store installation info and rule configurations

For detailed information about the architecture, technology stack, and implementation approach, see [ARCHITECTURE.md](./ARCHITECTURE.md).


## 🚀 Quick Start

### Prerequisites

> See [Repository Prerequisites →](../README.md#🚀-prerequisites) for install guide.

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0

### Initialize the app development environment

#### 1. Clone the repository

```bash
git clone https://github.com/ones-com/ones-app-examples.git
cd ones-app-examples/auto-watcher
```

#### 2. Install dependencies

```bash
npm run init
```

This command will automatically:
- Install backend dependencies
- Install frontend dependencies
- Build frontend assets
- Copy environment variable example file and random app id

#### 3. Expose your local service (for webhooks & callbacks)
```bash
cloudflared tunnel --url http://localhost:3000
```

Cloudflare will print a `https://<random>.trycloudflare.com` URL in the output. This is ideal for temporary testing, but **it has no uptime guarantee** and the URL changes between runs.

**Notes**

- You may see a warning about missing `config.yml` — that’s expected for quick tunnels.
- If your service only listens on `127.0.0.1`, that’s fine; `cloudflared` runs locally and can reach it.

See: [Expose Your App Service →](../EXPOSE_YOUR_APP.md)

#### 4. Configure environment variables

Edit the `.env` file with your app settings:

```bash
# App ID is generated automatically by the script `npm run init`
APP_ID=app_<random>
# App Base URL Configuration
# Replace <random> with the URL printed by cloudflared
BASE_URL=https://<random>.trycloudflare.com

# Database Configuration (Optional)
DB_FILE=./app.db

# Server Configuration (Optional)
# If you expose your service with another port, replace 3000 with the port you used.
PORT=3000
```

**Important**: `BASE_URL` must be a publicly accessible address where your app can be reached. The ONES platform will communicate with your app through this address.

#### 5. Run the application

This command will start the development server with hot reload.
```bash
npm run dev
```

Once the app is running, you can access `http://localhost:3000`(and also `https://<random>.trycloudflare.com`) to view the app's `manifest`.

#### 6. Install the app to your ONES organization

1. In ONES, go to `App Center` in the left sidebar.
2. Click the `Installed apps` button on the top .
3. Click the `Upload app` button on the top right.
4. Input the `BASE_URL` (it should be `https://<random>.trycloudflare.com`) and click the `Confirm` button.
5. Check the `Auto Watcher` app and click the `Confirm` button.
6. Enjoy the app!

For more deployment details, refer to the [ONES Developer Documentation](https://docs.ones.com/developer/guide/getting-started/).


## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `BASE_URL` | Publicly accessible address of your app | ✅ | - |
| `DB_FILE` | SQLite database file path | ❌ | `./app.db` |
| `PORT` | Server listening port | ❌ | `3000` |

### Manifest Configuration

`manifest.json` is the core configuration file for ONES Apps, defining app capabilities and permissions:

- **App ID**: Obtained after creating the app in the ONES platform
- **OAuth Scopes**: Define the permissions your app needs
- **Event Subscriptions**: Define the event types your app listens to
- **Extension Points**: Define UI extensions for your app

For detailed configuration instructions, refer to the [ONES App Manifest Documentation](https://docs.ones.com/developer/guide/getting-started/app-lifecycle#manifest-declaration).

## 📚 API Documentation

### Backend APIs

#### Get Manifest

```
GET /
```

Returns the app's manifest.json configuration.

#### Install Callback

```
POST /install_cb
```

Called by the ONES platform when installing the app.

#### Enabled Callback

```
POST /enabled_cb
```

Called by the ONES platform when enabling the app.

#### Get Watcher Rule

```
GET /settings/watcher-rule
Headers: Authorization: Bearer <token>
```

Gets the currently active watcher rule configuration.

#### Save Watcher Rule

```
PUT /settings/watcher-rule
Headers: Authorization: Bearer <token>
Body: {
  "projectId": "string",
  "teamId": "string",
  "watcherUserIds": ["string"]
}
```

Saves or updates the watcher rule configuration.

#### Event Callback

```
POST /event_cb
```

Called by the ONES platform when subscribed events are triggered.

### Frontend APIs

The frontend uses the ONES Open SDK to communicate with the ONES platform and the app's backend:

```typescript
// Call app backend API
ONES.fetchApp('/settings/watcher-rule', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Call ONES OpenAPI
ONES.fetchOpenAPI('/openapi/v2/project/projects', {
  method: 'GET'
});
```

## 🔌 ONES Capabilities Used

This project uses the following ONES OpenPlatform capabilities:

### Events

- `ones:project:issue:created` - Issue creation event

### OpenAPI Endpoints

- `GET /openapi/v2/project/issues/{issueID}` - Get issue details
- `POST /openapi/v2/project/issues/{issueID}/watchers` - Add issue watchers
- `GET /openapi/v2/project/projects` - Get project list
- `GET /openapi/v2/account/teams` - Get team list
- `GET /openapi/v2/account/users/search` - Search users
- `GET /openapi/v2/account/users/batch` - Batch get user information

### OAuth Scopes

- `read:project:issue` - Read issues
- `write:project:issue-watcher` - Manage issue watchers
- `read:project:project` - Read project information
- `read:account:teams` - Read team information
- `read:account:user` - Read user information

### Extensions

- **App Setting Pages**: Custom setting page entries

For detailed capability documentation, refer to the [ONES OpenPlatform Capabilities Reference](https://docs.ones.com/developer/abilities/reference).

## 🧑‍💻 Development

### Development Workflow

1. **Modify code**: Edit code in `src/` or `web/src/` directories
2. **Frontend development**: Run `npm run dev` in the `web/` directory for frontend development
3. **Backend development**: Run `npm run dev` to start the development server (with hot reload)
4. **Code checking**: Run `npm run lint` to check code style

### Code Style

The project uses ESLint and Prettier for code style checking:

```bash
# Check code style
npm run lint

# Auto-fix code formatting
npm run format
```

### Testing

```bash
# Run tests
npm test
```

For more detailed development guidelines, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 🔗 Related Links

- [ONES Developer Documentation](https://docs.ones.com/developer)
- [ONES OpenPlatform Capabilities Reference](https://docs.ones.com/developer/abilities/reference)
- [NestJS Official Documentation](https://docs.nestjs.com/)
- [React Official Documentation](https://react.dev/)
- [TypeScript Official Documentation](https://www.typescriptlang.org/)

---

<div align="center">

**⭐ If this project helps you, please give it a Star!**

Made with ❤️ for ONES developers

</div>
