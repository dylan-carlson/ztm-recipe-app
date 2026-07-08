import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Meal } from "@/lib/api";

interface RecipeDB extends DBSchema {
  favorites: {
    key: string;
    value: Meal;
  };
}

const DB_NAME = "recipe-pwa-db";
const DB_VERSION = 1;
const STORE_NAME = "favorites";

export const initDB = async (): Promise<IDBPDatabase<RecipeDB>> => {
  return openDB<RecipeDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "idMeal" });
      }
    },
  });
};

export const saveFavorite = async (meal: Meal): Promise<void> => {
  const db = await initDB();
  await db.put(STORE_NAME, meal);
};

export const removeFavorite = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
};

export const getFavorite = async (id: string): Promise<Meal | undefined> => {
  const db = await initDB();
  return db.get(STORE_NAME, id);
};

export const getAllFavorites = async (): Promise<Meal[]> => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const cacheImageOffline = async (url: string | null | undefined): Promise<void> => {
  if (!url) return;
  try {
    await fetch(url, { mode: 'no-cors' });
  } catch (err) {
    console.error("Failed to cache image offline", err);
  }
};
