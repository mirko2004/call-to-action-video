
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Lock } from "lucide-react";

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
      {showButton ? (
        <Button 
          onClick={startCountdown}
          size="lg"
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-12 py-6 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Lock className="mr-3 h-6 w-6" />
          Guarda Ora Il Video Gratuito
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="text-6xl font-bold text-yellow-400 animate-pulse">
            {countdown}
          </div>
          <p className="text-lg text-gray-300">
            Il video inizierà tra {countdown} second{countdown !== 1 ? 'i' : 'o'}...
          </p>
        </div>
      )}
    </div>
  );
};

export default PreVideoMessage;
