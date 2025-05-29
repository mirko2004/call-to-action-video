
import { useRef, useState, useEffect } from "react";
import { Play, Timer } from "lucide-react";

interface VideoPlayerProps {
  onVideoEnd: () => void;
}

const VideoPlayer = ({ onVideoEnd }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (showTimer && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setShowTimer(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [showTimer, timeLeft]);

  const handlePlayClick = () => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((error) => {
        console.log("Play was prevented:", error);
      });
      setIsPlaying(true);
      setHasStarted(true);
      setShowTimer(true);
      
      // SIMULAZIONE: Simula la fine del video dopo 3 secondi
      console.log("Video simulato iniziato - terminerà in 3 secondi");
      setTimeout(() => {
        console.log("Simulazione video terminato - mostro pulsante WhatsApp");
        setIsPlaying(false);
        setShowTimer(false);
        onVideoEnd();
      }, 3000);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setShowTimer(false);
    onVideoEnd();
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto space-y-6">
      <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-lg relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          controls={hasStarted}
          muted
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
              <p className="text-lg">Video di Test - Simulazione</p>
              <p className="text-sm text-white/80">
                Clicca play e il pulsante WhatsApp apparirà dopo 3 secondi
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
      </div>

      {/* Timer Section */}
      {showTimer && timeLeft > 0 && (
        <div className="text-center bg-gradient-to-r from-yellow-400/10 to-orange-400/10 border border-yellow-400/30 rounded-xl p-6 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Timer className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="text-yellow-400 font-semibold text-lg">
              {timeLeft}
            </span>
          </div>
          <p className="text-white/90 text-sm leading-relaxed">
            🔓 <span className="font-semibold text-yellow-400">Accesso Esclusivo</span> alle selezioni si sbloccherà tra<br />
            <span className="text-white/70">Resta fino alla fine per scoprire come entrare nella community</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
