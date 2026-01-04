# Caneris

An interactive visualization of your Spotify listening data as a graph. This is meant to represent looking through your music taste as constellations, with each artist being a star sized on listening, and edges being based on genres.

## Why

I love music, data visualization, and space. Thought this would be a great way to make these interests of mine meet. 

## Technical Challenges and Spec

Took some learning graph visualization. 

Basically, it grabs your top artists off of the last.fm API, which gives you artist names along with one or two genres, then makes a graph by iterating through the API call and connecting each artist which shares a genre with another one. 

Originally, Spotify was meant to be used, but it is no longer viable because of Spotify's API limits.

I also used BFS for the analyzing artist hops distance from a starting node and fuzzy search for the search bar.

## Connections / Discovery

The Connections mode is a playable game on the constellation where you explore paths of artists to find the shortest path between two. It picks a start artist (with relatively high popularity), and collects candidates for the target artists who are from 3 to 6 hops away and randomly selects a target from those candidates and gets the shortest path to it.

Discovery uses the same API call as the main onboarding system, the main difference is that it stores the graph in localStorage, allowing you to view your friends graphs while keeping your graph as well as fusing graphs together, playing Connections on friends' graphs and more.

## Goals and Future Ideas

I want this to feel like going through space, but the space is your own music graph. Last.fm tends to give better info on artists, bc of the call "getSimilarArtists", which makes it a bit easier.

I want to add multiplayer, and my goal is to make this into a playable, fun game. The connections mode is


