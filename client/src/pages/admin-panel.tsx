import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { BookOpen, Type, HelpCircle, Trophy, Plus, Edit, Trash2, LogOut, Settings } from "lucide-react";

// Schemas
const chapterSchema = z.object({
  number: z.number().min(1),
  title: z.string().min(1, "Titolo richiesto"),
  content: z.string().min(1, "Contenuto richiesto"),
  summary: z.string().optional(),
  readingTime: z.number().min(1).default(10),
  imageUrl: z.string().optional(),
  isLocked: z.boolean().default(false),
});

const glossarySchema = z.object({
  term: z.string().min(1, "Termine richiesto"),
  definition: z.string().min(1, "Definizione richiesta"),
  category: z.string().optional(),
  example: z.string().optional(),
  chapterRef: z.number().optional(),
});

const quizSchema = z.object({
  chapterId: z.number().min(1),
  title: z.string().min(1, "Titolo richiesto"),
  description: z.string().optional(),
  xpReward: z.number().min(1).default(100),
});

const challengeSchema = z.object({
  title: z.string().min(1, "Titolo richiesto"),
  description: z.string().min(1, "Descrizione richiesta"),
  type: z.enum(["daily", "weekly"]),
  xpReward: z.number().min(1).default(50),
  coinsReward: z.number().min(0).default(10),
});

type ChapterForm = z.infer<typeof chapterSchema>;
type GlossaryForm = z.infer<typeof glossarySchema>;
type QuizForm = z.infer<typeof quizSchema>;
type ChallengeForm = z.infer<typeof challengeSchema>;

