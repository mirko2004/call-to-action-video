import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
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
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<any>(null);
  const playerInitializedRef = useRef(false);
  const previousVolumeRef = useRef(0.7);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();
  
  // Dettagli dispositivo
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(userAgent);
  const isMobile = isIOS || isAndroid;
  const isMuted = volume === 0;

  console.log('VideoPlayer Device detected:', { isIOS, isAndroid, isMobile, userAgent });

  // URL specifico per iPhone senza controlli nativi
  const getVideoUrl = () => {
    const baseUrl = 'https://player.vimeo.com/video/1089786027';
    const params = new URLSearchParams({
      title: '0',
      byline: '0', 
      portrait: '0',
      badge: '0',
      autopause: '0',
      player_id: '0',
      app_id: '58479',
      controls: '0', // Rimuoviamo i controlli nativi anche su iOS
      autoplay: hasStarted ? '1' : '0',
      preload: 'auto',
      playsinline: '1'
    });
    
    if (isIOS) {
      params.set('muted', '0');
      params.set('quality', 'auto');
      params.set('background', '0');
    }
    
    return `${baseUrl}?${params.toString()}`;
  };

  // Funzione fullscreen specifica per iPhone
  const enterIPhoneFullscreen = useCallback(async () => {
    console.log('VideoPlayer: Attempting iPhone fullscreen...');
    
    const iframe = iframeRef.current;
    
    if (isIOS && iframe) {
      try {
        // Prova webkit fullscreen specifico per video su iOS
        if ((iframe as any).webkitEnterFullscreen) {
          console.log('VideoPlayer: Using webkit iframe fullscreen for iOS');
          (iframe as any).webkitEnterFullscreen();
          return true;
        }
        
        // Prova fullscreen standard
        if (iframe.requestFullscreen) {
          console.log('VideoPlayer: Using standard iframe fullscreen');
          await iframe.requestFullscreen();
          return true;
        }
      } catch (error) {
        console.error('VideoPlayer: iPhone fullscreen failed:', error);
      }
    }
    
    return false;
  }, [isIOS]);

  // Gestione eventi fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement || 
        (document as any).webkitFullscreenElement || 
        (document as any).webkitCurrentFullScreenElement
      );
      
      console.log('VideoPlayer: Fullscreen change detected:', isCurrentlyFullscreen);
      setIsFullscreen(isCurrentlyFullscreen);
      setShowControls(true);
    };

    const events = [
      'fullscreenchange',
      'webkitfullscreenchange', 
      'webkitbeginfullscreen',
      'webkitendfullscreen'
    ];

    events.forEach(event => {
      document.addEventListener(event, handleFullscreenChange);
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFullscreenChange);
      });
    };
  }, []);

  // Carica script Vimeo
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

  // Inizializza player Vimeo
  useEffect(() => {
    if (!hasStarted || playerInitializedRef.current) return;
    
    const timer = setTimeout(() => {
      const iframe = iframeRef.current;
      if (iframe && window.Vimeo) {
        try {
          console.log('VideoPlayer: Initializing Vimeo player...');
          playerRef.current = new window.Vimeo.Player(iframe);
          playerInitializedRef.current = true;
          
          playerRef.current.getDuration().then((duration: number) => {
            setVideoDuration(Math.floor(duration));
            console.log('VideoPlayer: Video duration:', duration);
          }).catch((error: any) => {
            console.log("VideoPlayer: Error getting duration:", error);
          });
          
          playerRef.current.setVolume(volume).catch((error: any) => {
            console.log("VideoPlayer: Error setting volume:", error);
          });
          
          const handlePlay = () => {
            console.log('VideoPlayer: Video playing');
            setIsPlaying(true);
            setShowControls(true);
            if (!isMobile) {
              startControlsTimer();
            }
          };
          
          const handlePause = () => {
            console.log('VideoPlayer: Video paused');
            setIsPlaying(false);
            setShowControls(true);
            clearControlsTimer();
          };
          
          const handleEnd = () => {
            console.log('VideoPlayer: Video ended');
            setVideoEnded(true);
            setShowButton(true);
            setIsPlaying(false);
          };
          
          const handleTimeUpdate = (data: any) => {
            setCurrentTime(Math.floor(data.seconds));
          };
          
          playerRef.current.on('play', handlePlay);
          playerRef.current.on('pause', handlePause);
          playerRef.current.on('ended', handleEnd);
          playerRef.current.on('timeupdate', handleTimeUpdate);
          
          // Per iPhone, prova ad avviare automaticamente dopo l'inizializzazione
          if (isIOS) {
            console.log('VideoPlayer: Auto-starting video for iOS');
            setTimeout(() => {
              playerRef.current?.play().catch((error: any) => {
                console.log("VideoPlayer: iOS auto-play prevented:", error);
              });
            }, 1000);
          }
        } catch (error) {
          console.log("VideoPlayer: Error initializing Vimeo player:", error);
        }
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [hasStarted, volume, isMobile, isIOS]);

  const startControlsTimer = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    
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

  // Touch controls per mobile
  useEffect(() => {
    const handleTouch = () => {
      if (hasStarted) {
        setShowControls(true);
        if (isPlaying) {
          startControlsTimer();
        }
      }
    };

    const handleMouseMove = () => {
      if (hasStarted && !isMobile) {
        setShowControls(true);
        if (isPlaying) {
          startControlsTimer();
        }
      }
    };
    
    if (isMobile) {
      window.addEventListener('touchstart', handleTouch, { passive: true });
      window.addEventListener('touchend', handleTouch, { passive: true });
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
    console.log('VideoPlayer: Play button clicked');
    setHasStarted(true);
    setIsPlaying(true);
    setVideoEnded(false);
    
    // Su iPhone, prova immediatamente a far partire il video
    if (isIOS && playerRef.current) {
      try {
        await playerRef.current.play();
        console.log('VideoPlayer: iPhone play successful');
      } catch (error) {
        console.log("VideoPlayer: iPhone play error:", error);
      }
    }
  };

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const handleContinue = () => {
    navigate("/secondo-video");
  };

  const togglePlayPause = async () => {
    if (playerRef.current) {
      try {
        if (isPlaying) {
          await playerRef.current.pause();
        } else {
          await playerRef.current.play();
        }
      } catch (error) {
        console.log("VideoPlayer: Play/pause error:", error);
      }
    }
  };

  const toggleMute = async () => {
    if (playerRef.current) {
      try {
        if (volume > 0) {
          previousVolumeRef.current = volume;
          await playerRef.current.setVolume(0);
          setVolume(0);
        } else {
          await playerRef.current.setVolume(previousVolumeRef.current);
          setVolume(previousVolumeRef.current);
        }
      } catch (error) {
        console.log("VideoPlayer: Mute error:", error);
      }
    }
  };

  const toggleFullscreen = async () => {
    console.log('VideoPlayer: Fullscreen toggle clicked');
    if (isFullscreen) {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      } catch (error) {
        console.error("VideoPlayer: Exit fullscreen error:", error);
      }
    } else {
      // Su iPhone usa la funzione specifica
      if (isIOS) {
        await enterIPhoneFullscreen();
      } else {
        // Per altri dispositivi usa il metodo standard
        const container = containerRef.current;
        if (container) {
          try {
            if (container.requestFullscreen) {
              await container.requestFullscreen();
            } else if ((container as any).webkitRequestFullscreen) {
              await (container as any).webkitRequestFullscreen();
            }
          } catch (error) {
            console.error("VideoPlayer: Fullscreen error:", error);
          }
        }
      }
    }
  };

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      try {
        await playerRef.current.setVolume(newVolume);
      } catch (error) {
        console.log("VideoPlayer: Volume change error:", error);
      }
    }
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
          {/* iPhone Instructions */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <p className="text-yellow-400/80 text-xs leading-relaxed">
              📱 Se hai iPhone e non riesci a mettere lo schermo intero,<br />
              metti il telefono orizzontale (con la rotazione schermo attiva) per vederlo più chiaramente
            </p>
          </div>

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
                  className="flex flex-col items-center justify-center cursor-pointer gap-4 transition-all duration-300 hover:scale-105" 
                  onClick={handlePlayClick}
                >
                  <div className="bg-yellow-500 hover:bg-yellow-600 rounded-full p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-pulse">
                    <Play className="w-12 h-12 text-black ml-1" fill="currentColor" />
                  </div>
                  <p className="text-lg font-medium animate-fade-in" style={{ animationDelay: '1s' }}>
                    {isIOS ? 'Tocca per iniziare' : 'Clicca per iniziare il video'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full relative">
                <div className="absolute inset-0">
                  <iframe
                    ref={iframeRef}
                    src={getVideoUrl()}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                    title="Video Esclusivo"
                    allowFullScreen
                  />
                </div>
                
                {/* Barra progresso */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-700 z-20">
                  <div 
                    className="h-full bg-yellow-500 transition-all duration-200"
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
                
                {/* Controlli personalizzati per tutti i dispositivi */}
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
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-4 py-3 text-sm lg:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-xs mx-auto animate-scale-in leading-tight"
                style={{ animationDelay: '0.4s' }}
              >
                🔥 Sono Pronto - Vai al<br className="sm:hidden" /> Contenuto Esclusivo
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
