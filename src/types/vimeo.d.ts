
declare global {
  interface Window {
    Vimeo: {
      Player: new (element: HTMLIFrameElement, options?: any) => VimeoPlayer;
    };
  }
}

interface VimeoPlayer {
  play(): Promise<void>;
  pause(): Promise<void>;
  setVolume(volume: number): Promise<void>;
  getVolume(): Promise<number>;
  getDuration(): Promise<number>;
  getCurrentTime(): Promise<number>;
  on(event: string, callback: (data?: any) => void): void;
  off(event: string, callback?: (data?: any) => void): void;
}

export {};
