console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// let navLinks = $$('nav a');

// let currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname,
// );

// currentLink?.classList.add('current');


let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'cv-resume/', title: 'CV / Resume' },
  { url: 'https://github.com/Matthew-Kwon', title: 'GitHub' },
];

const BASE_PATH =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '/' // Local server
    : 'https://matthew-kwon.github.io/portfolio/'; // GitHub Pages repo name

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  url = !url.startsWith('http') ? BASE_PATH + url : url;

  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname,
  );

  if (a.host !== location.host) {
    a.target = '_blank';
  }

  nav.append(a);
}


const isOSDark = matchMedia('(prefers-color-scheme: dark)').matches;

document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select>
      <option value="light dark">Automatic (${isOSDark ? 'Dark' : 'Light'})</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>`,
);

let select = document.querySelector('.color-scheme select');

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  select.value = colorScheme;
}


if ('colorScheme' in localStorage) {
  setColorScheme(localStorage.colorScheme);
}


select.addEventListener('input', function (event) {
  console.log('color scheme changed to', event.target.value);
  setColorScheme(event.target.value);
  localStorage.colorScheme = event.target.value;
});


let form = document.querySelector('form');

form?.addEventListener('submit', function (event) {
  event.preventDefault();

  let data = new FormData(form);
  let url = form.action + '?';
  let params = [];

  for (let [name, value] of data) {
    console.log(name, value);
    params.push(`${name}=${encodeURIComponent(value)}`);
  }

  url += params.join('&');
  location.href = url;
});


export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!(containerElement instanceof HTMLElement)) {
    console.error('renderProjects: containerElement must be a valid DOM element');
    return;
  }

  const validHeadings = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
  const tag = validHeadings.has(headingLevel) ? headingLevel : 'h2';

  containerElement.innerHTML = '';

  if (!Array.isArray(projects) || projects.length === 0) {
    containerElement.innerHTML = '<p class="projects-empty">No projects to display yet.</p>';
    return;
  }

  for (const project of projects) {
    const article = document.createElement('article');
    const imageSrc =
      project.image && String(project.image).startsWith('http')
        ? project.image
        : `${BASE_PATH}${project.image ?? ''}`;
    const yearHtml =
      project.year !== undefined && project.year !== null && project.year !== ''
        ? `<small class="project-year">${project.year}</small>`
        : '';

    article.innerHTML = `
      <${tag}>${project.title ?? ''}</${tag}>
      <img src="${imageSrc}" alt="${project.title ?? ''}">
      <p>${project.description ?? ''}</p>
      ${yearHtml}
    `;
    containerElement.appendChild(article);
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}

export const fetchGithubData = fetchGitHubData;
