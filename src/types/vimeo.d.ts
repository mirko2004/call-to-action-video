
declare global {
  interface Window {
    Vimeo: {
      Player: new (element: HTMLElement | string, options?: any) => {
        play(): Promise<void>;
        pause(): Promise<void>;
        getDuration(): Promise<number>;
        setVolume(volume: number): Promise<void>;
        on(event: string, callback: Function): void;
      };
    };
  }
}

export {};
