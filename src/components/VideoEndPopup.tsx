
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const VideoEndPopup = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/secondo-video");
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-400/30 rounded-2xl p-8 max-w-md mx-4 text-center space-y-6 animate-scale-in">
        <div className="text-yellow-400 text-4xl mb-4">🎯</div>
        
        <h3 className="text-2xl font-bold text-white mb-4">
          Congratulazioni!
        </h3>
        
        <p className="text-white/90 leading-relaxed">
          Hai completato il primo step. Ora scoprirai i dettagli esclusivi che cambieranno la tua prospettiva.
        </p>
        
        <p className="text-yellow-400 font-semibold">
          Preparati per il contenuto più importante...
        </p>
        
        <Button
          onClick={handleContinue}
          size="lg"
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full"
        >
          Continua al Contenuto Esclusivo
        </Button>
      </div>
    </div>
  );
};

export default VideoEndPopup;
