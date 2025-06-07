
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VideoPlayer from "@/components/VideoPlayer";

const Index = () => {
  const navigate = useNavigate();
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    // Controlla se l'utente è arrivato da Instagram o TikTok
    const referrer = document.referrer.toLowerCase();
    const isInstagram = referrer.includes('instagram.com') || referrer.includes('i.instagram.com');
    const isTikTok = referrer.includes('tiktok.com');
    
    // Controlla se l'utente ha già visto la pagina di bridge
    const hasSeenBridge = localStorage.getItem('hasSeenBridge');
    
    // Reindirizza alla pagina di bridge se necessario
    if ((isInstagram || isTikTok) && !hasSeenBridge) {
      navigate('/instagram-bridge');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Top testimonial box */}
          <div className="border border-gray-600 border-dashed p-4 rounded-lg mb-6 lg:mb-8 animate-fade-in">
            <p className="text-gray-300 text-sm animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              Questo Webinar GRATIS è per Chiunque Voglia<br />
              Approfondire L'online Ormai Pieno di Scetticismo
            </p>
          </div>

          {/* Main headline */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              <span className="text-yellow-400 animate-slide-in-right" style={{ animationDelay: '0.4s' }}>La Grande Differenza Tra Un<br />
              "Guru Online" E Una Community<br />
              Che Ha Un Interesse Lavorativo<br />
              Ad Aiutare</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Video Section with Side Content */}
      <div className="container mx-auto px-4 py-4 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Mobile: Side content first, then video */}
          <div className="lg:hidden mb-6 animate-slide-in-right" style={{ animationDelay: '0.6s' }}>
            <div className="bg-gradient-to-br from-yellow-400/10 to-orange-400/10 border border-yellow-400/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                "Il Pentagono D'Oro per Trasformare la Tua Vita in un Viaggio Continuo"
              </h3>
              
              <p className="text-white/90 font-semibold mb-4 animate-fade-in" style={{ animationDelay: '1s' }}>Scoprirai:</p>
              
              <div className="space-y-3 text-sm text-white/90">
                <div className="flex items-start space-x-2 animate-fade-in" style={{ animationDelay: '1.1s' }}>
                  <span className="text-green-400 mt-1">✅</span>
                  <span>Il Metodo che mi ha permesso di costruire un'entrata extra (fino a viverci)</span>
                </div>
                
                <div className="flex items-start space-x-2 animate-fade-in" style={{ animationDelay: '1.2s' }}>
                  <span className="text-green-400 mt-1">✅</span>
                  <span>Il Sistema che usiamo per non lasciare mai da solo chi inizia: supporto reale, step chiari e affiancamento costante</span>
                </div>
                
                <div className="flex items-start space-x-2 animate-fade-in" style={{ animationDelay: '1.3s' }}>
                  <span className="text-green-400 mt-1">✅</span>
                  <span>Il Protocollo in 3 Step per iniziare anche da zero</span>
                </div>
                
                <div className="flex items-start space-x-2 animate-fade-in" style={{ animationDelay: '1.4s' }}>
                  <span className="text-green-400 mt-1">✅</span>
                  <span>L'opportunità che non è mai esistita prima: innovativa, accessibile e con strumenti esclusivi come lo scanner</span>
                </div>
                
                <div className="flex items-start space-x-2 animate-fade-in" style={{ animationDelay: '1.5s' }}>
                  <span className="text-green-400 mt-1">✅</span>
                  <span>Chi sono, cosa faccio ogni giorno e perché questo non è il solito "lavoretto online"</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Video Column */}
            <div className="lg:col-span-2 space-y-6">
              <VideoPlayer />
            </div>

            {/* Side Content - Desktop only */}
            <div className="lg:col-span-1 hidden lg:block">
              <div className="bg-gradient-to-br from-yellow-400/10 to-orange-400/10 border border-yellow-400/30 rounded-xl p-6 sticky top-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <h3 className="text-xl font-bold text-yellow-400 mb-4 animate-slide-in-right" style={{ animationDelay: '0.8s' }}>
                  "Il Pentagono D'Oro per Trasformare la Tua Vita in un Viaggio Continuo"
                </h3>
                
                <p className="text-white/90 font-semibold mb-4 animate-fade-in" style={{ animationDelay: '1s' }}>Scoprirai:</p>
                
                <div className="space-y-3 text-sm text-white/90">
                  <div className="flex items-start space-x-2 animate-fade-in" style={{ animationDelay: '1.1s' }}>
                    <span className="text-green-400 mt-1">✅</span>
                    <span>Il Metodo che mi ha permesso di costruire un'entrata extra (fino a viverci)</span>
                  </div>
                  
                  <div className="flex items-start space-x-2 animate-fade-in" style={{ animationDelay: '1.2s' }}>
                    <span className="text-green-400 mt-1">✅</span>
                    <span>Il Sistema che usiamo per non lasciare mai da solo chi inizia: supporto reale, step chiari e affiancamento costante</span>
                  </div>
                  
                  <div className="flex items-start space-x-2 animate-fade-in" style={{ animationDelay: '1.3s' }}>
                    <span className="text-green-400 mt-1">✅</span>
                    <span>Il Protocollo in 3 Step per iniziare anche da zero</span>
                  </div>
                  
                  <div className="flex items-start space-x-2 animate-fade-in" style={{ animationDelay: '1.4s' }}>
                    <span className="text-green-400 mt-1">✅</span>
                    <span>L'opportunità che non è mai esistita prima: innovativa, accessibile e con strumenti esclusivi come lo scanner</span>
                  </div>
                  
                  <div className="flex items-start space-x-2 animate-fade-in" style={{ animationDelay: '1.5s' }}>
                    <span className="text-green-400 mt-1">✅</span>
                    <span>Chi sono, cosa faccio ogni giorno e perché questo non è il solito "lavoretto online"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
