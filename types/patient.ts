export type Patient = {
  id: number;
  fullname: string;
  height: number;
  weight: number;
  age: number;
  caretakerId?: number;
};
