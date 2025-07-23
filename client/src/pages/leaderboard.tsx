import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "@/components/bottom-navigation";
import AppHeader from "@/components/app-header";
import { Link } from "wouter";

export default function Leaderboard() {
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

  const { data: globalLeaderboard = [] } = useQuery({
    queryKey: ["/api/leaderboard"],
    enabled: isAuthenticated,
  });

  const { data: friendsLeaderboard = [] } = useQuery({
    queryKey: ["/api/leaderboard/friends"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader title="Classifica" showBackButton={true} />
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

  const renderLeaderboardItem = (userItem: any, index: number, isCurrentUser: boolean = false) => {
    const rankColors = ["bg-accent-blue", "bg-gray-400", "bg-modern-blue"];
    const rankColor = index < 3 ? rankColors[index] : "bg-gray-300";

    return (
      <div 
        key={userItem.id}
        className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
          isCurrentUser ? 'bg-modern-blue bg-opacity-10 border border-modern-blue' : 'bg-white border border-gray-200'
        }`}
      >
        <div className="flex items-center space-x-4">
          <div className={`w-10 h-10 ${rankColor} text-white rounded-full flex items-center justify-center font-bold`}>
            {index + 1}
          </div>
          <Avatar className="w-12 h-12">
            <AvatarImage src={userItem.profileImageUrl || ""} />
            <AvatarFallback className="bg-modern-blue text-white">
              {(userItem.firstName?.[0] || "S").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-modern-blue flex items-center space-x-2">
              <span>{isCurrentUser ? `Tu (${userItem.firstName || "Studente"})` : (userItem.firstName || "Studente")}</span>
              {isCurrentUser && <Badge variant="outline" className="text-xs">Tu</Badge>}
            </div>
            <div className="text-sm text-gray-600">Livello {userItem.level}</div>
            {userItem.streak > 0 && (
              <div className="flex items-center space-x-1 text-xs text-warm-orange">
                <i className="fas fa-fire"></i>
                <span>{userItem.streak} giorni</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-modern-blue text-lg">
            {userItem.xp.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">XP</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="Classifica" showBackButton={true} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="friends">Amici</TabsTrigger>
            <TabsTrigger value="global">Globale</TabsTrigger>
          </TabsList>
          
          <TabsContent value="friends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-users text-modern-blue"></i>
                  <span>Classifica Amici</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {friendsLeaderboard.length > 0 ? (
                  <div className="space-y-4">
                    {friendsLeaderboard.map((friend, index) => 
                      renderLeaderboardItem(friend, index, friend.id === user.id)
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-user-friends text-4xl text-gray-300 mb-4"></i>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Nessun amico aggiunto
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Aggiungi degli amici per competere nelle classifiche!
                    </p>
                    <Button className="bg-modern-blue hover:bg-deep-blue text-white">
                      Trova Amici
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="global" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-globe text-modern-blue"></i>
                  <span>Classifica Globale</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {globalLeaderboard.map((userItem, index) => 
                    renderLeaderboardItem(userItem, index, userItem.id === user.id)
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User's current position */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-center">La Tua Posizione</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-modern-blue">{user.level}</div>
                  <div className="text-sm text-gray-600">Livello</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-blue">{user.xp.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">XP Totali</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-modern-blue">{user.streak}</div>
                  <div className="text-sm text-gray-600">Giorni Streak</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">Progresso al prossimo livello</div>
                <div className="bg-gray-200 rounded-full h-3 mb-1">
                  <div 
                    className="bg-gradient-to-r from-modern-blue to-accent-blue h-3 rounded-full transition-all duration-300" 
                    style={{width: `${((user.xp % 1000) / 1000) * 100}%`}}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  {1000 - (user.xp % 1000)} XP al livello {user.level + 1}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation for mobile */}
      {isMobile && <BottomNavigation />}
    </div>
  );
}
