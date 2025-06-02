import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Timer, Maximize, Minimize, Download, AlertCircle } from "lucide-react";

interface SecondVideoPlayerProps {
  onVideoEnd: () => void;
}

const SecondVideoPlayer = ({ onVideoEnd }: SecondVideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const previousVolumeRef = useRef(0.7);

  const isMuted = volume === 0;
  const MEGA_URL = "https://mega.nz/file/3I8gGCoS#jH9kOyLuxwjsPw-nDq1xlQeV4HxrW3wXuklq0aw9BGE";

  // Listener per fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setVideoDuration(Math.floor(video.duration));
    };

    const handleTimeUpdate = () => {
      setCurrentTime(Math.floor(video.currentTime));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setShowTimer(false);
      setShowFinalPopup(true);
      onVideoEnd();
    };

    const handleError = () => {
      console.error("Errore nel caricamento del video", video.error);
      setHasError(true);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [onVideoEnd]);

  // Sync volume with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  // Sync play/pause with video element
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.play().catch(error => {
        console.error("Playback failed:", error);
        setHasError(true);
      });
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  // Timer for hiding controls
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

  // Avvia il timer dei controlli dopo il primo play
  useEffect(() => {
    if (hasStarted && isPlaying) {
      setShowControls(true);
      startControlsTimer();
    }
  }, [hasStarted, isPlaying, startControlsTimer]);

  // Handle mouse movement for controls
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
    setShowTimer(true);
    setIsPlaying(true);
    setShowControls(true);
    setIsLoading(true);
    
    // Simula il caricamento
    setTimeout(() => {
      setIsLoading(false);
      // Simula un errore dopo 1 secondo
      setTimeout(() => {
        setHasError(true);
      }, 1000);
    }, 500);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    setShowControls(true);
    startControlsTimer();
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
  };

  const calculateProgress = () => {
    if (videoDuration === 0) return 0;
    return (currentTime / videoDuration) * 100;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const reloadVideo = () => {
    setHasError(false);
    setIsLoading(true);
    setHasStarted(false);
    setIsPlaying(false);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const downloadVideo = () => {
    window.open(MEGA_URL, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="text-center animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
            Video Esclusivo Finale
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Guarda questo contenuto premium per accedere alle selezioni speciali
          </p>
        </div>

        <div 
          ref={containerRef}
          className={`aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative ${isFullscreen ? 'w-screen h-screen fixed inset-0 z-50 rounded-none' : ''}`}
        >
          {!hasStarted ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-white/80">Caricamento in corso...</p>
                </div>
              ) : (
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer gap-6 transition-all duration-300 hover:scale-[1.02]"
                  onClick={handlePlayClick}
                >
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-7 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Play className="w-14 h-14 text-black ml-1" fill="currentColor" />
                  </div>
                  <div className="text-center space-y-3">
                    <p className="text-2xl font-bold text-white">Video Premium</p>
                    <p className="text-white/80 text-base max-w-md">
                      Clicca play per accedere a questo contenuto esclusivo e alle selezioni speciali
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : hasError ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800/95 to-slate-900/95 p-6 backdrop-blur-sm">
              <div className="bg-red-500/20 rounded-full p-5 mb-6">
                <AlertCircle className="w-16 h-16 text-red-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-center text-white mb-3">
                Errore nel caricamento del video
              </h2>
              
              <p className="text-white/80 text-center text-lg mb-2 max-w-xl">
                Si è verificato un problema durante la riproduzione del video da Mega.nz.
              </p>
              
              <p className="text-white/70 text-center mb-8 max-w-xl">
                Questo può essere causato da limitazioni tecniche della piattaforma. 
                Ti consigliamo di scaricare il video per visualizzarlo correttamente.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <button
                  onClick={reloadVideo}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Riprova
                </button>
                
                <button
                  onClick={downloadVideo}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl transition-all shadow-lg transform hover:-translate-y-0.5"
                >
                  <Download className="w-5 h-5" />
                  Scarica Video
                </button>
              </div>
              
              <div className="mt-10 p-4 bg-slate-800/50 rounded-xl border border-slate-700 max-w-xl">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Perché non funziona?
                </h3>
                <p className="text-white/80 text-sm">
                  Mega.nz utilizza una tecnologia di protezione che impedisce la riproduzione diretta 
                  dei video nei browser. Per visualizzare questo contenuto, ti consigliamo di scaricare 
                  il file e riprodurlo con un lettore video locale come VLC Media Player.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full relative">
              <div className="w-full h-full flex items-center justify-center bg-black">
                <div className="text-center p-6 max-w-md">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Video in caricamento</h3>
                  <p className="text-white/80 mb-6">
                    Stiamo preparando la riproduzione del tuo contenuto esclusivo...
                  </p>
                  <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!hasError && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
            <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-yellow-500/20 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Contenuto Esclusivo</h3>
              </div>
              <p className="text-white/80">
                Questo video contiene informazioni riservate disponibili solo per utenti premium.
              </p>
            </div>
            
            <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-yellow-500/20 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Accesso Garantito</h3>
              </div>
              <p className="text-white/80">
                Al termine della visione, otterrai accesso immediato alle selezioni speciali.
              </p>
            </div>
            
            <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-yellow-500/20 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Sicurezza</h3>
              </div>
              <p className="text-white/80">
                Il tuo accesso è protetto con crittografia avanzata per garantire la privacy.
              </p>
            </div>
          </div>
        )}

        {hasError && (
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <AlertCircle className="text-red-400" />
              Risoluzione dei problemi
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl">
                <h4 className="font-semibold text-white mb-2">1. Scarica il video</h4>
                <p className="text-white/80 text-sm">
                  Clicca sul pulsante "Scarica Video" per ottenere il file completo sul tuo dispositivo.
                </p>
              </div>
              
              <div className="bg-slate-800/50 p-4 rounded-xl">
                <h4 className="font-semibold text-white mb-2">2. Utilizza VLC Media Player</h4>
                <p className="text-white/80 text-sm">
                  Installa VLC (gratuito) per riprodurre qualsiasi formato video senza problemi.
                </p>
              </div>
              
              <div className="bg-slate-800/50 p-4 rounded-xl">
                <h4 className="font-semibold text-white mb-2">3. Verifica la connessione</h4>
                <p className="text-white/80 text-sm">
                  Assicurati di avere una connessione internet stabile per il download.
                </p>
              </div>
              
              <div className="bg-slate-800/50 p-4 rounded-xl">
                <h4 className="font-semibold text-white mb-2">4. Contatta il supporto</h4>
                <p className="text-white/80 text-sm">
                  Se il problema persiste, il nostro team è disponibile ad aiutarti.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Contatta il Supporto
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-12 text-center text-white/60 text-sm">
        <p>© {new Date().getFullYear()} Premium Video Service. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
};

export default SecondVideoPlayer;
