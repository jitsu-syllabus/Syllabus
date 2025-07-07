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

  // Wait for DOM to be ready before populating filters
  requestAnimationFrame(() => {
    populateBeltFilter();
    populateCategoryFilter();
    render();
  });
}

function populateCategoryFilter() {
  const cats = new Set();
  Object.values(rawData).forEach(belt => {
    Object.keys(belt).forEach(cat => cats.add(cat));
  });
  const opts = ['All', ...[...cats].sort()].map(c => `<option value="${c}">${c}</option>`);
  categorySelect.innerHTML = opts.join('');
  categorySelect.addEventListener('change', render);
}

function render() {
  const beltFilter = beltSelect.value;
  const catFilter = categorySelect.value;
  const search = searchInput.value.toLowerCase();
  beltSwatch.style.background = beltFilter !== 'All' && rawData[beltFilter]?.color || 'transparent';

  const filtered = {};

  Object.entries(rawData).forEach(([belt, groups]) => {
    if (beltFilter !== 'All' && belt !== beltFilter) return;
    for (const group in groups) {
      if (catFilter !== 'All' && group !== catFilter) continue;
      for (const technique of groups[group]) {
        if (!technique.toLowerCase().includes(search)) continue;
        if (!filtered[belt]) filtered[belt] = {};
        if (!filtered[belt][group]) filtered[belt][group] = [];
        filtered[belt][group].push(technique);
      }
    }
  });

  displayNested(filtered);
}

function displayNested(data) {
  main.innerHTML = '';

  if (Object.keys(data).length === 0) {
    main.innerHTML = '<p>No matches found.</p>';
    return;
  }

  for (const belt in data) {
    const beltHeading = document.createElement('h2');
    beltHeading.textContent = `${belt} Belt`;
    main.appendChild(beltHeading);

    for (const group in data[belt]) {
      const groupHeading = document.createElement('h3');
      groupHeading.textContent = group;
      main.appendChild(groupHeading);

      const ul = document.createElement('ul');
      data[belt][group].forEach(t => {
        const li = document.createElement('li');
        li.textContent = t;
        ul.appendChild(li);
      });
      main.appendChild(ul);
    }
  }
}

searchInput.addEventListener('input', render);
darkModeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark', darkModeToggle.checked);
});

loadData();
