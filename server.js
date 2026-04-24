require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // 👈 NEW

const Blog = require("./models/Blog");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

// 👇 Serve frontend (IMPORTANT)
app.use(express.static(path.join(__dirname, "public")));

// Test route (optional, can remove later)
app.get("/api", (req, res) => {
  res.send("API is running...");
});

// -------------------- CRUD APIs --------------------

// CREATE Blog (POST)
app.post("/blogs", async (req, res) => {
  try {
    const { title, content, author } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and Content are required" });
    }

    const newBlog = new Blog({
      title,
      content,
      author
    });

    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ All Blogs (GET)
app.get("/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ Single Blog by ID (GET)
app.get("/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json(blog);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE Blog (PUT)
app.put("/blogs/:id", async (req, res) => {
  try {
    const { title, content, author } = req.body;

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, content, author },
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json(updatedBlog);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Blog (DELETE)
app.delete("/blogs/:id", async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

    if (!deletedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json({ message: "Blog deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- MongoDB Connection --------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });