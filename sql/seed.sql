DELETE FROM borrow;
DELETE FROM book_copy;
DELETE FROM wrote;
DELETE FROM book;
DELETE FROM author;
DELETE FROM bookish_user;

INSERT INTO author(author_name) VALUES
    ("Steven Halim"),
    ("Felix Halim"),
    ("Suhendry Effendy"),
    ("Daniel Higginbotham")
;

INSERT INTO bookish_user(username, password_hash) VALUES
    ("hamsta","ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"), -- password123
    ("jamtur", "b9c950640e1b3740e98acb93e669c65766f6670dd1609ba91ff41052ba48c6f3") -- password1234
;

INSERT INTO book(title, isbn) VALUES 
    ("Competitive Programming 4", 9781716745515),
    ("Clojure for the Brave and True", 9781593275914)
;

INSERT INTO wrote(isbn, author_id) VALUES 
    (9781716745515, (SELECT author_id FROM author WHERE author_name = "Steven Halim")),
    (9781716745515, (SELECT author_id FROM author WHERE author_name = "Felix Halim")),
    (9781716745515, (SELECT author_id FROM author WHERE author_name = "Suhendry Effendy")),
    (9781593275914, (SELECT author_id FROM author WHERE author_name = "Daniel Higginbotham"))
;

INSERT INTO book_copy(isbn) VALUES
    (9781716745515),
    (9781716745515),
    (9781716745515),
    (9781593275914)
;

INSERT INTO borrow(copy_id, username, return_date) VALUES
    ((SELECT TOP 1 copy_id FROM book_copy WHERE isbn = 9781716745515), "hamsta", "08/07/2023"),
    ((SELECT TOP 1 copy_id FROM book_copy WHERE isbn = 9781593275914), "jamtur", "09/07/2023")
;
