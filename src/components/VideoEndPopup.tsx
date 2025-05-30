
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
          Hai completato il primo step. Ora scoprirai come mai dico che questo è un PERCORSO totalmente diverso dagli altri "guru online".
        </p>
        
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
          <p className="text-red-400 font-semibold text-sm mb-2">
            🎧 ATTENZIONE MASSIMA RICHIESTA
          </p>
          <p className="text-white/90 text-sm">
            Per il prossimo video è fondamentale che tu sia concentrato al 100%. Metti le cuffie e assicurati di non avere distrazioni.
          </p>
        </div>
        
        <p className="text-yellow-400 font-semibold">
          Preparati per il contenuto più importante...
        </p>
        
        <Button
          onClick={handleContinue}
          size="lg"
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full"
        >
          🎥 Vai al Video Esclusivo
        </Button>
      </div>
    </div>
  );
};

export default VideoEndPopup;
