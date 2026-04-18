'use client';

import { useState } from "react";
import { Category, Categorytype } from "@/app/db/types";
import { deleteCategory } from "@/app/db/categories";
import { ModalPortal } from "@/app/components/ModalPortal";
import { useLockBodyScroll } from "@/app/hooks/useLockBodyScroll";
import { tapHaptic, heavyHaptic } from '@/app/lib/haptics';

const CategoryList = ({
  categories,
  onAddCategoryClick,
  onCategoryUpdate
}: {
  categories: Category[];
  onAddCategoryClick: (categoryType: Categorytype, editingCategory?: Category) => void;
  onCategoryUpdate: () => void;
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const categoryTypes = [Categorytype.Monthly, Categorytype.Weekly];

  useLockBodyScroll(showDeleteDialog);

  const handleDelete = (category: Category) => {
    tapHaptic();
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };

  const handleEdit = (category: Category) => {
    tapHaptic();
    onAddCategoryClick(category.type, category);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    heavyHaptic();
    setIsDeleting(true);
    const success = await deleteCategory(categoryToDelete.id);
    if (success) onCategoryUpdate();
    setShowDeleteDialog(false);
    setCategoryToDelete(null);
    setIsDeleting(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setCategoryToDelete(null);
  };

  const isWeeklyDisabled = true; // Weekly categories: upcoming feature

  return (
    <div className="space-y-12 md:space-y-16">
      {categoryTypes.map((type, typeIndex) => {
        const typeCategories = categories.filter((c: Category) => c.type === type);
        const isUpcoming = type === Categorytype.Weekly && isWeeklyDisabled;

        return (
          <section
            key={type}
            className="animate-fade-in-up opacity-0"
            style={{ animationDelay: `${typeIndex * 80}ms`, animationFillMode: 'forwards' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground tracking-tight">
                {Categorytype[type]} Categories
              </h2>
              {!isUpcoming && (
                <span className="text-sm text-muted-foreground">
                  {typeCategories.length} {typeCategories.length === 1 ? 'category' : 'categories'}
                </span>
              )}
              {isUpcoming && (
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 px-2.5 py-1 rounded-full">
                  Upcoming
                </span>
              )}
            </div>

            {isUpcoming ? (
              <div className="rounded-2xl border border-border border-dashed bg-muted/20 p-8 md:p-12 min-h-[200px] flex flex-col items-center justify-center text-center">
                <p className="text-muted-foreground text-sm md:text-base max-w-sm">
                  Weekly categories are coming soon. You can use monthly categories for now.
                </p>
                <p className="text-xs text-muted-foreground mt-2">This feature is currently disabled.</p>
              </div>
            ) : (
            <div className="rounded-2xl border border-border bg-card/50 p-4 md:p-6 min-h-[280px] md:min-h-[320px] transition-colors duration-300">
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {/* Add card */}
                <li className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                  <button
                    type="button"
                    onClick={() => onAddCategoryClick(type)}
                    className="group w-full aspect-square min-h-[100px] md:min-h-[120px] rounded-xl border-2 border-dashed border-border bg-transparent hover:border-accent hover:bg-accent/5 flex flex-col items-center justify-center gap-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className="text-2xl md:text-3xl text-muted-foreground group-hover:text-accent transition-colors duration-300">
                      +
                    </span>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-accent transition-colors duration-300">
                      Add
                    </span>
                  </button>
                </li>

                {/* Category cards */}
                {typeCategories.map((category, index) => (
                  <li
                    key={`${category.name}-${category.id}`}
                    className="animate-fade-in-up opacity-0 perspective-1000"
                    style={{ animationDelay: `${0.12 + index * 0.03}s`, animationFillMode: 'forwards' }}
                  >
                    <div
                      className="relative w-full aspect-square min-h-[100px] md:min-h-[120px] cursor-pointer"
                      style={{ transformStyle: 'preserve-3d' }}
                      onMouseEnter={() => setFlippedId(category.name)}
                      onMouseLeave={() => setFlippedId(null)}
                    >
                      <div
                        className="relative w-full h-full transition-transform duration-500 ease-out"
                        style={{
                          transform: flippedId === category.name ? 'rotateY(180deg)' : 'rotateY(0deg)',
                          transformStyle: 'preserve-3d'
                        }}
                      >
                        {/* Front */}
                        <div
                          className="absolute inset-0 rounded-xl bg-card border border-border shadow-sm flex flex-col items-center justify-center gap-2 p-3 transition-all duration-300 hover:shadow-md hover:border-border hover:bg-card"
                          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}
                        >
                          <span className="text-2xl md:text-3xl" role="img" aria-hidden>
                            {category.icon}
                          </span>
                          <span className="text-sm font-medium text-foreground text-center line-clamp-2">
                            {category.name}
                          </span>
                        </div>

                        {/* Back - actions */}
                        <div
                          className="absolute inset-0 rounded-xl bg-foreground flex items-center justify-center gap-2 p-2"
                          style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                          }}
                        >
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleEdit(category); }}
                            className="p-2.5 rounded-xl bg-background/20 hover:bg-background/30 text-background transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-background/50"
                            aria-label={`Edit ${category.name}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 -960 960 960" fill="currentColor">
                              <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDelete(category); }}
                            className="p-2.5 rounded-xl bg-background/20 hover:bg-red-500/30 text-background transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400/50"
                            aria-label={`Delete ${category.name}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 -960 960 960" fill="currentColor">
                              <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            )}
          </section>
        );
      })}

      {/* Delete confirmation modal */}
      {showDeleteDialog && categoryToDelete && (
        <ModalPortal
          className="flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={handleCancelDelete}
        >
          <div
            className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground">Delete category?</h2>
              <p className="mt-2 text-muted-foreground text-sm">
                <span className="font-medium text-foreground">{categoryToDelete.name}</span> will be removed. This can&apos;t be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="flex-1 py-3 text-sm font-medium rounded-xl border border-border bg-transparent text-foreground hover:bg-card transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 text-sm font-medium rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default CategoryList;
