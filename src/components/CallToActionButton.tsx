
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";

const CallToActionButton = () => {
  const handleBooking = () => {
    // Here you can add your booking logic
    // For example, redirect to a booking platform or open a modal
    console.log("Booking button clicked!");
    // window.open('https://your-booking-link.com', '_blank');
  };

  return (
    <div className="text-center space-y-6 py-8">
      <div className="space-y-3">
        <h3 className="text-2xl md:text-3xl font-bold text-slate-800">
          Pronto a Iniziare?
        </h3>
        <p className="text-lg text-slate-600 max-w-xl mx-auto">
          Non perdere questa opportunità. Prenota ora la tua chiamata gratuita 
          e scopri come possiamo lavorare insieme per raggiungere i tuoi obiettivi.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button
          onClick={handleBooking}
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
        >
          <Calendar className="mr-2 h-5 w-5" />
          Prenota la Tua Chiamata Gratuita
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
        
        <Button
          onClick={handleBooking}
          variant="outline"
          size="lg"
          className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg rounded-xl transition-all duration-300"
        >
          Richiedi Info Gratis
        </Button>
      </div>

      <div className="text-sm text-slate-500 space-y-1">
        <p>✅ Chiamata gratuita di 30 minuti</p>
        <p>✅ Analisi personalizzata della tua situazione</p>
        <p>✅ Strategia su misura per i tuoi obiettivi</p>
      </div>
    </div>
  );
};

export default CallToActionButton;
