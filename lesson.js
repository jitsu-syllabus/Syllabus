fetch('syllabus.json')
  .then(res => res.json())
  .then(data => {
    const belts = JSON.parse(localStorage.getItem('selectedBelts')) || [];
    const topics = JSON.parse(localStorage.getItem('selectedTopics')) || [];

    const filtered = data.filter(item =>
      belts.includes(item.belt) && topics.includes(item.category)
    );

    const output = document.getElementById('output');
    if (filtered.length === 0) {
      output.innerHTML = '<p>No matching techniques found.</p>';
      return;
    }

    filtered.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'lesson-item';
      div.innerHTML = `
        <strong>${entry.belt}</strong> - ${entry.category}<br>
        <span>${entry.technique}</span><br>
        <em>${entry.notes}</em><hr>
      `;
      output.appendChild(div);
    });
  });