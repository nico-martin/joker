export interface JokeI {
  category: string;
  error: boolean;
  flags: Record<string, boolean>;
  id: number;
  lang: string;
  safe: boolean;
  type: 'twopart' | 'single';
  setup?: string;
  delivery?: string;
  joke?: string;
}
