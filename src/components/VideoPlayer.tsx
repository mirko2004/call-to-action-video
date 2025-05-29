
import { useRef, useState } from "react";
import { Play } from "lucide-react";

interface VideoPlayerProps {
  onVideoEnd: () => void;
}

const VideoPlayer = ({ onVideoEnd }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const handlePlayClick = () => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((error) => {
        console.log("Play was prevented:", error);
      });
      setIsPlaying(true);
      setHasStarted(true);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    onVideoEnd();
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
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
        >
          <source src="/placeholder-video.mp4" type="video/mp4" />
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[6px] border-y-transparent ml-1"></div>
              </div>
              <p className="text-lg">Carica il tuo video qui</p>
              <p className="text-sm text-white/80">
                Sostituisci "placeholder-video.mp4" con il tuo file video
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
    </div>
  );
};

export default VideoPlayer;
