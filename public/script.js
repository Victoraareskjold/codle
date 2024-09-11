const problemDate = document.getElementById("problem-date");
const problemDescription = document.getElementById("problem-description");
const correctOutput = document.getElementById("correct-output");

const userInput = document.getElementById("user-input");
const codeOutput = document.getElementById("codeOutput");
const submitBtn = document.getElementById("submit-btn");
const feedback = document.getElementById("feedback");

let attempts = 3;
const attempstCounter = document.getElementById("attempts");

attempstCounter.innerHTML = attempts + " forsøk igjen.";

const codeMirror = CodeMirror.fromTextArea(
  document.getElementById("user-input"),
  {
    mode: "javascript",
    lineNumbers: true,
    theme: "default",
  }
);

// Funksjon for å hente dagens problem
function fetchTodaysProblem() {
  fetch("/admin/today") // Henter fra din backend
    .then((response) => response.json())
    .then((data) => {
      // Hvis det er problemer med koden, vis error
      if (data.error) {
        problemDate.textContent = null;
        problemDescription.textContent = data.error;

        // Hvis dataen hentes, vis riktig data
      } else {
        problemDate.textContent = data.date;
        problemDescription.textContent = data.description;
        correctOutput.textContent = data.awnser;
        mustContain = data.mustContain;
      }
    })
    .catch((error) => {
      console.error("Feil ved henting av problem:", error);
    });
}

// Kall funksjonen når siden lastes inn
fetchTodaysProblem();

submitBtn.addEventListener("click", () => {
  const userCode = codeMirror.getValue(); // Hent kode fra CodeMirror

  if (mustContain && !userCode.includes(mustContain)) {
    attempts--;
    attempstCounter.innerHTML = attempts + " forsøk igjen.";
    feedback.innerHTML = "<p>Koden mangler et viktig element, prøv igjen.</p>";
    feedback.style.color = "orange";
    return;
  }

  if (userCode.length > 0) {
    fetch("/run-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: userCode }),
    })
      .then((response) => response.json())
      .then((data) => {
        codeOutput.value = data.output; // Sett utdata i textarea

        if (attempts <= 0) {
          feedback.innerHTML = "Ingen flere forsøk, prøv igjen i morgen.";
          codeMirror.setOption("readOnly", true); // Deaktiver CodeMirror
          codeMirror.setOption("cursorBlinkRate", -1);
        } else {
          // Vis feedback til brukeren
          if (data.correct) {
            feedback.innerHTML = "<p>koden din er korrekt!</p>";
            feedback.style.color = "green"; // Grønn farge for riktig svar
            codeMirror.setOption("readOnly", true); // Deaktiver CodeMirror
            codeMirror.setOption("cursorBlinkRate", -1);
          } else {
            attempts--;
            attempstCounter.innerHTML = attempts + " forsøk igjen.";
            feedback.innerHTML = "<p>Koden din er feil, prøv igjen.</p>";
            feedback.style.color = "red"; // Rød farge for feil svar
          }
        }
      })
      .catch((error) => {
        console.error("Feil ved innsending:", error);
      });
  } else {
    feedback.innerHTML = "Vennligst fyll ut feltet.";
  }
});
