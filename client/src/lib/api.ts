const API_URL = "/api";

export interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strYoutube?: string;
  strTags?: string;
  [key: string]: any;
}

export interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export const fetchMealsBySearch = async (query: string): Promise<Meal[]> => {
  const res = await fetch(`${API_URL}/search?s=${query}`);
  if (!res.ok) throw new Error("Network response was not ok");
  const data = await res.json();
  return data.meals || [];
};

export const fetchMealById = async (id: string): Promise<Meal | null> => {
  const res = await fetch(`${API_URL}/meal/${id}`);
  if (!res.ok) throw new Error("Network response was not ok");
  const data = await res.json();
  return data.meals ? data.meals[0] : null;
};

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error("Network response was not ok");
  const data = await res.json();
  return data.categories || [];
};

export const fetchMealsByCategory = async (category: string): Promise<Meal[]> => {
  const res = await fetch(`${API_URL}/filter?c=${category}`);
  if (!res.ok) throw new Error("Network response was not ok");
  const data = await res.json();
  return data.meals || [];
};
