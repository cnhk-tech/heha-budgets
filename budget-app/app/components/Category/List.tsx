'use client';

import { useState } from "react";
import { Category, Categorytype } from "@/app/db/types";
import { deleteCategory } from "@/app/db/categories";

const CategoryList = ({ 
  categories, 
  onAddCategoryClick,
  onCategoryUpdate 
}: { 
  categories: Category[], 
  onAddCategoryClick: (categoryType: Categorytype, editingCategory?: Category) => void,
  onCategoryUpdate: () => void 
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const categoryTypes = [Categorytype.Monthly, Categorytype.Weekly];
  const [isFlipped, setIsFlipped] = useState<string | null>(null);

  const handleDelete = async (category: Category) => {
    setShowDeleteDialog(true);
    setCategoryToDelete(category);
  };

  const handleEdit = (category: Category) => {
    onAddCategoryClick(category.type, category);
  };

  return (
    <div className="my-6 h-1/2 flex gap-3 text-foreground justify-evenly text-center max-lg:block max-lg:place-items-center">
      {categoryTypes.map((type) => (
        <div key={type} className="w-3/4 max-lg:pt-4 max-lg:pb-4 max-lg:w-full">
          <h3 className="text-lg font-semibold mb-4">{Categorytype[type]} Categories</h3>
          <div className="rounded-lg border-dotted border-2 p-4 h-full overflow-auto max-lg:h-[400px] max-md:h-[250px]">
            <ul className="grid grid-cols-3 gap-x-2 gap-y-2">
              <button onClick={() => {onAddCategoryClick(type)}}>
                <li className="items-center p-3 bg-green-200 text-background border border-foreground rounded-lg shadow-sm h-full flex flex-col justify-center">
                  <p className="text-2xl">+</p>
                  <p className="font-medium max-lg:text-sm">Add</p>
                </li>
              </button>
              {categories.length > 0 && categories.filter((category: Category) => category.type === type).map((category) => (
                <div
                  key={category.name}
                  className="relative h-24 perspective-1000"
                  onMouseEnter={() => setIsFlipped(category.name)}
                  onMouseLeave={() => setIsFlipped(null)}
                >
                  <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                    isFlipped === category.name ? 'rotate-y-180' : ''
                  }`}>
                    {/* Front of card */}
                    <div className="absolute w-full h-full backface-hidden">
                      <li className="items-center p-3 bg-background text-foreground border border-foreground rounded-lg shadow-sm h-full flex flex-col justify-center">
                        <p className="text-2xl max-md:text-md">{category.icon}</p>
                        <p className="font-medium max-sm:text-[12px]">{category.name}</p>
                      </li>
                    </div>
                    {/* Back of card */}
                    <div className="absolute w-full h-full backface-hidden rotate-y-180">
                      <li className="items-center p-3 bg-background text-foreground border border-foreground rounded-lg shadow-sm h-full flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor" className="text-blue-500">
                            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor" className="text-red-500">
                            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                          </svg>
                        </button>
                      </li>
                    </div>
                  </div>
                </div>
              ))}
            </ul>
          </div>
        </div>
      ))}
      {(showDeleteDialog && categoryToDelete) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="w-full max-w-md mx-auto bg-background text-foreground rounded-2xl shadow-2xl p-6 relative animate-fade-in-up">
            <div className="flex flex-col items-center mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mb-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h2 className="text-2xl font-bold text-center">Delete Category</h2>
              <p className="text-gray-500 mt-3 text-center">
                Are you sure you want to delete <span className="font-semibold text-foreground">{categoryToDelete.name}</span> ?
              </p>
              <p className="text-sm text-gray-400 mt-2 text-center">This action cannot be undone.</p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 sm:gap-4">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setCategoryToDelete(null);
                }}
                className="w-full sm:w-32 px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const success = await deleteCategory(categoryToDelete.id);
                  if (success) {
                    onCategoryUpdate();
                  }
                  setShowDeleteDialog(false);
                  setCategoryToDelete(null);
                }}
                className="w-full sm:w-32 px-6 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryList;