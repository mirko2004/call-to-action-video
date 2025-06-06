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

  // Dettagli dispositivo
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(userAgent);
  const isMobile = isIOS || isAndroid;

  console.log('SecondVideo Device detected:', { isIOS, isAndroid, isMobile, userAgent });

  // Funzione fullscreen specifica per iPhone
  const enterIPhoneFullscreen = useCallback(async () => {
    console.log('SecondVideo: Attempting iPhone fullscreen...');
    
    const iframe = iframeRef.current;
    
    if (isIOS && iframe) {
      try {
        // Prova webkit fullscreen specifico per video su iOS
        if ((iframe as any).webkitEnterFullscreen) {
          console.log('SecondVideo: Using webkit iframe fullscreen for iOS');
          (iframe as any).webkitEnterFullscreen();
          return true;
        }
        
        // Prova fullscreen standard
        if (iframe.requestFullscreen) {
          console.log('SecondVideo: Using standard iframe fullscreen');
          await iframe.requestFullscreen();
          return true;
        }
      } catch (error) {
        console.error('SecondVideo: iPhone fullscreen failed:', error);
      }
    }
    
    return false;
  }, [isIOS]);

  // Costruzione URL Vimeo senza controlli nativi anche per iPhone
  useEffect(() => {
    const getVideoUrl = () => {
      const baseUrl = 'https://player.vimeo.com/video/1090015233';
      const params = new URLSearchParams({
        title: '0',
        byline: '0', 
        portrait: '0',
        badge: '0',
        autopause: '0',
        player_id: '0',
        app_id: '58479',
        controls: '0', // Rimuoviamo i controlli nativi anche su iOS
        autoplay: '0',
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
    
    setVimeoUrl(getVideoUrl());
    console.log('SecondVideo: Video URL set for device type');
  }, [isIOS]);

  // Inizializza Vimeo Player
  useEffect(() => {
    if (!vimeoUrl) return;

    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.onload = () => {
      if (iframeRef.current && window.Vimeo) {
        console.log('SecondVideo: Initializing Vimeo player...');
        const vimeoPlayer = new window.Vimeo.Player(iframeRef.current);
        setPlayer(vimeoPlayer);

        vimeoPlayer.getDuration().then((duration: number) => {
          setVideoDuration(Math.floor(duration));
          console.log('SecondVideo: Video duration:', duration);
        });

        vimeoPlayer.on('play', () => {
          console.log('SecondVideo: Video playing');
          setIsPlaying(true);
          setHasStarted(true);
        });

        vimeoPlayer.on('pause', () => {
          console.log('SecondVideo: Video paused');
          setIsPlaying(false);
        });

        vimeoPlayer.on('ended', () => {
          console.log('SecondVideo: Video ended');
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
      const isCurrentlyFullscreen = !!(document.fullscreenElement || 
        (document as any).webkitFullscreenElement || 
        (document as any).webkitCurrentFullScreenElement);
      
      console.log('SecondVideo: Fullscreen change detected:', isCurrentlyFullscreen);
      setIsFullscreen(isCurrentlyFullscreen);
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

  // Timer per nascondere i controlli
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

  // Controlli touch per mobile
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
    console.log('SecondVideo: Play button clicked');
    setHasStarted(true);
    setIsPlaying(true);
    
    if (player) {
      try {
        await player.play();
        console.log('SecondVideo: iPhone play successful');
      } catch (error) {
        console.log("SecondVideo: Play was prevented:", error);
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
        console.log("SecondVideo: Play/pause error:", error);
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
        console.log("SecondVideo: Mute error:", error);
      }
    }
  };

  const toggleFullscreen = async () => {
    console.log('SecondVideo: Fullscreen toggle clicked');
    if (isFullscreen) {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      } catch (error) {
        console.error("SecondVideo: Exit fullscreen error:", error);
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
            console.error("SecondVideo: Fullscreen error:", error);
          }
        }
      }
    }
  };

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (player) {
      try {
        await player.setVolume(newVolume);
      } catch (error) {
        console.log("SecondVideo: Volume change error:", error);
      }
    }
  };

  const calculateProgress = () => {
    if (videoDuration === 0) return 0;
    return (currentTime / videoDuration) * 100;
  };

  const isMuted = volume === 0;

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
          
          {/* Barra di progresso per tutti i dispositivi */}
          {hasStarted && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-700 z-20">
              <div 
                className="h-full bg-yellow-500 transition-all duration-200"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          )}
          
          {/* Controlli personalizzati per tutti i dispositivi */}
          {hasStarted && (
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

        {/* Messaggio contenuto finale */}
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
