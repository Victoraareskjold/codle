const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

// Server statiske filer fra public-mappen
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

// Rute for å hente dagens problem
app.get("/admin/today", (req, res) => {
  fs.readFile("problems.json", "utf-8", (err, data) => {
    if (err)
      return res.status(500).json({ error: "Feil ved lasting av problemer." });

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
      res.json({ error: "Ingen oppgave tilgjengelig for i dag." });
    }
  });
});

app.get("/admin", (req, res) => {
  fs.readFile("problems.json", "utf-8", (err, data) => {
    if (err)
      return res.status(500).json({ error: "Feil ved lasting av problemer" });

    const problems = JSON.parse(data);

    if (problems) {
      res.json(problems);
    } else {
      res.json({ error: "Det er ingen lagrede oppgaver." });
    }
  });
});

// Ny rute for å kjøre brukerens kode
app.post("/run-code", (req, res) => {
  const { code } = req.body;

  // Les dagens problem for å hente fasitsvaret
  fs.readFile("problems.json", "utf-8", (err, data) => {
    if (err)
      return res.status(500).json({ error: "Feil ved lasting av problemer." });

    const problems = JSON.parse(data);
    const today = new Date()
      .toISOString()
      .slice(0, 10)
      .split("-")
      .reverse()
      .join("-");

    const todaysProblem = problems.find((problem) => problem.date === today);

    if (!todaysProblem) {
      return res.status(400).json({ error: "Ingen oppgave funnet for i dag." });
    }

    const correctAwnser = todaysProblem.awnser; // Hent fasitsvaret

    try {
      // Erstatt console.log med en tilpasset funksjon
      let output = "";
      const originalConsoleLog = console.log;
      console.log = (msg) => {
        output += msg + "\n";
      };

      // Evaluer brukerens kode
      eval(code);

      // Gjenopprett original console.log
      console.log = originalConsoleLog;

      // Fjern trailing newline fra output
      output = output.trim();

      // Sjekk om output er lik fasiten
      const correct = output === correctAwnser.toString();

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

app.listen(3000, () => {
  console.log("Server kjører på http://localhost:3000");
});
