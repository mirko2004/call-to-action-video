
import { useRef, useEffect } from "react";

interface VideoPlayerProps {
  onVideoEnd: () => void;
}

const VideoPlayer = ({ onVideoEnd }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Auto-play the video when component mounts
      video.play().catch((error) => {
        console.log("Autoplay was prevented:", error);
      });

      // Add event listener for when video ends
      const handleEnded = () => {
        onVideoEnd();
      };

      video.addEventListener('ended', handleEnded);

      return () => {
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, [onVideoEnd]);

  return (
    <div className="relative w-full">
      <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          controls={false}
          muted
          playsInline
          preload="metadata"
        >
          {/* Placeholder for when user uploads their video */}
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
      </div>
      
      {/* Custom overlay to ensure no controls are visible */}
      <div className="absolute inset-0 pointer-events-none rounded-xl"></div>
    </div>
  );
};

export default VideoPlayer;
