import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Timer, Maximize, Minimize } from "lucide-react";
import FinalPopup from "./FinalPopup";

interface SecondVideoPlayerProps {
  onVideoEnd: () => void;
}

const SecondVideoPlayer = ({ onVideoEnd }: SecondVideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<any>(null);
  const playerInitializedRef = useRef(false);
  const previousVolumeRef = useRef(0.7);
  const containerRef = useRef<HTMLDivElement>(null);

  const isMuted = volume === 0;

  // Listener per fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Carica script Vimeo API
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Inizializzazione player
  useEffect(() => {
    const initializePlayer = () => {
      const iframe = document.getElementById('vimeo-player-second') as HTMLIFrameElement;
      if (iframe && window.Vimeo && !playerInitializedRef.current) {
        try {
          // @ts-ignore
          playerRef.current = new window.Vimeo.Player(iframe);
          playerInitializedRef.current = true;
          
          playerRef.current.getDuration().then((duration: number) => {
            setVideoDuration(Math.floor(duration));
          }).catch((error: any) => {
            console.log("Error getting duration:", error);
          });
          
          playerRef.current.setVolume(volume).catch((error: any) => {
            console.log("Error setting volume:", error);
          });
          
          const handlePlay = () => {
            setIsPlaying(true);
            setShowControls(true);
            startControlsTimer();
          };
          
          const handlePause = () => {
            setIsPlaying(false);
            setShowControls(true);
            clearControlsTimer();
          };
          
          const handleEnd = () => {
            handleVideoEnd();
          };
          
          const handleTimeUpdate = (data: any) => {
            setCurrentTime(Math.floor(data.seconds));
          };
          
          const handleLoaded = () => {
            setIsPlayerReady(true);
          };
          
          playerRef.current.on('play', handlePlay);
          playerRef.current.on('pause', handlePause);
          playerRef.current.on('ended', handleEnd);
          playerRef.current.on('timeupdate', handleTimeUpdate);
          playerRef.current.on('loaded', handleLoaded);
        } catch (error) {
          console.log("Error initializing Vimeo player:", error);
        }
      }
    };

    initializePlayer();
    const interval = setInterval(initializePlayer, 200);
    return () => clearInterval(interval);
  }, [volume]);

  useEffect(() => {
    if (!playerRef.current || !playerInitializedRef.current) return;
    playerRef.current.setVolume(volume).catch((error: any) => {
      console.log("Error setting volume:", error);
    });
  }, [volume]);

  const startControlsTimer = useCallback(() => {
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  const clearControlsTimer = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
      controlsTimeout.current = null;
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = () => {
      if (hasStarted) {
        setShowControls(true);
        if (isPlaying) startControlsTimer();
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPlaying, hasStarted, startControlsTimer]);

  const handlePlayClick = () => {
    setHasStarted(true);
    setShowTimer(true);
    
    if (playerRef.current && isPlayerReady) {
      playerRef.current.play().catch((error: any) => {
        console.log("Error playing:", error);
      });
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setShowTimer(false);
    setShowFinalPopup(true);
    clearControlsTimer();
    onVideoEnd();
  };

  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause().catch((error: any) => {
          console.log("Error pausing:", error);
        });
      } else {
        playerRef.current.play().catch((error: any) => {
          console.log("Error playing:", error);
        });
      }
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
          className={`aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-lg relative animate-scale-in group ${isFullscreen ? 'w-screen h-screen fixed inset-0 z-50 rounded-none' : ''}`}
          style={{ animationDelay: '0.4s' }}
        >
          {!hasStarted ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer gap-4 transition-all duration-300 hover:scale-105" 
                onClick={handlePlayClick}
              >
                <div className="bg-yellow-400 hover:bg-yellow-500 rounded-full p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-pulse">
                  <Play className="w-12 h-12 text-black ml-1" fill="currentColor" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">Video Esclusivo Finale</p>
                  <p className="text-sm text-white/80">
                    Clicca play per accedere alle selezioni
                  </p>
                </div>
                
                {!isPlayerReady && (
                  <div className="absolute bottom-6 text-sm text-white/70">
                    Caricamento in corso...
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-full relative">
              <div className="absolute inset-0">
                <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                  <iframe
                    id="vimeo-player-second"
                    src={`https://player.vimeo.com/video/1090015233?autoplay=1&background=0&loop=0&autopause=0&controls=0&title=0&byline=0&portrait=0&badge=0&preload=auto`}
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%',
                      borderRadius: isFullscreen ? '0' : '0.75rem',
                      overflow: 'hidden'
                    }}
                    title="Video Esclusivo Finale"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
              
              <div 
                className="absolute inset-0 z-10"
                onContextMenu={(e) => e.preventDefault()}
              />
              
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-700 z-20">
                <div 
                  className="h-full bg-yellow-500 transition-all duration-200"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
              
              {(showControls || !isPlaying) && (
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

        {hasStarted && !showFinalPopup && videoDuration > 0 && currentTime < videoDuration && (
          <div className="text-center bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4 animate-pulse">
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
