export type Item = {
  id: number;
  title: string;
  work: string;
  character: string;
  category: string;
  price: number;
  description: string;
  image: string;
  created_at?: string;
  submitter_id?: string | null;
};