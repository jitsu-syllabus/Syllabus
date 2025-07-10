document.addEventListener('DOMContentLoaded', () => {
  let rawData = [];
  const beltSelect = document.getElementById('beltSelect');
  const categorySelect = document.getElementById('categorySelect');
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearFilters');
  const main = document.getElementById('techniques');

  const controlBar = document.createElement('div');
  controlBar.style.marginBottom = '1rem';
  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = 'Collapse All';
  toggleBtn.style.padding = '0.3rem 0.6rem';
  toggleBtn.style.cursor = 'pointer';
  toggleBtn.style.marginTop = '1rem';
  toggleBtn.addEventListener('click', () => {
    const detailsElements = document.querySelectorAll('details');
    const expanding = toggleBtn.textContent.includes('Expand');
    detailsElements.forEach(el => el.open = expanding);
    toggleBtn.textContent = expanding ? 'Collapse All' : 'Expand All';
  });
  main.before(controlBar);
  controlBar.appendChild(toggleBtn);

  clearBtn.addEventListener('click', () => {
    Array.from(beltSelect.options).forEach(opt => opt.selected = false);
    Array.from(categorySelect.options).forEach(opt => opt.selected = false);
    searchInput.value = '';
    render();
    requestAnimationFrame(() => {
      document.querySelectorAll('details').forEach(d => d.open = false);
      toggleBtn.textContent = 'Expand All';
    });
  });

  async function loadData() {
    const json = await fetch('syllabus.json').then(r => r.json());
    rawData = json;
    populateBeltFilter();
    populateCategoryFilter();
    beltSelect.addEventListener('change', render);
    categorySelect.addEventListener('change', render);
    searchInput.addEventListener('input', render);
    render();
  }

  function populateBeltFilter() {
    const belts = Object.keys(rawData);
    beltSelect.innerHTML = belts.map(b => `<option value="${b}">${b}</option>`).join('');
  }

  function populateCategoryFilter() {
    const cats = new Set();
    Object.values(rawData).forEach(groupMap => {
      Object.keys(groupMap).forEach(cat => cats.add(cat));
    });
    categorySelect.innerHTML = [...cats].sort().map(c => `<option value="${c}">${c}</option>`).join('');
  }

  function isColorCategory(group) {
    return /^#?[0-9a-f]{3,6}$/i.test(group) ||
      ['color', 'colour', 'swatch', 'shade', 'highlight', 'red', 'blue', 'green', 'yellow', 'black', 'white']
        .includes(group.toLowerCase());
  }

function render() {
  const beltFilter = Array.from(beltSelect.selectedOptions).map(o => o.value);
  const catFilter = Array.from(categorySelect.selectedOptions).map(o => o.value);
  const search = searchInput.value.toLowerCase();
  const filtered = {};

  // ⛔ Don't display anything unless filters are applied
  if (beltFilter.length === 0 && catFilter.length === 0 && search === '') {
    main.innerHTML = '';
    return;
  }

  for (const [belt, groups] of Object.entries(rawData)) {
    if (beltFilter.length && !beltFilter.includes(belt)) continue;
    for (const group in groups) {
      if (isColorCategory(group)) continue;
      if (catFilter.length && !catFilter.includes(group)) continue;
      for (const technique of groups[group]) {
        if (!technique.toLowerCase().includes(search)) continue;
        if (!filtered[group]) filtered[group] = [];
        filtered[group].push({ belt, technique });
      }
    }
  }

  displayFlat(filtered);
}
  function displayFlat(data) {
    main.innerHTML = '';
    if (Object.keys(data).length === 0) {
      main.innerHTML = '<p>No matches found.</p>';
      return;
    }

    for (const group in data) {
      const header = document.createElement('div');
      header.className = 'category-heading';
      header.textContent = group;
      main.appendChild(header);

      const ul = document.createElement('ul');
      data[group].forEach(({ belt, technique }) => {
        const li = document.createElement('li');
        li.textContent = `${technique} (${belt})`;
        ul.appendChild(li);
      });

      main.appendChild(ul);
    }

    toggleBtn.textContent = 'Collapse All';
  }

  loadData();
});
