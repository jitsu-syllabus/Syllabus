document.getElementById('generate-lesson').addEventListener('click', () => {
  const belts = [...document.querySelectorAll('#session-planner input[type="checkbox"]')]
    .filter(el => el.checked && el.parentElement.previousElementSibling?.textContent.includes('Belts'))
    .map(el => el.value);

  const topics = [...document.querySelectorAll('#session-planner input[type="checkbox"]')]
    .filter(el => el.checked && el.parentElement.previousElementSibling?.textContent.includes('Topics'))
    .map(el => el.value);

  localStorage.setItem('selectedBelts', JSON.stringify(belts));
  localStorage.setItem('selectedTopics', JSON.stringify(topics));

  window.location.href = 'lesson.html';
});