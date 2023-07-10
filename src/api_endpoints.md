# API Plan

## /books
- /add - Add new books by submitting the book's title, author(s), ISBN, and the number of copies owned by the library.
- ✅ /search - Search books by title or author.
- /catalogue - Show the library catalogue. This shows a paged view of every book in the catalogue, ordered alphabetically.
- ✅ /get - View the number of copies for a book in total, and the number which are currently available. Where some books are unavailable, it shows which user borrowed them, and the date that they're due back.

## /user
- ✅ /login
- ✅ /borrows/list show user's borrows - Show a list of books which are currently checked out in the user's name, and the due date for returns.
- /borrows/make - make a borrow for user

## /authors
- /search search authors by name
