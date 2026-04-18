'use client';

import { useState, FormEvent, useEffect } from "react";
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react';
import { Category, Categorytype } from "@/app/db/types";
import { addCategory as addCategoryInDB, updateCategory } from "@/app/db/categories";
import { tapHaptic, confirmHaptic, errorHaptic } from '@/app/lib/haptics';

const Add = ({
  requestCategoryType,
  onClose,
  editingCategory,
  userId,
}: {
  requestCategoryType: Categorytype;
  onClose: () => void;
  editingCategory?: Category;
  userId: number;
}) => {
  const [icon, setIcon] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [iconError, setIconError] = useState<string>("");
  const [nameError, setNameError] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setIcon(editingCategory.icon);
      setName(editingCategory.name);
    }
  }, [editingCategory]);

  const addCategory = async (newCategory: Omit<Category, 'id'>) => {
    try {
      setIsSubmitting(true);
      const status = await addCategoryInDB(newCategory);
      if (status) onClose();
    } catch {
      setNameError("Category name already exists");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (updatedCategory: Category) => {
    try {
      setIsSubmitting(true);
      const status = await updateCategory(updatedCategory.id, updatedCategory);
      if (status) onClose();
    } catch {
      setNameError("Failed to update category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    let hasError = false;
    if (!icon) {
      setIconError("Please select an emoji.");
      hasError = true;
    } else {
      setIconError("");
    }

    if (!name.trim()) {
      setNameError("Name cannot be empty.");
      hasError = true;
    } else {
      setNameError("");
    }

    if (hasError) {
      errorHaptic();
      return;
    }

    confirmHaptic();
    const category: Category = {
      id: editingCategory?.id ?? 0,
      userId,
      icon,
      name,
      type: requestCategoryType,
    };

    if (editingCategory) {
      handleUpdateCategory(category);
    } else {
      addCategory({ userId, icon, name, type: requestCategoryType });
    }
  };

  const handleEmojiSelect = ({ emoji }: EmojiClickData) => {
    tapHaptic();
    setIcon(emoji);
    setShowEmojiPicker(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameError("");
    setName(e.target.value);
  };

  const inputBase = "w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200";
  const inputError = "border-red-500/80 focus:ring-red-500/50";

  return (
    <div className="w-full max-w-lg bg-card text-card-foreground rounded-2xl shadow-2xl border border-border p-6 md:p-8 relative">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-border/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <div className="text-center mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          {editingCategory ? 'Update' : 'Add'} {Categorytype[requestCategoryType]} Category
        </h2>
        <p className="text-muted-foreground text-sm mt-1.5">
          Choose an icon and name for your category
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Icon</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`w-full py-4 rounded-xl border-2 flex items-center justify-center text-3xl transition-all duration-200 ${
                  iconError
                    ? "border-red-500/80 bg-red-500/5"
                    : "border-border bg-background hover:border-ring/50"
                }`}
              >
                {icon || "🌟"}
              </button>
              {showEmojiPicker && (
                <div className="absolute z-10 mt-2 left-0 right-0">
                  <div className="bg-card border border-border rounded-xl shadow-xl p-2 overflow-hidden">
                    <EmojiPicker
                      theme={Theme.AUTO}
                      onEmojiClick={handleEmojiSelect}
                      emojiStyle={EmojiStyle.NATIVE}
                      width={300}
                      height={360}
                      searchPlaceholder="Search emoji…"
                    />
                  </div>
                </div>
              )}
              {iconError && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {iconError}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter category name"
              className={`${inputBase} ${nameError ? inputError : ''}`}
            />
            {nameError && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {nameError}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-sm font-medium rounded-xl border border-border bg-transparent text-foreground hover:bg-border/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-3 text-sm font-medium rounded-xl text-accent-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card ${
              isSubmitting ? "bg-accent/70 cursor-not-allowed" : "bg-accent hover:opacity-90"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {editingCategory ? 'Updating…' : 'Adding…'}
              </span>
            ) : (
              editingCategory ? 'Update' : 'Add'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Add;
