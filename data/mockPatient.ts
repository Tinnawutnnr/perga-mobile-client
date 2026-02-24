export type Patient = {
  id: number;
  fullname: string;
  height: number;
  weight: number;
  age: number;
  caretakerId?: number;
};

export const mockPatients: Patient[] = [
  {
    id: 1,
    fullname: "John Doe",
    height: 170,
    weight: 65.5,
    age: 72,
    caretakerId: 1,
  },
  {
    id: 2,
    fullname: "Jane Smith",
    height: 158,
    weight: 55.0,
    age: 65,
    caretakerId: 1,
  },
  {
    id: 3,
    fullname: "Robert Brown",
    height: 175,
    weight: 78.0,
    age: 80,
    caretakerId: 2,
  },
];
