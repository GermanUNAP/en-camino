"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react"; // Importa el icono Plus
import { STORE_CATEGORIES } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Category {
  name: string;
  slug: string;
}

interface CategorySelectorProps {
  onCategoriesChange: (categories: string[]) => void;
  initialCategories?: string[];
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ onCategoriesChange, initialCategories = [] }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [availableCategories, setAvailableCategories] = useState<Category[]>(STORE_CATEGORIES);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const categoriesFromParams = searchParams.getAll("categoria");
    if (categoriesFromParams.length > 0) {
      setSelectedCategories(categoriesFromParams);
    }
  }, [searchParams]);

  useEffect(() => {
    const newAvailableCategories = STORE_CATEGORIES.filter(
      (cat) => !selectedCategories.includes(cat.slug)
    );
    setAvailableCategories(newAvailableCategories);
    onCategoriesChange(selectedCategories);

    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("categoria");
    selectedCategories.forEach((catSlug) => {
      newParams.append("categoria", catSlug);
    });
    router.push(`?${newParams.toString()}`, { scroll: false });
  }, [selectedCategories, onCategoriesChange, router, searchParams]);

  const handleSelectCategory = (category: Category) => {
    setSelectedCategories([...selectedCategories, category.slug]);
  };

  const handleRemoveCategory = (categorySlug: string) => {
    setSelectedCategories(selectedCategories.filter((slug) => slug !== categorySlug));
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {selectedCategories.map((slug) => {
        const selectedCategory = STORE_CATEGORIES.find((cat) => cat.slug === slug);
        return selectedCategory ? (
          <Button
            key={slug}
            variant="secondary"
            size="sm"
            className="rounded-full flex items-center gap-1"
            onClick={() => handleRemoveCategory(slug)}
          >
            {selectedCategory.name}
            <X className="h-4 w-4" />
          </Button>
        ) : null;
      })}

      {availableCategories.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> {/* Añade el icono Plus aquí */}
              Añadir Categoría
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {availableCategories.map((category) => (
              <DropdownMenuItem key={category.slug} onSelect={() => handleSelectCategory(category)}>
                {category.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default CategorySelector;