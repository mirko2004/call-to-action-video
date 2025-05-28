
import { useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import CallToActionButton from "@/components/CallToActionButton";
import PreVideoMessage from "@/components/PreVideoMessage";

const Index = () => {
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);

  const handleVideoEnd = () => {
    setVideoEnded(true);
  };

  const handleVideoStart = () => {
    setVideoStarted(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Top testimonial box */}
          <div className="border border-gray-600 border-dashed p-4 rounded-lg mb-8">
            <p className="text-gray-300 text-sm">
              Dopo aver fatto generare più di<br />
              1 miliardo di visualizzazioni totali, giovane<br />
              imprenditore rivela...
            </p>
          </div>

          {/* Main headline */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              Come Centinaia Di Persone<br />
              <span className="text-yellow-400">Ricevono 1.000 € A<br />
              Settimana</span> In Meno Di 58<br />
              Minuti Al Giorno Grazie Ad<br />
              Instagram
            </h1>
            
            <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
              E come professionisti, mamme single o dipendenti 
              stanchi stanno usando la stessa skill per 
              rimpiazzare il proprio lavoro
            </p>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!videoStarted && (
            <PreVideoMessage onStart={handleVideoStart} />
          )}
          
          {videoStarted && (
            <div className="space-y-6">
              <VideoPlayer onVideoEnd={handleVideoEnd} />
              
              {videoEnded && (
                <div className="animate-fade-in">
                  <CallToActionButton />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
