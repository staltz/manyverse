export type Callback<T> = (endOrErr: boolean | any, data?: T) => void;
export type Readable<T> = (endOrErr: boolean | any, cb?: Callback<T>) => void;
