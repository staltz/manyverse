export interface Mutant<T> {}
export type MutantWatch = {
  <T>(m: Mutant<T>, cb: (val: T) => void): () => {};
};
