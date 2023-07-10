DROP TABLE IF EXISTS borrow, book_copy, wrote, book, author, bookish_user;

CREATE table bookish_user(
    username VARCHAR(20) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    CONSTRAINT user_pk PRIMARY KEY (username)
); 

CREATE TABLE book(
    title VARCHAR(100) NOT NULL,
    isbn bigint NOT NULL,
    CONSTRAINT book_pk PRIMARY KEY (isbn)
);

CREATE TABLE author(
    author_id int IDENTITY(0, 1),
    author_name VARCHAR(30) NOT NULL,
    CONSTRAINT author_pk PRIMARY KEY (author_id) 
);

CREATE TABLE wrote(
    isbn bigint NOT NULL,
    author_id int NOT NULL,
    CONSTRAINT isbn_fk FOREIGN KEY (isbn) REFERENCES book(isbn),
    CONSTRAINT author_fk FOREIGN KEY (author_id) REFERENCES author(author_id),
    CONSTRAINT wrote_pk PRIMARY KEY (isbn, author_id)
);

CREATE TABLE book_copy(
    copy_id int IDENTITY(0, 1),
    isbn bigint,
    CONSTRAINT copy_pk PRIMARY KEY (copy_id),
    CONSTRAINT copy_fk FOREIGN KEY (isbn) REFERENCES book(isbn)
);

CREATE TABLE borrow(
    copy_id int,
    username VARCHAR(20),
    return_date date,
    CONSTRAINT borrow_pk PRIMARY KEY(copy_id),
    CONSTRAINT borrow_copy_fk FOREIGN KEY (copy_id) REFERENCES book_copy(copy_id),
    CONSTRAINT borrow_user_fk FOREIGN KEY (username) REFERENCES bookish_user (username) 
);
