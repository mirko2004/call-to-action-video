import { useState, useEffect } from "react";
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
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // ID del video da Google Drive
  const GOOGLE_DRIVE_VIDEO_ID = "1SLIZHcvyvyHEHpFDaD91awuWMoNxHIBi";
  const VIDEO_URL = `https://drive.google.com/file/d/${GOOGLE_DRIVE_VIDEO_ID}/preview`;

  // Funzione per avviare il video
  const handlePlayClick = () => {
    setHasStarted(true);
    setIsPlaying(true);
    setShowTimer(true);
    // Imposta una durata fissa per il timer (in secondi)
    setVideoDuration(120); // 2 minuti
  };

  // Aggiorna il timer ogni secondo
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isPlaying && hasStarted && currentTime < videoDuration) {
      timer = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          
          // Controllo fine video
          if (newTime >= videoDuration) {
            clearInterval(timer);
            setIsPlaying(false);
            setShowTimer(false);
            setShowFinalPopup(true);
            onVideoEnd();
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [isPlaying, hasStarted, videoDuration]);

  // Formatta il tempo in minuti:secondi
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
              {/* Iframe per Google Drive */}
              <iframe
                src={`${VIDEO_URL}${isPlaying ? '?autoplay=1' : ''}`}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay"
              />
            </div>
          )}
        </div>

        {/* Timer countdown */}
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
      </div>

      {showFinalPopup && <FinalPopup />}
    </>
  );
};

export default SecondVideoPlayer;
