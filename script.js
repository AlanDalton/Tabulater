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

const samples = {
  'sample-worldcup': `The FIFA World Cup is the most prestigious trophy in international football, and since the first tournament was held in Uruguay in 1930, only eight countries have ever won it. Uruguay were the first winners, and they won it again in 1950. Italy won the tournament twice in a row, in 1934 and 1938, and then won it again in 1982 and 2006. Brazil are the most successful nation of all, having won the World Cup five times: in 1958, 1962, 1970, 1994, and 2002. England won the World Cup just once, on home soil in 1966. Germany — competing as West Germany in their earlier victories — have won the tournament four times, in 1954, 1974, 1990, and 2014. Argentina have won it three times, in 1978, 1986, and most recently in 2022. France have won it twice, in 1998 and 2018. And finally, Spain won their one and only World Cup in 2010.`,

  'sample-counties': `Did you know that the counties of Ireland are divided into four provinces? The first is Munster, in the south of the country, which includes Tipperary, Waterford, Cork, Kerry, Clare, and Limerick. Moving to the east of the country, Leinster includes Louth, Meath, Westmeath, Offaly, Laois, Kildare, Dublin, Wicklow, Wexford, Kilkenny, Carlow, and not forgetting Longford. The west of the country is home to Connacht, which takes in Mayo, Galway, Roscommon, Leitrim, and Sligo. And finally, Ulster, in the north, includes the counties of Donegal, Cavan, and Monaghan — the three Ulster counties that form part of the Republic of Ireland — as well as Antrim, Armagh, Down, Fermanagh, Londonderry, and Tyrone, which are part of Northern Ireland.`,

  'sample-dinosaurs': `Everyone loves dinosaurs, and it is easy to see why — these magnificent creatures roamed the Earth for an extraordinarily long time. Dinosaurs lived during the Mesozoic Era, which scientists divide into three periods. The first is the Triassic, which began around 252 million years ago and ended around 201 million years ago. It was during this period that dinosaurs first appeared, including early dinosaurs such as Eoraptor and Coelophysis. Next came the Jurassic period, starting around 201 million years ago and ending around 145 million years ago. This is perhaps the most famous period, and not just because of a certain film franchise — it was home to some of the most iconic dinosaurs of all time, including the enormous Brachiosaurus, the fearsome Allosaurus, and the recognisable Stegosaurus. Last but not least comes the Cretaceous period, which began around 145 million years ago and ended around 66 million years ago with a mass extinction event caused by an asteroid impact. The Cretaceous was home to what is perhaps the most famous dinosaur of all, Tyrannosaurus rex, as well as Triceratops and Velociraptor.`
};

document.querySelectorAll('fieldset button').forEach((button) => {
  button.addEventListener('click', () => {
    inputText.value = samples[button.id];
    inputText.focus();
  });
});

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
  submitButton.textContent = 'Tabulating…';

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
    output.focus();

  } catch (error) {
    errorDetails.textContent = error.message;
    errorMessage.hidden = false;
    errorMessage.focus();

  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Tabulate';
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
    errorMessage.focus();
  }
});

copyHtmlButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(generatedHtml);
    showConfirmation();
  } catch (error) {
    errorDetails.textContent = 'Could not copy the HTML. Please try selecting and copying it manually.';
    errorMessage.hidden = false;
    errorMessage.focus();
  }
});

function showConfirmation() {
  copyConfirmation.hidden = false;
  setTimeout(() => {
    copyConfirmation.hidden = true;
  }, 3000);
}
