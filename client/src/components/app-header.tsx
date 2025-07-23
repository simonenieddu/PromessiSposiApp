import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
  actions?: React.ReactNode;
}

export default function AppHeader({ 
  title = "Promessi Sposi App", 
  showBackButton = false, 
  backUrl = "/",
  actions 
}: AppHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Link href={backUrl}>
                <Button variant="ghost" size="sm" className="mr-2">
                  <i className="fas fa-arrow-left text-modern-blue"></i>
                </Button>
              </Link>
            )}
            <div className="flex items-center space-x-2">
              <i className="fas fa-book-open text-2xl text-modern-blue"></i>
              <h1 className="text-xl font-semibold text-modern-blue">{title}</h1>
            </div>
            <nav className="hidden md:flex space-x-6 ml-8">
              <Link href="/" className="text-modern-blue hover:text-accent-blue font-medium">
                Dashboard
              </Link>
              <Link href="/glossary" className="text-gray-600 hover:text-accent-blue font-medium">
                Glossario
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                {user.streak > 0 && (
                  <div className="hidden sm:flex items-center space-x-2 bg-accent-blue bg-opacity-10 px-3 py-1 rounded-full">
                    <i className="fas fa-fire text-accent-blue"></i>
                    <span className="text-sm font-semibold text-accent-blue">{user.streak} giorni</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-gray-900">
                      {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email?.split('@')[0]}
                    </div>
                    <div className="text-xs text-gray-500">
                      Livello {user.level} • {user.xp} XP
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-accent-blue bg-opacity-10 px-2 py-1 rounded">
                      <i className="fas fa-coins text-accent-blue text-sm"></i>
                      <span className="text-sm font-semibold text-accent-blue">{user.coins}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
            {actions}
            <a href="/api/logout">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                <i className="fas fa-sign-out-alt"></i>
              </Button>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}