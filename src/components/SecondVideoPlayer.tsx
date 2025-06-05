
import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import FinalPopup from "./FinalPopup";

interface SecondVideoPlayerProps {
  onVideoEnd: () => void;
}

const SecondVideoPlayer = ({ onVideoEnd }: SecondVideoPlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [videoDuration, setVideoDuration] = useState(30);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [player, setPlayer] = useState<any>(null);
  const [vimeoUrl, setVimeoUrl] = useState("");
  
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const previousVolumeRef = useRef(0.7);

  // Fix for TypeScript error
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;

  // Force landscape orientation when entering fullscreen on mobile
  const enterFullscreenWithLandscape = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (container.requestFullscreen) {
        await container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        await (container as any).webkitRequestFullscreen();
      }

      // Force landscape orientation on mobile devices
      if (isMobile && (screen as any).orientation && (screen as any).orientation.lock) {
        try {
          await (screen as any).orientation.lock('landscape');
        } catch (error) {
          console.log("Orientation lock not supported:", error);
        }
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  }, [isMobile]);

  // Rilevamento iOS e costruzione URL Vimeo
  useEffect(() => {
    const url = isIOS ? 
      'https://player.vimeo.com/video/1090015233?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479&controls=1&autoplay=0&preload=auto' :
      'https://player.vimeo.com/video/1090015233?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479&controls=0&autoplay=0&preload=auto';
    
    setVimeoUrl(url);
  }, []);

  // Inizializza Vimeo Player
  useEffect(() => {
    if (!vimeoUrl) return;

    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.onload = () => {
      if (iframeRef.current && window.Vimeo) {
        const vimeoPlayer = new window.Vimeo.Player(iframeRef.current);
        setPlayer(vimeoPlayer);

        vimeoPlayer.getDuration().then((duration: number) => {
          setVideoDuration(Math.floor(duration));
        });

        vimeoPlayer.on('play', () => {
          setIsPlaying(true);
          setHasStarted(true);
        });

        vimeoPlayer.on('pause', () => {
          setIsPlaying(false);
        });

        vimeoPlayer.on('ended', () => {
          setIsPlaying(false);
          setShowFinalPopup(true);
          onVideoEnd();
        });

        vimeoPlayer.on('timeupdate', (data: any) => {
          setCurrentTime(Math.floor(data.seconds));
          setForceUpdate(count => count + 1);
        });

        vimeoPlayer.on('volumechange', (data: any) => {
          setVolume(data.volume);
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [vimeoUrl, onVideoEnd]);

  // Gestione fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      
      // Unlock orientation when exiting fullscreen
      if (!isCurrentlyFullscreen && isMobile && (screen as any).orientation && (screen as any).orientation.unlock) {
        try {
          (screen as any).orientation.unlock();
        } catch (error) {
          console.log("Orientation unlock not supported:", error);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [isMobile]);

  // Timer per nascondere i controlli
  const startControlsTimer = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    
    // Nascondi controlli dopo 3 secondi
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying && !isFullscreen) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying, isFullscreen]);

  const clearControlsTimer = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
      controlsTimeout.current = null;
    }
  }, []);

  // Improved mobile touch controls
  useEffect(() => {
    const handleMouseMove = () => {
      if (hasStarted) {
        setShowControls(true);
        if (isPlaying && !isMobile) {
          startControlsTimer();
        }
      }
    };

    const handleTouch = (e: TouchEvent) => {
      if (hasStarted) {
        e.preventDefault();
        setShowControls(true);
        if (isPlaying) {
          startControlsTimer();
        }
      }
    };
    
    if (isMobile) {
      window.addEventListener('touchstart', handleTouch, { passive: false });
      window.addEventListener('touchend', handleTouch, { passive: false });
    } else {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (isMobile) {
        window.removeEventListener('touchstart', handleTouch);
        window.removeEventListener('touchend', handleTouch);
      } else {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isPlaying, hasStarted, startControlsTimer, isMobile]);

  const handlePlayClick = async () => {
    if (player) {
      try {
        await player.play();
        setIsPlaying(true);
        setHasStarted(true);
      } catch (error) {
        console.log("Play was prevented:", error);
      }
    }
  };

  const togglePlayPause = async () => {
    if (player) {
      try {
        if (isPlaying) {
          await player.pause();
          setIsPlaying(false);
        } else {
          await player.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.log("Play/pause error:", error);
      }
    }
  };

  const toggleMute = async () => {
    if (player) {
      try {
        if (volume > 0) {
          previousVolumeRef.current = volume;
          await player.setVolume(0);
          setVolume(0);
        } else {
          await player.setVolume(previousVolumeRef.current);
          setVolume(previousVolumeRef.current);
        }
      } catch (error) {
        console.log("Mute error:", error);
      }
    }
  };

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      } catch (error) {
        console.error("Exit fullscreen error:", error);
      }
    } else {
      await enterFullscreenWithLandscape();
    }
  };

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (player) {
      try {
        await player.setVolume(newVolume);
      } catch (error) {
        console.log("Volume change error:", error);
      }
    }
  };

  const calculateProgress = () => {
    if (videoDuration === 0) return 0;
    return (currentTime / videoDuration) * 100;
  };

  // Stato derivato per il muto
  const isMuted = volume === 0;

  return (
    <>
      <div className="relative w-full max-w-2xl mx-auto space-y-6">
        {/* Testo sopra il video */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <p className="text-white/70 text-sm">
            🎯 Questo è il contenuto finale - dopo aver guardato tutto il video si aprirà l'accesso alle selezioni
          </p>
        </div>

        <div 
          ref={containerRef}
          className={`bg-slate-900 rounded-xl overflow-hidden shadow-lg relative animate-scale-in ${isFullscreen ? 'w-screen h-screen fixed inset-0 z-50 rounded-none flex items-center justify-center' : 'aspect-video'}`}
          style={{ animationDelay: '0.4s' }}
        >
          {vimeoUrl && (
            <iframe
              ref={iframeRef}
              src={vimeoUrl}
              className={`w-full h-full ${isFullscreen ? '' : 'aspect-video'}`}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
              title="2 secondo video sito"
              allowFullScreen
            />
          )}
          
          {/* Custom Play Button Overlay */}
          {!hasStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer z-30" onClick={handlePlayClick}>
              <div className="bg-yellow-400 hover:bg-yellow-500 rounded-full p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Play className="w-12 h-12 text-black ml-1" fill="currentColor" />
              </div>
            </div>
          )}

          {/* Overlay per controlli touch */}
          {hasStarted && (
            <div 
              className="absolute inset-0 z-10"
              onContextMenu={(e) => e.preventDefault()}
              onClick={() => {
                setShowControls(true);
                if (isPlaying) {
                  startControlsTimer();
                }
              }}
              onTouchStart={() => {
                setShowControls(true);
                if (isPlaying) {
                  startControlsTimer();
                }
              }}
            />
          )}
          
          {/* Barra di progresso */}
          {hasStarted && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-700 z-20">
              <div 
                className="h-full bg-yellow-500 transition-all duration-200"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          )}
          
          {/* Controlli per mobile in fullscreen - solo play/pause, volume e exit */}
          {hasStarted && isFullscreen && isMobile ? (
            <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20 flex items-center justify-between transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlayPause();
                  }}
                  className="text-white hover:text-yellow-400 transition-colors p-2"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" fill="currentColor" />
                  )}
                </button>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="text-white hover:text-yellow-400 transition-colors p-2"
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
                  onClick={(e) => e.stopPropagation()}
                  className="w-16 accent-yellow-500"
                />
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="text-white hover:text-yellow-400 transition-colors p-2"
              >
                <Minimize className="w-5 h-5" />
              </button>
            </div>
          ) : (
            /* Controlli normali per desktop e mobile non-fullscreen */
            hasStarted && (
              <div 
                className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20 flex items-center justify-between transition-opacity duration-300 ${
                  showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlayPause();
                    }}
                    className="text-white hover:text-yellow-400 transition-colors p-2"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" fill="currentColor" />
                    )}
                  </button>
                  
                  {/* Volume solo per desktop o se non in fullscreen su mobile */}
                  {(!isMobile || !isFullscreen) && (
                    <>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute();
                        }}
                        className="text-white hover:text-yellow-400 transition-colors p-2"
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
                        onClick={(e) => e.stopPropagation()}
                        className="w-24 accent-yellow-500"
                      />
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                    className="text-white hover:text-yellow-400 transition-colors p-2"
                  >
                    {isFullscreen ? (
                      <Minimize className="w-5 h-5" />
                    ) : (
                      <Maximize className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* Timer countdown - solo messaggio senza tempo rimanente */}
        {hasStarted && currentTime < videoDuration && (
          <div 
            className="text-center bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4 animate-pulse"
            key={`timer-${forceUpdate}`}
          >
            <p className="text-white/90 text-sm leading-relaxed">
              🚨 <span className="font-semibold text-red-400">CONTENUTO FINALE</span> - L'accesso alle selezioni si sbloccherà tra poco
            </p>
          </div>
        )}
      </div>

      {/* Final Popup */}
      {showFinalPopup && <FinalPopup />}
    </>
  );
};

export default SecondVideoPlayer;
