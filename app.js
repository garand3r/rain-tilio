const TIME_LIMIT = 15 * 60 * 1000;
const ADMIN_PASSWORD = "cafe123";

let visitors = JSON.parse(localStorage.getItem("cafequeue_data")) || [];
let loggedIn = false;

function saveData() {
  localStorage.setItem("cafequeue_data", JSON.stringify(visitors));
}

function login() {
  const pass = document.getElementById("adminPass").value;

  if (pass === ADMIN_PASSWORD) {
    loggedIn = true;
    document.getElementById("loginCard").classList.add("hidden");
    document.getElementById("systemArea").classList.remove("hidden");
    loadVisitors();
  } else {
    alert("Incorrect password");
  }
}

function logout() {
  loggedIn = false;
  document.getElementById("systemArea").classList.add("hidden");
  document.getElementById("loginCard").classList.remove("hidden");
}

function registerVisitor() {
  const name = document.getElementById("name").value.trim();
  const zone = document.getElementById("zone").value;

  if (!name) {
    alert("Please enter visitor name");
    return;
  }

  const visitor = {
    id: Date.now(),
    name,
    zone,
    startTime: Date.now(),
    timedOut: false
  };

  visitors.push(visitor);

  saveData();
  printReceipt(visitor);

  document.getElementById("name").value = "";

  loadVisitors();
}

function loadVisitors() {

  if (!loggedIn) return;

  const container = document.getElementById("visitors");
  container.innerHTML = "";

  visitors.forEach(v => {

    if (!v.timedOut && Date.now() - v.startTime >= TIME_LIMIT) {
      v.timedOut = true;
    }

    const div = document.createElement("div");
    div.className = "visitor";

    if (v.timedOut) div.classList.add("timeout");

    const timeLeft = getTimeLeft(v.startTime);

    div.innerHTML = `
      <strong>${v.name}</strong><br>
      Zone: ${v.zone}<br>
      ${v.timedOut ? "⚠ Timed Out" : "Time Left: " + timeLeft}
      <br><button onclick="printReceiptById(${v.id})">Reprint</button>
    `;

    container.appendChild(div);

  });

  saveData();
}

function getTimeLeft(startTime) {

  const remaining = Math.max(TIME_LIMIT - (Date.now() - startTime), 0);

  const m = Math.floor(remaining / 60000);
  const s = Math.floor((remaining % 60000) / 1000);

  return `${m}:${s.toString().padStart(2, "0")}`;
}

function printReceipt(visitor) {

  const receiptWindow = window.open("", "", "width=300,height=600");

  receiptWindow.document.write(`
  <html>
  <head>
  <title>Receipt</title>

  <style>

  body{
    width:58mm;
    margin:0;
    padding:5px;
    font-family: monospace;
    font-size:12px;
    text-align:center;
  }

  .line{
    border-top:1px dashed black;
    margin:5px 0;
  }

  @media print{
    @page{
      size:58mm auto;
      margin:0;
    }
  }

  </style>
  </head>

  <body>

  <b>CAFEQUEUE</b><br>
  Art Museum Cafe

  <div class="line"></div>

  Visitor:<br>
  ${visitor.name}<br><br>

  Zone:<br>
  ${visitor.zone}<br><br>

  Time Limit: 15 Minutes

  <div class="line"></div>

  Issued:<br>
  ${new Date().toLocaleString()}

  <div class="line"></div>

  Enjoy Your Visit!

  </body>
  </html>
  `);

  receiptWindow.document.close();

  setTimeout(() => {
    receiptWindow.print();
    receiptWindow.close();
  }, 300);
}

function printReceiptById(id) {

  const visitor = visitors.find(v => v.id === id);

  if (visitor) {
    printReceipt(visitor);
  }
}

function exportCSV() {

  let csv = "Name,Zone,Timed Out\n";

  visitors.forEach(v => {
    csv += `"${v.name}","${v.zone}","${v.timedOut}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);

  link.download = "CafeQueue_Report.csv";

  link.click();
}

setInterval(loadVisitors, 1000);
