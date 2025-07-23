import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChapterGrid from "@/components/chapter-grid";
import UserStats from "@/components/user-stats";
import DailyChallenge from "@/components/daily-challenge";
import BottomNavigation from "@/components/bottom-navigation";
import AppHeader from "@/components/app-header";
import { Link } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const isMobile = useIsMobile();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: chapters = [] } = useQuery({
    queryKey: ["/api/chapters"],
    enabled: isAuthenticated,
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ["/api/user/progress"],
    enabled: isAuthenticated,
  });

  const { data: dailyChallenge } = useQuery({
    queryKey: ["/api/challenges/daily"],
    enabled: isAuthenticated,
  });

  const { data: weeklyChallenge } = useQuery({
    queryKey: ["/api/challenges/weekly"],
    enabled: isAuthenticated,
  });



  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader title="Dashboard" />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-modern-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento...</p>
          </div>
        </div>
        {isMobile && <BottomNavigation />}
      </div>
    );
  }

  const completedChapters = userProgress.filter(p => p.isCompleted).length;
  const currentChapterNumber = Math.min(completedChapters + 1, 38);
  const currentChapter = chapters.find(c => c.number === currentChapterNumber);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="Dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-modern-blue to-accent-blue rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0">
                <h2 className="text-2xl font-display font-bold mb-2">
                  Buongiorno, {user.firstName || "Studente"}!
                </h2>
                <p className="text-lg opacity-90">Sei pronto a continuare il viaggio con Renzo e Lucia?</p>
              </div>
              <div className="flex space-x-4">
                <div className="text-center bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-2xl font-bold">{user.xp.toLocaleString()}</div>
                  <div className="text-sm opacity-80">XP Totali</div>
                </div>
                <div className="text-center bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-2xl font-bold">{completedChapters}/38</div>
                  <div className="text-sm opacity-80">Capitoli</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Daily Challenge */}
            {dailyChallenge && <DailyChallenge challenge={dailyChallenge} />}

            {/* Current Chapter */}
            {currentChapter && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-display font-semibold text-deep-blue mb-4">Capitolo Corrente</h3>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      <img 
                        src="https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                        alt={currentChapter.title}
                        className="w-full h-48 object-cover rounded-lg shadow-md" 
                      />
                    </div>
                    <div className="md:w-2/3">
                      <div className="flex items-center mb-2">
                        <Badge className="bg-renaissance-brown text-white mr-3">
                          Capitolo {currentChapter.number}
                        </Badge>
                        <span className="text-gray-500 text-sm">
                          Tempo di lettura: {currentChapter.readingTime} min
                        </span>
                      </div>
                      <h4 className="text-lg font-display font-semibold text-deep-blue mb-3">
                        {currentChapter.title}
                      </h4>
                      <p className="text-gray-600 mb-4">
                        {currentChapter.summary || "Continua la tua avventura letteraria..."}
                      </p>
                      
                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progresso</span>
                          <span>0%</span>
                        </div>
                        <Progress value={0} className="h-2" />
                      </div>
                      
                      <div className="flex space-x-3">
                        <Link href={`/chapter/${currentChapter.id}`}>
                          <Button className="bg-modern-blue hover:bg-deep-blue text-white">
                            Continua a Leggere
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chapter Grid */}
            <ChapterGrid chapters={chapters} userProgress={userProgress} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            <UserStats user={user} completedChapters={completedChapters} />

            {/* Glossary Preview */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-modern-blue">Glossario Parole</h3>
                  <Link href="/glossary">
                    <Button variant="link" className="text-sm text-accent-blue p-0">
                      Vedi tutto
                    </Button>
                  </Link>
                </div>
                
                <div className="space-y-3">
                  <div className="text-center py-8">
                    <i className="fas fa-book text-4xl text-modern-blue mb-3"></i>
                    <p className="text-gray-600 text-sm">Esplora il glossario</p>
                    <p className="text-gray-500 text-xs mt-1">Scopri le parole difficili dei Promessi Sposi</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Challenge */}
            {weeklyChallenge && (
              <div className="bg-gradient-to-br from-modern-blue to-deep-blue text-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-display font-semibold flex items-center">
                    <i className="fas fa-calendar-week mr-2"></i>
                    Sfida Settimanale
                  </h3>
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
                    3 giorni rimasti
                  </span>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">{weeklyChallenge.title}</h4>
                  <p className="text-sm opacity-90 mb-3">{weeklyChallenge.description}</p>
                  <div className="bg-white bg-opacity-20 rounded-full h-2 mb-2">
                    <div className="bg-white h-2 rounded-full transition-all duration-300" style={{width: "60%"}}></div>
                  </div>
                  <div className="text-sm opacity-80">9/15 completati</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="opacity-80">Ricompensa:</span>
                    <span className="font-semibold ml-1">{weeklyChallenge.xpReward} XP + Badge Speciale</span>
                  </div>
                  <Button className="bg-white text-modern-blue hover:bg-gray-100">
                    Partecipa
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Navigation for mobile */}
      {isMobile && <BottomNavigation />}
    </div>
  );
}
