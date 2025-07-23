import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, Users, MapPin, Zap } from "lucide-react";
import AppHeader from "@/components/app-header";
import BottomNavigation from "@/components/bottom-navigation";
import { useIsMobile } from "@/hooks/use-mobile";

interface GlossaryTerm {
  id: number;
  term: string;
  definition: string;
  category: string | null;
  example: string | null;
  chapterRef: number | null;
}

export default function Glossary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const isMobile = useIsMobile();

  const { data: terms = [], isLoading } = useQuery({
    queryKey: ["/api/glossary"],
  });

  const filteredTerms = terms.filter((term: GlossaryTerm) => {
    const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: "all", label: "Tutti", icon: BookOpen },
    { value: "personaggi", label: "Personaggi", icon: Users },
    { value: "luoghi", label: "Luoghi", icon: MapPin },
    { value: "oggetti", label: "Oggetti", icon: Zap },
  ];

  const getCategoryIcon = (category: string | null) => {
    switch (category) {
      case "personaggi":
        return <Users className="h-4 w-4" />;
      case "luoghi":
        return <MapPin className="h-4 w-4" />;
      case "oggetti":
        return <Zap className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case "personaggi":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "luoghi":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "oggetti":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader title="Glossario" showBackButton={true} />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
            <div className="grid gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        {isMobile && <BottomNavigation />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="Glossario" showBackButton={true} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-modern-blue mb-2">
            Glossario
          </h1>
          <p className="text-gray-600">
            Scopri i significati delle parole e dei termini più difficili de "I Promessi Sposi"
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cerca termini, definizioni..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            {categories.map((category) => (
              <TabsTrigger
                key={category.value}
                value={category.value}
                className="flex items-center gap-2"
              >
                <category.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Terms Grid */}
        <div className="space-y-4">
          {filteredTerms.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  Nessun termine trovato
                </h3>
                <p className="text-sm text-muted-foreground">
                  Prova a modificare i criteri di ricerca o seleziona una categoria diversa.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTerms.map((term: GlossaryTerm) => (
              <Card key={term.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl font-heading text-primary">
                      {term.term}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {term.category && (
                        <Badge
                          variant="secondary"
                          className={`flex items-center gap-1 ${getCategoryColor(term.category)}`}
                        >
                          {getCategoryIcon(term.category)}
                          <span className="capitalize">{term.category}</span>
                        </Badge>
                      )}
                      {term.chapterRef && (
                        <Badge variant="outline">
                          Cap. {term.chapterRef}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground mb-3 leading-relaxed">
                    {term.definition}
                  </p>
                  {term.example && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Esempio dal testo:
                      </p>
                      <p className="text-sm italic text-foreground">
                        "{term.example}"
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {filteredTerms.length} {filteredTerms.length === 1 ? 'termine trovato' : 'termini trovati'}
            {searchQuery || selectedCategory !== "all" ? ` • ${terms.length} termini totali` : ''}
          </p>
        </div>
      </div>
      {isMobile && <BottomNavigation />}
    </div>
  );
}