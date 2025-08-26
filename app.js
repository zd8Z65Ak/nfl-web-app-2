// Fetch and parse teams.csv, populate select, and show selected team details

const EXCLUDE = new Set(['LAR','OAK','STL','SD']); // exclude legacy duplicates to show 32 teams

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines.shift().split(',').map(h => h.trim());
  const rows = lines.map(line => {
    // split on commas not inside quotes
    const cols = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
    return header.reduce((obj, key, i) => {
      obj[key] = cols[i] === undefined || cols[i] === '' ? null : cols[i].replace(/^\"|\"$/g,'');
      return obj;
    }, {});
  });
  return rows;
}

async function init() {
  const res = await fetch('/teams.csv');
  if (!res.ok) {
    document.body.innerText = 'Failed to load teams.csv';
    return;
  }
  const text = await res.text();
  const teams = parseCSV(text).filter(t => t.team_abbr && !EXCLUDE.has(t.team_abbr));

  const select = document.getElementById('team-select');
  teams.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.team_abbr;
    opt.textContent = t.team_name;
    select.appendChild(opt);
  });

  select.addEventListener('change', () => showTeam(teams.find(t => t.team_abbr === select.value)));
}

function showTeam(team) {
  const info = document.getElementById('team-info');
  if (!team) {
    info.classList.add('hidden');
    return;
  }
  document.getElementById('team-logo').src = team.team_logo_espn || team.team_logo_wikipedia || '';
  document.getElementById('team-logo').alt = `${team.team_name} logo`;
  document.getElementById('team-name').textContent = team.team_name || '';
  document.getElementById('team-abbr').textContent = team.team_abbr || '';
  document.getElementById('team-division').textContent = team.team_division || '';
  info.classList.remove('hidden');
}

init().catch(err => {
  console.error(err);
  document.body.innerText = 'Error initializing app';
});
