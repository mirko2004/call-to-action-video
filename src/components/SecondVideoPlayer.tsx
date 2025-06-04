
import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Timer, Maximize, Minimize } from "lucide-react";
import FinalPopup from "./FinalPopup";

interface SecondVideoPlayerProps {
  onVideoEnd: () => void;
}

const SecondVideoPlayer = ({ onVideoEnd }: SecondVideoPlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [videoDuration, setVideoDuration] = useState(30); // durata video Vimeo in secondi
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [player, setPlayer] = useState<any>(null);
  
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const previousVolumeRef = useRef(0.7);

  // Stato derivato per il muto
  const isMuted = volume === 0;

  // Inizializza Vimeo Player
  useEffect(() => {
    // Carica Vimeo Player API
    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.onload = () => {
      if (iframeRef.current && window.Vimeo) {
        const vimeoPlayer = new window.Vimeo.Player(iframeRef.current);
        setPlayer(vimeoPlayer);

        // Ottieni durata del video
        vimeoPlayer.getDuration().then((duration: number) => {
          setVideoDuration(Math.floor(duration));
        });

        // Listener per gli eventi del video
        vimeoPlayer.on('play', () => {
          setIsPlaying(true);
          setHasStarted(true);
          setShowTimer(true);
        });

        vimeoPlayer.on('pause', () => {
          setIsPlaying(false);
        });

        vimeoPlayer.on('ended', () => {
          setIsPlaying(false);
          setShowTimer(false);
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
  }, [onVideoEnd]);

  // Listener per fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Timer per nascondere i controlli
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

  const clearControlsTimer = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
      controlsTimeout.current = null;
    }
  }, []);

  // Gestisci il movimento del mouse per mostrare i controlli
  useEffect(() => {
    const handleMouseMove = () => {
      if (hasStarted) {
        setShowControls(true);
        if (isPlaying) {
          startControlsTimer();
        }
      }
    };
    
    const handleTouch = () => {
      if (hasStarted) {
        setShowControls(true);
        if (isPlaying) {
          startControlsTimer();
        }
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouch);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouch);
    };
  }, [isPlaying, hasStarted, startControlsTimer]);

  const handlePlayClick = async () => {
    if (player) {
      try {
        await player.play();
        setIsPlaying(true);
        setHasStarted(true);
        setShowTimer(true);
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
          className={`aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-lg relative animate-scale-in ${isFullscreen ? 'w-screen h-screen fixed inset-0 z-50 rounded-none' : ''}`}
          style={{ animationDelay: '0.4s' }}
        >
          <iframe
            ref={iframeRef}
            src="https://player.vimeo.com/video/1090015233?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479&controls=0&autoplay=0"
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
            title="2 secondo video sito"
          />
          
          {/* Custom Play Button Overlay */}
          {!hasStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer z-30" onClick={handlePlayClick}>
              <div className="bg-yellow-400 hover:bg-yellow-500 rounded-full p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Play className="w-12 h-12 text-black ml-1" fill="currentColor" />
              </div>
            </div>
          )}

          {/* Overlay per controlli touch su mobile */}
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
          
          {/* Controlli video personalizzati */}
          {hasStarted && (showControls || !isPlaying) && (
            <div 
              className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20 flex items-center justify-between transition-opacity duration-300"
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
          )}
        </div>

        {/* Timer countdown */}
        {hasStarted && showTimer && currentTime < videoDuration && (
          <div 
            className="text-center bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4 animate-pulse"
            key={`timer-${forceUpdate}`}
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Timer className="w-5 h-5 text-red-400 animate-pulse" />
              <span className="text-red-400 font-semibold text-lg">
                {videoDuration - currentTime} secondi rimanenti
              </span>
            </div>
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
