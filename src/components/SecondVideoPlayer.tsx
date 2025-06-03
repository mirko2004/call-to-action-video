import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Timer, Maximize, Minimize } from "lucide-react";
import FinalPopup from "./FinalPopup";

interface SecondVideoPlayerProps {
  onVideoEnd: () => void;
}

const SecondVideoPlayer = ({ onVideoEnd }: SecondVideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0); // Fixed: initialize to 0
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const isMuted = volume === 0;
  const previousVolumeRef = useRef(0.7);

  // Timer per nascondere i controlli
  const startControlsTimer = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        // Non nascondere i controlli per Vimeo
      }
    }, 3000);
  };

  const clearControlsTimer = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
      controlsTimeout.current = null;
    }
  };

  // Gestione movimento mouse per mostrare controlli
  useEffect(() => {
    const handleMouseMove = () => {
      if (hasStarted) {
        // Mostra sempre i controlli per Vimeo
      }
    };
    
    if (hasStarted) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isPlaying, hasStarted]);

  // Carica script Vimeo API
  useEffect(() => {
    if (!hasStarted) return;

    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [hasStarted]);

  // Inizializza player Vimeo
  useEffect(() => {
    if (!hasStarted || !containerRef.current) return;

    const initPlayer = () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://player.vimeo.com/video/1090015233?badge=0&autopause=0&player_id=0&app_id=58479';
      iframe.allow = 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media';
      iframe.title = '2 secondo video sito';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      
      containerRef.current!.innerHTML = '';
      containerRef.current!.appendChild(iframe);

      // Usa l'API globale di Vimeo
      playerRef.current = new (window as any).Vimeo.Player(iframe, {
        id: 1090015233,
        autoplay: true,
        muted: isMuted,
        volume: volume
      });

      // Gestione eventi
      playerRef.current.on('play', () => {
        setIsPlaying(true);
        startControlsTimer();
      });

      playerRef.current.on('pause', () => {
        setIsPlaying(false);
        clearControlsTimer();
      });

      playerRef.current.on('ended', () => {
        handleVideoEnd();
      });

      playerRef.current.on('timeupdate', (data: any) => {
        setCurrentTime(data.seconds);
      });

      playerRef.current.on('loaded', (data: any) => {
        // Fixed: Set actual video duration
        setVideoDuration(data.duration);
      });

      playerRef.current.on('volumechange', (data: any) => {
        setVolume(data.volume);
        if (data.volume > 0) {
          previousVolumeRef.current = data.volume;
        }
      });

      playerRef.current.on('fullscreenchange', (data: any) => {
        setIsFullscreen(data.fullscreen);
      });
    };

    // Controlla se l'API è già disponibile
    if ((window as any).Vimeo) {
      initPlayer();
    } else {
      // Attendi il caricamento dello script
      const checkInterval = setInterval(() => {
        if ((window as any).Vimeo) {
          clearInterval(checkInterval);
          initPlayer();
        }
      }, 100);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [hasStarted]);

  const handlePlayClick = () => {
    setHasStarted(true);
    setShowTimer(true);
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setShowTimer(false);
    setShowFinalPopup(true);
    clearControlsTimer();
    onVideoEnd();
  };

  // Formatta tempo in minuti:secondi
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!playerRef.current) return;
    
    if (volume > 0) {
      previousVolumeRef.current = volume;
      playerRef.current.setVolume(0);
    } else {
      playerRef.current.setVolume(previousVolumeRef.current);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    if (!playerRef.current) return;

    try {
      if (!isFullscreen) {
        await playerRef.current.requestFullscreen();
      } else {
        await playerRef.current.exitFullscreen();
      }
    } catch (error) {
      console.log("Errore fullscreen:", error);
    }
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
          className={`aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-lg relative animate-scale-in group ${isFullscreen ? 'w-screen h-screen fixed inset-0 z-50 rounded-none' : ''}`}
          style={{ animationDelay: '0.4s' }}
        >
          {!hasStarted ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
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
            </div>
          ) : (
            <div className="w-full h-full relative" ref={containerRef}>
              {/* Controlli video semplificati */}
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
                </div>

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

        {/* Timer countdown sincronizzato */}
        {hasStarted && showTimer && videoDuration > 0 && currentTime < videoDuration && (
          <div 
            className="text-center bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4 animate-pulse"
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Timer className="w-5 h-5 text-red-400 animate-pulse" />
              <span className="text-red-400 font-semibold text-lg">
                {/* Fixed: Use actual video duration */}
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
