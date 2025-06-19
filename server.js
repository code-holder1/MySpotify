const express = require("express");
const serveIndex = require("serve-index");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static("public"));

// Serve Songs folder with file listing
app.use("/Songs", express.static("Songs"), serveIndex("Songs", { icons: true }));

// Fallback route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
