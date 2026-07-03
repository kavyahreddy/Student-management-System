import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Loader from "../components/Loader";

const statusStyles = {
  pending: "bg-navy/10 text-navy/60",
  processing: "bg-gold/20 text-gold-dark",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const Documents = () => {
  const { user } = useAuth();
  const isAdmin = ["superadmin", "sectionadmin"].includes(user.role);

  const [myDocs, setMyDocs] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docType, setDocType] = useState("id_proof");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [mineRes, pendingRes] = await Promise.all([
        api.get("/documents/my-documents"),
        isAdmin ? api.get("/documents/pending") : Promise.resolve({ data: { documents: [] } }),
      ]);
      setMyDocs(mineRes.data.documents);
      setPending(pendingRes.data.documents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000); // poll for OCR completion
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("docType", docType);
      await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Uploaded — extracting text with OCR, this refreshes automatically.");
      setFile(null);
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (id) => {
    await api.put(`/documents/verify/${id}`);
    loadData();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="section-title">Documents & OCR verification</h2>
        <p className="text-navy/60 text-sm mt-1">
          Upload ID proofs, marksheets or certificates — text is extracted automatically for quick review.
        </p>
      </div>

      <form onSubmit={handleUpload} className="card grid md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-navy mb-1">Document type</label>
          <select className="input-field" value={docType} onChange={(e) => setDocType(e.target.value)}>
            <option value="id_proof">ID proof</option>
            <option value="marksheet">Marksheet</option>
            <option value="certificate">Certificate</option>
            <option value="fee_receipt">Fee receipt</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">File (JPG/PNG)</label>
          <input className="input-field" type="file" accept=".jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} required />
        </div>
        <button className="btn-accent h-fit" type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload & scan"}
        </button>
        {message && <p className="md:col-span-3 text-sm text-navy/70">{message}</p>}
      </form>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="card">
            <h3 className="font-display text-lg text-navy mb-3">My documents</h3>
            <div className="space-y-3">
              {myDocs.length === 0 && <p className="text-sm text-navy/50">No documents uploaded yet.</p>}
              {myDocs.map((d) => (
                <div key={d._id} className="border border-navy/10 rounded-lg p-4">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <p className="font-medium text-navy">{d.originalFileName}</p>
                      <p className="text-xs text-navy/50 capitalize">{d.docType.replace("_", " ")}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[d.ocrStatus]}`}>
                      {d.ocrStatus}
                    </span>
                  </div>
                  {d.extractedText && (
                    <div className="mt-3 bg-navy/5 rounded-md p-3 text-xs text-navy/70 max-h-28 overflow-y-auto whitespace-pre-wrap">
                      {d.extractedText}
                    </div>
                  )}
                  {d.verified && <p className="text-xs text-green-700 mt-2">✓ Verified</p>}
                </div>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="card">
              <h3 className="font-display text-lg text-navy mb-3">Pending verification</h3>
              <div className="space-y-3">
                {pending.length === 0 && <p className="text-sm text-navy/50">Nothing awaiting verification.</p>}
                {pending.map((d) => (
                  <div key={d._id} className="border border-navy/10 rounded-lg p-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <p className="font-medium text-navy">
                          {d.originalFileName} · {d.owner?.name} ({d.owner?.admissionNo || d.owner?.department})
                        </p>
                        <p className="text-xs text-navy/50 capitalize">{d.docType.replace("_", " ")}</p>
                      </div>
                      <button onClick={() => handleVerify(d._id)} className="btn-primary text-sm py-1.5">
                        Verify
                      </button>
                    </div>
                    {d.extractedText && (
                      <div className="mt-3 bg-navy/5 rounded-md p-3 text-xs text-navy/70 max-h-28 overflow-y-auto whitespace-pre-wrap">
                        {d.extractedText}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Documents;
