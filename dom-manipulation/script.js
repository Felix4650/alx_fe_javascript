let quotes = [];

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

/* =======================
   LOCAL STORAGE
======================= */
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  quotes = stored
    ? JSON.parse(stored)
    : [
        { text: "Code is poetry.", category: "Programming" },
        { text: "Stay hungry, stay foolish.", category: "Motivation" }
      ];
}

/* =======================
   DISPLAY LOGIC
======================= */
function displayQuotes(list) {
  quoteDisplay.innerHTML = "";

  if (list.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  list.forEach(q => {
    const p = document.createElement("p");
    p.textContent = `"${q.text}" — ${q.category}`;
    quoteDisplay.appendChild(p);
  });
}

/* =======================
   CATEGORY FILTERING
======================= */
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("lastFilter", selected);

  const filtered =
    selected === "all"
      ? quotes
      : quotes.filter(q => q.category === selected);

  displayQuotes(filtered);
}

function restoreLastFilter() {
  const saved = localStorage.getItem("lastFilter");
  if (saved) {
    categoryFilter.value = saved;
  }
  filterQuotes();
}

/* =======================
   ADD NEW QUOTE
======================= */
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  const newQuote = { text, category };

  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();

  postQuoteToServer(newQuote);
}

/* =======================
   JSON EXPORT / IMPORT
======================= */
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();

  reader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    filterQuotes();
    showNotification("Quotes imported successfully.");
  };

  reader.readAsText(event.target.files[0]);
}

/* =======================
   SERVER SYNC (REQUIRED)
======================= */
async function fetchQuotesFromServer() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  const data = await response.json();

  return data.slice(0, 5).map(post => ({
    text: post.title,
    category: "Server"
  }));
}

async function postQuoteToServer(quote) {
  await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    body: JSON.stringify(quote),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];

  if (JSON.stringify(serverQuotes) !== JSON.stringify(localQuotes)) {
    quotes = serverQuotes; // server wins conflict
    saveQuotes();
    populateCategories();
    filterQuotes();
    showNotification("Quotes updated from server due to conflict resolution.");
  }
}

/* =======================
   UI NOTIFICATIONS
======================= */
function showNotification(message) {
  const note = document.createElement("div");
  note.textContent = message;
  note.style.background = "#ffeb3b";
  note.style.padding = "10px";
  note.style.marginBottom = "10px";
  document.body.prepend(note);

  setTimeout(() => note.remove(), 4000);
}

/* =======================
   EVENTS
======================= */
document.getElementById("newQuote").addEventListener("click", filterQuotes);

/* =======================
   INIT
======================= */
loadQuotes();
populateCategories();
restoreLastFilter();

setInterval(syncQuotes, 60000);
