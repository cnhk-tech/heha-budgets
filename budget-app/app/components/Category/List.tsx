import { Category, Categorytype } from "./types";

const CategoryList = ({ categories, onAddCategoryClick }: { categories: Category[], onAddCategoryClick: (categoryType: Categorytype) => void }) => {
  const categoryTypes = [Categorytype.Monthly, Categorytype.Weekly];

  return (
    <div className="my-6 h-1/2 flex gap-3 justify-evenly text-center max-lg:block max-lg:place-items-center">
      {categoryTypes.map((type) => (
          <div key={type} className="w-3/4 max-lg:pt-4 max-lg:pb-4 max-lg:w-full">
            <h3 className="text-lg font-semibold text-background mb-4">{Categorytype[type]} Categories</h3>
            <div className="border-dotted border-2 border-secondary p-4 h-full overflow-auto max-lg:h-[400px] max-sm:h-[250px]">
              <ul className="grid grid-cols-3 gap-x-2 gap-y-2">
                <button onClick={() => {onAddCategoryClick(type)}}>
                  <li className="items-center p-3 bg-green-200 border border-green-950 rounded-lg shadow-sm">
                    <p className="text-2xl">+</p>
                    <p className="font-medium max-lg:text-sm">Add</p>
                  </li>
                </button>
                {categories.length > 0 && categories.filter((category: Category) => category.type === type).map((category) => (
                  <li
                    key={category.name}
                    className="items-center p-3 bg-background text-foreground border border-secondary rounded-lg shadow-sm"
                  >
                    <p className="text-2xl max-md:text-md">{category.icon}</p>
                    <p className="font-medium max-sm:text-[12px]">{category.name}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default CategoryList;