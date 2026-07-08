import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCategories, fetchMealsByCategory, fetchMealsBySearch, fetchMealById, Meal } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ImageOff, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllFavorites, saveFavorite, removeFavorite, cacheImageOffline } from "@/features/favorites/db";
import { toast } from "sonner";

export default function Home() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: categories, isLoading: isLoadingCats } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: meals, isLoading: isLoadingMeals, isError } = useQuery({
    queryKey: ["meals", query || selectedCategory, !!query],
    queryFn: () => query ? fetchMealsBySearch(query) : (selectedCategory === "All" ? fetchMealsBySearch("") : fetchMealsByCategory(selectedCategory)),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["favoritesList"],
    queryFn: getAllFavorites,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
  };

  const handleToggleFavorite = async (e: React.MouseEvent, meal: Meal, isFavorite: boolean) => {
    e.preventDefault();
    try {
      if (isFavorite) {
        await removeFavorite(meal.idMeal);
        toast.success("Removed from favorites");
      } else {
        const fullMeal = await fetchMealById(meal.idMeal);
        await saveFavorite(fullMeal);
        await cacheImageOffline(fullMeal.strMealThumb);
        toast.success("Saved to favorites", { description: "Available offline" });
      }
      queryClient.invalidateQueries({ queryKey: ["favoritesList"] });
    } catch (err) {
      toast.error("Failed to update favorites");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Discover Delicious Recipes
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Search for your favorite meals or browse our curated categories to find your next culinary adventure.
        </p>
        <form onSubmit={handleSearch} className="flex max-w-md mx-auto mt-6 gap-2">
          <Input
            placeholder="Search meals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" /> Search
          </Button>
        </form>
      </section>

      {!query && (
        <section>
          <div className="flex flex-wrap justify-center pb-4 gap-2">
            {isLoadingCats ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-full" />
              ))
            ) : (
              <>
                <Button
                  variant={selectedCategory === "All" ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => setSelectedCategory("All")}
                >
                  All
                </Button>
                {categories?.map((c) => (
                  <Button
                    key={c.idCategory}
                    variant={selectedCategory === c.strCategory ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setSelectedCategory(c.strCategory)}
                  >
                    {c.strCategory}
                  </Button>
                ))}
              </>
            )}
          </div>
        </section>
      )}

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoadingMeals ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full rounded-none" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
              </Card>
            ))
          ) : isError ? (
            <div className="col-span-full text-center text-destructive p-8">
              <p>Failed to load meals. You might be offline.</p>
            </div>
          ) : meals?.length ? (
            meals.map((meal: Meal) => {
              const isFavorite = favorites.some((fav) => fav.idMeal === meal.idMeal);
              return (
              <Link to={`/meal/${meal.idMeal}`} key={meal.idMeal} className="block transition-transform hover:scale-[1.02]">
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow bg-card relative">
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    {meal.strMealThumb ? (
                      <img
                        src={meal.strMealThumb}
                        alt={meal.strMeal}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <ImageOff className="h-8 w-8" />
                      </div>
                    )}
                    <button
                      onClick={(e) => handleToggleFavorite(e, meal, isFavorite)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-background/50 backdrop-blur-sm z-10 hover:bg-background/80 transition-colors cursor-pointer"
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? "text-red-500 fill-current" : "text-muted-foreground"}`} />
                    </button>
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="line-clamp-1">{meal.strMeal}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
              );
            })
          ) : (
            <div className="col-span-full text-center text-muted-foreground p-8">
              No meals found. Try a different search.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
