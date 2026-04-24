# YT再生機器 (YT Playback Machine)

A high-performance YouTube frontend focused on privacy, zero advertisements, and native background playback. Built with a full-stack approach using React, TypeScript, and Vercel Serverless Functions.

## Core Features

- **Ad-Free Architecture**: Direct stream extraction bypasses traditional ad injection layers.
- **Native Background Playback**: Leverages Media Session API and playsInline attributes for seamless audio persistence on mobile devices.
- **Self-Hosted API**: Utilizes `youtubei.js` to interface with YouTube's internal API without requiring official API keys.
- **Glassmorphism UI**: High-fidelity dark theme implemented with custom Materialize CSS components.
- **PWA Support**: Full manifest configuration for standalone installation on iOS and Android.

## Technical Implementation

### Frontend Stack
- **Framework**: React 18
- **Build Tool**: Vite 6+
- **Styling**: Materialize CSS (Customized) + Vanilla CSS
- **Routing**: React Router 7

### Backend / API Layer
The application utilizes Vercel Serverless Functions located in the `/api` directory.
- **Logic**: Node.js environment executing `youtubei.js` commands.
- **Fallback Mechanism**: Implements a dual-layer playback strategy. If native HLS/MP4 extraction fails due to signature or CORS constraints, the application dynamically falls back to an optimized YouTube Iframe embed.

## System Architecture Flow

1. **Client Request**: Frontend initiates a fetch request to the serverless endpoint (`/api/yt?action=...`).
2. **Serverless Execution**: The Node.js handler initializes an `Innertube` session to retrieve video metadata, related feeds, and comment threads.
3. **Stream Resolution**: The backend attempts to resolve high-quality video/audio formats.
4. **Client-Side Rendering**: Data is hydrated into the React state. For video playback, `hls.js` is used where necessary to handle HLS streams.

## Local Development

```bash
# Clone the repository
git clone https://github.com/jefanko/saisekiki.git

# Install dependencies
npm install

# Start development server
npm run dev
```

Note: The `vite.config.ts` includes a custom middleware that simulates the Vercel serverless environment during local development.

## Deployment

This project is optimized for Vercel. To deploy, push your changes to the main branch and connect the repository via the Vercel dashboard.

## License

MIT License. See `LICENSE` for details.
