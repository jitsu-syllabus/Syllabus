let rawData = [];
const beltSelect = document.getElementById('beltSelect');
const categorySelect = document.getElementById('categorySelect');
const searchInput = document.getElementById('searchInput');
const beltSwatch = document.getElementById('beltSwatch');
const darkModeToggle = document.getElementById('darkMode');
const main = document.getElementById('techniques');

async function loadData() {
  const json = await fetch('syllabus.json').then(r => r.json());
  rawData = json;

  populateBeltFilter();
  populateCategoryFilter();

  beltSelect.addEventListener('change', render);
  categorySelect.addEventListener('change', render);
  render();
}

function populateBeltFilter() {
  const belts = Object.keys(rawData);
  beltSelect.innerHTML = '<option value="All">All Belts</option>' +
    belts.map(b => `<option value="${b}">${b}</option>`).join('');
}

function populateCategoryFilter() {
  const cats = new Set();
  Object.values(rawData).forEach(groupMap => {
    Object.keys(groupMap).forEach(cat => cats.add(cat));
  });
  const opts = ['All', ...[...cats].sort()].map(c => `<option value="${c}">${c}</option>`);
  categorySelect.innerHTML = opts.join('');
}

function render() {
  const beltFilter = beltSelect.value;
  const catFilter = categorySelect.value;
  const search = searchInput.value.toLowerCase();

  // ✅ Belt swatch fix
  if (beltFilter !== 'All' && rawData[beltFilter]?.color) {
    beltSwatch.style.background = rawData[beltFilter].color;
  } else {
    beltSwatch.style.background = 'transparent';
  }

  const filtered = {};

  for (const [belt, groups] of Object.entries(rawData)) {
    if (beltFilter !== 'All' && belt !== beltFilter) continue;

    for (const group in groups) {
      if (catFilter !== 'All' && group !== catFilter) continue;

      for (const technique of groups
