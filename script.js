// ----------------- SELECT ELEMENTS -----------------
const cashForm = document.getElementById('cashForm');
const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const typeInput = document.getElementById('type');
const recordsTable = document.getElementById('recordsTable');

const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const netBalanceEl = document.getElementById('netBalance');

const exportPdfBtn = document.getElementById('exportPdf');

// ----------------- INITIAL DATA -----------------
let records = JSON.parse(localStorage.getItem('cashRecords')) || [];

// ----------------- FUNCTIONS -----------------
function saveToLocalStorage() {
  localStorage.setItem('cashRecords', JSON.stringify(records));
}

function updateTotals() {
  const income = records
    .filter(r => r.type === 'Income')
    .reduce((sum, r) => sum + r.amount, 0);

  const expense = records
    .filter(r => r.type === 'Expense')
    .reduce((sum, r) => sum + r.amount, 0);

  totalIncomeEl.textContent = income;
  totalExpenseEl.textContent = expense;
  netBalanceEl.textContent = income - expense;

  updateSummaries();
}

function updateSummaries() {
  const now = new Date();

  let dailyIncome = 0, dailyExpense = 0;
  let monthlyIncome = 0, monthlyExpense = 0;
  let yearlyIncome = 0, yearlyExpense = 0;

  records.forEach(r => {
    const recordDate = new Date(r.date);
    const recordMonth = recordDate.getMonth();
    const recordYear = recordDate.getFullYear();

    if (r.type === 'Income') {
      if (recordDate.toDateString() === now.toDateString()) dailyIncome += r.amount;
      if (recordMonth === now.getMonth() && recordYear === now.getFullYear()) monthlyIncome += r.amount;
      if (recordYear === now.getFullYear()) yearlyIncome += r.amount;
    } else {
      if (recordDate.toDateString() === now.toDateString()) dailyExpense += r.amount;
      if (recordMonth === now.getMonth() && recordYear === now.getFullYear()) monthlyExpense += r.amount;
      if (recordYear === now.getFullYear()) yearlyExpense += r.amount;
    }
  });

  // Update HTML spans
  document.getElementById('dailyIncome').textContent = dailyIncome;
  document.getElementById('dailyExpense').textContent = dailyExpense;
  document.getElementById('dailyNet').textContent = dailyIncome - dailyExpense;

  document.getElementById('monthlyIncome').textContent = monthlyIncome;
  document.getElementById('monthlyExpense').textContent = monthlyExpense;
  document.getElementById('monthlyNet').textContent = monthlyIncome - monthlyExpense;

  document.getElementById('yearlyIncome').textContent = yearlyIncome;
  document.getElementById('yearlyExpense').textContent = yearlyExpense;
  document.getElementById('yearlyNet').textContent = yearlyIncome - yearlyExpense;
}

function renderRecords() {
  recordsTable.innerHTML = '';
  records.forEach((r, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${r.amount}</td>
      <td>${r.type}</td>
      <td>${r.description}</td>
      <td>${new Date(r.date).toLocaleDateString()} ${r.time}</td>
      <td>
        <button class="edit-btn" onclick="editRecord(${index})">Edit</button>
        <button class="delete-btn" onclick="deleteRecord(${index})">Delete</button>
      </td>
    `;
    recordsTable.appendChild(tr);
  });
}

function addRecord(e) {
  e.preventDefault();
  const amount = parseFloat(amountInput.value);
  const description = descriptionInput.value;
  const type = typeInput.value;

  const now = new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const time = now.toLocaleTimeString();

  records.push({ amount, description, type, date, time });
  saveToLocalStorage();
  updateTotals();
  renderRecords();

  cashForm.reset();
}

function deleteRecord(index) {
  records.splice(index, 1);
  saveToLocalStorage();
  updateTotals();
  renderRecords();
}

function editRecord(index) {
  const record = records[index];
  amountInput.value = record.amount;
  descriptionInput.value = record.description;
  typeInput.value = record.type;
  deleteRecord(index);
}

// ----------------- PDF EXPORT -----------------
exportPdfBtn.addEventListener('click', () => {
  if (records.length === 0) {
    alert('No records to export!');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Cash Flow Records', 14, 20);

  const tableColumn = ["#", "Amount", "Type", "Description", "Date", "Time"];
  const tableRows = [];

  records.forEach((r, index) => {
    tableRows.push([index + 1, r.amount, r.type, r.description, new Date(r.date).toLocaleDateString(), r.time]);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    styles: { fontSize: 10 },
  });

  doc.save('cashflow.pdf');
});

// ----------------- INIT -----------------
cashForm.addEventListener('submit', addRecord);
updateTotals();
renderRecords();
