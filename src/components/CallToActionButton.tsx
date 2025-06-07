
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const CallToActionButton = () => {
  const handleWhatsApp = () => {
    // Replace with your WhatsApp number (include country code without +)
    const phoneNumber = "393xxxxxxxxx"; // Replace with your actual number
    const message = "Ciao! Ho visto il tuo video e vorrei saperne di più.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="text-center space-y-6 py-8">
      <Button
        onClick={handleWhatsApp}
        size="lg"
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-12 py-6 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-md"
      >
        <MessageCircle className="mr-3 h-6 w-6" />
        Scrivimi Ora Su WhatsApp
      </Button>
    </div>
  );
};

export default CallToActionButton;
