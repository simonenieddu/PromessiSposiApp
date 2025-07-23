import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import AppHeader from "@/components/app-header";
import { useIsMobile } from "@/hooks/use-mobile";
import BottomNavigation from "@/components/bottom-navigation";
import type { QuizQuestion } from "@shared/schema";

export default function Quiz() {
  const [, params] = useRoute("/quiz/:id");
  const chapterId = parseInt(params?.id || "1");
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

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

  const { data: quizzes = [] } = useQuery({
    queryKey: ["/api/chapters", chapterId, "quizzes"],
    enabled: isAuthenticated && !!chapterId,
  });

  const quiz = quizzes[0]; // Get the first quiz for the chapter

  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ["/api/quizzes", quiz?.id, "questions"],
    enabled: isAuthenticated && !!quiz?.id,
  });

  const submitQuizMutation = useMutation({
    mutationFn: async (attemptData: {
      score: number;
      totalQuestions: number;
      correctAnswers: number;
      xpEarned: number;
    }) => {
      return await apiRequest("POST", `/api/quizzes/${quiz.id}/attempt`, attemptData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Quiz Completato!",
        description: `Hai guadagnato ${calculateXP()} XP`,
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
        description: "Impossibile salvare i risultati del quiz",
        variant: "destructive",
      });
    },
  });

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((question: QuizQuestion) => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  };

  const calculateXP = () => {
    const correctAnswers = calculateScore();
    const percentage = (correctAnswers / questions.length) * 100;
    return Math.round((quiz?.xpReward || 50) * (percentage / 100));
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit quiz
      const correctAnswers = calculateScore();
      const finalScore = Math.round((correctAnswers / questions.length) * 100);
      const xpEarned = calculateXP();
      
      setScore(finalScore);
      setQuizCompleted(true);
      
      submitQuizMutation.mutate({
        score: finalScore,
        totalQuestions: questions.length,
        correctAnswers,
        xpEarned,
      });
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (isLoading || questionsLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader title="Quiz" showBackButton={true} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-modern-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento quiz...</p>
          </div>
        </div>
        {isMobile && <BottomNavigation />}
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader title="Quiz" showBackButton={true} />
        <div className="flex items-center justify-center h-96 p-4">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <h1 className="text-xl font-bold text-gray-900 mb-4">Quiz non disponibile</h1>
              <p className="text-gray-600 mb-4">Non ci sono quiz disponibili per questo capitolo.</p>
              <Link href="/">
                <Button className="bg-modern-blue hover:bg-deep-blue text-white">Torna alla Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        {isMobile && <BottomNavigation />}
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader title="Quiz Completato" showBackButton={true} />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-semibold text-modern-blue">Quiz Completato!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="space-y-4">
                <div className="text-6xl font-bold text-modern-blue">{score}%</div>
                <div className="text-lg text-gray-600">
                  {calculateScore()} su {questions.length} risposte corrette
                </div>
                <div className="bg-accent-blue bg-opacity-10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-accent-blue">+{calculateXP()} XP</div>
                  <div className="text-sm text-gray-600">Esperienza guadagnata</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link href="/">
                  <Button className="w-full bg-modern-blue hover:bg-deep-blue text-white">
                    Torna alla Dashboard
                  </Button>
                </Link>
                <Link href={`/chapter/${chapterId}`}>
                  <Button variant="outline" className="w-full border-modern-blue text-modern-blue hover:bg-modern-blue hover:text-white">
                    Rileggi il Capitolo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        {isMobile && <BottomNavigation />}
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title={quiz.title} showBackButton={true} />
      <div className="max-w-4xl mx-auto p-4">
        {/* Quiz Progress */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Domanda {currentQuestionIndex + 1} di {questions.length}</span>
              <span>{quiz.xpReward} XP possibili</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
        </Card>

        {/* Question Card */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-modern-blue mb-4">
                {currentQuestion.question}
              </h4>
              
              {currentQuestion.type === 'multiple_choice' && (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  className="space-y-3"
                >
                  {(currentQuestion.options as string[])?.map((option, index) => (
                    <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <RadioGroupItem value={option} id={`option-${index}`} className="mr-3" />
                      <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === 'true_false' && (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  className="space-y-3"
                >
                  <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="true" id="true" className="mr-3" />
                    <Label htmlFor="true" className="cursor-pointer flex-1">Vero</Label>
                  </div>
                  <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="false" id="false" className="mr-3" />
                    <Label htmlFor="false" className="cursor-pointer flex-1">Falso</Label>
                  </div>
                </RadioGroup>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="border-modern-blue text-modern-blue hover:bg-modern-blue hover:text-white"
              >
                Indietro
              </Button>
              <Button 
                className="bg-modern-blue hover:bg-deep-blue text-white"
                onClick={handleNextQuestion}
                disabled={!answers[currentQuestion.id]}
              >
                {currentQuestionIndex === questions.length - 1 ? "Completa Quiz" : "Avanti"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {isMobile && <BottomNavigation />}
    </div>
  );
}
