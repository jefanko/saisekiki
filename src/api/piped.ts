import type { PipedVideo, PipedStreamResponse } from '../types/piped';

const BASE_URL = '/api/yt';

export async function getTrending(): Promise<PipedVideo[]> {
  const response = await fetch(`${BASE_URL}?action=trending`);
  if (!response.ok) throw new Error('Failed to fetch trending videos');
  return response.json();
}

export async function searchVideos(query: string): Promise<{items: PipedVideo[]}> {
  const response = await fetch(`${BASE_URL}?action=search&q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to fetch search results');
  return response.json();
}

export async function getStreamDetails(videoId: string): Promise<PipedStreamResponse> {
  const response = await fetch(`${BASE_URL}?action=stream&id=${videoId}`);
  if (!response.ok) throw new Error('Failed to fetch stream details');
  return response.json();
}

export async function getChannelDetails(channelId: string): Promise<any> {
  const response = await fetch(`${BASE_URL}?action=channel&id=${channelId}`);
  if (!response.ok) throw new Error('Failed to fetch channel details');
  return response.json();
}

export async function getComments(videoId: string): Promise<any[]> {
  const response = await fetch(`${BASE_URL}?action=comments&id=${videoId}`);
  if (!response.ok) throw new Error('Failed to fetch comments');
  return response.json();
}

export async function getSearchSuggestions(query: string): Promise<string[]> {
  const response = await fetch(`${BASE_URL}?action=suggestions&q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to fetch suggestions');
  return response.json();
}
