
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Timer, Clock, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const VideoEndPopup = ({ onContinue }: { onContinue: () => void }) => {
  const navigate = useNavigate();
  
  const handleContinue = () => {
    navigate("/secondo-video");
    onContinue();
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-xl max-w-md w-full p-8 text-center animate-scale-in">
        <h2 className="text-2xl font-bold mb-4 text-yellow-400 animate-fade-in" style={{ animationDelay: '0.2s' }}>Perfetto! 🎯</h2>
        <p className="mb-6 text-gray-300 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          Mettiti le cuffie e assicurati di avere almeno 30 minuti liberi da dedicare completamente al prossimo contenuto, senza distrazioni.
        </p>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <p className="text-yellow-400 font-semibold text-sm mb-2">
            🎧 MASSIMA ATTENZIONE RICHIESTA
          </p>
          <p className="text-white/90 text-sm">
            • Metti le cuffie<br />
            • Assicurati di avere 30 minuti liberi<br />
            • Elimina tutte le distrazioni<br />
            • Preparati a scoprire qualcosa di completamente nuovo
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleContinue}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-scale-in"
            style={{ animationDelay: '0.6s' }}
          >
            🔥 Sono Pronto - Vai al Contenuto Esclusivo
          </Button>
        </div>
      </div>
    </div>
  );
};

const VideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<any>(null);
  const playerInitializedRef = useRef(false);
  const previousVolumeRef = useRef(0.7);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Fix for TypeScript error
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;

  const isMuted = volume === 0;

  // Enhanced fullscreen function with iOS support
  const enterFullscreenWithLandscape = useCallback(async () => {
    const container = containerRef.current;
    const iframe = document.getElementById('vimeo-player');
    
    if (!container && !iframe) return;

    try {
      // Try iframe fullscreen first (works better on iOS)
      if (iframe && isIOS) {
        if ((iframe as any).webkitEnterFullscreen) {
          await (iframe as any).webkitEnterFullscreen();
        } else if ((iframe as any).requestFullscreen) {
          await (iframe as any).requestFullscreen();
        }
      } else if (container) {
        // Container fullscreen for other devices
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen();
        } else if ((container as any).webkitEnterFullscreen) {
          await (container as any).webkitEnterFullscreen();
        }
      }

      // Force landscape orientation on mobile devices
      if (isMobile && (screen as any).orientation && (screen as any).orientation.lock) {
        try {
          await (screen as any).orientation.lock('landscape-primary');
        } catch (error) {
          console.log("Orientation lock not supported:", error);
        }
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  }, [isMobile, isIOS]);

  // Enhanced fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(document.fullscreenElement || 
        (document as any).webkitFullscreenElement || 
        (document as any).webkitCurrentFullScreenElement);
      setIsFullscreen(isCurrentlyFullscreen);
      setShowControls(true);
      
      // Unlock orientation when exiting fullscreen
      if (!isCurrentlyFullscreen && isMobile && (screen as any).orientation && (screen as any).orientation.unlock) {
        try {
          (screen as any).orientation.unlock();
        } catch (error) {
          console.log("Orientation unlock not supported:", error);
        }
      }
    };

    // Listen to all fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitbeginfullscreen', handleFullscreenChange);
    document.addEventListener('webkitendfullscreen', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitbeginfullscreen', handleFullscreenChange);
      document.removeEventListener('webkitendfullscreen', handleFullscreenChange);
    };
  }, [isMobile]);

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

  useEffect(() => {
    if (!hasStarted || playerInitializedRef.current) return;
    
    const timer = setTimeout(() => {
      const iframe = document.getElementById('vimeo-player');
      if (iframe && window.Vimeo) {
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
            if (!isMobile) {
              startControlsTimer();
            }
          };
          
          const handlePause = () => {
            setIsPlaying(false);
            setShowControls(true);
            clearControlsTimer();
          };
          
          const handleEnd = () => {
            setVideoEnded(true);
            setShowButton(true);
            setIsPlaying(false);
          };
          
          const handleTimeUpdate = (data: any) => {
            setCurrentTime(Math.floor(data.seconds));
          };

          const handleFullscreenChange = (data: any) => {
            setIsFullscreen(data.fullscreen);
          };
          
          playerRef.current.on('play', handlePlay);
          playerRef.current.on('pause', handlePause);
          playerRef.current.on('ended', handleEnd);
          playerRef.current.on('timeupdate', handleTimeUpdate);
          playerRef.current.on('fullscreenchange', handleFullscreenChange);
        } catch (error) {
          console.log("Error initializing Vimeo player:", error);
        }
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [hasStarted, volume, isMobile]);

  useEffect(() => {
    if (!playerRef.current || !playerInitializedRef.current) return;
    
    playerRef.current.setVolume(volume).catch((error: any) => {
      console.log("Error setting volume:", error);
    });
  }, [volume]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
    if (playerRef.current) {
      isPlaying ? playerRef.current.pause() : playerRef.current.play();
    }
    // Mostra i controlli quando si fa play
    setShowControls(true);
    clearControlsTimer();
    controlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, [isPlaying, clearControlsTimer]);

  const startControlsTimer = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    // Nascondi controlli dopo 3 secondi
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying && !isFullscreen) {
    }, 3000);
  }, []);

  const clearControlsTimer = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
      controlsTimeout.current = null;
    }
  }, []);

  // Gestione del click sul video per mostrare i controlli
  useEffect(() => {
    const handleVideoClick = () => {
      setShowControls(true);
      clearControlsTimer();
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const videoContainer = document.querySelector('.relative.w-full.max-w-2xl.mx-auto');
    if (videoContainer) {
      videoContainer.addEventListener('click', handleVideoClick);
    }

    return () => {
      if (videoContainer) {
        videoContainer.removeEventListener('click', handleVideoClick);
      }
    };
  }, [clearControlsTimer]);

// Improved mobile touch controls
useEffect(() => {
const handleMouseMove = () => {
  if (hasStarted) {
    setShowControls(true);
    if (isPlaying && !isMobile) {
      startControlsTimer();
        }
      } catch (error) {
        console.error("Exit fullscreen error:", error);
      }
    } else {
      await enterFullscreenWithLandscape();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-6 lg:mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            Contenuto Video Esclusivo
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Guarda attentamente per sbloccare l'accesso al video completo
          </p>
        </header>

        <div className="relative w-full max-w-2xl mx-auto space-y-6">
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <p className="text-white/70 text-sm">
              💡 Dopo aver visto tutto il video apparirà il pulsante per continuare
            </p>
          </div>

          <div 
            ref={containerRef}
            className={`bg-slate-900 rounded-xl overflow-hidden shadow-lg relative group animate-scale-in ${isFullscreen ? 'w-screen h-screen fixed inset-0 z-50 rounded-none' : 'aspect-video'}`}
            style={{ animationDelay: '0.8s' }}
          >
            {!hasStarted ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer gap-4 transition-all duration-300 hover:scale-105" 
                  onClick={handlePlayClick}
                >
                  <div className="bg-yellow-500 hover:bg-yellow-600 rounded-full p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-pulse">
                    <Play className="w-12 h-12 text-black ml-1" fill="currentColor" />
                  </div>
                  <p className="text-lg font-medium animate-fade-in" style={{ animationDelay: '1s' }}>Clicca per iniziare il video</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full relative">
                <div className="absolute inset-0">
                  <div style={{ padding: isFullscreen ? '0' : '56.25% 0 0 0', position: 'relative', height: isFullscreen ? '100%' : 'auto' }}>
                    <iframe
                      id="vimeo-player"
                      src={`https://player.vimeo.com/video/1089786027?autoplay=1&background=0&loop=0&autopause=0&controls=0&title=0&byline=0&portrait=0&badge=0&playsinline=1`}
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%',
                        borderRadius: isFullscreen ? '0' : '0.75rem',
                        overflow: 'hidden',
                        objectFit: 'cover'
                      }}
                      title="Video Esclusivo"
                      allowFullScreen
                      playsInline
                      webkitAllowFullScreen
                    ></iframe>
                  </div>
                </div>
                
                {/* Overlay solo per i controlli del video - limitato al video container */}
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
                
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-700 z-20">
                  <div 
                    className="h-full bg-yellow-500 transition-all duration-200"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
                
                {/* Controlli per mobile in fullscreen - solo play/pause, volume e exit */}
                {isFullscreen && isMobile ? (
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
                        className="text-white hover:text-yellow-400 transition-colors"
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
                            onClick={(e) => e.stopPropagation()}
                            className="w-24 accent-yellow-500"
                          />
                        </>
                      )}
                    </div>

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
                )}
              </div>
            )}
          </div>

          {hasStarted && !videoEnded && videoDuration > 0 && (
            <div className="text-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4 animate-fade-in">
              <p className="text-white/90 text-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Continua a guardare fino alla fine per sbloccare il contenuto
              </p>
            </div>
          )}

          {showButton && (
            <div className="text-center bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 animate-fade-in space-y-4">
              <p className="text-white/90 text-sm mb-4 leading-relaxed animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
                🎯 <span className="font-semibold text-yellow-400">Perfetto!</span><br />
                <span className="text-white/70">Ora ti mostro perché questo percorso è diverso da tutti gli altri "guru" che vedi online</span>
              </p>
              
              <Button
                onClick={handleButtonClick}
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-6 py-3 text-base lg:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-xs mx-auto animate-scale-in"
                style={{ animationDelay: '0.4s' }}
              >
                🔥 Accedi al Contenuto Esclusivo
              </Button>
            </div>
          )}
        </div>
      </div>

      {showPopup && (
        <VideoEndPopup onContinue={handleContinue} />
      )}
    </div>
  );
};

export default VideoPlayer;
