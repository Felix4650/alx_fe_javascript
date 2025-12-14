let quotes = [];

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

/* =========================
   LOCAL STORAGE
========================= */
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  quotes = storedQuotes
    ? JSON.parse(storedQuotes)
    : [
        { text: "Code is poetry.", category: "Programming" },
        { text: "Stay hungry, stay foolish.", category: "Motivation" }
      ];
}

/* =========================
   DISPLAY QUOTES
========================= */
function displayQuotes(list) {
  quoteDisplay.innerHTML = "";

  if (list.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  list.forEach(quote => {
    const p = document.createElement("p");
    p.textContent = `"${quote.text}" — ${quote.category}`;
    quoteDisplay.appendChild(p);
  });
}

/* =========================
   CATEGORY HANDLING
========================= */
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

/* REQUIRED BY ALX */
function filterQuote() {
  const selectedCategory = categoryFilter.value;

  /* save selected category */
  localStorage.setItem("selectedCategory", selectedCategory);

  let filteredQuotes = quotes;

  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(
      quote => quote.category === selectedCategory
    );
  }

  displayQuotes(filteredQuotes);
}

/* REQUIRED BY ALX */
function restoreLastSelectedCategory() {
  const savedCategory = localStorage.getItem("selectedCategory");

  if (savedCategory) {
    categoryFilter.value = savedCategory;
  }

  filterQuote();
}

/* =========================
   ADD QUOTE
========================= */
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);

  saveQuotes();
  populateCategories();
  filterQuote();

  postQuoteToServer(newQuote);

  textInput.value = "";
  categoryInput.value = "";
}

/* =========================
   JSON EXPORT / IMPORT
========================= */
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();

  reader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);

    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    filterQuote();

    showNotification("Quotes imported successfully");
  };

  reader.readAsText(event.target.files[0]);
}

/* =========================
   SERVER SYNC (ALX REQUIRED)
========================= */
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
    quotes = serverQuotes; // server wins
    saveQuotes();
    populateCategories();
    filterQuote();

    showNotification("Quotes updated from server due to conflict resolution");
  }
}

/* =========================
   UI NOTIFICATION (ALX)
========================= */
function showNotification(message) {
  let notification = document.getElementById("notification");

  if (!notification) {
    notification = document.createElement("div");
    notification.id = "notification";
    notification.style.background = "#ffeb3b";
    notification.style.padding = "10px";
    notification.style.marginBottom = "10px";
    document.body.prepend(notification);
  }

  notification.textContent = message;
}

/* =========================
   EVENTS
========================= */
categoryFilter.addEventListener("change", filterQuote);

/* =========================
   INIT
========================= */
loadQuotes();
populateCategories();
restoreLastSelectedCategory();

/* periodic server sync */
setInterval(syncQuotes, 60000);

