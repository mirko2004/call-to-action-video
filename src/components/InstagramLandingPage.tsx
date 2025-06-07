import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function InstagramLandingPage() {
  const navigate = useNavigate();
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    // Check if we should show the landing page
    const userAgent = navigator.userAgent.toLowerCase();
    const isInstagram = userAgent.includes('instagram');
    
    if (!isInstagram) {
      setShowLanding(false);
      navigate('/'); // Redirect to main site if not on Instagram
    }
  }, [navigate]);

  const handleContinue = () => {
    setShowLanding(false);
    navigate('/'); // Redirect to main site
  };

  if (!showLanding) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Stai aprendo questo sito da Instagram
          </h1>
          <p className="text-gray-600">
            Per navigare correttamente, clicca i tre puntini in alto a destra (⋮ o ⋯) e scegli ‘Apri nel browser’.
          </p>
          <button
            onClick={handleContinue}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ho fatto, fammi entrare
          </button>
        </div>
      </div>
    </div>
  );
}
