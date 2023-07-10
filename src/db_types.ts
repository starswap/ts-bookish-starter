export type Param = {
    name: string;
    value: string;
}

export type Book = {
    title: string;
    isbn: number;
}

export type User = {
    username: string;
    password_hash: string;
}

export type Borrow = {
    title: string;
    return_date: Date;
}