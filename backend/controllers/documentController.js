const Document = require("../models/Document");
const { extractTextFromImage } = require("../utils/ocrService");

// Upload a document (ID proof, marksheet, certificate...) and run OCR on it
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { docType, ownerId } = req.body;

    const doc = await Document.create({
      owner: ownerId || req.user._id,
      docType: docType || "other",
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      ocrStatus: "processing",
      uploadedBy: req.user._id,
    });

    // Run OCR asynchronously so the upload response returns immediately
    extractTextFromImage(req.file.path)
      .then(async (text) => {
        doc.extractedText = text;
        doc.ocrStatus = "completed";
        await doc.save();
      })
      .catch(async (err) => {
        doc.ocrStatus = "failed";
        await doc.save();
        console.error("OCR extraction failed:", err.message);
      });

    res.status(201).json({ message: "Document uploaded, OCR processing started", document: doc });
  } catch (err) {
    res.status(500).json({ message: "Failed to upload document", error: err.message });
  }
};

const getDocumentStatus = async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Document not found" });
  res.json({ document: doc });
};

const myDocuments = async (req, res) => {
  const docs = await Document.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ documents: docs });
};

// Section/Super admin: list all documents pending verification
const pendingDocuments = async (req, res) => {
  const docs = await Document.find({ verified: false, ocrStatus: "completed" })
    .populate("owner", "name admissionNo department")
    .sort({ createdAt: -1 });
  res.json({ documents: docs });
};

const verifyDocument = async (req, res) => {
  const doc = await Document.findByIdAndUpdate(
    req.params.id,
    { verified: true, verifiedBy: req.user._id },
    { new: true }
  );
  if (!doc) return res.status(404).json({ message: "Document not found" });
  res.json({ message: "Document verified", document: doc });
};

module.exports = { uploadDocument, getDocumentStatus, myDocuments, pendingDocuments, verifyDocument };
