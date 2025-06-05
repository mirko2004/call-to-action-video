
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Timer, Lock, CheckCircle } from "lucide-react";

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

  // Timer countdown - si ferma quando hasClicked è true
  useEffect(() => {
    if (hasClicked) return; // Ferma il timer se ha già cliccato
    
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
  }, [timeLeft, userIP, hasClicked]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuestionnaireClick = () => {
    setHasClicked(true);
    // 🔥 QUI PUOI MODIFICARE IL LINK ESTERNO 🔥
    // Sostituisci l'URL sotto con il tuo link al questionario
    window.open("https://984rk3s3.forms.app/selezionibymirkotaranto", "_blank");
  };

  if (isExpired) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-gradient-to-br from-purple-900 to-black border border-purple-500 rounded-2xl p-8 max-w-md mx-4 text-center space-y-6 animate-scale-in">
          <div className="text-purple-400 text-4xl mb-4">📱</div>
          
          <h3 className="text-2xl font-bold text-purple-400">
            Tempo Scaduto
          </h3>
          
          <p className="text-white/80 leading-relaxed">
            Purtroppo il tempo per accedere alle selezioni è scaduto.
          </p>
          
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-xl p-4">
            <p className="text-purple-400 font-semibold text-sm mb-2">
              🎯 VUOI UNA SECONDA POSSIBILITÀ?
            </p>
            <p className="text-white/90 text-sm mb-3">
              Scrivimi su Instagram in DM:
            </p>
            <p className="text-yellow-400 font-bold text-lg mb-2">
              "SECONDA POSSIBILITÀ"
            </p>
            <p className="text-white/80 text-xs">
              Fai una breve presentazione di te per farmi capire che hai veramente voglia di scoprire di più questo mondo.
            </p>
            <p className="text-yellow-400 text-sm mt-3 font-semibold">
              📱 Instagram: @mirkotaranto_
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-green-900 to-black border border-green-500 rounded-2xl p-8 max-w-md mx-4 text-center space-y-6 animate-scale-in">
        <div className="text-green-400 text-4xl mb-4">🎖️</div>
        
        <h3 className="text-2xl font-bold text-white mb-4">
          ACCESSO ESCLUSIVO SBLOCCATO!
        </h3>
        
        {!hasClicked ? (
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/50 rounded-xl p-4 mb-6 animate-pulse">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Timer className="w-5 h-5 text-red-400 animate-pulse" />
              <span className="text-red-400 font-bold text-xl" key={timeLeft}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <p className="text-white/90 text-sm">
              ⚠️ Tempo rimasto per accedere alle selezioni
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-bold text-lg">
                Questionario Aperto!
              </span>
            </div>
            <p className="text-white/90 text-sm">
              ✅ Perfetto! Il questionario è stato aperto in una nuova finestra
            </p>
            <p className="text-white/70 text-xs mt-2">
              Puoi cliccare di nuovo il pulsante se necessario
            </p>
          </div>
        )}
        
        <p className="text-white/90 leading-relaxed">
          {!hasClicked ? (
            <>
              Hai sbloccato l'accesso alle selezioni per entrare nella community esclusiva. Hai solo <span className="text-red-400 font-bold">2 minuti</span> per compilare il questionario!
            </>
          ) : (
            <>
              Compila attentamente il questionario per completare la tua candidatura. Questo è l'ultimo step per entrare nella community esclusiva!
            </>
          )}
        </p>
        
        {!hasClicked && (
          <p className="text-green-400 font-semibold text-sm">
            Dopo questo tempo, l'opportunità sparirà per sempre.
          </p>
        )}
        
        <Button
          onClick={handleQuestionnaireClick}
          size="lg"
          className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full"
        >
          {hasClicked ? "🔄 Riapri Questionario" : "🚀 Accedi alle Selezioni - Compila Qui"}
        </Button>
      </div>
    </div>
  );
};

export default FinalPopup;
