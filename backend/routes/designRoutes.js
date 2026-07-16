const express = require('express');
const fs = require('fs');
const path = require('path');
const Design = require('../models/Design');

const router = express.Router();

// Save design (Fabric.js base64 directly to database)
router.post("/design/save", async (req, res) => {
  try {
    const design = new Design(req.body);
    const saved = await design.save();
    res.json(saved);
  } catch (err) {
    console.error("❌ Save error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Save design (React-Konva base64 to disk, metadata to database)
router.post("/designs", async (req, res) => {
  try {
    const { title, description, imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ message: "No image data provided" });
    }

    // Ensure uploads folder exists
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save PNG file
    const base64Data = imageBase64.replace(/^data:image\/png;base64,/, "").replace(/\s/g, "");
    const filename = `design-${Date.now()}.png`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, base64Data, "base64");

    // Save metadata in DB
    const newDesign = new Design({
      image: `/uploads/${filename}`,
      type: title, // "bedsheet", "cupcoaster", "napkin"
      config: {
        description: description,
        ...req.body.config
      }
    });

    await newDesign.save();
    res.json({ message: "✅ Design saved successfully", design: newDesign });
  } catch (error) {
    console.error("Error saving design:", error);
    res.status(500).json({ message: "❌ Failed to save design", error: error.message });
  }
});

// Get all designs
router.get("/designs", async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) {
      filter.type = req.query.type;
    }
    const designs = await Design.find(filter).sort({ createdAt: -1 });
    res.json(designs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch designs" });
  }
});

// Delete design from MongoDB
router.post("/design/delete", async (req, res) => {
  try {
    const { id } = req.body;
    const deleted = await Design.findByIdAndDelete(id);

    if (deleted) {
      console.log("🗑️ Design deleted:", id);
      res.json({ success: true, deleted: true });
    } else {
      console.log("❌ Design not found:", id);
      res.json({ success: false, deleted: false });
    }
  } catch (err) {
    console.error("❌ Delete error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
