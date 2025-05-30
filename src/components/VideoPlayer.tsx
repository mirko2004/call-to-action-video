
import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoEndPopup from "./VideoEndPopup";

interface VideoPlayerProps {
  onVideoEnd: () => void;
}

const VideoPlayer = ({ onVideoEnd }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef<any>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

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
      const iframe = document.querySelector('iframe');
      if (iframe) {
        // @ts-ignore
        playerRef.current = new Vimeo.Player(iframe);
        
        // Imposta il volume iniziale
        playerRef.current.setVolume(volume);
        
        // Ottieni la durata del video
        playerRef.current.getDuration().then((duration: number) => {
          setVideoDuration(Math.floor(duration));
        });
        
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
          onVideoEnd();
          setIsPlaying(false);
        });
        
        playerRef.current.on('timeupdate', (data: any) => {
          setCurrentTime(Math.floor(data.seconds));
        });
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [hasStarted, onEnded, volume]);

  // Timer per nascondere i controlli
  const startControlsTimer = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    
    controlsTimeout.current = setTimeout(() => {
      setShowControls(false);
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
      if (isPlaying && hasStarted) {
        setShowControls(true);
        startControlsTimer();
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
    setIsMuted(!isMuted);
    if (playerRef.current) {
      playerRef.current.setVolume(isMuted ? volume : 0);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    if (videoDuration === 0) return 0;
    return (currentTime / videoDuration) * 100;
  };

  return (
    <>
      <div className="relative w-full max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <p className="text-white/70 text-sm">
            📺 Guarda tutto il video per sbloccare il pulsante e continuare
          </p>
        </div>

        <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-lg relative group">
          {!hasStarted ? (
            <div className="w-full h-full flex items-center justify-center bg-black/50">
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer" 
                onClick={handlePlayClick}
              >
                <div className="bg-yellow-400 hover:bg-yellow-500 rounded-full p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Play className="w-12 h-12 text-black ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full relative">
              <div className="absolute inset-0">
                <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                  <iframe
                    src={`https://player.vimeo.com/video/898897743?autoplay=1&background=1&loop=0&autopause=0&muted=${isMuted ? 1 : 0}&controls=0&title=0&byline=0&portrait=0&badge=0`}
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
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 z-20">
                <div 
                  className="h-full bg-yellow-500 transition-all duration-200"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
              
              {/* Controlli video personalizzati */}
              {(showControls || !isPlaying) && (
                <div 
                  ref={controlsRef}
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
                        <Play className="w-6 h-6" />
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
                    
                    <div className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(videoDuration)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {isPlaying && !videoEnded && (
          <div className="text-center bg-gradient-to-r from-blue-400/10 to-purple-400/10 border border-blue-400/30 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Timer className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-semibold text-lg">
                {formatTime(videoDuration - currentTime)} rimanenti
              </span>
            </div>
            <p className="text-white/90 text-sm">
              ⏱️ Tempo rimanente - resta fino alla fine per sbloccare il contenuto
            </p>
          </div>
        )}

        {showButton && (
          <div className="text-center bg-gradient-to-r from-yellow-400/10 to-orange-400/10 border border-yellow-400/30 rounded-xl p-6 animate-fade-in">
            <p className="text-white/90 text-sm mb-4 leading-relaxed">
              🎯 <span className="font-semibold text-yellow-400">Congratulazioni!</span><br />
              <span className="text-white/70">Hai completato il primo step. Ora scoprirai come mai dico che questo è un PERCORSO totalmente diverso dagli altri "guru online"</span>
            </p>
            
            <Button
              onClick={handleButtonClick}
              size="lg"
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              🎥 Accedi al Contenuto Esclusivo
            </Button>
          </div>
        )}
      </div>

      {showPopup && <VideoEndPopup />}
    </>
  );
};

export default VideoPlayer;
