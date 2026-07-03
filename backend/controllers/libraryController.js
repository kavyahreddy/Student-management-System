const Book = require("../models/Book");
const BookIssue = require("../models/BookIssue");

const addBook = async (req, res) => {
  try {
    const { title, author, isbn, category, totalCopies } = req.body;
    const book = await Book.create({
      title,
      author,
      isbn,
      category,
      totalCopies,
      availableCopies: totalCopies,
      addedBy: req.user._id,
    });
    res.status(201).json({ book });
  } catch (err) {
    res.status(500).json({ message: "Failed to add book", error: err.message });
  }
};

const listBooks = async (req, res) => {
  const { search } = req.query;
  const filter = search
    ? { $or: [{ title: new RegExp(search, "i") }, { author: new RegExp(search, "i") }] }
    : {};
  const books = await Book.find(filter).sort({ createdAt: -1 });
  res.json({ books });
};

const issueBook = async (req, res) => {
  try {
    const { bookId, studentId, dueDate } = req.body;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.availableCopies < 1) return res.status(400).json({ message: "No copies available" });

    book.availableCopies -= 1;
    await book.save();

    const issue = await BookIssue.create({
      book: bookId,
      student: studentId,
      dueDate,
      issuedBy: req.user._id,
    });

    res.status(201).json({ issue });
  } catch (err) {
    res.status(500).json({ message: "Failed to issue book", error: err.message });
  }
};

const returnBook = async (req, res) => {
  try {
    const issue = await BookIssue.findById(req.params.id).populate("book");
    if (!issue) return res.status(404).json({ message: "Issue record not found" });
    if (issue.status === "returned") return res.status(400).json({ message: "Already returned" });

    issue.returnDate = new Date();
    issue.status = "returned";

    // Simple overdue fine: ₹5/day
    if (issue.returnDate > issue.dueDate) {
      const daysLate = Math.ceil((issue.returnDate - issue.dueDate) / (1000 * 60 * 60 * 24));
      issue.fine = daysLate * 5;
    }
    await issue.save();

    issue.book.availableCopies += 1;
    await issue.book.save();

    res.json({ issue });
  } catch (err) {
    res.status(500).json({ message: "Failed to return book", error: err.message });
  }
};

const myIssuedBooks = async (req, res) => {
  const issues = await BookIssue.find({ student: req.user._id }).populate("book").sort({ issueDate: -1 });
  res.json({ issues });
};

const allIssuedBooks = async (req, res) => {
  const issues = await BookIssue.find().populate("book student", "title author name admissionNo").sort({ issueDate: -1 });
  res.json({ issues });
};

module.exports = { addBook, listBooks, issueBook, returnBook, myIssuedBooks, allIssuedBooks };
