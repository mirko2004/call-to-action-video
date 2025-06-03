
import { useState, useEffect, useRef } from "react";
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
  const [videoDuration] = useState(607); // 10:07 in secondi
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const isMuted = volume === 0;
  const previousVolumeRef = useRef(0.7);

  // Timer per nascondere i controlli
  const startControlsTimer = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
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
        setShowControls(true);
        if (isPlaying) {
          startControlsTimer();
        }
      }
    };
    
    if (hasStarted) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isPlaying, hasStarted]);

  // Timer personalizzato per il video
  useEffect(() => {
    if (isPlaying && hasStarted) {
      timerInterval.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= videoDuration) {
            handleVideoEnd();
            return videoDuration;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [isPlaying, hasStarted, videoDuration]);

  // Gestione fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handlePlayClick = () => {
    setHasStarted(true);
    setIsPlaying(true);
    setShowTimer(true);
    setCurrentTime(0);
    startControlsTimer();
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setShowTimer(false);
    setShowFinalPopup(true);
    clearControlsTimer();
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
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
    if (isPlaying) {
      setIsPlaying(false);
      clearControlsTimer();
    } else {
      setIsPlaying(true);
      startControlsTimer();
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (volume > 0) {
      previousVolumeRef.current = volume;
      setVolume(0);
    } else {
      const newVolume = previousVolumeRef.current;
      setVolume(newVolume);
    }
  };

  // Gestione volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  // Toggle fullscreen
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
      console.log("Errore fullscreen:", error);
    }
  };

  // Calcola progresso video
  const calculateProgress = () => {
    if (videoDuration === 0) return 0;
    return (currentTime / videoDuration) * 100;
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
            <div className="w-full h-full relative">
              {/* Simulazione video con gradiente animato */}
              <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black relative overflow-hidden">
                {/* Animazione di "riproduzione" */}
                {isPlaying && (
                  <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 animate-pulse"></div>
                  </div>
                )}
                
                {/* Contenuto del video simulato */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="text-yellow-400 text-4xl mb-4">🎥</div>
                    <h3 className="text-2xl font-bold text-white">Contenuto Esclusivo</h3>
                    <p className="text-white/80">Video in riproduzione...</p>
                    {isPlaying && (
                      <div className="text-yellow-400 animate-bounce">▶</div>
                    )}
                  </div>
                </div>
                
                {/* Overlay per gestire i click */}
                <div 
                  className="absolute inset-0 z-10 cursor-pointer"
                  onClick={togglePlayPause}
                  onDoubleClick={toggleFullscreen}
                />
              </div>
              
              {/* Barra di progresso */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-700 z-20">
                <div 
                  className="h-full bg-yellow-500 transition-all duration-200"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
              
              {/* Controlli video */}
              {(showControls || !isPlaying) && (
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

        {/* Timer countdown sincronizzato */}
        {hasStarted && showTimer && currentTime < videoDuration && videoDuration > 0 && (
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
