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
          if (mustContain && userCode.includes(mustContain)) {
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
          } else {
            attempts--;
            attempstCounter.innerHTML = attempts + " forsøk igjen.";
            feedback.innerHTML =
              "<p>Koden mangler et viktig element, prøv igjen.</p>";
            feedback.style.color = "orange";
          }
        } else {
          feedback.innerHTML = "Ingen flere forsøk, prøv igjen i morgen.";
          submitBtn.style = "disabled";
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
