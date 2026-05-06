const goals = {
  jobs: 4,
  commits: 6,
  connections: 8
};

let data = {
  jobs: [],
  commits: [],
  connections: []
};

function addJob() {
  const company = document.getElementById("jobCompany").value.trim();
  const role = document.getElementById("jobRole").value.trim();
  const link = document.getElementById("jobLink").value.trim();

  if (!company || !role) {
    alert("Add at least the company and role.");
    return;
  }

  data.jobs.push({
    company,
    role,
    link,
    date: new Date().toLocaleDateString()
  });

  document.getElementById("jobCompany").value = "";
  document.getElementById("jobRole").value = "";
  document.getElementById("jobLink").value = "";

  render();
}

function addCommit() {
  const message = document.getElementById("commitMessage").value.trim();
  const feature = document.getElementById("commitFeature").value.trim();
  const link = document.getElementById("commitLink").value.trim();

  if (!message) {
    alert("Add the commit message.");
    return;
  }

  data.commits.push({
    message,
    feature,
    link,
    date: new Date().toLocaleDateString()
  });

  document.getElementById("commitMessage").value = "";
  document.getElementById("commitFeature").value = "";
  document.getElementById("commitLink").value = "";

  render();
}

function addConnection() {
  const name = document.getElementById("connectionName").value.trim();
  const company = document.getElementById("connectionCompany").value.trim();
  const link = document.getElementById("connectionLink").value.trim();

  if (!name) {
    alert("Add the person's name.");
    return;
  }

  data.connections.push({
    name,
    company,
    link,
    date: new Date().toLocaleDateString()
  });

  document.getElementById("connectionName").value = "";
  document.getElementById("connectionCompany").value = "";
  document.getElementById("connectionLink").value = "";

  render();
}

function render() {
  renderList("jobList", data.jobs, item => `${item.date} — ${item.company}: ${item.role}`);
  renderList("commitList", data.commits, item => `${item.date} — ${item.message}`);
  renderList("connectionList", data.connections, item => `${item.date} — ${item.name} ${item.company ? "(" + item.company + ")" : ""}`);

  updateProgress("jobCount", "jobBar", data.jobs.length, goals.jobs);
  updateProgress("commitCount", "commitBar", data.commits.length, goals.commits);
  updateProgress("connectionCount", "connectionBar", data.connections.length, goals.connections);
}

function renderList(elementId, items, formatter) {
  const list = document.getElementById(elementId);
  list.innerHTML = "";

  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = formatter(item);
    list.appendChild(li);
  });
}

function updateProgress(countId, barId, current, goal) {
  document.getElementById(countId).textContent = `${current}/${goal}`;
  document.getElementById(barId).style.width = `${Math.min((current / goal) * 100, 100)}%`;
}

render();