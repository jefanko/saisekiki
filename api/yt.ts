import { Innertube, UniversalCache, YTNodes } from 'youtubei.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let yt: Innertube | null = null;
async function getYT() {
  if (!yt) yt = await Innertube.create({ cache: new UniversalCache(false) });
  return yt;
}

function mapVideo(video: any) {
  return {
    url: `/watch?v=${video.id}`,
    type: 'stream',
    title: video.title?.text || video.title || 'Unknown Title',
    thumbnail: video.thumbnails?.[0]?.url || '',
    uploaderName: video.author?.name || video.author || 'Unknown Channel',
    uploaderUrl: `/channel/${video.author?.id || ''}`,
    uploaderAvatar: video.author?.thumbnails?.[0]?.url || '',
    uploadedDate: video.published?.text || '',
    shortDescription: video.description?.text || '',
    duration: video.duration?.seconds || 0,
    views: typeof video.view_count === 'number' ? video.view_count : 0,
    uploaded: 0,
    uploaderVerified: video.author?.is_verified || false,
    isShort: video.is_short || false
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const youtube = await getYT();
    const action = req.query.action;

    if (action === 'trending') {
      // youtubei.js doesn't have a direct getTrending method, use a search fallback
      const search = await youtube.search('trending', { type: 'video' });
      const results = search.videos.map(mapVideo);
      res.status(200).json(results);

    } else if (action === 'search') {
      const q = req.query.q as string;
      const search = await youtube.search(q, { type: 'video' });
      const results = search.videos.map(mapVideo);
      res.status(200).json({ items: results });

    } else if (action === 'stream') {
      const id = req.query.id as string;
      let info = await youtube.getInfo(id);

      let streamUrl = '';
      const tryExtract = (vInfo: any) => {
        try {
          const format = vInfo.chooseFormat({ type: 'video+audio', quality: 'best' });
          return format.url || '';
        } catch (e) {
          try {
            const format = vInfo.chooseFormat({ type: 'video', quality: 'best' });
            return format.url || '';
          } catch (e2) {
            return '';
          }
        }
      };

      streamUrl = tryExtract(info);

      // If WEB client fails, try ANDROID client which is more permissive
      if (!streamUrl) {
        try {
          const androidInfo = await youtube.getInfo(id, { client: 'ANDROID' });
          streamUrl = tryExtract(androidInfo);
        } catch (e) { }
      }

      const relatedStreams = info.watch_next_feed
        ?.filter((item: any) => item.type === 'CompactVideo' || item.type === 'Video')
        .map(mapVideo) || [];

      const streamData = {
        title: info.basic_info.title,
        description: info.basic_info.short_description,
        uploadDate: info.basic_info.start_timestamp ? new Date((info.basic_info.start_timestamp as any) * 1000).toLocaleDateString() : 'Unknown',
        uploader: info.basic_info.channel?.name || 'Unknown',
        uploaderUrl: `/channel/${info.basic_info.channel_id || ''}`,
        uploaderAvatar: (info as any).secondary_info?.owner?.author?.thumbnails?.[0]?.url || '',
        views: info.basic_info.view_count || 0,
        likes: info.basic_info.like_count || 0,
        hls: streamUrl,
        relatedStreams
      };

      res.status(200).json(streamData);

    } else if (action === 'channel') {
      const id = req.query.id as string;
      const channel = await youtube.getChannel(id);
      const videos = await channel.getVideos();

      const channelData = {
        name: channel.metadata.title,
        description: channel.metadata.description,
        avatar: channel.metadata.avatar?.[0]?.url || '',
        banner: (channel.header as any)?.content?.banner?.[0]?.url || '',
        subscribers: (channel.header as any)?.content?.subscriber_count?.text || '',
        videos: videos.videos.map(mapVideo)
      };
      res.status(200).json(channelData);

    } else if (action === 'comments') {
      const id = req.query.id as string;
      const comments = await youtube.getComments(id);

      const results = (comments.contents || []).map((thread: any) => {
        const c = thread.comment;
        if (!c) return null;
        return {
          authorName: c.author?.name || 'Unknown',
          authorAvatar: c.author?.thumbnails?.[0]?.url || '',
          content: c.content?.text || c.content?.toString() || '',
          published: c.published_time?.text || c.published_time?.toString() || '',
          likeCount: c.like_count?.toString() || '0',
          authorId: c.author?.id || ''
        };
      }).filter(Boolean);
      res.status(200).json(results);

    } else if (action === 'suggestions') {
      const q = req.query.q as string;
      const suggestions = await youtube.getSearchSuggestions(q);
      res.status(200).json(suggestions);

    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}
