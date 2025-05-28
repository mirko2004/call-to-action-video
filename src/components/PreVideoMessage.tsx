
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface PreVideoMessageProps {
  onStart: () => void;
}

const PreVideoMessage = ({ onStart }: PreVideoMessageProps) => {
  const [countdown, setCountdown] = useState(0);
  const [showButton, setShowButton] = useState(true);

  const startCountdown = () => {
    setShowButton(false);
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !showButton) {
      onStart();
    }
  }, [countdown, showButton, onStart]);

  return (
    <div className="text-center py-16 space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
          Scopri il Segreto del Successo
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Guarda questo video fino alla fine per scoprire come prenotare 
          la tua <span className="font-semibold text-blue-600">chiamata gratuita</span> e 
          trasformare il tuo business.
        </p>
      </div>

      {showButton ? (
        <Button 
          onClick={startCountdown}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Play className="mr-2 h-5 w-5" />
          Inizia a Guardare
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="text-6xl font-bold text-blue-600 animate-pulse">
            {countdown}
          </div>
          <p className="text-lg text-slate-600">
            Il video inizierà tra {countdown} second{countdown !== 1 ? 'i' : 'o'}...
          </p>
        </div>
      )}
    </div>
  );
};

export default PreVideoMessage;
