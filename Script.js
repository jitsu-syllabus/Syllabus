let data = [];
const beltSelect = document.getElementById('beltSelect');
const categorySelect = document.getElementById('categorySelect');
const searchInput = document.getElementById('searchInput');
const beltSwatch = document.getElementById('beltSwatch');
const darkModeToggle = document.getElementById('darkMode');
const main = document.getElementById('techniques');

async function loadData() {
  data = await fetch('syllabus.json').then(r => r.json());
  populateBeltFilter();
  populateCategoryFilter();
  render();
}

function populateBeltFilter() {
  beltSelect.innerHTML = '<option value="All">All Belts</option>' +
    Object.keys(data).map(b => `<option value="${b}">${b}</option>`).join('');
  beltSelect.addEventListener('change', render);
}

function populateCategoryFilter() {
  const cats = new Set();
  Object.values(data).forEach(belt => {
    Object.keys(belt).forEach(cat => cats.add(cat));
  });
  const opts = ['All', ...[...cats].sort()].map(c => `<option value="${c}">${c}</option>`);
  categorySelect.innerHTML = opts.join('');
  categorySelect.addEventListener('change', render);
}

function render() {
  const belt = beltSelect.value;
  const category = categorySelect.value;
  const search = searchInput.value.toLowerCase();
  beltSwatch.style.background = belt !== 'All' && data[belt]?.color || 'transparent';

  let items = [];
  Object.entries(data).forEach(([beltName, beltObj]) => {
    if (belt !== 'All' && beltName !== belt) return;
    Object.entries(beltObj).forEach(([cat, techniques]) => {
      if (category !== 'All' && cat !== category) return;
      techniques.forEach(name => {
        if (name.toLowerCase().includes(search))
          items.push({ belt: beltName, cat, name });
      });
    });
  });

  main.innerHTML = items.length
    ? items.map(i => `
      <div class="technique">
        <h3>${i.name} <small>(${i.belt} • ${i.cat})</small></h3>
      </div>`).join('')
    : '<p>No matches found.</p>';
}

searchInput.addEventListener('input', render);
darkModeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark', darkModeToggle.checked);
});

loadData();