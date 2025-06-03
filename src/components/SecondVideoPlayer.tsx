import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Timer, Maximize, Minimize } from "lucide-react";
import FinalPopup from "./FinalPopup";

interface SecondVideoPlayerProps {
  onVideoEnd: () => void;
}

const SecondVideoPlayer = ({ onVideoEnd }: SecondVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [videoDuration, setVideoDuration] = useState(10); // durata simulata di 10 secondi
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const previousVolumeRef = useRef(0.7);

  // Stato derivato per il muto
  const isMuted = volume === 0;

  // Listener per fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Simula l'aggiornamento del tempo corrente con force update per mobile
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && hasStarted) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev >= videoDuration - 1 ? videoDuration : prev + 1;
          
          if (newTime >= videoDuration) {
            setIsPlaying(false);
            setShowTimer(false);
            setShowFinalPopup(true);
            onVideoEnd();
          }
          
          // Force update per mobile
          setForceUpdate(count => count + 1);
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, hasStarted, videoDuration, onVideoEnd]);

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
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPlaying, hasStarted, startControlsTimer]);

  const handlePlayClick = () => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((error) => {
        console.log("Play was prevented:", error);
      });
      setIsPlaying(true);
      setHasStarted(true);
      setShowTimer(true);
    }
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        video.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      if (volume > 0) {
        previousVolumeRef.current = volume;
        setVolume(0);
        video.volume = 0;
      } else {
        setVolume(previousVolumeRef.current);
        video.volume = previousVolumeRef.current;
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
    }
  };

  const calculateProgress = () => {
    if (videoDuration === 0) return 0;
    return (currentTime / videoDuration) * 100;
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setShowTimer(false);
    setShowFinalPopup(true);
    onVideoEnd();
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
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
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            controls={false}
            muted={false}
            playsInline
            preload="metadata"
            onEnded={handleVideoEnd}
            onPause={handleVideoPause}
            onPlay={handleVideoPlay}
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
            style={{
              WebkitAppearance: 'none'
            }}
          >
            <source src="/placeholder-video.mp4" type="video/mp4" />
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[6px] border-y-transparent ml-1"></div>
                </div>
                <p className="text-lg">Video Esclusivo Finale</p>
                <p className="text-sm text-white/80">
                  Clicca play per accedere alle selezioni
                </p>
              </div>
            </div>
          </video>
          
          {/* Custom Play Button Overlay */}
          {!hasStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer" onClick={handlePlayClick}>
              <div className="bg-yellow-400 hover:bg-yellow-500 rounded-full p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Play className="w-12 h-12 text-black ml-1" fill="currentColor" />
              </div>
            </div>
          )}

          {/* Overlay per prevenire il click destro */}
          {hasStarted && (
            <div 
              className="absolute inset-0 z-10"
              onContextMenu={(e) => e.preventDefault()}
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

        {/* Timer rimane sempre visibile durante la riproduzione */}
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
