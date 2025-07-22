"use client";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Item = {
  $id: string;
  listingId: string;
  ownerId: string;
  title: string;
  description: string;
  images: string[];
  categories: string[];
  deposit: number;
  pricePerDay: number;
  location: string;
  status: string;
};

const ItemsPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const allCategories = useMemo(() => {
    const cats = items.flatMap(i => i.categories).filter(Boolean);
    return Array.from(new Set(cats));
  }, [items]);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/api/items");
        if (res.data.success) {
          setItems(res.data.data);
        } else {
          setError(res.data.error || "Failed to fetch items.");
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch items.");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Advanced filtering (NYC quick, editorial, fuzzier)
  const filteredItems = useMemo(() => {
    let results = [...items];
    if (search.trim()) {
      const term = search.toLowerCase();
      results = results.filter(i =>
        i.title.toLowerCase().includes(term) ||
        i.categories.some(cat => cat.toLowerCase().includes(term))
      );
    }
    if (selectedCategory) {
      results = results.filter(i =>
        i.categories.includes(selectedCategory)
      );
    }
    return results;
  }, [items, search, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-14 font-sans">
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white uppercase leading-none">
          Just Rent It
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
          Curated finds from the city that never sleeps.
        </p>
      </header>

      {/* Search + Category */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <Input
          className="md:w-96 w-full text-base border-2 border-black/60 dark:border-white/40 bg-white dark:bg-black/30 rounded-xl px-6 py-2 shadow-none placeholder-gray-400 focus:ring-2 focus:border-black/90 focus:ring-black/10 dark:focus:ring-white/30 dark:focus:border-white/80"
          placeholder="Search by title or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap md:justify-end gap-2 mt-1 text-sm">
          <Button
            variant={!selectedCategory ? "default" : "outline"}
            className={`uppercase rounded-full px-4 py-1 font-bold tracking-widest border-2 border-black/50 dark:border-white/40 transition-all
            ${!selectedCategory ?
              "bg-black text-white dark:bg-white dark:text-black" :
              "bg-white/80 dark:bg-black/50 text-black dark:text-white"}`}
            onClick={() => setSelectedCategory("")}
          >
            All
          </Button>
          {allCategories.map(cat => (
            <Button
              key={cat}
              variant={cat === selectedCategory ? "default" : "outline"}
              className={`uppercase rounded-full px-4 py-1 font-bold tracking-widest border-2 border-black/50 dark:border-white/40 transition-all
              ${cat === selectedCategory ?
                "bg-black text-white dark:bg-white dark:text-black" :
                "bg-white/80 dark:bg-black/50 text-black dark:text-white"}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="my-12 text-center text-xl font-semibold tracking-widest text-black/70 dark:text-white/80 uppercase">
          Loading…
        </div>
      )}
      {error && (
        <div className="my-8 text-center text-red-600 font-bold">{error}</div>
      )}
      {!loading && filteredItems.length === 0 && (
        <div className="my-20 text-center text-gray-400 italic text-lg">
          Nothing matches that search.
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredItems.map(item => (
          <Card
            key={item.$id}
            className="rounded-2xl border-0 bg-white dark:bg-black/70 shadow-2xl transition-transform hover:scale-[1.02] duration-200 group"
          >
            <CardContent className="p-0">
              <div className="relative w-full overflow-hidden rounded-t-2xl">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="h-56 w-full object-cover rounded-t-2xl group-hover:brightness-90 transition"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex items-center justify-center h-56 w-full bg-gray-200 dark:bg-gray-800 rounded-t-2xl text-gray-400 text-3xl font-bold">
                    No image
                  </div>
                )}
                <div className="absolute top-4 right-4 z-10">
                  {item.status !== "active" && (
                    <span className="px-3 py-1 rounded-full bg-yellow-300 text-black font-bold text-xs tracking-widest shadow">
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {item.categories?.map((cat, i) => (
                    <Badge
                      key={i}
                      className="uppercase border-0 tracking-tight bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-[13px] font-medium"
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white truncate">
                  {item.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-200 text-base leading-tight mt-2 mb-4 min-h-[3.5em] line-clamp-3">
                  {item.description}
                </p>
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-black dark:text-white">
                      ₹{item.pricePerDay}
                      <span className="ml-1 text-base text-gray-500 font-normal">/day</span>
                    </span>
                    <span className="text-base font-semibold text-gray-500">•</span>
                    <span className="text-base text-gray-700 dark:text-gray-300">
                      Deposit: ₹{item.deposit}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span role="img" aria-label="Location">📍</span> {item.location}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ItemsPage;
