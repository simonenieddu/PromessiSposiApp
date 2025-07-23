import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Settings, BookOpen, HelpCircle, Type, Plus, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import AppHeader from "@/components/app-header";
import BottomNavigation from "@/components/bottom-navigation";
import { useIsMobile } from "@/hooks/use-mobile";

// Form schemas
const chapterSchema = z.object({
  number: z.number().min(1),
  title: z.string().min(1, "Il titolo è obbligatorio"),
  content: z.string().min(1, "Il contenuto è obbligatorio"),
  summary: z.string().min(1, "Il riassunto è obbligatorio"),
  readingTime: z.number().min(1),
  imageUrl: z.string().url("URL immagine non valido").optional().or(z.literal("")),
  isLocked: z.boolean(),
});

const glossarySchema = z.object({
  term: z.string().min(1, "Il termine è obbligatorio"),
  definition: z.string().min(1, "La definizione è obbligatoria"),
  category: z.string().optional(),
  example: z.string().optional(),
  chapterRef: z.number().optional(),
});

const quizSchema = z.object({
  chapterId: z.number().min(1),
  title: z.string().min(1, "Il titolo è obbligatorio"),
  description: z.string().min(1, "La descrizione è obbligatoria"),
  xpReward: z.number().min(1),
});

type ChapterForm = z.infer<typeof chapterSchema>;
type GlossaryForm = z.infer<typeof glossarySchema>;
type QuizForm = z.infer<typeof quizSchema>;

