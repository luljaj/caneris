# Spotify Graph

An interactive visualization of your Spotify listening data as a force-directed node graph. Artists are connected by shared genres, naturally forming clusters based on your music taste.

![Spotify Graph](https://via.placeholder.com/800x400/0a0a0f/1DB954?text=Spotify+Graph)

## Features

- **OAuth Authentication** - Secure login with your Spotify account
- **Top 100 Artists** - Visualizes your most-listened artists
- **Genre Connections** - Artists connected by shared genre tags
- **Force-Directed Layout** - Natural clustering by genre
- **Interactive Graph** - Zoom, pan, and drag nodes
- **Artist Details** - Click nodes to see artist info and open in Spotify
- **Customizable Display** - Toggle genre cluster labels

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Spotify account
- Spotify Developer credentials

### Setup

1. **Clone the repository**
   ```bash
   cd spotifygraph
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create Spotify App**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Add `http://localhost:3000` to Redirect URIs in app settings
   - Copy your Client ID

4. **Configure environment**
   ```bash
   # Create .env file
   echo "VITE_SPOTIFY_CLIENT_ID=your_client_id_here" > .env
   echo "VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000" >> .env
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open http://localhost:3000** and connect your Spotify account

## Tech Stack

- **React 18** - UI framework with hooks
- **Vite** - Fast build tool and dev server
- **react-force-graph-2d** - Force-directed graph visualization
- **Spotify Web API** - Artist and user data

## Project Structure

```
spotifygraph/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ArtistDetails.jsx   # Artist info modal
│   │   ├── Login.jsx           # Spotify login screen
│   │   ├── SettingsPanel.jsx   # Settings toggle
│   │   └── SpotifyGraph.jsx    # Main graph visualization
│   ├── hooks/
│   │   ├── useSpotifyAuth.js   # Auth state management
│   │   └── useSpotifyData.js   # Data fetching hook
│   ├── utils/
│   │   ├── graphUtils.js       # Graph data transformation
│   │   └── spotify.js          # Spotify API utilities
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## How It Works

1. **Authentication**: Uses Spotify's Implicit Grant flow for client-side auth
2. **Data Fetching**: Retrieves your top 50-100 artists from Spotify's `/me/top/artists` endpoint
3. **Graph Generation**: 
   - Each artist becomes a node
   - Node size reflects listening frequency (rank)
   - Edges connect artists sharing genres
   - Edge weight = number of shared genres
4. **Visualization**: Force-directed simulation naturally clusters related artists

## License

MIT

