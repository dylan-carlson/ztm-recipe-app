import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/Home";
import Details from "@/pages/Details";
import Favorites from "@/pages/Favorites";
import { Utensils } from "lucide-react";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="recipes-theme">
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-background font-sans">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center justify-between mx-auto px-4">
                <div className="flex items-center gap-4">
                  <Link to="/" className="flex items-center space-x-2">
                    <Utensils className="h-6 w-6 text-primary" />
                    <span className="font-bold hidden sm:inline-block">Recipes</span>
                  </Link>
                  <nav className="flex items-center space-x-4 ml-4">
                    <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
                      Home
                    </Link>
                    <Link to="/favorites" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                      Favorites
                    </Link>
                  </nav>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                </div>
              </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/meal/:id" element={<Details />} />
                <Route path="/favorites" element={<Favorites />} />
              </Routes>
            </main>
          </div>
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
