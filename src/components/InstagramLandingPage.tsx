import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface InstagramLandingPageProps {
  onClose: () => void;
}

export default function InstagramLandingPage({ onClose }: InstagramLandingPageProps) {
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleContinue = () => {
    onClose();
    navigate('/'); // Redirect to main site
  };



  useEffect(() => {
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-xl max-w-md w-full p-8 text-center animate-scale-in">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-yellow-400 animate-fade-in">
            Stai aprendo questo sito da Instagram
          </h1>
          <p className="text-gray-300 animate-fade-in">
            Per navigare correttamente, clicca i tre puntini in alto a destra (⋮ o ⋯) e scegli ‘Apri nel browser’.
          </p>
          <button
            onClick={handleContinue}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-scale-in focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            🔥 Ho fatto, fammi entrare
          </button>
        </div>
      </div>
    </div>
  );
}
