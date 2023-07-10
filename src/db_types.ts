import {TYPES} from 'tedious';

export type Param = {
    name: string;
    value: any;
    type: TYPES
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
    book: Book;
    return_date: Date;
}

export type BorrowWithUser = {
    return_date: Date;
    user: string;
}

export type Counts {
    borrowed: number;
    total: number;
}