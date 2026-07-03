import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Loader from "../components/Loader";

const Library = () => {
  const { user } = useAuth();
  const isAdmin = ["superadmin", "sectionadmin"].includes(user.role);

  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bookForm, setBookForm] = useState({ title: "", author: "", isbn: "", category: "", totalCopies: 1 });
  const [issueForm, setIssueForm] = useState({ bookId: "", studentId: "", dueDate: "" });

  const loadData = async () => {
    setLoading(true);
    try {
      const [booksRes, issuesRes] = await Promise.all([
        api.get("/library/books", { params: search ? { search } : {} }),
        isAdmin ? api.get("/library/issues") : api.get("/library/my-issues"),
      ]);
      setBooks(booksRes.data.books);
      setIssues(issuesRes.data.issues);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleAddBook = async (e) => {
    e.preventDefault();
    await api.post("/library/books", bookForm);
    setBookForm({ title: "", author: "", isbn: "", category: "", totalCopies: 1 });
    loadData();
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    await api.post("/library/issue", issueForm);
    setIssueForm({ bookId: "", studentId: "", dueDate: "" });
    loadData();
  };

  const handleReturn = async (id) => {
    await api.put(`/library/return/${id}`);
    loadData();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="section-title">Library</h2>
        <p className="text-navy/60 text-sm mt-1">Browse the catalogue and track book issues & returns.</p>
      </div>

      <input
        className="input-field max-w-sm"
        placeholder="Search by title or author..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isAdmin && (
        <div className="grid md:grid-cols-2 gap-4">
          <form onSubmit={handleAddBook} className="card space-y-3">
            <h3 className="font-display text-lg text-navy">Add a book</h3>
            <input className="input-field" placeholder="Title" value={bookForm.title}
              onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} required />
            <input className="input-field" placeholder="Author" value={bookForm.author}
              onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field" placeholder="ISBN (optional)" value={bookForm.isbn}
                onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} />
              <input className="input-field" type="number" min={1} placeholder="Copies" value={bookForm.totalCopies}
                onChange={(e) => setBookForm({ ...bookForm, totalCopies: e.target.value })} />
            </div>
            <input className="input-field" placeholder="Category (optional)" value={bookForm.category}
              onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })} />
            <button className="btn-accent" type="submit">Add book</button>
          </form>

          <form onSubmit={handleIssueBook} className="card space-y-3">
            <h3 className="font-display text-lg text-navy">Issue a book</h3>
            <select className="input-field" value={issueForm.bookId}
              onChange={(e) => setIssueForm({ ...issueForm, bookId: e.target.value })} required>
              <option value="">Select book</option>
              {books.map((b) => (
                <option key={b._id} value={b._id} disabled={b.availableCopies < 1}>
                  {b.title} ({b.availableCopies} available)
                </option>
              ))}
            </select>
            <input className="input-field" placeholder="Student ID" value={issueForm.studentId}
              onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })} required />
            <input className="input-field" type="date" value={issueForm.dueDate}
              onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })} required />
            <button className="btn-accent" type="submit">Issue book</button>
          </form>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="card">
            <h3 className="font-display text-lg text-navy mb-3">Catalogue</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-navy/50 border-b border-navy/10">
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Author</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Available</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => (
                    <tr key={b._id} className="border-b border-navy/5">
                      <td className="py-2 pr-4">{b.title}</td>
                      <td className="py-2 pr-4">{b.author}</td>
                      <td className="py-2 pr-4">{b.category || "—"}</td>
                      <td className="py-2 pr-4">{b.availableCopies} / {b.totalCopies}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h3 className="font-display text-lg text-navy mb-3">{isAdmin ? "All issued books" : "My issued books"}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-navy/50 border-b border-navy/10">
                    <th className="py-2 pr-4">Book</th>
                    {isAdmin && <th className="py-2 pr-4">Student</th>}
                    <th className="py-2 pr-4">Due date</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Fine</th>
                    {isAdmin && <th className="py-2 pr-4">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {issues.map((i) => (
                    <tr key={i._id} className="border-b border-navy/5">
                      <td className="py-2 pr-4">{i.book?.title}</td>
                      {isAdmin && <td className="py-2 pr-4">{i.student?.name} ({i.student?.admissionNo})</td>}
                      <td className="py-2 pr-4">{new Date(i.dueDate).toLocaleDateString()}</td>
                      <td className="py-2 pr-4 capitalize">{i.status}</td>
                      <td className="py-2 pr-4">₹{i.fine}</td>
                      {isAdmin && i.status !== "returned" && (
                        <td className="py-2 pr-4">
                          <button onClick={() => handleReturn(i._id)} className="text-gold-dark hover:underline">
                            Mark returned
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Library;
