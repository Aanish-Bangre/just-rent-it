"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
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
        <div className="min-h-screen bg-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
            <div className="max-w-7xl mx-auto px-4 py-14 font-sans">
            <header className="mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full mb-4">
                    <span className="text-sm font-semibold">Browse & Rent</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
                    Discover Amazing Items
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
                    Find the perfect item for rent from our curated collection
                </p>
            </header>

            {/* Search + Category */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <Input
                    className="md:w-96 w-full text-base border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl px-6 py-3 shadow-lg focus:ring-2 focus:border-black focus:ring-black/20 dark:focus:ring-white/20 dark:focus:border-white placeholder-slate-400"
                    placeholder="Search by title or category..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div className="flex flex-wrap md:justify-end gap-2 mt-1 text-sm">
                    <Button
                        variant={!selectedCategory ? "default" : "outline"}
                        className={`rounded-full px-5 py-2 font-bold tracking-wide transition-all shadow-md hover:shadow-lg
            ${!selectedCategory ?
                                "bg-black text-white hover:bg-slate-800" :
                                "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"}`}
                        onClick={() => setSelectedCategory("")}
                    >
                        All Items
                    </Button>
                    {allCategories.map(cat => (
                        <Button
                            key={cat}
                            variant={cat === selectedCategory ? "default" : "outline"}
                            className={`rounded-full px-5 py-2 font-bold tracking-wide transition-all shadow-md hover:shadow-lg
              ${cat === selectedCategory ?
                                    "bg-black text-white hover:bg-slate-800" :
                                    "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading && (
                <div className="my-12 text-center text-xl font-semibold tracking-widest text-slate-700 dark:text-slate-300">
                    Loading amazing items...
                </div>
            )}
            {error && (
                <div className="my-8 text-center text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/20 p-6 rounded-xl border border-red-200 dark:border-red-900">
                    {error}
                </div>
            )}
            {!loading && filteredItems.length === 0 && (
                <div className="my-20 text-center text-slate-500 dark:text-slate-400 italic text-lg bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800">
                    No items found. Try adjusting your search or filters.
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredItems.map(item => (
                    <Link href={`/items/${item.listingId}`} key={item.$id}>
                        <Card
                            className="rounded-2xl border-0 bg-white dark:bg-slate-900 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] duration-300 group overflow-hidden"
                        >
                            <CardContent className="p-0">
                                <div className="relative w-full overflow-hidden">
                                    {item.images && item.images.length > 0 ? (
                                        <img
                                            src={item.images[0]}
                                            alt={item.title}
                                            className="h-56 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-56 w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-400 text-3xl font-bold">
                                            No image
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 z-10">
                                        {item.status !== "active" && (
                                            <span className="px-3 py-1 rounded-full bg-yellow-400 text-yellow-900 font-bold text-xs tracking-widest shadow-lg">
                                                {item.status}
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div className="p-6">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        {item.categories?.map((cat, i) => (
                                            <Badge
                                                key={i}
                                                className="border-0 tracking-tight bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-semibold"
                                            >
                                                {cat}
                                            </Badge>
                                        ))}
                                    </div>
                                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white truncate mb-2">
                                        {item.title}
                                    </h2>
                                    <p className="text-slate-600 dark:text-slate-400 text-base leading-snug mt-2 mb-4 min-h-[3.5em] line-clamp-3">
                                        {item.description}
                                    </p>
                                    <div className="flex flex-col gap-2 mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl font-bold text-slate-900 dark:text-white">
                                                ₹{item.pricePerDay}
                                                <span className="ml-1 text-base text-slate-500 dark:text-slate-400 font-normal">/day</span>
                                            </span>
                                            <span className="text-base font-semibold text-slate-400">•</span>
                                            <span className="text-base text-slate-600 dark:text-slate-400">
                                                Deposit: ₹{item.deposit}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                            <span role="img" aria-label="Location">📍</span> {item.location}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                ))}
            </div>
        </div>
        </div>
    );
};

export default ItemsPage;
