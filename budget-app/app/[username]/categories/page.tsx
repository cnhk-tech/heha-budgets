'use client';

import { useState, useEffect } from "react";
import { Category, Categorytype } from "@/app/components/Category/types";
import { getCategories } from "@/app/db/categories";
import CategoryList from "@/app/components/Category/List";
import AddCategory from "@/app/components/Category/Add";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState<Categorytype | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);

  const fetchCategories = async () => {
    const fetchedCategories = await getCategories() as Category[];
    setCategories(fetchedCategories);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategoryClick = (type: Categorytype, editingCategory?: Category) => {
    setSelectedType(type);
    setEditingCategory(editingCategory);
    setShowAddForm(true);
  };

  const handleCategoryUpdate = () => {
    fetchCategories();
    setShowAddForm(false);
    setEditingCategory(undefined);
  };

  return (
    <div className="w-full p-4 sm:p-6 md:p-10 bg-background min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">Categories</h1>
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="animate-fade-in-up">
            <AddCategory
              requestCategoryType={selectedType!}
              onClose={handleCategoryUpdate}
              editingCategory={editingCategory}
            />
          </div>
        </div>
      )}
      <CategoryList
        categories={categories}
        onAddCategoryClick={handleAddCategoryClick}
        onCategoryUpdate={handleCategoryUpdate}
      />
    </div>
  );
}