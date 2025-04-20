import { Category, Categorytype } from "@/app/db/types";

const categories: Category[] = [
  {
    icon: "🎥",
    name: "Movie",
    type: Categorytype.Monthly,
    id: 1,
  },
  {
    icon: "🏋🏻‍♂️",
    name: "Gym",
    type: Categorytype.Monthly,
    id: 2,
  },
  {
    icon: "🍔",
    name: "Junk Food",
    type: Categorytype.Monthly,
    id: 3,
  },

  {
    icon: "🍓",
    name: "Fruits",
    type: Categorytype.Monthly,
    id: 4,
  },

  {
    icon: "⛽️",
    name: "Gasoline",
    type: Categorytype.Monthly,
    id: 5,
  },
];

export default categories;