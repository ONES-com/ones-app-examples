# Architecture & Development Guide

This document provides detailed information about the architecture, technology stack, implementation approach, and development guidelines for the Auto Watcher ONES App.

## 📋 Table of Contents

- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Architecture Overview](#-architecture-overview)
- [Implementation Approach](#-implementation-approach)
- [Development Guidelines](#-development-guidelines)
- [Adding New Features](#-adding-new-features)

## 🛠️ Technology Stack

### Backend

- **Framework**: NestJS 11.x
  - A progressive Node.js framework for building efficient and scalable server-side applications
  - Provides dependency injection, decorators, and modular architecture
- **Language**: TypeScript 5.x
  - Provides type safety and better developer experience
- **Runtime**: Node.js 20+
  - Modern JavaScript runtime with improved performance
- **Database**: SQLite 3 + TypeORM
  - Lightweight database suitable for ONES Apps
  - TypeORM provides type-safe database operations
- **Authentication**: JWT (jsonwebtoken)
  - Secure token-based authentication for API requests
- **HTTP Client**: Built-in Fetch API
  - Modern API for making HTTP requests to ONES OpenAPI

### Frontend

- **Framework**: React 17.x
  - Component-based UI library
- **Build Tool**: Vite 7.x
  - Fast build tool with excellent developer experience
- **SDK**: ONES Open SDK (@ones-open/sdk)
  - SDK for interacting with ONES platform and app backend
- **Language**: TypeScript 5.x
  - Type-safe frontend development

### Development Tools

- **Code Style**: ESLint + Prettier
  - Ensures consistent code formatting and catches potential issues
- **Package Manager**: npm
- **Type Checking**: TypeScript

## 📁 Project Structure

```
my-new-project/
├── src/                          # Backend source code
│   ├── app.controller.ts         # Main controller (route handlers)
│   ├── app.module.ts             # Application module
│   ├── main.ts                   # Application entry point
│   ├── dto/                      # Data Transfer Objects
│   │   ├── event-callback.dto.ts
│   │   ├── install-callback.dto.ts
│   │   ├── openapi.dto.ts
│   │   └── watcher-rule.dto.ts
│   ├── entities/                 # Database entities
│   │   ├── install-callback.entity.ts
│   │   └── watcher-rule.entity.ts
│   └── services/                 # Business logic services
│       ├── auth.service.ts       # Authentication service
│       ├── database.service.ts   # Database service
│       ├── issue-watcher.service.ts  # Issue watcher service
│       ├── openapi.service.ts    # ONES OpenAPI service
│       └── watcher-rule.service.ts  # Rule management service
├── web/                          # Frontend source code
│   ├── src/
│   │   ├── pages/
│   │   │   └── SettingsPage.tsx  # Settings page component
│   │   └── settings-page-main.tsx
│   ├── scripts/
│   │   └── generate-html.cjs      # HTML generation script
│   └── vite.config.ts            # Vite configuration
├── manifest.json                 # ONES App manifest file
├── manifest.template.json        # Manifest file template
├── package.json                  # Project dependencies
├── tsconfig.json                 # TypeScript configuration
├── .env                          # Environment variables (create manually, run `npm run init` to copy env.example to .env)
└── env.example                   # Environment variable example
```

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────┐
│   ONES Platform │
└────────┬────────┘
         │
         │ Events / OpenAPI / OAuth
         │
┌────────▼────────────────────────┐
│      Auto Watcher App           │
│  ┌──────────────────────────┐   │
│  │   Frontend (React)       │   │
│  │   - Settings Page        │   │
│  └──────────┬───────────────┘   │
│             │                    │
│  ┌──────────▼───────────────┐   │
│  │   Backend (NestJS)       │   │
│  │   - Controllers          │   │
│  │   - Services             │   │
│  │   - Database (SQLite)    │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

### Component Responsibilities

#### Backend Components

1. **AppController**: Handles HTTP requests and routes them to appropriate services
2. **AuthService**: Validates JWT tokens from ONES platform
3. **DatabaseService**: Manages database connections and installation data
4. **OpenApiService**: Handles communication with ONES OpenAPI
5. **WatcherRuleService**: Manages watcher rule CRUD operations
6. **IssueWatcherService**: Processes issue creation events and adds watchers

#### Frontend Components

1. **SettingsPage**: React component for configuring watcher rules
2. **ONES SDK Integration**: Uses ONES Open SDK to communicate with platform and backend

### Data Flow

#### Event-Driven Flow

```
1. User creates issue in ONES
   ↓
2. ONES Platform triggers 'ones:project:issue:created' event
   ↓
3. App receives event at /event_cb endpoint
   ↓
4. IssueWatcherService processes event
   ↓
5. Service checks if rule matches (project ID)
   ↓
6. Service calls ONES OpenAPI to add watchers
```

#### Configuration Flow

```
1. Admin opens settings page in ONES
   ↓
2. Frontend loads current rule via GET /settings/watcher-rule
   ↓
3. Admin selects team, project, and watchers
   ↓
4. Frontend saves rule via PUT /settings/watcher-rule
   ↓
5. Backend persists rule to SQLite database
```

## 💡 Implementation Approach

### Design Principles

1. **Event-Driven Architecture**: The app primarily responds to ONES events rather than polling
2. **Separation of Concerns**: Clear separation between controllers, services, and data access
3. **Type Safety**: Extensive use of TypeScript types and DTOs
4. **Modular Design**: Services are independent and can be easily tested or replaced

### Key Implementation Details

#### Authentication

- Uses JWT tokens provided by ONES platform
- Tokens are validated in `AuthService` before processing requests
- Token validation ensures requests are from authorized sources

#### Database Design

- **InstallCallback Entity**: Stores installation information from ONES platform
- **WatcherRule Entity**: Stores watcher rule configurations
- Only one active rule is maintained at a time

#### Error Handling

- Comprehensive error logging using NestJS Logger
- Graceful error handling with appropriate HTTP status codes
- Detailed error messages for debugging

#### Event Processing

- Events are processed asynchronously
- Event processing includes validation and error handling
- Failed events are logged but don't crash the application

## 🧑‍💻 Development Guidelines

### Code Organization

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **DTOs**: Define data structures for API requests/responses
- **Entities**: Define database models

### Naming Conventions

- **Files**: kebab-case (e.g., `watcher-rule.service.ts`)
- **Classes**: PascalCase (e.g., `WatcherRuleService`)
- **Functions/Methods**: camelCase (e.g., `getActiveRule`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `BASE_URL`)

### TypeScript Best Practices

- Always define types for function parameters and return values
- Use interfaces for object shapes
- Use enums for fixed sets of values
- Avoid `any` type; use `unknown` if type is truly unknown

### Error Handling

- Use NestJS `HttpException` for HTTP errors
- Log errors with appropriate log levels
- Provide meaningful error messages
- Don't expose internal error details to clients

## ➕ Adding New Features

### Adding a New API Endpoint

1. **Define DTO**: Create a new DTO file in `src/dto/` for request/response types
2. **Add Controller Method**: Add a new method in `src/app.controller.ts`
3. **Implement Service Logic**: Create or update a service in `src/services/`
4. **Update Module**: Ensure the service is registered in `src/app.module.ts`

Example:

```typescript
// src/dto/new-feature.dto.ts
export class NewFeatureRequest {
  field1: string;
  field2: number;
}

// src/app.controller.ts
@Post('/new-feature')
async handleNewFeature(@Body() request: NewFeatureRequest) {
  return this.newFeatureService.process(request);
}
```

### Adding a New Event Handler

1. **Update Manifest**: Add the event type to `manifest.json` under `events.types`
2. **Add Event DTO**: Create a DTO for the event structure in `src/dto/`
3. **Update Event Handler**: Add handling logic in `IssueWatcherService` or create a new service
4. **Test Event**: Use ONES platform to trigger the event and verify handling

Example:

```typescript
// manifest.json
"events": {
  "types": [
    { "eventType": "ones:project:issue:created" },
    { "eventType": "ones:project:issue:updated" }  // New event
  ]
}

// src/services/issue-watcher.service.ts
async handleIssueUpdated(event: IssueUpdatedEventCallback) {
  // Handle the new event
}
```

### Adding a New Frontend Page

1. **Create Component**: Create a new React component in `web/src/pages/`
2. **Update Manifest**: Add the page to `manifest.json` under `extensions.appSettingPages`
3. **Generate HTML**: The build process will automatically generate the HTML file
4. **Test in ONES**: Access the page through ONES platform settings

Example:

```typescript
// web/src/pages/NewPage.tsx
export default function NewPage() {
  return <div>New Page Content</div>;
}

// manifest.json
"extensions": {
  "appSettingPages": [
    {
      "key": "settingPage",
      "funcs": {
        "customEntries": "/settingPage/entries"
      }
    }
  ]
}

// src/app.controller.ts
@Post('/settingPage/entries')
handleSettingPageEntries() {
  return {
    entries: [
      { title: 'Rule settings', page_url: '/static/settings-page.html' },
      { title: 'New Page', page_url: '/static/new-page.html' }  // New page
    ]
  };
}
```

### Testing Strategy

1. **Unit Tests**: Test individual services and functions
2. **Integration Tests**: Test API endpoints with test database
3. **E2E Tests**: Test complete workflows in ONES platform

### Performance Considerations

- Database queries should be optimized (use indexes where appropriate)
- API calls to ONES OpenAPI should be batched when possible
- Frontend should use React best practices (memoization, lazy loading)

## 📚 Additional Resources

- [ONES Developer Documentation](https://docs.ones.com/developer/guide/getting-started/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
