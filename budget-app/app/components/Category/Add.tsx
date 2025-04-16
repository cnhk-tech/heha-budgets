'use client';

import { useState, FormEvent, useEffect } from "react";
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react';
import { Category, Categorytype } from "./types";
import { addCategory as addCategoryInDB, updateCategory } from "@/app/db/categories";

const Add = ({ 
  requestCategoryType, 
  onClose,
  editingCategory 
}: { 
  requestCategoryType: Categorytype; 
  onClose: () => void;
  editingCategory?: Category;
})  => {
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

  const addCategory = async (newCategory: Category) => {
    try {
      setIsSubmitting(true);
      const status = await addCategoryInDB(newCategory);
      if (status) {
        onClose();
      }
    } catch {
      setNameError("Category name already exists")
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (updatedCategory: Category) => {
    try {
      setIsSubmitting(true);
      const status = await updateCategory(updatedCategory.name, updatedCategory);
      if (status) {
        onClose();
      }
    } catch {
      setNameError("Failed to update category")
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

    if (hasError) return;

    const category: Category = { icon, name, type: requestCategoryType };
    
    if (editingCategory) {
      handleUpdateCategory(category);
    } else {
      addCategory(category);
    }
  };

  const handleEmojiSelect = ({ emoji }: EmojiClickData) => {
    setIcon(emoji);
    setShowEmojiPicker(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNameError("");
    setName(value);
  };

  return (
    <div className="w-full max-w-lg m-12 bg-background text-foreground rounded-2xl shadow-2xl p-8 relative animate-fade-in-up">
      <div className="absolute top-4 right-4">
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold ">
          {editingCategory ? 'Update' : 'Add New'} {Categorytype[requestCategoryType]} Category
        </h2>
        <p className="text-gray-500 mt-2">Choose an icon and name for your category</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium ">Icon</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`w-full p-4 border-2 rounded-xl flex items-center justify-center text-3xl transition-all duration-200 ${
                  iconError 
                    ? "border-red-500 bg-red-50" 
                    : "border-gray-200 hover:border-blue-500 hover:bg-blue-50"
                }`}
              >
                {icon || "🌟"}
              </button>
              {showEmojiPicker && (
                <div className="absolute z-10 mt-2 left-0 right-0">
                  <div className="bg-white rounded-xl shadow-lg p-2">
                    <EmojiPicker 
                      theme={Theme.AUTO} 
                      onEmojiClick={handleEmojiSelect} 
                      emojiStyle={EmojiStyle.NATIVE}
                      width={300}
                      height={400}
                      searchPlaceholder="Search emoji..."
                    />
                  </div>
                </div>
              )}
              {iconError && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {iconError}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium ">Name</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter category name"
              className={`w-full p-4 border-2 rounded-xl text-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                nameError 
                  ? "border-red-500 bg-red-50" 
                  : "border-gray-200 hover:border-blue-500"
              }`}
            />
            {nameError && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {nameError}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 text-sm font-medium text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
              isSubmitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {editingCategory ? 'Updating...' : 'Adding...'}
              </span>
            ) : (
              editingCategory ? 'Update' : 'Add'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Add;
