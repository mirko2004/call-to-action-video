import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const InstagramWarning = () => {
  const [showContent, setShowContent] = useState(true);
  const navigate = useNavigate();

  const handleContinue = () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('fromInstagram');
    navigate(currentUrl.pathname);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full px-4 py-8 text-center space-y-8">
        <div className="animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4">
            🏠 Stai aprendo questo sito da Instagram
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Per navigare correttamente, clicca i tre puntini in alto a destra (⋮ o ⋯) e scegli 'Apri nel browser'.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Questo passaggio è necessario perché il browser interno di Instagram blocca alcune funzioni importanti del sito.
          </p>
        </div>

        <Button
          onClick={handleContinue}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-4 px-8 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-scale-in"
        >
          🚀 Ho fatto, fammi entrare
        </Button>

        <div className="mt-8 text-gray-400 text-sm">
          <p className="mb-2">Se non riesci a vedere i tre puntini:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Tieni premuto il link</li>
            <li>Scegli "Copia link"</li>
            <li>Apri il browser</li>
            <li>Incolla il link</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default InstagramWarning;
