
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header/Introduction */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight">
            Ciao, sono Marco
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Aiuto professionisti e imprenditori a raggiungere i loro obiettivi attraverso 
            strategie personalizzate e innovative. Scopri come posso aiutarti a trasformare 
            le tue idee in successi concreti.
          </p>
        </div>
      </div>

      {/* Video Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
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

      {/* Footer */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-slate-500 text-sm">
          <p>© 2024 - Tutti i diritti riservati</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
