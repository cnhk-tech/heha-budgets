'use client';

import { useState, useEffect, useCallback } from 'react';
import { Category, Categorytype } from '@/app/db/types';
import { getCategories } from '@/app/db';
import CategoryList from '@/app/components/Category/List';
import AddCategory from '@/app/components/Category/Add';
import { useUser } from '@/app/contexts/UserContext';
import { ModalPortal } from '@/app/components/ModalPortal';
import { useLockBodyScroll } from '@/app/hooks/useLockBodyScroll';

export default function CategoriesPage() {
  const { user } = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState<Categorytype | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [isExiting, setIsExiting] = useState(false);
  const fetchCategories = useCallback(async () => {
    if (!user) return;
    const fetchedCategories = (await getCategories(user.id)) as Category[];
    setCategories(fetchedCategories);
  }, [user]);

  useLockBodyScroll(showAddForm);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategoryClick = (type: Categorytype, editingCategory?: Category) => {
    setSelectedType(type);
    setEditingCategory(editingCategory);
    setIsExiting(false);
    setShowAddForm(true);
  };

  const handleCategoryUpdate = () => {
    setIsExiting(true);
    setTimeout(() => {
      fetchCategories();
      setShowAddForm(false);
      setEditingCategory(undefined);
      setIsExiting(false);
    }, 200);
  };

  if (!user) return null;

  return (
    <div className="w-full min-w-0 overflow-x-hidden bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-10">
        <header>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                Categories
              </h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base max-w-xl">
                Organize your spending with monthly and weekly categories. Add emojis and names to stay on track.
              </p>
            </div>
          </div>
        </header>

        {showAddForm && selectedType && (
        <ModalPortal
          className={`flex items-center justify-center p-4 transition-[background-color,filter] duration-300 ease-out ${
            isExiting ? 'bg-black/0 backdrop-blur-0' : 'bg-black/50 backdrop-blur-sm'
          }`}
        >
          <div
            className={`transition-all duration-300 ease-out ${
              isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-scale-in'
            }`}
          >
            <AddCategory
              requestCategoryType={selectedType}
              onClose={handleCategoryUpdate}
              editingCategory={editingCategory}
              userId={user.id}
            />
          </div>
        </ModalPortal>
      )}

        <CategoryList
          categories={categories}
          onAddCategoryClick={handleAddCategoryClick}
          onCategoryUpdate={handleCategoryUpdate}
        />
      </div>
    </div>
  );
}
