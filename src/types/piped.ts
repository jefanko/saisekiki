export interface PipedVideo {
  url: string;
  type: string;
  title: string;
  thumbnail: string;
  uploaderName: string;
  uploaderUrl: string;
  uploaderAvatar: string;
  uploadedDate: string;
  shortDescription: string;
  duration: number;
  views: number;
  uploaded: number;
  uploaderVerified: boolean;
  isShort: boolean;
  id?: string;
}

export interface PipedStreamResponse {
  title: string;
  description: string;
  uploadDate: string;
  uploader: string;
  uploaderUrl: string;
  uploaderAvatar: string;
  views: number;
  likes: number;
  dislikes: number;
  hls: string;
  videoStreams: any[];
  audioStreams: any[];
  relatedStreams: PipedVideo[];
}
