import { Category, Categorytype } from "@/app/components/Category/types";

const categories: Category[] = [
  {
    icon: "🎥",
    name: "Movie",
    type: Categorytype.Weekly,
  },
  {
    icon: "🏋🏻‍♂️",
    name: "Gym",
    type: Categorytype.Monthly,
  },
  {
    icon: "🍔",
    name: "Junk Food",
    type: Categorytype.Monthly,
  },
];

export default categories;