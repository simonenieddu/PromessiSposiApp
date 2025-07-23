import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "wouter";
import type { Chapter, UserChapterProgress } from "@shared/schema";

interface ChapterGridProps {
  chapters: Chapter[];
  userProgress: UserChapterProgress[];
}

export default function ChapterGrid({ chapters, userProgress }: ChapterGridProps) {
  const getChapterStatus = (chapter: Chapter) => {
    const progress = userProgress.find(p => p.chapterId === chapter.id);
    
    if (progress?.isCompleted) {
      return 'completed';
    }
    
    // A chapter is unlocked if it's chapter 1 or if the previous chapter is completed
    if (chapter.number === 1) {
      return 'current';
    }
    
    const previousChapter = chapters.find(c => c.number === chapter.number - 1);
    if (previousChapter) {
      const previousProgress = userProgress.find(p => p.chapterId === previousChapter.id);
      if (previousProgress?.isCompleted) {
        return 'current';
      }
    }
    
    return 'locked';
  };

  const getChapterIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'fas fa-check-circle';
      case 'current':
        return 'fas fa-play';
      case 'locked':
      default:
        return 'fas fa-lock';
    }
  };

  const getChapterStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-mint text-white hover:scale-105 cursor-pointer';
      case 'current':
        return 'bg-renaissance-brown text-white border-2 border-goldenrod animate-pulse cursor-pointer hover:scale-105';
      case 'locked':
      default:
        return 'bg-gray-200 text-gray-400 cursor-not-allowed';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-xl font-display font-semibold text-deep-blue mb-6">Tutti i Capitoli</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {chapters.map((chapter) => {
            const status = getChapterStatus(chapter);
            const isInteractive = status !== 'locked';
            
            const ChapterButton = (
              <div className={`relative group`}>
                <div 
                  className={`rounded-lg p-4 text-center transition-transform ${getChapterStyles(status)}`}
                >
                  <div className="text-lg font-bold mb-1">{chapter.number}</div>
                  <i className={`${getChapterIcon(status)} text-sm`}></i>
                </div>
                
                {isInteractive && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute inset-0" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">{chapter.title}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            );

            return isInteractive ? (
              <Link key={chapter.id} href={`/chapter/${chapter.id}`}>
                {ChapterButton}
              </Link>
            ) : (
              <div key={chapter.id}>
                {ChapterButton}
              </div>
            );
          })}
          
          {/* Fill remaining slots if less than 38 chapters */}
          {Array.from({ length: Math.max(0, 38 - chapters.length) }, (_, index) => (
            <div key={`empty-${index}`} className="relative group">
              <div className="bg-gray-200 text-gray-400 rounded-lg p-4 text-center cursor-not-allowed">
                <div className="text-lg font-bold mb-1">{chapters.length + index + 1}</div>
                <i className="fas fa-lock text-sm"></i>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
