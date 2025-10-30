"use client";
import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils"; // optional if you use a className combiner

const initialState = {
  title: "",
  description: "",
  images: [],
  categories: [],
  deposit: "",
  pricePerDay: "",
  location: "",
  status: "active"
};

const statusOptions = ["active", "booked"];

const inputClass =
  "bg-background border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary rounded-lg px-4 py-2 text-base text-slate-900 dark:text-neutral-100 placeholder:text-muted-foreground transition-colors";

const labelClass = "font-semibold text-[15px] mb-1 text-slate-700 dark:text-neutral-200";

interface PublishItemProps {
  onItemPublished?: () => void;
}

const PublishItem: React.FC<PublishItemProps> = ({ onItemPublished }) => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value.split(",").map((v) => v.trim())
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const payload = {
        ...form,
        deposit: parseInt(form.deposit, 10),
        pricePerDay: parseInt(form.pricePerDay, 10)
      };
      const res = await axios.post("/api/items", payload);
      if (res.data.success) {
        setSuccess(true);
        setForm(initialState);
        // Call the callback to refresh the items list
        if (onItemPublished) {
          setTimeout(() => {
            onItemPublished();
          }, 1000);
        }
      } else {
        setError("Failed to publish item.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-2">
      <Card className="shadow-xl border-none w-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-2xl">
        <CardContent>
          <form className="flex flex-col gap-5 p-0 pt-2" onSubmit={handleSubmit}>
            {/* Title */}
            <div>
              <Label htmlFor="title" className={labelClass}>
                Title
              </Label>
              <Input
                id="title"
                name="title"
                autoComplete="off"
                className={inputClass}
                placeholder="Modern Espresso Machine"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>
            {/* Description */}
            <div>
              <Label htmlFor="description" className={labelClass}>
                Description
              </Label>
              <Input
                id="description"
                name="description"
                autoComplete="off"
                className={inputClass}
                placeholder="Describe your item..."
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>
            {/* Images */}
            <div>
              <Label htmlFor="images" className={labelClass}>
                Image URLs <span className="text-xs font-normal text-muted-foreground">(comma separated)</span>
              </Label>
              <Input
                id="images"
                name="images"
                autoComplete="off"
                className={inputClass}
                placeholder="https://img1.jpg, https://img2.jpg"
                value={form.images.join(", ")}
                onChange={e => handleArrayChange(e, "images")}
              />
            </div>
            {/* Categories */}
            <div>
              <Label htmlFor="categories" className={labelClass}>
                Categories <span className="text-xs font-normal text-muted-foreground">(comma separated)</span>
              </Label>
              <Input
                id="categories"
                name="categories"
                autoComplete="off"
                className={inputClass}
                placeholder="Coffee, Appliance, Kitchen"
                value={form.categories.join(", ")}
                onChange={e => handleArrayChange(e, "categories")}
              />
            </div>
            {/* Deposit & Price / Day */}
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="deposit" className={labelClass}>
                  Deposit
                </Label>
                <Input
                  id="deposit"
                  name="deposit"
                  type="number"
                  className={inputClass}
                  placeholder="Deposit in INR"
                  value={form.deposit}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="pricePerDay" className={labelClass}>
                  Price/Day
                </Label>
                <Input
                  id="pricePerDay"
                  name="pricePerDay"
                  type="number"
                  className={inputClass}
                  placeholder="Rental per day"
                  value={form.pricePerDay}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            {/* Location */}
            <div>
              <Label htmlFor="location" className={labelClass}>
                Location
              </Label>
              <Input
                id="location"
                name="location"
                className={inputClass}
                placeholder="Chelsea, Manhattan, NY"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>
            {/* Status */}
            <div>
              <Label htmlFor="status" className={labelClass}>
                Status
              </Label>
              <select
                id="status"
                name="status"
                className={cn(
                  inputClass,
                  "pr-8 appearance-none cursor-pointer bg-white dark:bg-neutral-900"
                )}
                value={form.status}
                onChange={handleChange}
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            {/* Errors and Success */}
            {error && <div className="text-red-600 text-sm text-center mt-2">{error}</div>}
            {success && (
              <div className="text-green-600 text-sm text-center mt-2">
                Item published successfully!
              </div>
            )}
            <Button
              type="submit"
              size="lg"
              className="mt-4 w-full font-semibold tracking-wider bg-black hover:bg-slate-800 rounded-lg"
              disabled={loading}
            >
              {loading ? "Publishing..." : "Publish Item"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublishItem;
