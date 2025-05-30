
import { useRef, useState, useEffect } from "react";
import { Play, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoEndPopup from "./VideoEndPopup";

interface VideoPlayerProps {
  onVideoEnd: () => void;
}

const VideoPlayer = ({ onVideoEnd }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3);
  const [showTimer, setShowTimer] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(3); // Durata simulata del video
  const [currentTime, setCurrentTime] = useState(0);

  // Timer per la durata del video durante la riproduzione
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && !videoEnded) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= videoDuration) {
            setIsPlaying(false);
            setVideoEnded(true);
            setShowButton(true);
            onVideoEnd();
            return videoDuration;
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, videoEnded, videoDuration, onVideoEnd]);

  // Timer per il countdown dopo il video (rimosso perché ora il pulsante appare subito)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (showTimer && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setShowTimer(false);
            setShowButton(true);
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
      setCurrentTime(0);
      
      console.log("Video simulato iniziato - durata:", videoDuration, "secondi");
    }
  };

  const handleVideoEnd = () => {
    if (!videoEnded) {
      setIsPlaying(false);
      setVideoEnded(true);
      setShowButton(true);
      onVideoEnd();
    }
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="relative w-full max-w-2xl mx-auto space-y-6">
        {/* Instructional text above video */}
        <div className="text-center">
          <p className="text-white/70 text-sm">
            📺 Guarda tutto il video per sbloccare il pulsante e continuare
          </p>
        </div>

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
            <source src="https://vimeo.com/manage/videos/898897743" type="video/vimeo" />
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[6px] border-y-transparent ml-1"></div>
                </div>
                <p className="text-lg">Video di Test - Simulazione</p>
                <p className="text-sm text-white/80">
                  Clicca play e il pulsante apparirà dopo 3 secondi
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

        {/* Video Duration Timer (shown during video playback) */}
        {isPlaying && !videoEnded && (
          <div className="text-center bg-gradient-to-r from-blue-400/10 to-purple-400/10 border border-blue-400/30 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Timer className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-semibold text-lg">
                {videoDuration - currentTime} secondi rimanenti
              </span>
            </div>
            <p className="text-white/90 text-sm">
              ⏱️ Tempo rimanente - resta fino alla fine per sbloccare il contenuto
            </p>
          </div>
        )}

        {/* Button Section */}
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

      {/* Video End Popup */}
      {showPopup && <VideoEndPopup />}
    </>
  );
};

export default VideoPlayer;
