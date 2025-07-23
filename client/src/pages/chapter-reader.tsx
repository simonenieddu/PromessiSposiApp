import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function ChapterReader() {
  const [, params] = useRoute("/chapter/:id");
  const chapterId = parseInt(params?.id || "1");
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

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

  const { data: chapter, isLoading: chapterLoading } = useQuery({
    queryKey: ["/api/chapters", chapterId],
    enabled: isAuthenticated && !!chapterId,
  });

  const { data: userProgress } = useQuery({
    queryKey: ["/api/user/progress"],
    enabled: isAuthenticated,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (progressData: { progressPercentage: number; isCompleted?: boolean }) => {
      return await apiRequest("POST", `/api/chapters/${chapterId}/progress`, progressData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Errore",
        description: "Impossibile salvare il progresso",
        variant: "destructive",
      });
    },
  });

  const markAsCompletedMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/chapters/${chapterId}/progress`, {
        progressPercentage: 100,
        isCompleted: true,
        completedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Capitolo Completato!",
        description: "Hai guadagnato 100 XP",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Errore",
        description: "Impossibile completare il capitolo",
        variant: "destructive",
      });
    },
  });

  // Simulate reading progress
  useEffect(() => {
    if (!chapter) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.body.offsetHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      if (scrollPercent !== progress) {
        setProgress(scrollPercent);
        
        // Update progress every 25%
        if (scrollPercent > 0 && scrollPercent % 25 === 0) {
          updateProgressMutation.mutate({ progressPercentage: scrollPercent });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [chapter, progress, updateProgressMutation]);

  if (isLoading || chapterLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-renaissance-brown mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento capitolo...</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Capitolo non trovato</h1>
            <Link href="/">
              <Button>Torna alla Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentChapterProgress = userProgress?.find(p => p.chapterId === chapterId);
  const isCompleted = currentChapterProgress?.isCompleted || false;

  return (
    <div className="min-h-screen bg-white">
      {/* Reader Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-50">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <i className="fas fa-arrow-left text-xl"></i>
            </Button>
          </Link>
          <div>
            <h3 className="font-display font-semibold text-deep-blue">Capitolo {chapter.number}</h3>
            <p className="text-sm text-gray-600">{chapter.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">{progress}% completato</div>
          <div className="w-24">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        {/* Chapter illustration */}
        {chapter.imageUrl && (
          <img 
            src={chapter.imageUrl}
            alt={chapter.title}
            className="w-full h-64 object-cover rounded-xl shadow-lg mb-8" 
          />
        )}
        
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-display font-bold text-deep-blue mb-6">
            Capitolo {chapter.number}: {chapter.title}
          </h1>
          
          <div 
            className="text-lg leading-relaxed text-gray-800 space-y-6"
            dangerouslySetInnerHTML={{ __html: chapter.content }}
          />
        </div>

        {/* Action buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          {!isCompleted && (
            <Button 
              className="bg-renaissance-brown hover:bg-renaissance-brown/90 text-white px-8 py-3"
              onClick={() => markAsCompletedMutation.mutate()}
              disabled={markAsCompletedMutation.isPending}
            >
              {markAsCompletedMutation.isPending ? "Completamento..." : "Completa Capitolo"}
            </Button>
          )}
          
          <Link href={`/quiz/${chapterId}`}>
            <Button variant="outline" className="px-8 py-3 w-full sm:w-auto">
              Fai il Quiz
            </Button>
          </Link>
          
          {chapter.number < 38 && (
            <Link href={`/chapter/${chapter.id + 1}`}>
              <Button variant="outline" className="px-8 py-3 w-full sm:w-auto">
                Prossimo Capitolo
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
