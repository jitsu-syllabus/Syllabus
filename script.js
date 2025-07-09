document.addEventListener('DOMContentLoaded', () => {
  let rawData = [];
  const beltSelect = document.getElementById('beltSelect');
  const categorySelect = document.getElementById('categorySelect');
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearFilters');
  const main = document.getElementById('techniques');

  // 🌟 Expand/Collapse Toggle
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
    beltSelect.value = 'All';
    categorySelect.value = 'All';
    searchInput.value = '';
    render();

    // 🔽 Collapse everything after clearing
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

  function isColorCategory(group) {
    return /^#?[0-9a-f]{3,6}$/i.test(group) ||
      ['color', 'colour', 'swatch', 'shade', 'highlight', 'red', 'blue', 'green', 'yellow', 'black', 'white']
        .includes(group.toLowerCase());
  }

  function render() {
    const beltFilter = beltSelect.value;
    const catFilter = categorySelect.value;
    const search = searchInput.value.toLowerCase();

    const filtered = {};

    for (const [belt, groups] of Object.entries(rawData)) {
      if (beltFilter !== 'All' && belt !== beltFilter) continue;

      for (const group in groups) {
        if (isColorCategory(group)) continue;
        if (catFilter !== 'All' && group !== catFilter) continue;

        for (const technique of groups[group]) {
          if (!technique.toLowerCase().includes(search)) continue;

          if (!filtered[belt]) filtered[belt] = {};
          if (!filtered[belt][group]) filtered[belt][group] = [];
          filtered[belt][group].push(technique);
        }
      }
    }

    displayNested(filtered, { beltFilter, catFilter, isSearching: !!search });
  }

  function displayNested(data, { beltFilter, catFilter, isSearching }) {
    main.innerHTML = '';

    if (Object.keys(data).length === 0) {
      main.innerHTML = '<p>No matches found.</p>';
      return;
    }

    const onlyBeltSelected = beltFilter !== 'All' && catFilter === 'All' && !isSearching;
    const onlyCategorySelected = beltFilter === 'All' && catFilter !== 'All' && !isSearching;
    const bothSelected = beltFilter !== 'All' && catFilter !== 'All' && !isSearching;

    for (const belt in data) {
      const cleanedBeltName = belt.replace(/\s+\d+(st|nd|rd|th)?\s+kyu\b/i, '').trim();

      const beltDetails = document.createElement('details');
      if (onlyBeltSelected || onlyCategorySelected || bothSelected || isSearching) beltDetails.open = true;

      const beltSummary = document.createElement('summary');
      beltSummary.textContent = `${cleanedBeltName} Belt`;
      beltDetails.appendChild(beltSummary);

      for (const group in data[belt]) {
        const groupDetails = document.createElement('details');
        if (onlyBeltSelected || onlyCategorySelected || bothSelected || isSearching) groupDetails.open = true;

        const showGroupHeading =
          (catFilter === 'All' && !onlyCategorySelected && !isSearching) ||
          Object.keys(data[belt]).length > 1;

        if (showGroupHeading) {
          const groupSummary = document.createElement('summary');
          groupSummary.textContent = group;
          groupDetails.appendChild(groupSummary);
        }

        const ul = document.createElement('ul');
        data[belt][group].forEach(technique => {
          const li = document.createElement('li');
          li.textContent = technique;
          ul.appendChild(li);
        });

        groupDetails.appendChild(ul);
        beltDetails.appendChild(groupDetails);
      }

      main.appendChild(beltDetails);
    }

    toggleBtn.textContent = 'Collapse All';
  }

  loadData();
});
