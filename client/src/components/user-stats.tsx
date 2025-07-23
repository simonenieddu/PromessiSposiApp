import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface UserStatsProps {
  user: User;
  completedChapters: number;
}

export default function UserStats({ user, completedChapters }: UserStatsProps) {
  const { data: userBadges = [] } = useQuery({
    queryKey: ["/api/user/badges"],
    enabled: !!user,
  });

  const xpToNextLevel = 1000 - (user.xp % 1000);
  const levelProgress = ((user.xp % 1000) / 1000) * 100;

  // Mock recent badges for display
  const recentBadges = [
    { icon: "fas fa-star", name: "Quiz Master", color: "from-goldenrod to-yellow-500" },
    { icon: "fas fa-fire", name: `Streak ${user.streak}`, color: "from-crimson to-red-600" },
    { icon: "fas fa-book", name: "Lettore", color: "from-mint to-teal-500" },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-display font-semibold text-deep-blue mb-4">I Tuoi Progressi</h3>
        
        {/* Level Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600">Livello {user.level}</span>
            <span className="text-sm text-gray-500">{user.xp.toLocaleString()} / {(user.level * 1000).toLocaleString()} XP</span>
          </div>
          <Progress value={levelProgress} className="h-3" />
          <p className="text-xs text-gray-500 mt-1">{xpToNextLevel} XP al prossimo livello</p>
        </div>

        {/* Recent Badges */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Ultimi Badge Ottenuti</h4>
          <div className="grid grid-cols-3 gap-2">
            {recentBadges.map((badge, index) => (
              <div key={index} className="text-center group">
                <div className={`w-12 h-12 bg-gradient-to-br ${badge.color} rounded-full flex items-center justify-center mb-1 mx-auto`}>
                  <i className={`${badge.icon} text-white text-lg`}></i>
                </div>
                <span className="text-xs text-gray-600 group-hover:text-deep-blue transition-colors">
                  {badge.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-deep-blue">{completedChapters}</div>
            <div className="text-xs text-gray-600">Capitoli</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-deep-blue">{user.streak}</div>
            <div className="text-xs text-gray-600">Streak</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
