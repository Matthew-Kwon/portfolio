import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const titleElement = document.querySelector('.projects-title');
if (titleElement && projects) {
  titleElement.textContent = `${projects.length} Projects`;
}

const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
const colors = d3.scaleOrdinal(d3.schemeTableau10);

let query = '';
let selectedIndex = -1;

let selectedYear = null;

function filterByQuery(projectsGiven) {
  return projectsGiven.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

function getVisibleProjects() {
  let filtered = filterByQuery(projects);
  if (selectedYear !== null) {
    filtered = filtered.filter((p) => String(p.year) === selectedYear);
  }
  return filtered;
}

function renderPieChart(projectsGiven) {
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  newRolledData.sort((a, b) => d3.ascending(a[0], b[0]));
  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: String(year) };
  });

  let newSliceGenerator = d3.pie().value((d) => d.value).sort(null);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => arcGenerator(d));

  selectedIndex = newData.findIndex((d) => d.label === selectedYear);
  if (selectedIndex === -1) selectedYear = null;

  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();
  let legend = d3.select('.legend');
  legend.selectAll('li').remove();

  const updateSelection = () => {
    svg
      .selectAll('path')
      .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));
    legend
      .selectAll('li')
      .attr('class', (_, idx) =>
        idx === selectedIndex ? 'legend-item selected' : 'legend-item',
      );
  };

  const toggleSelection = (i) => {
    selectedIndex = selectedIndex === i ? -1 : i;
    selectedYear = selectedIndex === -1 ? null : newData[selectedIndex].label;
    updateSelection();
    renderProjects(getVisibleProjects(), projectsContainer, 'h2');
  };

  newArcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(newData[i].label))
      .on('click', () => toggleSelection(i))
      .append('title')
      .text(`${newData[i].label}: ${newData[i].value} project(s)`);
  });

  newData.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(d.label)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => toggleSelection(idx));
  });

  updateSelection();
}

renderPieChart(projects);

let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  renderPieChart(filterByQuery(projects));
  renderProjects(getVisibleProjects(), projectsContainer, 'h2');
});
