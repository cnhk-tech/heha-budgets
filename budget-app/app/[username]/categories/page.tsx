'use client';

import { useEffect, useState } from "react";

import CategoryList from "@/app/components/Category/List";
import Add from "@/app/components/Category/Add";
import { getCategories } from "@/app/db";
import { Category, Categorytype } from "@/app/components/Category/types";

const Page = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [requestCategoryType, setRequestCategoryType] = useState<Categorytype>(Categorytype.Monthly);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  const fetchCategories = async () => {
    const data: Category[] = await getCategories();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const closeAddCategory = async () => {
    fetchCategories();
    setIsAddCategoryOpen(false);
  };

  return (
    <div className="w-full p-4 sm:p-6 md:p-10 bg-background">
      <CategoryList
        categories={categories}
        onAddCategoryClick={(categoryType: Categorytype) => {
          setRequestCategoryType(categoryType);
          setIsAddCategoryOpen(true);
        }}
      />

      {isAddCategoryOpen && (
        <div className="w-full pt-24 fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50">
          <Add
            requestCategoryType={requestCategoryType}
            onClose={() => closeAddCategory()}
          />
        </div>
      )}
    </div>
  );
}

export default Page;