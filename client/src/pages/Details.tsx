import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchMealById, Meal } from "@/lib/api";
import { saveFavorite, removeFavorite, getFavorite, cacheImageOffline } from "@/features/favorites/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ArrowLeft, PlayCircle } from "lucide-react";
import { toast } from "sonner";

export default function Details() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: meal, isLoading, isError } = useQuery({
    queryKey: ["meal", id],
    queryFn: async () => {
      try {
        return await fetchMealById(id!);
      } catch (err) {
        const fav = await getFavorite(id!);
        if (fav) return fav;
        throw err;
      }
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (id) {
      getFavorite(id).then((fav) => setIsFavorite(!!fav));
    }
  }, [id]);

  const toggleFavorite = async () => {
    if (!meal) return;
    try {
      if (isFavorite) {
        await removeFavorite(meal.idMeal);
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await saveFavorite(meal);
        await cacheImageOffline(meal.strMealThumb);
        setIsFavorite(true);
        toast.success("Saved to favorites", {
          description: "Available offline",
        });
      }
    } catch (err) {
      toast.error("Failed to update favorites");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !meal) {
    return (
      <div className="text-center p-8 space-y-4">
        <h2 className="text-2xl font-bold">Meal not found</h2>
        <p className="text-muted-foreground">It might be unavailable or you are offline without it cached.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const ingredients = Array.from({ length: 20 })
    .map((_, i) => ({
      ingredient: meal[`strIngredient${i + 1}`],
      measure: meal[`strMeasure${i + 1}`],
    }))
    .filter((i) => i.ingredient && i.ingredient.trim() !== "");

  const tags = meal.strTags ? meal.strTags.split(",") : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <img
            src={meal.strMealThumb}
            alt={meal.strMeal}
            className="w-full rounded-xl shadow-lg object-cover aspect-square"
          />
        </div>
        <div className="md:w-1/2 space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{meal.strMeal}</h1>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {meal.strCategory && <Badge variant="secondary">{meal.strCategory}</Badge>}
              {meal.strArea && <Badge variant="outline">{meal.strArea}</Badge>}
            </div>
          </div>
          
          <Button
            size="lg"
            variant={isFavorite ? "default" : "outline"}
            className="w-full md:w-auto transition-all"
            onClick={toggleFavorite}
          >
            <Heart className={`mr-2 h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
            {isFavorite ? "Favorited" : "Add to Favorites"}
          </Button>

          {tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-primary/10">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}

          {meal.strYoutube && (
            <Button variant="outline" asChild className="w-full md:w-auto">
              <a href={meal.strYoutube} target="_blank" rel="noopener noreferrer">
                <PlayCircle className="mr-2 h-5 w-5 text-red-500" /> Watch Tutorial
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">Ingredients</h2>
          <ul className="space-y-2">
            {ingredients.map((item, i) => (
              <li key={i} className="flex justify-between text-sm py-1 border-b border-border/50">
                <span className="font-medium">{item.ingredient}</span>
                <span className="text-muted-foreground">{item.measure}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">Instructions</h2>
          <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {meal.strInstructions}
          </div>
        </div>
      </div>
    </div>
  );
}
