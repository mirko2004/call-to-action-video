import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Timer, Maximize, Minimize } from "lucide-react";
import FinalPopup from "./FinalPopup";

interface SecondVideoPlayerProps {
  onVideoEnd: () => void;
}

const SecondVideoPlayer = ({ onVideoEnd }: SecondVideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const previousVolumeRef = useRef(0.7);

  const isMuted = volume === 0;

  // URL del video di esempio (sostituisci con il tuo URL reale)
  const VIDEO_URL = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  // Listener per fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setVideoDuration(Math.floor(video.duration));
      setIsBuffering(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(Math.floor(video.currentTime));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setShowTimer(false);
      setShowFinalPopup(true);
      onVideoEnd();
    };

    const handleError = () => {
      console.error("Video error", video.error);
      setHasError(true);
      setIsBuffering(false);
    };

    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [onVideoEnd]);

  // Sync volume with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  // Sync play/pause with video element
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.play().catch(error => {
        console.error("Playback failed:", error);
        setHasError(true);
      });
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  // Timer for hiding controls
  const startControlsTimer = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  // Avvia il timer dei controlli dopo il primo play
  useEffect(() => {
    if (hasStarted && isPlaying) {
      setShowControls(true);
      startControlsTimer();
    }
  }, [hasStarted, isPlaying, startControlsTimer]);

  // Handle mouse movement for controls
  useEffect(() => {
    const handleMouseMove = () => {
      if (hasStarted) {
        setShowControls(true);
        if (isPlaying) {
          startControlsTimer();
        }
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPlaying, hasStarted, startControlsTimer]);

  const handlePlayClick = () => {
    setHasStarted(true);
    setShowTimer(true);
    setIsPlaying(true);
    setShowControls(true);
    setIsLoading(true);
    
    // Simula il caricamento
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    setShowControls(true);
    startControlsTimer();
  };

  const toggleMute = () => {
    if (volume > 0) {
      previousVolumeRef.current = volume;
      setVolume(0);
    } else {
      setVolume(previousVolumeRef.current);
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!isFullscreen) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.log("Fullscreen error:", error);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const calculateProgress = () => {
    if (videoDuration === 0) return 0;
    return (currentTime / videoDuration) * 100;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const reloadVideo = () => {
    setHasError(false);
    setIsLoading(true);
    setHasStarted(false);
    setIsPlaying(false);
    
    if (videoRef.current) {
      videoRef.current.load();
    }
    
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <>
      <div className="relative w-full max-w-2xl mx-auto space-y-6">
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <p className="text-white/70 text-sm">
            🎯 Questo è il contenuto finale - dopo aver guardato tutto il video si aprirà l'accesso alle selezioni
          </p>
        </div>

        <div 
          ref={containerRef}
          className={`aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-lg relative animate-scale-in ${isFullscreen ? 'w-screen h-screen fixed inset-0 z-50 rounded-none' : ''}`}
          style={{ animationDelay: '0.4s' }}
        >
          {!hasStarted ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-white/80">Caricamento in corso...</p>
                </div>
              ) : (
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer gap-4 transition-all duration-300 hover:scale-105" 
                  onClick={handlePlayClick}
                >
                  <div className="bg-yellow-400 hover:bg-yellow-500 rounded-full p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Play className="w-12 h-12 text-black ml-1" fill="currentColor" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-lg font-medium">Video Esclusivo Finale</p>
                    <p className="text-sm text-white/80">
                      Clicca play per accedere alle selezioni
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : hasError ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-4">
              <div className="bg-red-500/20 rounded-full p-4 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-center text-white mb-2">Errore nel caricamento del video</p>
              <p className="text-white/80 text-center mb-6 max-w-md">
                Si è verificato un problema durante la riproduzione del video. 
                Controlla la tua connessione internet e riprova.
              </p>
              <button
                onClick={reloadVideo}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Riprova
              </button>
            </div>
          ) : (
            <div className="w-full h-full relative">
              {/* Direct video player */}
              <video
                ref={videoRef}
                src={VIDEO_URL}
                className="w-full h-full object-contain bg-black"
                playsInline
                muted={isMuted}
                preload="auto"
              />
              
              {/* Overlay for controls */}
              <div 
                className="absolute inset-0 z-10 bg-transparent cursor-pointer"
                onClick={togglePlayPause}
              />
              
              {/* Buffering indicator */}
              {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30">
                  <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-700 z-20">
                <div 
                  className="h-full bg-yellow-500 transition-all duration-200"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
              
              {/* Custom controls */}
              {showControls && (
                <div 
                  className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20 flex items-center justify-between transition-opacity duration-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={togglePlayPause}
                      className="text-white hover:text-yellow-400 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" fill="currentColor" />
                      )}
                    </button>
                    
                    <button 
                      onClick={toggleMute}
                      className="text-white hover:text-yellow-400 transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>
                    
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-24 accent-yellow-500"
                    />
                    
                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(videoDuration)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={toggleFullscreen}
                      className="text-white hover:text-yellow-400 transition-colors"
                    >
                      {isFullscreen ? (
                        <Minimize className="w-5 h-5" />
                      ) : (
                        <Maximize className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timer countdown */}
        {hasStarted && showTimer && currentTime < videoDuration && !hasError && (
          <div 
            className="text-center bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4 animate-pulse"
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Timer className="w-5 h-5 text-red-400 animate-pulse" />
              <span className="text-red-400 font-semibold text-lg">
                {formatTime(videoDuration - currentTime)} rimanenti
              </span>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">
              🚨 <span className="font-semibold text-red-400">CONTENUTO FINALE</span> - L'accesso alle selezioni si sbloccherà tra poco
            </p>
          </div>
        )}
      </div>

      {showFinalPopup && <FinalPopup />}
    </>
  );
};

export default SecondVideoPlayer;
