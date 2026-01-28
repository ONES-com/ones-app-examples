# Frontend Application

This is the frontend part of the Auto Watcher ONES App, built with React + TypeScript + Vite.

## Technology Stack

- **React** 17.x
- **TypeScript** 5.x
- **Vite** 7.x
- **ONES Design** - Official ONES UI component library
- **ONES Open SDK** - ONES platform SDK

## Development

### Install Dependencies

```bash
npm install
```

### Build for Production

```bash
npm run build
```

After building, static files will be generated and HTML files will be automatically created.

### Code Linting

```bash
npm run lint
```

## Project Structure

```
web/
├── src/
│   ├── pages/
│   │   └── SettingsPage.tsx      # App settings page
│   └── settings-page-main.tsx    # Settings page entry point
├── scripts/
│   └── generate-html.cjs         # HTML generation script
└── vite.config.ts                # Vite configuration
```

## Using ONES SDK

The frontend uses the ONES Open SDK to communicate with the ONES (pages rendered in ONES) and the app's backend:

```typescript
import { ONES } from '@ones-open/sdk';

// Call app backend API
const response = await ONES.fetchApp('/settings/watcher-rule', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Call ONES OpenAPI
const projects = await ONES.fetchOpenAPI('/openapi/v2/project/projects', {
  method: 'GET'
});
```

## Notes

- Frontend build artifacts are hosted by the backend service, no separate deployment needed
- Built HTML files are automatically injected into the backend static resources directory
- Development uses Vite dev server, production uses NestJS static file serving

For more information, refer to the main [README.md](../README.md) in the project root.
