function buildToc() {
  const tocNav = document.querySelector('.page-toc__list');
  if (!tocNav) return;

  const article = document.querySelector('.journal-prose');
  if (!article) return;

  const headings = article.querySelectorAll('h2, h3');
  if (headings.length === 0) {
    const tocContainer = document.querySelector('.page-toc');
    if (tocContainer) tocContainer.hidden = true;
    return;
  }

  const fragment = document.createDocumentFragment();

  headings.forEach((heading, index) => {
    const id = `toc-heading-${index}`;
    heading.id = id;

    const li = document.createElement('li');
    li.className = `page-toc__item page-toc__item--${heading.tagName.toLowerCase()}`;

    const a = document.createElement('a');
    a.href = `#${id}`;
    a.className = 'page-toc__link';
    a.textContent = heading.textContent;

    li.appendChild(a);
    fragment.appendChild(li);
  });

  tocNav.appendChild(fragment);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.page-toc__link').forEach(link => link.removeAttribute('aria-current'));
        const id = entry.target.id;
        const activeLink = document.querySelector(`.page-toc__link[href="#${id}"]`);
        if (activeLink) activeLink.setAttribute('aria-current', 'location');
      }
    });
  }, { rootMargin: '-80px 0px -60% 0px' });

  headings.forEach(h => observer.observe(h));
}

document.addEventListener('DOMContentLoaded', buildToc);
