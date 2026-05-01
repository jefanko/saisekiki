import { Innertube, UniversalCache, YTNodes } from 'youtubei.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let yt: Innertube | null = null;
async function getYT() {
  if (!yt) yt = await Innertube.create({ cache: new UniversalCache(false) });
  return yt;
}

function mapItem(item: any) {
  if (item.type === 'Playlist') {
    return {
      url: `/playlist/${item.id}`,
      type: 'playlist',
      title: item.title?.text || item.title || 'Unknown Playlist',
      thumbnail: item.thumbnails?.[0]?.url || '',
      uploaderName: item.author?.name || item.author || 'Unknown Channel',
      uploaderUrl: `/channel/${item.author?.channel_id || item.author?.id || ''}`,
      uploaderAvatar: '',
      videos: item.video_count?.text ? parseInt(item.video_count.text.replace(/[^0-9]/g, '')) : 0,
      id: item.id
    };
  }

  return {
    url: `/watch?v=${item.id}`,
    type: 'stream',
    title: item.title?.text || item.title || 'Unknown Title',
    thumbnail: item.thumbnails?.[0]?.url || '',
    uploaderName: item.author?.name || item.author || 'Unknown Channel',
    uploaderUrl: `/channel/${item.author?.channel_id || item.author?.id || ''}`,
    uploaderAvatar: item.author?.thumbnails?.[0]?.url || '',
    uploadedDate: item.published?.text || '',
    shortDescription: item.description?.text || '',
    duration: item.duration?.seconds || 0,
    views: typeof item.view_count === 'number' ? item.view_count : 0,
    uploaded: 0,
    uploaderVerified: item.author?.is_verified || false,
    isShort: item.is_short || false,
    id: item.id
  };
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
      const search = await youtube.search(q);
      const results = search.results?.map(mapItem).filter((item: any) => item.type === 'stream' || item.type === 'playlist') || [];
      res.status(200).json({ items: results });

    } else if (action === 'playlist') {
      const id = req.query.id as string;
      const playlist = await youtube.getPlaylist(id);

      const playlistData = {
        title: playlist.info.title,
        description: playlist.info.description,
        author: playlist.info.author.name,
        authorUrl: `/channel/${playlist.info.author.channel_id}`,
        authorAvatar: playlist.info.author.thumbnails?.[0]?.url || '',
        views: playlist.info.views,
        updated: playlist.info.last_updated,
        videos: playlist.items.map(mapVideo)
      };

      res.status(200).json(playlistData);

    } else if (action === 'stream') {
      const id = req.query.id as string;
      let info = await youtube.getInfo(id);

      let streamUrl = '';
      let audioOnlyUrl = '';

      const tryExtract = (vInfo: any) => {
        let vUrl = '';
        let aUrl = '';

        try {
          const format = vInfo.chooseFormat({ type: 'video+audio', quality: 'best' });
          vUrl = format.url || '';
        } catch (e) {
          try {
            const format = vInfo.chooseFormat({ type: 'video', quality: 'best' });
            vUrl = format.url || '';
          } catch (e2) { }
        }

        try {
          const audioFormat = vInfo.chooseFormat({ type: 'audio', quality: 'best' });
          aUrl = audioFormat.url || '';
        } catch (e) { }

        return { vUrl, aUrl };
      };

      const urls = tryExtract(info);
      streamUrl = urls.vUrl;
      audioOnlyUrl = urls.aUrl;

      // If WEB client fails, try ANDROID client which is more permissive
      if (!streamUrl) {
        try {
          const androidInfo = await youtube.getInfo(id, { client: 'ANDROID' });
          const aUrls = tryExtract(androidInfo);
          streamUrl = aUrls.vUrl || streamUrl;
          audioOnlyUrl = aUrls.aUrl || audioOnlyUrl;
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
        uploaderAvatar: info.basic_info.channel?.thumbnails?.[0]?.url || (info as any).secondary_info?.owner?.author?.thumbnails?.[0]?.url || '',
        views: info.basic_info.view_count || 0,
        likes: info.basic_info.like_count || 0,
        hls: streamUrl,
        audioOnlyUrl: audioOnlyUrl,
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
