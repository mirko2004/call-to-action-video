import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

// Componente VideoEndPopup (ripristinato)
const VideoEndPopup = ({ onClose, onContinue }: { onClose: () => void; onContinue: () => void }) => (
  <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-xl max-w-md w-full p-8 text-center">
      <h2 className="text-2xl font-bold mb-4 text-yellow-400">Contenuto Sbloccato!</h2>
      <p className="mb-6 text-gray-300">
        Hai completato il primo step. Ora scoprirai come mai dico che questo è un PERCORSO totalmente diverso dagli altri "guru online"
      </p>
      <div className="flex flex-col gap-3">
        <Button 
          onClick={onContinue}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          🎥 Accedi al Contenuto Esclusivo
        </Button>
        <Button 
          onClick={onClose}
          variant="outline"
          className="text-white border-gray-600 hover:bg-gray-800"
        >
          Chiudi
        </Button>
      </div>
    </div>
  </div>
);

const VideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<any>(null);

  // Carica lo script Vimeo API
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Inizializza il player Vimeo
  useEffect(() => {
    if (!hasStarted) return;
    
    const timer = setTimeout(() => {
      const iframe = document.getElementById('vimeo-player');
      if (iframe) {
        // @ts-ignore
        playerRef.current = new window.Vimeo.Player(iframe);
        
        // Imposta il volume iniziale
        playerRef.current.setVolume(volume).catch(() => {});
        
        // Ottieni la durata del video
        playerRef.current.getDuration().then((duration: number) => {
          setVideoDuration(Math.floor(duration));
        }).catch(() => {});
        
        // Gestisci gli eventi
        playerRef.current.on('play', () => {
          setIsPlaying(true);
          setShowControls(true);
          startControlsTimer();
        });
        
        playerRef.current.on('pause', () => {
          setIsPlaying(false);
          setShowControls(true);
          clearControlsTimer();
        });
        
        playerRef.current.on('ended', () => {
          setVideoEnded(true);
          setShowButton(true);
          setIsPlaying(false);
        });
        
        playerRef.current.on('timeupdate', (data: any) => {
          setCurrentTime(Math.floor(data.seconds));
        });
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [hasStarted, volume]);

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
  }, [isPlaying, hasStarted]);

  const handlePlayClick = () => {
    setHasStarted(true);
    setIsPlaying(true);
    setVideoEnded(false);
  };

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const handleContinue = () => {
    // Naviga alla seconda pagina
    window.location.href = "/step2";
  };

  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (playerRef.current) {
      playerRef.current.setVolume(newMuted ? 0 : volume);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const calculateProgress = () => {
    if (videoDuration === 0) return 0;
    return (currentTime / videoDuration) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
            Contenuto Video Esclusivo
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Guarda il video completo per sbloccare contenuti premium e accedere a risorse esclusive
          </p>
        </header>

        <div className="relative w-full max-w-2xl mx-auto space-y-6">
          <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-lg relative group">
            {!hasStarted ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer gap-4" 
                  onClick={handlePlayClick}
                >
                  <div className="bg-yellow-500 hover:bg-yellow-600 rounded-full p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Play className="w-12 h-12 text-black ml-1" fill="currentColor" />
                  </div>
                  <p className="text-lg font-medium">Clicca per iniziare il video</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full relative">
                <div className="absolute inset-0">
                  <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                    <iframe
                      id="vimeo-player"
                      src={`https://player.vimeo.com/video/898897743?autoplay=1&background=0&loop=0&autopause=0&muted=${isMuted ? 1 : 0}&controls=0&title=0&byline=0&portrait=0&badge=0`}
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%',
                        borderRadius: '0.75rem',
                        overflow: 'hidden'
                      }}
                      title="Video Esclusivo"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
                
                {/* Overlay per prevenire il click destro */}
                <div 
                  className="absolute inset-0 z-10"
                  onContextMenu={(e) => e.preventDefault()}
                />
                
                {/* Barra di progresso */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-700 z-20">
                  <div 
                    className="h-full bg-yellow-500 transition-all duration-200"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
                
                {/* Controlli video personalizzati */}
                {(showControls || !isPlaying) && (
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
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timer rimane sempre visibile durante la riproduzione */}
          {hasStarted && !videoEnded && (
            <div className="text-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Timer className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-semibold text-lg">
                  {videoDuration - currentTime} secondi rimanenti
                </span>
              </div>
              <p className="text-white/90 text-sm">
                Continua a guardare fino alla fine per sbloccare il contenuto
              </p>
            </div>
          )}

          {showButton && (
            <div className="text-center bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 animate-fade-in">
              <p className="text-white/90 text-sm mb-4 leading-relaxed">
                🎯 <span className="font-semibold text-yellow-400">Congratulazioni!</span><br />
                <span className="text-white/70">Hai completato il primo step. Ora scoprirai come mai dico che questo è un PERCORSO totalmente diverso dagli altri "guru online"</span>
              </p>
              
              <Button
                onClick={handleButtonClick}
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                🎥 Accedi al Contenuto Esclusivo
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Popup di fine video (ripristinato) */}
      {showPopup && (
        <VideoEndPopup 
          onClose={() => setShowPopup(false)} 
          onContinue={handleContinue}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
