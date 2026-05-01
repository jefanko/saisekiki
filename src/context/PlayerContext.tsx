import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { PipedVideo, PipedStreamResponse } from '../types/piped';

interface PlayerContextType {
  currentVideo: Partial<PipedVideo> | null;
  stream: PipedStreamResponse | null;
  queue: Partial<PipedVideo>[];
  isMinimized: boolean;
  isPlaying: boolean;
  isAudioOnly: boolean;
  setVideo: (video: Partial<PipedVideo> | null) => void;
  setStream: (stream: PipedStreamResponse | null) => void;
  addToQueue: (video: Partial<PipedVideo>) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playNext: () => void;
  setMinimized: (minimized: boolean) => void;
  setPlaying: (playing: boolean) => void;
  setIsAudioOnly: (isAudioOnly: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentVideo, setCurrentVideo] = useState<Partial<PipedVideo> | null>(null);
  const [stream, setStream] = useState<PipedStreamResponse | null>(null);
  const [queue, setQueue] = useState<Partial<PipedVideo>[]>([]);
  const [isMinimized, setMinimized] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const [isAudioOnly, setIsAudioOnly] = useState(false);

  const setVideo = (video: Partial<PipedVideo> | null) => {
    setCurrentVideo(video);
    setStream(null);
    if (video) setPlaying(true);
  };

  const addToQueue = (video: Partial<PipedVideo>) => {
    setQueue(prev => [...prev, video]);
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => setQueue([]);

  const playNext = () => {
    if (queue.length > 0) {
      const nextVideo = queue[0];
      setQueue(prev => prev.slice(1));
      setVideo(nextVideo);
    }
  };

  return (
    <PlayerContext.Provider value={{
      currentVideo, stream, queue, isMinimized, isPlaying, isAudioOnly,
      setVideo, setStream, addToQueue, removeFromQueue, clearQueue, playNext, setMinimized, setPlaying, setIsAudioOnly
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
