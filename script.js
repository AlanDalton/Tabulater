const form = document.getElementById('tabulate-form');
const inputText = document.getElementById('input-text');
const output = document.getElementById('output');
const tableContainer = document.getElementById('table-container');
const copyTableButton = document.getElementById('copy-table');
const copyHtmlButton = document.getElementById('copy-html');
const copyConfirmation = document.getElementById('copy-confirmation');
const errorMessage = document.getElementById('error-message');
const errorDetails = document.getElementById('error-details');

let generatedHtml = '';

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const text = inputText.value.trim();

  if (!text) {
    return;
  }

  // Hide previous output and errors
  output.hidden = true;
  errorMessage.hidden = true;
  copyConfirmation.hidden = true;

  // Disable the submit button while waiting
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Generating…';

  try {
    const response = await fetch('/api/tabulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    generatedHtml = data.table;
    tableContainer.innerHTML = generatedHtml;
    output.hidden = false;

  } catch (error) {
    errorDetails.textContent = error.message;
    errorMessage.hidden = false;

  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Generate table';
  }
});

copyTableButton.addEventListener('click', () => {
  const table = tableContainer.querySelector('table');
  if (!table) return;

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNode(table);
  selection.removeAllRanges();
  selection.addRange(range);

  try {
    document.execCommand('copy');
    selection.removeAllRanges();
    showConfirmation();
  } catch (error) {
    errorDetails.textContent = 'Could not copy the table. Please try selecting and copying it manually.';
    errorMessage.hidden = false;
  }
});

copyHtmlButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(generatedHtml);
    showConfirmation();
  } catch (error) {
    errorDetails.textContent = 'Could not copy the HTML. Please try selecting and copying it manually.';
    errorMessage.hidden = false;
  }
});

function showConfirmation() {
  copyConfirmation.hidden = false;
  setTimeout(() => {
    copyConfirmation.hidden = true;
  }, 3000);
}
