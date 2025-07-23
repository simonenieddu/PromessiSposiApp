import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "Username richiesto"),
  password: z.string().min(1, "Password richiesta"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => apiRequest("/api/admin/login", "POST", data),
    onSuccess: () => {
      toast({
        title: "Accesso effettuato",
        description: "Benvenuto nel pannello amministrativo",
      });
      navigate("/admin-panel");
    },
    onError: (error: any) => {
      toast({
        title: "Errore di accesso",
        description: error.message || "Credenziali non valide",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-modern-blue">
            Accesso Amministratore
          </CardTitle>
          <p className="text-gray-600">
            Inserisci le tue credenziali per accedere al pannello admin
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Inserisci username" 
                        {...field}
                        disabled={loginMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="Inserisci password" 
                        {...field}
                        disabled={loginMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-modern-blue hover:bg-deep-blue text-white"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Accesso in corso..." : "Accedi"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}