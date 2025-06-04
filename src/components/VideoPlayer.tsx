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
          Hai completato il primo step! Ora ti mostro qualcosa che ti farà capire perché questo percorso è completamente diverso dal solito.
        </p>
        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleContinue}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-scale-in"
            style={{ animationDelay: '0.6s' }}
          >
            🔥 Vai al Contenuto Esclusivo
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
  const [showControls, setShowControls] = useState(true);
  const [accessTimeLeft, setAccessTimeLeft] = useState(0);
  const [accessExpired, setAccessExpired] = useState(false);
  const [userIP, setUserIP] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<any>(null);
  const playerInitializedRef = useRef(false);
  const previousVolumeRef = useRef(0.7);
  const accessTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isMuted = volume === 0;

  // Rilevamento iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // Listener per fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      setShowControls(true);
      if (isCurrentlyFullscreen && isPlaying) {
        startControlsTimer();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isPlaying]);

  // Gestione eventi mouse in fullscreen
  useEffect(() => {
    const handleFullscreenInteraction = () => {
      if (isFullscreen) {
        setShowControls(true);
        startControlsTimer();
      }
    };

    if (isFullscreen) {
      window.addEventListener('mousemove', handleFullscreenInteraction);
      window.addEventListener('click', handleFullscreenInteraction);
    }

    return () => {
      window.removeEventListener('mousemove', handleFullscreenInteraction);
      window.removeEventListener('click', handleFullscreenInteraction);
    };
  }, [isFullscreen, isPlaying]);

  // Simula il rilevamento dell'IP
  useEffect(() => {
    const simulatedIP = "192.168.1." + Math.floor(Math.random() * 255);
    setUserIP(simulatedIP);
    
    const blockedUntil = localStorage.getItem(`video_blocked_${simulatedIP}`);
    if (blockedUntil && new Date().getTime() < parseInt(blockedUntil)) {
      setAccessExpired(true);
    }
  }, []);

  // Timer per l'accesso al video
  useEffect(() => {
    if (showButton && !accessExpired && accessTimeLeft === 0) {
      setAccessTimeLeft(300);
    }
  }, [showButton, accessExpired]);

  // Timer countdown
  useEffect(() => {
    if (accessTimeLeft > 0) {
      const timer = setInterval(() => {
        setAccessTimeLeft(prev => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            const blockedUntil = new Date().getTime() + (10 * 60 * 1000);
            localStorage.setItem(`video_blocked_${userIP}`, blockedUntil.toString());
            setAccessExpired(true);
            setShowButton(false);
            return 0;
          }
          return newValue;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [accessTimeLeft, userIP]);

  const formatAccessTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
            startControlsTimer();
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
  }, [hasStarted, volume]);

  useEffect(() => {
    if (!playerRef.current || !playerInitializedRef.current) return;
    
    playerRef.current.setVolume(volume).catch((error: any) => {
      console.log("Error setting volume:", error);
    });
  }, [volume]);

  const startControlsTimer = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    
    // In fullscreen nascondi i controlli dopo 3 secondi
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
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
    setIsPlaying(true);
    setVideoEnded(false);
  };

  const handleButtonClick = () => {
    if (!accessExpired) {
      setShowPopup(true);
    }
  };

  const handleContinue = () => {
    navigate("/secondo-video");
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
    if (!container || !playerRef.current) return;

    try {
      if (isFullscreen) {
        // Uscita da fullscreen
        if (isIOS) {
          await playerRef.current.exitFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } else {
        // Entrata in fullscreen
        if (isIOS) {
          await playerRef.current.requestFullscreen();
        } else {
          await container.requestFullscreen();
        }
        // Forza la visualizzazione dei controlli
        setShowControls(true);
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
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

  if (accessExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 flex flex-col items-center justify-center animate-fade-in">
        <div className="w-full max-w-md mx-auto text-center space-y-6">
          <div className="text-red-400 text-6xl mb-6 animate-scale-in">⏰</div>
          <h2 className="text-3xl font-bold text-red-400 mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Tempo Scaduto
          </h2>
          <p className="text-white/80 leading-relaxed mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Il tempo per accedere al contenuto è scaduto. L'opportunità non è più disponibile.
          </p>
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/50 rounded-xl p-4 animate-scale-in" style={{ animationDelay: '0.6s' }}>
            <p className="text-red-400 font-semibold text-sm mb-2">
              💬 Vuoi una seconda possibilità?
            </p>
            <p className="text-white/90 text-sm">
              Contattami direttamente per vedere se posso fare un'eccezione.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-6 lg:mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            Contenuto Video Esclusivo
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Guarda attentamente per sbloccare l'accesso al video completo 🚀
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
                      src={`https://player.vimeo.com/video/1089786027?autoplay=1&background=0&loop=0&autopause=0&controls=0&title=0&byline=0&portrait=0&badge=0`}
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
                
                {/* Controlli con transizione di opacità */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20 flex items-center justify-between transition-opacity duration-300 ${
                    isFullscreen || showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
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
              </div>
            )}
          </div>

          {hasStarted && !videoEnded && videoDuration > 0 && (
            <div className="text-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4 animate-fade-in">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Timer className="w-5 h-5 text-blue-400 animate-pulse" />
                <span className="text-blue-400 font-semibold text-lg">
                  {Math.max(0, videoDuration - currentTime)} secondi rimanenti
                </span>
              </div>
              <p className="text-white/90 text-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Continua a guardare fino alla fine per sbloccare il contenuto
              </p>
            </div>
          )}

          {showButton && !accessExpired && (
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

              {accessTimeLeft > 0 && (
                <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/50 rounded-xl p-4 mt-4 animate-pulse">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-red-400 animate-pulse" />
                    <span className="text-red-400 font-bold text-xl">
                      {formatAccessTime(accessTimeLeft)}
                    </span>
                  </div>
                  <p className="text-white/90 text-sm animate-fade-in" style={{ animationDelay: '0.6s' }}>
                    ⚠️ Tempo rimasto per accedere al contenuto
                  </p>
                  <p className="text-white/70 text-xs mt-2 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                    Dopo questo tempo, l'opportunità sparirà per sempre
                  </p>
                </div>
              )}
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