export default function Admin() {
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<any>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [isGlossaryDialogOpen, setIsGlossaryDialogOpen] = useState(false);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Check if user is admin
  const { data: isAdmin, isLoading: isAdminLoading } = useQuery({
    queryKey: ["/api/admin/check"],
  });

  const { data: chapters = [] } = useQuery({
    queryKey: ["/api/chapters"],
  });

  const { data: glossaryTerms = [] } = useQuery({
    queryKey: ["/api/glossary"],
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ["/api/admin/quizzes"],
  });

  // Chapter form
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

  // Glossary form
  const glossaryForm = useForm<GlossaryForm>({
    resolver: zodResolver(glossarySchema),
    defaultValues: {
      term: "",
      definition: "",
      category: "",
      example: "",
    },
  });

  // Quiz form
  const quizForm = useForm<QuizForm>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      chapterId: 1,
      title: "",
      description: "",
      xpReward: 100,
    },
  });

  // Mutations
  const createChapterMutation = useMutation({
    mutationFn: (data: ChapterForm) => apiRequest("/api/admin/chapters", "POST", data),
    onSuccess: () => {
      toast({ title: "Capitolo creato con successo!" });
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
      setIsChapterDialogOpen(false);
      chapterForm.reset();
    },
    onError: () => {
      toast({ title: "Errore nella creazione del capitolo", variant: "destructive" });
    },
  });

  const updateChapterMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ChapterForm> }) =>
      apiRequest(`/api/admin/chapters/${id}`, "PATCH", data),
    onSuccess: () => {
      toast({ title: "Capitolo aggiornato con successo!" });
      queryClient.invalidateQueries({ queryKey: ["/api/chapters"] });
      setIsChapterDialogOpen(false);
      setSelectedChapter(null);
    },
    onError: () => {
      toast({ title: "Errore nell'aggiornamento del capitolo", variant: "destructive" });
    },
  });

  const createGlossaryMutation = useMutation({
    mutationFn: (data: GlossaryForm) => apiRequest("/api/admin/glossary", "POST", data),
    onSuccess: () => {
      toast({ title: "Termine aggiunto al glossario!" });
      queryClient.invalidateQueries({ queryKey: ["/api/glossary"] });
      setIsGlossaryDialogOpen(false);
      glossaryForm.reset();
    },
    onError: () => {
      toast({ title: "Errore nell'aggiunta del termine", variant: "destructive" });
    },
  });

  const updateGlossaryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GlossaryForm> }) =>
      apiRequest(`/api/admin/glossary/${id}`, "PATCH", data),
    onSuccess: () => {
      toast({ title: "Termine aggiornato con successo!" });
      queryClient.invalidateQueries({ queryKey: ["/api/glossary"] });
      setIsGlossaryDialogOpen(false);
      setSelectedGlossaryTerm(null);
    },
    onError: () => {
      toast({ title: "Errore nell'aggiornamento del termine", variant: "destructive" });
    },
  });

  const deleteGlossaryMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/glossary/${id}`, "DELETE"),
    onSuccess: () => {
      toast({ title: "Termine eliminato!" });
      queryClient.invalidateQueries({ queryKey: ["/api/glossary"] });
    },
    onError: () => {
      toast({ title: "Errore nell'eliminazione del termine", variant: "destructive" });
    },
  });

  // Handle form submissions
  const onChapterSubmit = (data: ChapterForm) => {
    if (selectedChapter) {
      updateChapterMutation.mutate({ id: selectedChapter.id, data });
    } else {
      createChapterMutation.mutate(data);
    }
  };

  const onGlossarySubmit = (data: GlossaryForm) => {
    if (selectedGlossaryTerm) {
      updateGlossaryMutation.mutate({ id: selectedGlossaryTerm.id, data });
    } else {
      createGlossaryMutation.mutate(data);
    }
  };

  // Edit functions
  const editChapter = (chapter: any) => {
    setSelectedChapter(chapter);
    chapterForm.reset({
      number: chapter.number,
      title: chapter.title,
      content: chapter.content,
      summary: chapter.summary,
      readingTime: chapter.readingTime,
      imageUrl: chapter.imageUrl || "",
      isLocked: chapter.isLocked,
    });
    setIsChapterDialogOpen(true);
  };

  const editGlossaryTerm = (term: any) => {
    setSelectedGlossaryTerm(term);
    glossaryForm.reset({
      term: term.term,
      definition: term.definition,
      category: term.category || "",
      example: term.example || "",
      chapterRef: term.chapterRef || undefined,
    });
    setIsGlossaryDialogOpen(true);
  };

  if (isAdminLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader title="Pannello Admin" showBackButton={true} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-modern-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Verifica permessi admin...</p>
          </div>
        </div>
        {isMobile && <BottomNavigation />}
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader title="Pannello Admin" showBackButton={true} />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
          <Card className="max-w-md">
            <CardContent className="text-center py-12">
              <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-modern-blue mb-2">Accesso Negato</h2>
              <p className="text-gray-600">
                Non hai i permessi per accedere al pannello di amministrazione.
              </p>
            </CardContent>
          </Card>
        </div>
        {isMobile && <BottomNavigation />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="Pannello Admin" showBackButton={true} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-modern-blue mb-2">
            Pannello Amministrazione
          </h1>
          <p className="text-gray-600">
            Gestisci capitoli, quiz e glossario dell'app
          </p>
        </div>

        <Tabs defaultValue="chapters" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
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
          </TabsList>

          {/* Chapters Tab */}
          <TabsContent value="chapters" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestione Capitoli</h2>
              <Dialog open={isChapterDialogOpen} onOpenChange={setIsChapterDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setSelectedChapter(null); chapterForm.reset(); }}>
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
                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
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
                              <FormLabel>Tempo di Lettura (min)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
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
                              <Input {...field} />
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
                            <FormLabel>Riassunto</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={3} />
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
                            <FormLabel>Contenuto (HTML)</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={8} />
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
                            <FormLabel>URL Immagine</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsChapterDialogOpen(false)}
                        >
                          Annulla
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createChapterMutation.isPending || updateChapterMutation.isPending}
                        >
                          {selectedChapter ? "Aggiorna" : "Crea"} Capitolo
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {chapters.map((chapter: any) => (
                <Card key={chapter.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Capitolo {chapter.number}: {chapter.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{chapter.summary}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editChapter(chapter)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Glossary Tab */}
          <TabsContent value="glossary" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestione Glossario</h2>
              <Dialog open={isGlossaryDialogOpen} onOpenChange={setIsGlossaryDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setSelectedGlossaryTerm(null); glossaryForm.reset(); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuovo Termine
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {selectedGlossaryTerm ? "Modifica Termine" : "Nuovo Termine"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...glossaryForm}>
                    <form onSubmit={glossaryForm.handleSubmit(onGlossarySubmit)} className="space-y-4">
                      <FormField
                        control={glossaryForm.control}
                        name="term"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Termine</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={glossaryForm.control}
                        name="definition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Definizione</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={3} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={glossaryForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Categoria</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleziona categoria" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="personaggi">Personaggi</SelectItem>
                                  <SelectItem value="luoghi">Luoghi</SelectItem>
                                  <SelectItem value="oggetti">Oggetti</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={glossaryForm.control}
                          name="chapterRef"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Capitolo di Riferimento</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={glossaryForm.control}
                        name="example"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Esempio dal Testo</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={2} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsGlossaryDialogOpen(false)}
                        >
                          Annulla
                        </Button>
                        <Button type="submit" disabled={createGlossaryMutation.isPending || updateGlossaryMutation.isPending}>
                          {selectedGlossaryTerm ? "Aggiorna" : "Crea"} Termine
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {glossaryTerms.map((term: any) => (
                <Card key={term.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{term.term}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{term.definition}</p>
                      {term.category && (
                        <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                          {term.category}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editGlossaryTerm(term)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteGlossaryMutation.mutate(term.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestione Quiz</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Quiz
              </Button>
            </div>
            
            <div className="text-center py-12">
              <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gestione Quiz</h3>
              <p className="text-muted-foreground">
                La gestione dei quiz sarà implementata nelle prossime versioni.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {isMobile && <BottomNavigation />}
    </div>
  );
}