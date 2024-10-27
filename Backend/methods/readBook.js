const mongoose = require("mongoose");
const EPub = require("epub"); // EPUB parsing library
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const Content = require("../models/Content"); // MongoDB Model
const { htmlToText } = require("html-to-text"); // For improved HTML parsing

// Step 1: Set up MongoDB connection
const config = require("../config/config.json"); // Assuming config.json contains { "MongoDBURI": "your-mongodb-uri" }
mongoose
  .connect(config.MongoDBURI)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit if connection fails
  });

// Function to check if the EPUB file exists
const checkFileExists = (filePath) => {
  return fs.existsSync(filePath);
};

// Function to convert HTML to clean text
const convertHtmlToText = (htmlContent) => {
  return htmlToText(htmlContent, {
    wordwrap: false,
    preserveNewlines: false,
    selectors: [
      { selector: "a", options: { ignoreHref: true } },
      { selector: "img", format: "skip" }, // Skip images
      { selector: "script", format: "skip" }, // Skip scripts
      { selector: "style", format: "skip" }, // Skip styles
    ],
  }).trim();
};

// Function to split content into pages
const splitTextIntoPages = (text, maxCharsPerPage = 1500) => {
  const pages = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + maxCharsPerPage;

    // Make sure to split at the end of a word
    if (endIndex < text.length) {
      while (endIndex < text.length && text[endIndex] !== " ") {
        endIndex++;
      }
    }

    const pageContent = text.substring(startIndex, endIndex).trim();
    pages.push(pageContent);
    startIndex = endIndex;
  }

  return pages;
};

// Step 2: Function to Parse EPUB and Save Content
async function parseEpubAndSave(filePath, bookData) {
  try {
    if (!checkFileExists(filePath)) {
      console.error(`The EPUB file does not exist at: ${filePath}`);
      return;
    }

    // Initialize EPub parser
    const epub = new EPub(filePath, "", "");

    // Listen for EPUB load completion
    epub.on("end", async () => {
      let pageNumber = 1;

      // Use the TOC to ensure correct ordering of chapters
      const orderedChapters = epub.flow.sort((a, b) => a.index - b.index);

      for (const chapter of orderedChapters) {
        try {
          // Get the text of the chapter
          epub.getChapter(chapter.id, (error, htmlContent) => {
            if (error) {
              console.error(`Error fetching chapter content:`, error);
              return;
            }

            // Convert HTML to clean text
            const textContent = convertHtmlToText(htmlContent);

            // Split the text content into pages
            const pages = splitTextIntoPages(textContent);

            // Prepare each page as a separate section with a sequential page number
            // Adjusted to skip the first 15 sections and adjust section numbers
            pages.forEach((page) => {
              pageNumber++;
              if (pageNumber > 16) {
                // Start adding sections only after the first 15
                const sectionData = {
                  SectionID: uuidv4(), // Unique ID for each section
                  SectionNumber: pageNumber - 16, // Adjusted section number after skipping the first 15
                  OriginalText: page,
                };

                // Add to bookData sections
                bookData.Sections.push(sectionData);
              }
            });
          });
        } catch (error) {
          console.error(`Error processing section:`, error);
        }
      }

      // Save to MongoDB after all chapters are processed
      await saveBookToMongo(bookData);
    });

    // Listen for any errors during parsing
    epub.on("error", (error) => {
      console.error("EPUB Parsing Error:", error);
    });

    // Start parsing
    epub.parse();
  } catch (error) {
    console.error("Failed to process EPUB:", error);
  }
}

// Step 3: Function to Save Content to MongoDB
async function saveBookToMongo(bookData) {
  try {
    // Check if the content already exists
    const existing = await Content.findOne({ ContentID: bookData.ContentID });
    if (existing) {
      console.log("Content already exists. Skipping save.");
      return;
    }

    // Create and save new content
    const content = new Content({
      ContentID: "61bf26eb-f916-42dd-9783-de6946402b4a",
      Title: bookData.Title,
      Author: bookData.Author,
      Metadata: bookData.Metadata,
      Sections: bookData.Sections,
      TotalSections: bookData.Sections.length
    });

    await content.save();
    console.log("Book content saved successfully!");
  } catch (error) {
    console.error("Failed to save book content:", error);
  }
}

// Example Usage:
const filePath = path.resolve(__dirname, "./book2.epub"); // Adjust the path to your EPUB file
const bookData = {
  ContentID: uuidv4(),
  Title: "Frankenstein; Or, The Modern Prometheus",
  Author: "Mary Wollstonecraft Shelley",
  Metadata: {
    PublishedDate: new Date("1993-10-01"),
    CoverPage: "https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg",
  },
  Sections: [], // This will be populated by the parsed content
};

// Check if the EPUB exists and parse it
if (checkFileExists(filePath)) {
  parseEpubAndSave(filePath, bookData).catch(console.error);
} else {
  console.error("EPUB file not found at the specified path.");
}
