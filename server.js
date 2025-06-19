const express = require("express");
const path = require("path");
const serveIndex = require("serve-index");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static("public"));

// Serve Songs folder with directory listing
app.use("/Songs", express.static("Songs"), serveIndex("Songs", { icons: true }));

// Fallback for SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
