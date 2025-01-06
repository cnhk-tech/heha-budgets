// Define types
export type Category = {
  icon: string;
  name: string;
  type: Categorytype;
};

export enum Categorytype {
  "Monthly",
  "Weekly"
};
