const problemDate = document.getElementById("problem-date");
const problemDescription = document.getElementById("problem-description");
const correctOutput = document.getElementById("correct-output");

const userInput = document.getElementById("user-input");
const codeOutput = document.getElementById("codeOutput");
const submitBtn = document.getElementById("submit-btn");
const feedback = document.getElementById("feedback");

let attempts = 3;
const attempstCounter = document.getElementById("attempts");

const today = new Date()
  .toISOString()
  .slice(0, 10)
  .split("-")
  .reverse()
  .join("-");

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
        if (data.date !== today) {
          problemDate.innerHTML = `
            <p>${data.date} (Tidligere oppgave.)</p>`;
        }
        problemDescription.textContent = data.description;
        correctOutput.textContent = data.answer;
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
        codeOutput.value = data.output;

        if (attempts > 0) {
          // Sjekk om koden inneholder det nødvendige elementet
          if (mustContain && userCode.includes(mustContain)) {
            if (data.correct) {
              feedback.innerHTML = "<p>Koden din er korrekt!</p>";
              feedback.style.color = "green"; // Grønn farge for riktig svar
              codeMirror.setOption("readOnly", true); // Deaktiver CodeMirror
              codeMirror.setOption("cursorBlinkRate", -1);
            } else {
              feedback.innerHTML = "<p>Koden din er feil, prøv igjen.</p>";
              feedback.style.color = "red"; // Rød farge for feil svar

              // Reduser forsøk etter å ha gitt tilbakemelding
              attempts--;
              attempstCounter.innerHTML = attempts + " forsøk igjen.";
            }
          } else {
            feedback.innerHTML =
              "<p>Koden mangler et viktig element, prøv igjen.</p>";
            feedback.style.color = "orange";

            // Reduser forsøk etter å ha gitt tilbakemelding
            attempts--;
            attempstCounter.innerHTML = attempts + " forsøk igjen.";
          }

          // Sjekk om det var siste forsøk etter oppdatering av attempts
          if (attempts === 0) {
            feedback.innerHTML = "Ingen flere forsøk, prøv igjen i morgen.";
            feedback.style.color = "red";
            submitBtn.disabled = true; // Deaktiver knappen
            codeMirror.setOption("readOnly", true); // Deaktiver CodeMirror
            codeMirror.setOption("cursorBlinkRate", -1);
          }
        } else {
          feedback.innerHTML = "Ingen flere forsøk, prøv igjen i morgen.";
          feedback.style.color = "red";
          submitBtn.disabled = true; // Deaktiver knappen
          codeMirror.setOption("readOnly", true); // Deaktiver CodeMirror
          codeMirror.setOption("cursorBlinkRate", -1);
        }
      })
      .catch((error) => {
        console.error("Feil ved innsending:", error);
      });
  } else {
    feedback.innerHTML = "Vennligst fyll ut feltet.";
  }
});
