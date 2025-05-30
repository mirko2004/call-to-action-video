
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Timer, Lock } from "lucide-react";

const FinalPopup = () => {
  const [timeLeft, setTimeLeft] = useState(120); // 2 minuti = 120 secondi
  const [isExpired, setIsExpired] = useState(false);
  const [userIP, setUserIP] = useState<string>("");
  const [hasClicked, setHasClicked] = useState(false);

  // Simula il rilevamento dell'IP
  useEffect(() => {
    // In una app reale useresti un servizio per rilevare l'IP
    const simulatedIP = "192.168.1." + Math.floor(Math.random() * 255);
    setUserIP(simulatedIP);
    
    // Controlla se questo IP ha già perso l'opportunità
    const blockedUntil = localStorage.getItem(`blocked_${simulatedIP}`);
    if (blockedUntil && new Date().getTime() < parseInt(blockedUntil)) {
      setIsExpired(true);
      return;
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      // Blocca questo IP per 10 minuti
      const blockedUntil = new Date().getTime() + (10 * 60 * 1000);
      localStorage.setItem(`blocked_${userIP}`, blockedUntil.toString());
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, userIP]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuestionnaireClick = () => {
    setHasClicked(true);
    // Qui metterai il link al tuo questionario
    window.open("https://esempio-questionario.com", "_blank");
  };

  if (isExpired) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-red-900 to-black border border-red-500 rounded-2xl p-8 max-w-md mx-4 text-center space-y-6">
          <Lock className="w-16 h-16 mx-auto text-red-400" />
          
          <h3 className="text-2xl font-bold text-red-400">
            Opportunità Scaduta
          </h3>
          
          <p className="text-white/80">
            Il tempo per accedere alle selezioni è scaduto. Questa opportunità non sarà più disponibile per il tuo IP per i prossimi 10 minuti.
          </p>
          
          <p className="text-red-400 text-sm">
            IP: {userIP}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-green-900 to-black border border-green-500 rounded-2xl p-8 max-w-md mx-4 text-center space-y-6 animate-scale-in">
        <div className="text-green-400 text-4xl mb-4">🎖️</div>
        
        <h3 className="text-2xl font-bold text-white mb-4">
          ACCESSO ESCLUSIVO SBLOCCATO!
        </h3>
        
        <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Timer className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="text-red-400 font-bold text-xl">
              {formatTime(timeLeft)}
            </span>
          </div>
          <p className="text-white/90 text-sm">
            ⚠️ Tempo rimasto per accedere alle selezioni
          </p>
        </div>
        
        <p className="text-white/90 leading-relaxed">
          Hai sbloccato l'accesso alle selezioni per entrare nella community esclusiva. Hai solo <span className="text-red-400 font-bold">2 minuti</span> per compilare il questionario!
        </p>
        
        <p className="text-green-400 font-semibold text-sm">
          Dopo questo tempo, l'opportunità sparirà per sempre.
        </p>
        
        <Button
          onClick={handleQuestionnaireClick}
          disabled={hasClicked}
          size="lg"
          className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full"
        >
          {hasClicked ? "Questionario Aperto..." : "🚀 Accedi alle Selezioni - Compila Qui"}
        </Button>
        
        <p className="text-white/60 text-xs">
          IP monitorato: {userIP}
        </p>
      </div>
    </div>
  );
};

export default FinalPopup;