export default function AdminPanel() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Dialog states
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<any>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [isGlossaryDialogOpen, setIsGlossaryDialogOpen] = useState(false);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [isChallengeDialogOpen, setIsChallengeDialogOpen] = useState(false);

  // Check admin auth
  const { data: isAdminAuth, isLoading: isAdminLoading } = useQuery({
    queryKey: ["/api/admin/auth"],
    retry: false,
  });

  useEffect(() => {
    if (!isAdminLoading && !isAdminAuth) {
      navigate("/admin-login");
    }
  }, [isAdminAuth, isAdminLoading, navigate]);

  // Data queries
  const { data: chapters = [] } = useQuery({
    queryKey: ["/api/chapters"],
    enabled: !!isAdminAuth,
  });

  const { data: glossaryTerms = [] } = useQuery({
    queryKey: ["/api/glossary"],
    enabled: !!isAdminAuth,
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ["/api/admin/quizzes"],
    enabled: !!isAdminAuth,
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ["/api/admin/challenges"],
    enabled: !!isAdminAuth,
  });

  // Forms
  const chapterForm = useForm<ChapterForm>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      number: 1,
      title: "",
      content: "",
      summary: "",
      readingTime: 10,
      imageUrl: "",
      isLocked: false,
    },
  });

  const glossaryForm = useForm<GlossaryForm>({
    resolver: zodResolver(glossarySchema),
    defaultValues: {
      term: "",
      definition: "",
      category: "",
      example: "",
    },
  });

  const quizForm = useForm<QuizForm>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      chapterId: 1,
      title: "",
      description: "",
      xpReward: 100,
    },
  });

  const challengeForm = useForm<ChallengeForm>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "daily",
      xpReward: 50,
      coinsReward: 10,
    },
  });

  // Mutations
  const createChapterMutation = useMutation({
    mutationFn: (data: ChapterForm) => apiRequest("/api/admin/chapters", "POST", data),
    onSuccess: () => {
      toast({ title: "Capitolo creato!" });
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
      setIsChapterDialogOpen(false);
      chapterForm.reset();
    },
  });

  const updateChapterMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ChapterForm }) => 
      apiRequest(`/api/admin/chapters/${id}`, "PATCH", data),
    onSuccess: () => {
      toast({ title: "Capitolo aggiornato!" });
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
      setIsChapterDialogOpen(false);
      setSelectedChapter(null);
    },
  });

  const deleteChapterMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/chapters/${id}`, "DELETE"),
    onSuccess: () => {
      toast({ title: "Capitolo eliminato!" });
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("/api/admin/logout", "POST"),
    onSuccess: () => {
      toast({ title: "Logout effettuato" });
      navigate("/admin-login");
    },
  });

  if (isAdminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-modern-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Verifica autenticazione...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuth) {
    return null; // Redirect happens in useEffect
  }

  const onChapterSubmit = (data: ChapterForm) => {
    if (selectedChapter) {
      updateChapterMutation.mutate({ id: selectedChapter.id, data });
    } else {
      createChapterMutation.mutate(data);
    }
  };

  const editChapter = (chapter: any) => {
    setSelectedChapter(chapter);
    chapterForm.reset({
      number: chapter.number,
      title: chapter.title,
      content: chapter.content,
      summary: chapter.summary || "",
      readingTime: chapter.readingTime,
      imageUrl: chapter.imageUrl || "",
      isLocked: chapter.isLocked,
    });
    setIsChapterDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 text-modern-blue" />
              <h1 className="text-xl font-semibold text-modern-blue">Pannello Amministratore</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="chapters" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chapters" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Capitoli
            </TabsTrigger>
            <TabsTrigger value="glossary" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Glossario
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Quiz
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Sfide
            </TabsTrigger>
          </TabsList>

          {/* Chapters Tab */}
          <TabsContent value="chapters" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-modern-blue">Gestione Capitoli</h2>
              <Dialog open={isChapterDialogOpen} onOpenChange={setIsChapterDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-modern-blue hover:bg-deep-blue text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuovo Capitolo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedChapter ? "Modifica Capitolo" : "Nuovo Capitolo"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...chapterForm}>
                    <form onSubmit={chapterForm.handleSubmit(onChapterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={chapterForm.control}
                          name="number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Numero Capitolo</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={chapterForm.control}
                          name="readingTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tempo di lettura (min)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={chapterForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Titolo</FormLabel>
                            <FormControl>
                              <Input placeholder="Titolo del capitolo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={chapterForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contenuto</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Contenuto del capitolo..." 
                                className="min-h-[200px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={chapterForm.control}
                        name="summary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Riassunto (opzionale)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Breve riassunto del capitolo..." 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={chapterForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL Immagine (opzionale)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={chapterForm.control}
                        name="isLocked"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Capitolo bloccato</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsChapterDialogOpen(false);
                            setSelectedChapter(null);
                          }}
                        >
                          Annulla
                        </Button>
                        <Button 
                          type="submit"
                          className="bg-modern-blue hover:bg-deep-blue text-white"
                          disabled={createChapterMutation.isPending || updateChapterMutation.isPending}
                        >
                          {selectedChapter ? "Aggiorna" : "Crea"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {(chapters as any[]).map((chapter: any) => (
                <Card key={chapter.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-modern-blue">Capitolo {chapter.number}</span>
                          {chapter.isLocked && <Badge variant="secondary">Bloccato</Badge>}
                        </CardTitle>
                        <h3 className="text-lg font-medium mt-1">{chapter.title}</h3>
                        <p className="text-sm text-gray-600 mt-2">{chapter.summary}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Tempo lettura: {chapter.readingTime} min</span>
                          <span>Caratteri: {chapter.content?.length || 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => editChapter(chapter)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteChapterMutation.mutate(chapter.id)}
                          disabled={deleteChapterMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Other tabs would go here */}
          <TabsContent value="glossary" className="space-y-4">
            <div className="text-center py-12">
              <Type className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gestione Glossario</h3>
              <p className="text-gray-600">Funzionalità in sviluppo</p>
            </div>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-4">
            <div className="text-center py-12">
              <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gestione Quiz</h3>
              <p className="text-gray-600">Funzionalità in sviluppo</p>
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4">
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gestione Sfide</h3>
              <p className="text-gray-600">Funzionalità in sviluppo</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}