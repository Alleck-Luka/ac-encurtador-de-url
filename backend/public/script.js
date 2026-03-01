async function shorten() {
  const original = document.getElementById("urlInput").value;

  const response = await fetch("/shorten", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ original }),
  });

  const data = await response.json();

  document.getElementById("result").innerHTML = `URL encurtada: http://localhost:3000/${data.shortCode}`;
}
