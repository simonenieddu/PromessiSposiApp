import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { DailyChallenge } from "@shared/schema";

interface DailyChallengeProps {
  challenge: DailyChallenge;
}

export default function DailyChallenge({ challenge }: DailyChallengeProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: challengeProgress } = useQuery({
    queryKey: ["/api/user/challenges/daily", challenge.id],
    enabled: !!challenge.id,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (progress: number) => {
      return await apiRequest("POST", `/api/challenges/daily/${challenge.id}/progress`, { progress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/challenges/daily", challenge.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Progresso aggiornato!",
        description: "Continua così per completare la sfida",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il progresso",
        variant: "destructive",
      });
    },
  });

  const progress = challengeProgress?.progress || 0;
  const isCompleted = challengeProgress?.isCompleted || false;
  const requirement = challenge.requirement as any;
  const target = requirement?.target || 3;
  const progressPercentage = (progress / target) * 100;

  // Calculate time remaining (mock for demo)
  const timeRemaining = "23h 45m rimaste";

  const handleStartChallenge = () => {
    // Mock progress increment for demo
    const newProgress = Math.min(progress + 1, target);
    updateProgressMutation.mutate(newProgress);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-display font-semibold text-deep-blue flex items-center">
            <i className="fas fa-trophy text-goldenrod mr-2"></i>
            Sfida Giornaliera
          </h3>
          <Badge variant="secondary" className="bg-mint bg-opacity-20 text-mint">
            {timeRemaining}
          </Badge>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-gray-700 mb-3">{challenge.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <Progress value={progressPercentage} className="h-3" />
            </div>
            <span className="text-sm font-semibold text-gray-600">
              {progress}/{target}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Ricompensa:</span> {challenge.xpReward} XP
            {challenge.coinReward > 0 && ` + ${challenge.coinReward} monete`}
          </div>
          
          {!isCompleted ? (
            <Button 
              className="bg-mint hover:bg-mint/90 text-white"
              onClick={handleStartChallenge}
              disabled={updateProgressMutation.isPending}
            >
              {updateProgressMutation.isPending ? "Aggiornamento..." : "Inizia Sfida"}
            </Button>
          ) : (
            <Badge className="bg-green-500 text-white">
              <i className="fas fa-check mr-1"></i>
              Completata
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
