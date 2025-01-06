'use client';

import { useState, FormEvent } from "react";
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react';
import { Category, Categorytype } from "./types";
import { addCategory as addCategoryInDB } from "@/app/db";

const Add = ({ requestCategoryType, onClose }: { requestCategoryType: Categorytype; onClose: () => void })  => {
  const [icon, setIcon] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [iconError, setIconError] = useState<string>("");
  const [nameError, setNameError] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const addCategory = async (newCategory: Category) => {
    try {
      const status = await addCategoryInDB(newCategory);
      if (status) {
        onClose();
      }
    } catch {
      setNameError("Category name already exists")
    }
  };

  const handleAddCategory = (e: FormEvent) => {
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

    const newCategory: Category = { icon, name, type: requestCategoryType };
    addCategory(newCategory);
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
    <div className="w-full max-w-xl mx-8 p-6 bg-background text-foreground shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-6">Add New {Categorytype[requestCategoryType]} Category</h2>
      <form onSubmit={handleAddCategory} className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <p className="block font-medium mb-2">Icon</p>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`w-16 h-10 border bg-white ${iconError ? "border-red-500" : "border-gray-300"} rounded-md flex items-center justify-center text-2xl focus:outline-none focus:ring-2 focus:ring-blue-400`}
            >
              {icon || "🌟"}
            </button>
            <div className="absolute z-10 mt-2">
              <EmojiPicker theme={Theme.AUTO} onEmojiClick={handleEmojiSelect} open={showEmojiPicker} emojiStyle={EmojiStyle.NATIVE}/>
            </div>
          </div>
          <div className="flex-1">
            <p className="block font-medium mb-2">Name</p>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Category Name"
              className={`w-full px-4 py-2 border ${nameError ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
          </div>
        </div>
        {iconError && <p className="text-red-500 text-sm mt-1">{iconError}</p>}
        {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
        <div className="flex justify-end space-x-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300  text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Add Category
          </button>
        </div>
      </form>
    </div>
  );
}

export default Add;
