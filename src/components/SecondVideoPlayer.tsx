import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Timer, Maximize, Minimize } from "lucide-react";
import FinalPopup from "./FinalPopup";

interface SecondVideoPlayerProps {
  onVideoEnd: () => void;
}

const SecondVideoPlayer = ({ onVideoEnd }: SecondVideoPlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [videoDuration, setVideoDuration] = useState(300); // 5 minuti come default, modificabile
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // Listener per fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Timer personalizzato per tracciare il progresso
  useEffect(() => {
    if (hasStarted && showTimer) {
      timerInterval.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= videoDuration) {
            setShowTimer(false);
            setShowFinalPopup(true);
            onVideoEnd();
            return videoDuration;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [hasStarted, showTimer, videoDuration, onVideoEnd]);

  const handlePlayClick = () => {
    setHasStarted(true);
    setShowTimer(true);
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
      console.log("Errore fullscreen:", error);
    }
  };

  const calculateProgress = () => {
    if (videoDuration === 0) return 0;
    return (currentTime / videoDuration) * 100;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
              {/* Archive.org Embed */}
              <iframe
                ref={iframeRef}
                src="https://archive.org/embed/lv_0_20250602135445"
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; fullscreen"
              />
              
              {/* Barra di progresso personalizzata */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-700 z-20">
                <div 
                  className="h-full bg-yellow-500 transition-all duration-200"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
              
              {/* Controlli personalizzati overlay */}
              <div className="absolute top-4 right-4 z-20">
                <button 
                  onClick={toggleFullscreen}
                  className="bg-black/50 text-white hover:text-yellow-400 transition-colors p-2 rounded-lg backdrop-blur-sm"
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

        {/* Timer sincronizzato con la durata del video */}
        {hasStarted && showTimer && currentTime < videoDuration && (
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

        {/* Messaggio di progresso */}
        {hasStarted && showTimer && (
          <div className="text-center">
            <div className="bg-slate-800/50 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-white/80 text-sm">
                Progresso: {formatTime(currentTime)} / {formatTime(videoDuration)}
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Final Popup */}
      {showFinalPopup && <FinalPopup />}
    </>
  );
};

export default SecondVideoPlayer;
