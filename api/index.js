const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

// Server statiske filer fra public-mappen
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

// Definer filbanen en gang, bruk absolutt bane
const filePath = path.join(__dirname, "problems.json");

// Rute for å hente dagens problem
app.get("/admin/today", (req, res) => {
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error(`Error reading file at ${filePath}: ${err.message}`);
      return res.status(500).json({ error: "Feil ved lasting av problemer." });
    }

    try {
      const problems = JSON.parse(data);
      const today = new Date()
        .toISOString()
        .slice(0, 10)
        .split("-")
        .reverse()
        .join("-");

      const todaysProblem = problems.find((problem) => problem.date === today);

      if (todaysProblem) {
        res.json(todaysProblem);
      } else {
        const randomIndex = Math.floor(Math.random() * problems.length);
        const randomProblem = problems[randomIndex];
        res.json(randomProblem);
      }
    } catch (parseError) {
      console.error(`Error parsing JSON data: ${parseError.message}`);
      res.status(500).json({ error: "Feil ved parsing av JSON-data." });
    }
  });
});

// Rute for å hente alle problemer
app.get("/admin", (req, res) => {
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error(`Error reading file at ${filePath}: ${err.message}`);
      return res.status(500).json({ error: "Feil ved lasting av problemer" });
    }

    try {
      const problems = JSON.parse(data);
      res.json(problems);
    } catch (parseError) {
      console.error(`Error parsing JSON data: ${parseError.message}`);
      res.status(500).json({ error: "Feil ved parsing av JSON-data." });
    }
  });
});

// Ny rute for å kjøre brukerens kode
app.post("/run-code", (req, res) => {
  const { code } = req.body;

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error(`Error reading file at ${filePath}: ${err.message}`);
      return res.status(500).json({ error: "Feil ved lasting av problemer." });
    }

    try {
      const problems = JSON.parse(data);
      const today = new Date()
        .toISOString()
        .slice(0, 10)
        .split("-")
        .reverse()
        .join("-");

      const todaysProblem = problems.find((problem) => problem.date === today);

      if (!todaysProblem) {
        // Hvis ingen spesifikke oppgave for i dag, velg en tilfeldig oppgave
        const randomIndex = Math.floor(Math.random() * problems.length);
        todaysProblem = problems[randomIndex];
      }

      if (!todaysProblem || !todaysProblem.answer) {
        console.log("Ingen oppgave funnet eller svar mangler.");
        return res
          .status(400)
          .json({ error: "Ingen oppgave funnet eller svar mangler." });
      }

      const correctAnswer = todaysProblem.answer; // Hent fasitsvaret
      console.log("Fasitsvaret er:", correctAnswer); // Logge fasitsvaret

      let output = "";
      const originalConsoleLog = console.log;
      console.log = (msg) => {
        output += msg + "\n";
      };

      eval(code);

      console.log = originalConsoleLog;

      output = output.trim();

      const correct = output === correctAnswer.toString().trim();

      res.json({
        output,
        correct,
      });
    } catch (error) {
      res
        .status(500)
        .json({ output: `Feil ved evaluering av koden: ${error.message}` });
    }
  });
});

// Eksporter appen som handler for serveren
module.exports = (req, res) => {
  app(req, res);
};
