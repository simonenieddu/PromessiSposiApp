import { Link, useLocation } from "wouter";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: "fas fa-home", label: "Home" },
    { path: "/glossary", icon: "fas fa-book", label: "Glossario" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="grid grid-cols-2 h-16">
        {navItems.map((item) => {
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <div className={`flex flex-col items-center justify-center h-full transition-colors ${
                isActive ? 'text-renaissance-brown' : 'text-gray-400'
              }`}>
                <i className={`${item.icon} text-lg`}></i>
                <span className="text-xs mt-1">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
