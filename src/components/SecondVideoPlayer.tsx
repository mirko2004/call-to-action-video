import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Timer, Maximize, Minimize, ExternalLink } from "lucide-react";
import FinalPopup from "./FinalPopup";

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
  
  // Updated video URL - using a direct video source for better control
  const VIDEO_URL = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  // Initialize video metadata when loaded
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      const handleLoadedData = () => {
        setVideoDuration(video.duration);
        setIsLoading(false);
      };
      
      video.addEventListener('loadeddata', handleLoadedData);
      return () => video.removeEventListener('loadeddata', handleLoadedData);
    }
  }, []);

  // Update timer based on video playback
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
        if (video.currentTime >= video.duration - 0.5) {
          handleVideoEnd();
        }
      };
      
      video.addEventListener('timeupdate', handleTimeUpdate);
      return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }
  }, []);

  const handlePlayClick = () => {
    setIsLoading(true);
    setHasStarted(true);
    
    // Start playback after a small delay to ensure video is ready
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setShowTimer(true);
            setIsLoading(false);
          })
          .catch(error => {
            console.error("Playback failed:", error);
            setIsLoading(false);
          });
      }
    }, 100);
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setShowTimer(false);
    setShowFinalPopup(true);
    onVideoEnd();
  };

  // Format time in minutes:seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Open video in new window
  const openInNewWindow = () => {
    window.open(VIDEO_URL, '_blank');
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
              {/* Video element for better control */}
              <video
                ref={videoRef}
                src={VIDEO_URL}
                className="w-full h-full object-cover"
                preload="auto"
                playsInline
                volume={volume}
              />
              
              {/* Loading spinner */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
                </div>
              )}
              
              {/* Open in new window button */}
              <button
                onClick={openInNewWindow}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all"
              >
                <ExternalLink className="w-4 h-4 text-white" />
              </button>
              
              {/* Play/Pause overlay button */}
              <div 
                className={`absolute inset-0 flex items-center justify-center ${isPlaying ? 'hidden' : ''}`}
                onClick={togglePlayPause}
              >
                <div className="bg-black/50 rounded-full p-4 cursor-pointer hover:bg-black/70 transition-all">
                  <Play className="w-12 h-12 text-white" />
                </div>
              </div>
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
