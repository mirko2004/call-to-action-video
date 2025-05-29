
import { useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import CallToActionButton from "@/components/CallToActionButton";

const Index = () => {
  const [videoEnded, setVideoEnded] = useState(false);

  const handleVideoEnd = () => {
    setVideoEnded(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Top testimonial box */}
          <div className="border border-gray-600 border-dashed p-4 rounded-lg mb-8">
            <p className="text-gray-300 text-sm">
              Questo Webinar GRATIS è per Chiunque Voglia<br />
              Approfondire L'online Ormai Pieno di Scetticismo
            </p>
          </div>

          {/* Main headline */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              <span className="text-yellow-400">La Grande Differenza Tra Un<br />
              "Guru Online" E Una Community<br />
              Che Ha Un Interesse Lavorativo<br />
              Ad Aiutare</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <VideoPlayer onVideoEnd={handleVideoEnd} />
            
            {videoEnded && (
              <div className="animate-fade-in">
                <CallToActionButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
