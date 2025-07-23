import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Quiz, QuizQuestion } from "@shared/schema";

interface QuizModalProps {
  quiz: Quiz | null;
  questions: QuizQuestion[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (answers: Record<number, string>) => void;
}

export default function QuizModal({ quiz, questions, isOpen, onClose, onSubmit }: QuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  if (!quiz || questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerChange = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onSubmit(answers);
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleClose = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-deep-blue">
            {quiz.title}
          </DialogTitle>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Domanda {currentQuestionIndex + 1} di {questions.length}</span>
              <span>{quiz.xpReward} XP possibili</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>
        
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-deep-blue mb-4">
              {currentQuestion.question}
            </h4>
            
            {currentQuestion.type === 'multiple_choice' && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={handleAnswerChange}
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
                onValueChange={handleAnswerChange}
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
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Indietro
            </Button>
            <Button 
              className="bg-renaissance-brown hover:bg-renaissance-brown/90"
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
            >
              {currentQuestionIndex === questions.length - 1 ? "Conferma Risposta" : "Avanti"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
