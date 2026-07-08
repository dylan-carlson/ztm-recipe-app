import { Router, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const API_BASE = process.env.MEALDB_API_BASE || 'https://www.themealdb.com/api/json/v1';
const API_KEY = process.env.MEALDB_API_KEY || '1';

// In-memory cache for categories since they rarely change
let categoriesCache: any = null;
let categoriesCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Helper to construct and fetch from TheMealDB
const fetchMealDB = async (endpoint: string, res: Response) => {
  try {
    const url = `${API_BASE}/${API_KEY}/${endpoint}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TheMealDB responded with status ${response.status}`);
    }
    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error(`Error fetching ${endpoint}:`, error.message);
    return res.status(500).json({ error: 'Failed to fetch data from upstream API' });
  }
};

// GET /api/search -> search.php?s=...
router.get('/search', async (req: Request, res: Response) => {
  const query = req.query.s || '';
  await fetchMealDB(`search.php?s=${query}`, res);
});

// GET /api/meal/:id -> lookup.php?i=...
router.get('/meal/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  await fetchMealDB(`lookup.php?i=${id}`, res);
});

// GET /api/categories -> categories.php
router.get('/categories', async (req: Request, res: Response) => {
  const now = Date.now();
  if (categoriesCache && (now - categoriesCacheTime < CACHE_TTL)) {
    return res.json(categoriesCache);
  }

  try {
    const url = `${API_BASE}/${API_KEY}/categories.php`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    categoriesCache = data;
    categoriesCacheTime = now;
    return res.json(data);
  } catch (error: any) {
    console.error('Categories error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/filter -> filter.php?c=...
router.get('/filter', async (req: Request, res: Response) => {
  const category = req.query.c;
  if (!category) {
    return res.status(400).json({ error: 'Category parameter (c) is required' });
  }
  await fetchMealDB(`filter.php?c=${category}`, res);
});

// GET /api/random -> random.php
router.get('/random', async (req: Request, res: Response) => {
  await fetchMealDB('random.php', res);
});

export default router;
