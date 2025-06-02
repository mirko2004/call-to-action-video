import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Timer, Maximize, Minimize } from "lucide-react";
import FinalPopup from "./FinalPopup";

interface SecondVideoPlayerProps {
  onVideoEnd: () => void;
}

const SecondVideoPlayer = ({ onVideoEnd }: SecondVideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [videoDuration] = useState(607); // 10:07 in seconds
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const previousVolumeRef = useRef(0.7);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const videoKey = useRef(Date.now()); // Key to force iframe reload

  const isMuted = volume === 0;

  // Updated MEGA embed URL with hidden controls
  const getMegaUrl = (autoplay = false) => {
    const base = "https://mega.nz/embed/3I8gGCoS#jH9kOyLuxwjsPw-nDq1xlQeV4HxrW3wXuklq0aw9BGE";
    return `${base}?nectrl=1${autoplay ? "&autoplay=1" : ""}`;
  };

  // Listener for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle timer and video sync
  useEffect(() => {
    if (isPlaying && hasStarted) {
      lastUpdateTime.current = Date.now();
      
      progressInterval.current = setInterval(() => {
        setCurrentTime(prev => {
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - lastUpdateTime.current) / 1000);
          lastUpdateTime.current = now;
          
          const newTime = prev + elapsedSeconds;
          
          if (newTime >= videoDuration) {
            clearInterval(progressInterval.current!);
            setIsPlaying(false);
            setShowTimer(false);
            setShowFinalPopup(true);
            onVideoEnd();
            return videoDuration;
          }
          
          return newTime;
        });
      }, 1000);
    } else if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, hasStarted, videoDuration, onVideoEnd]);

  // Handle mouse movement for controls
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
    
    // Generate new key to force iframe reload
    videoKey.current = Date.now();
    
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      lastUpdateTime.current = Date.now();
    }
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
          ) : (
            <div className="w-full h-full relative overflow-hidden">
              {/* Iframe with key to force reload */}
              <div className="w-full h-full overflow-hidden">
                <iframe
                  key={videoKey.current}
                  src={getMegaUrl(true)}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  style={{ 
                    border: 'none',
                    outline: 'none',
                    // Shift the iframe to hide MEGA controls
                    transform: 'translateY(-30px)',
                    height: 'calc(100% + 60px)'
                  }}
                />
              </div>
              
              {/* Overlay for controls */}
              <div 
                className="absolute inset-0 z-10 bg-transparent cursor-pointer"
                onClick={() => setShowControls(!showControls)}
                onContextMenu={(e) => e.preventDefault()}
              />
              
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

        {/* Timer */}
        {hasStarted && showTimer && currentTime < videoDuration && (
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
