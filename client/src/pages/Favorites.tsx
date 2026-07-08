import { useEffect, useState } from "react";
import { Meal } from "@/lib/api";
import { getAllFavorites, removeFavorite } from "@/features/favorites/db";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HeartOff, ImageOff, WifiOff, Heart } from "lucide-react";
import { toast } from "sonner";

export default function Favorites() {
  const [favorites, setFavorites] = useState<Meal[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const loadFavorites = async () => {
    const data = await getAllFavorites();
    setFavorites(data);
  };

  useEffect(() => {
    loadFavorites();
    
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      setIsOffline(true);
      toast("You are offline", { icon: <WifiOff className="h-4 w-4" /> });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRemove = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent link click
    await removeFavorite(id);
    toast.success("Removed from favorites");
    loadFavorites();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold">Your Favorites</h1>
          <p className="text-muted-foreground">Available offline anytime.</p>
        </div>
        {isOffline && (
          <div className="flex items-center text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full text-sm font-medium">
            <WifiOff className="h-4 w-4 mr-2" /> Offline Mode
          </div>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <HeartOff className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-xl font-medium mb-2">No favorites yet</h2>
          <p className="text-muted-foreground mb-4">Save some recipes to view them offline later.</p>
          <Button asChild>
            <Link to="/">Browse Recipes</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((meal) => (
            <Link to={`/meal/${meal.idMeal}`} key={meal.idMeal} className="block group">
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow bg-card relative">
                <div className="aspect-video relative overflow-hidden bg-muted">
                  {meal.strMealThumb ? (
                    <img
                      src={meal.strMealThumb}
                      alt={meal.strMeal}
                      className="object-cover w-full h-full transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <ImageOff className="h-8 w-8" />
                    </div>
                  )}
                  <button
                    className="absolute top-2 right-2 p-2 rounded-full bg-background/50 backdrop-blur-sm z-10 hover:bg-background/80 transition-colors cursor-pointer"
                    onClick={(e) => handleRemove(e, meal.idMeal)}
                  >
                    <Heart className="h-5 w-5 text-red-500 fill-current" />
                  </button>
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="line-clamp-1">{meal.strMeal}</CardTitle>
                  <p className="text-xs text-muted-foreground">{meal.strCategory}</p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
