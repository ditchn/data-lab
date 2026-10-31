const search = document.querySelector('[data-project-search]');
if (search) {
  const cards = [...document.querySelectorAll('[data-project-card]')];
  const count = document.querySelector('[data-result-count]');
  search.addEventListener('input', () => {
    const query = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    for (const card of cards) {
      const match = card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !match;
      if (match) visible++;
    }
    count.textContent = `${visible} project${visible === 1 ? '' : 's'}`;
    document.querySelector('[data-no-matches]').hidden = visible > 0;
  });
}
