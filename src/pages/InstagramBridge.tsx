import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const InstagramBridge = () => {
  const navigate = useNavigate();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Show button after 3 seconds
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    // Store that user has seen the bridge page
    localStorage.setItem('hasSeenBridge', 'true');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4">
          Stai aprendo questo sito da Instagram
        </h1>
        
        <div className="bg-gradient-to-br from-yellow-400/10 to-orange-400/10 border border-yellow-400/30 rounded-xl p-6">
          <p className="text-lg mb-4">
            Per navigare correttamente, clicca i tre puntini in alto a destra (⋮ o ⋯) e scegli 'Apri nel browser'.
          </p>
          
          <div className="flex justify-center items-center gap-2 mb-4">
            <span className="text-3xl">⋮</span>
            <span className="text-gray-400">o</span>
            <span className="text-3xl">⋯</span>
          </div>

          {showButton && (
            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mt-4"
            >
              Ho fatto, fammi entrare
            </button>
          )}
        </div>

        <p className="text-gray-400 text-sm">
          Questo messaggio appare solo la prima volta che accedi da Instagram. 
          Dopo aver aperto il sito nel browser esterno, potrai navigare normalmente.
        </p>
      </div>
    </div>
  );
};

export default InstagramBridge;
