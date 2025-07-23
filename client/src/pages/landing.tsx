import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-modern-blue via-accent-blue to-deep-blue flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <i className="fas fa-book-open text-3xl text-modern-blue"></i>
              <h1 className="text-2xl font-semibold text-modern-blue">Promessi Sposi App</h1>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-modern-blue">
                Scopri I Promessi Sposi
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Un'esperienza gamificata e interattiva per esplorare il capolavoro di Alessandro Manzoni.
                Completa capitoli, risolvi quiz e esplora il glossario!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center py-4">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-modern-blue">38</div>
                <div className="text-sm text-gray-600">Capitoli</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-accent-blue">100+</div>
                <div className="text-sm text-gray-600">Quiz</div>
              </div>
            </div>

            <Button 
              className="w-full bg-modern-blue hover:bg-deep-blue text-white font-semibold py-3"
              onClick={() => window.location.href = "/api/login"}
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              Inizia il Viaggio
            </Button>

            <div className="text-xs text-gray-500 mt-4">
              Gratuito • Interattivo • Per tutti i livelli
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
