
import { useState } from "react";
import SecondVideoPlayer from "@/components/SecondVideoPlayer";

const SecondVideo = () => {
  const [videoEnded, setVideoEnded] = useState(false);

  const handleVideoEnd = () => {
    setVideoEnded(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Alert Section */}
          <div className="border border-red-500/50 bg-red-500/10 p-6 rounded-xl mb-8 animate-pulse">
            <p className="text-red-400 font-bold text-lg mb-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              ⚠️ ATTENZIONE MASSIMA RICHIESTA ⚠️
            </p>
            <p className="text-white/90 text-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Questo contenuto è ESCLUSIVO e contiene informazioni che potrebbero<br />
              cambiare completamente la tua vita. Presta la massima attenzione.
            </p>
          </div>

          {/* Main headline */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              <span className="text-yellow-400 animate-slide-in-right" style={{ animationDelay: '0.6s' }}>Il Contenuto Che Solo<br />
              Il 2% Delle Persone<br />
              Ha Mai Visto</span>
            </h1>
            
            <p className="text-white/80 text-lg animate-fade-in" style={{ animationDelay: '0.8s' }}>
              Quello che stai per vedere non è mai stato condiviso pubblicamente
            </p>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto animate-scale-in" style={{ animationDelay: '1s' }}>
          <SecondVideoPlayer onVideoEnd={handleVideoEnd} />
        </div>
      </div>
    </div>
  );
};

export default SecondVideo;
