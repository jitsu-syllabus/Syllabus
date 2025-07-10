document.addEventListener('DOMContentLoaded', () => {
  let rawData = [];
  const categoryOrder = [
    "Martial Warmup Drills",
    "Ukemi Waza",
    "Atemi Waza",
    "Ne Waza",
    "Releases",
    "Kansetsu Waza",
    "Nage Waza",
    "Shime Waza",
    "Scenario Training",
    "Expected Competencies"
  ];

const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearFilters');
  const main = document.getElementById('techniques');
  const beltContainer = document.getElementById('beltButtons');
  const categoryContainer = document.getElementById('categoryButtons');
  const activeBelts = new Set();
  const activeCategories = new Set();

  clearBtn.addEventListener('click', () => {
    activeBelts.clear();
    activeCategories.clear();
    searchInput.value = '';
    document.querySelectorAll('.button-group button').forEach(btn => btn.classList.remove('active'));
    render();
  });

  async function loadData() {
    const json = await fetch('syllabus.json').then(r => r.json());
    rawData = json;

    createButtons(Object.keys(json), beltContainer, activeBelts);

    const categories = new Set();
    Object.values(json).forEach(groupMap => {
      Object.keys(groupMap).forEach(cat => categories.add(cat));
    });

    let sortedCategories = categoryOrder.filter(cat => categories.has(cat));
    if (sortedCategories.length === 0) {
      sortedCategories = [...categories].sort(); // fallback
    }

    createButtons(sortedCategories, categoryContainer, activeCategories);

    searchInput.addEventListener('input', render);
    render();
  }

  function createButtons(items, container, activeSet) {
    container.innerHTML = '';
    items.forEach(item => {
      const btn = document.createElement('button');
      btn.textContent = item;
      btn.addEventListener('click', () => {
        if (activeSet.has(item)) {
          activeSet.delete(item);
          btn.classList.remove('active');
        } else {
          activeSet.add(item);
          btn.classList.add('active');
        }
        render();
      });
      container.appendChild(btn);
    });
  }

  function isColorCategory(group) {
    return /^#?[0-9a-f]{3,6}$/i.test(group) ||
      ['color', 'colour', 'swatch', 'shade', 'highlight', 'red', 'blue', 'green', 'yellow', 'black', 'white']
        .includes(group.toLowerCase());
  }

  function render() {
    const beltFilter = [...activeBelts];
    const catFilter = [...activeCategories];
    const search = searchInput.value.toLowerCase();
    const filtered = {};

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

    categoryOrder.forEach(group => {
      if (!data[group]) return;

      const header = document.createElement('div');
      header.className = 'category-heading';
      header.textContent = group;
      main.appendChild(header);

      const ul = document.createElement('ul');
      data[group].forEach(({ belt, technique }) => {
        const li = document.createElement('li');
        li.innerHTML = `${technique} (<strong>${belt}</strong>)`;
        ul.appendChild(li);
      });

      main.appendChild(ul);
    });
  }

  loadData();
});
