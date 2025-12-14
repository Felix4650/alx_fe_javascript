let quotes = [];
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

/* ---------- STORAGE ---------- */
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  quotes = stored ? JSON.parse(stored) : [
    { text: "Code is poetry.", category: "Programming" },
    { text: "Stay hungry, stay foolish.", category: "Motivation" }
  ];
}

/* ---------- DISPLAY ---------- */
function showRandomQuote(list = quotes) {
  if (list.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  const quote = list[Math.floor(Math.random() * list.length)];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

/* ---------- ADD QUOTE ---------- */
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  showRandomQuote();
}

/* ---------- CATEGORIES ---------- */
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem("lastFilter");
  if (savedFilter) {
    categoryFilter.value = savedFilter;
    filterQuotes();
  }
}

function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("lastFilter", selected);

  if (selected === "all") {
    showRandomQuote(quotes);
  } else {
    const filtered = quotes.filter(q => q.category === selected);
    showRandomQuote(filtered);
  }
}

/* ---------- JSON EXPORT ---------- */
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

/* ---------- JSON IMPORT ---------- */
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
  };
  reader.readAsText(event.target.files[0]);
}

/* ---------- SERVER SYNC (SIMULATION) ---------- */
async function syncWithServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverData = await response.json();

    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    quotes = serverQuotes; // server takes precedence
    saveQuotes();
    populateCategories();
    alert("Data synced with server.");
  } catch (error) {
    console.error("Sync failed", error);
  }
}

/* ---------- EVENTS ---------- */
document.getElementById("newQuote").addEventListener("click", () => {
  filterQuotes();
});  

/* ---------- INIT ---------- */
loadQuotes();
populateCategories();

const lastQuote = sessionStorage.getItem("lastQuote");
lastQuote ? quoteDisplay.textContent = JSON.parse(lastQuote).text : showRandomQuote();

setInterval(syncWithServer, 60000); // periodic sync
