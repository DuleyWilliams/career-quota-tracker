const goals = {
  jobs: 4,
  commits: 6,
  connections: 8
};

const STORAGE_KEY = "careerQuotaTrackerData";

let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  renderList(
    "jobList",
    data.jobs,
    item => `${item.date} | ${item.company}: ${item.role}`,
    "jobs"
  );

  renderList(
    "commitList",
    data.commits,
    item => `${item.date} | ${item.message}`,
    "commits"
  );

  renderList(
    "connectionList",
    data.connections,
    item => `${item.date} | ${item.name} ${item.company ? "(" + item.company + ")" : ""}`,
    "connections"
  );

  updateProgress("jobCount", "jobBar", data.jobs.length, goals.jobs);
  updateProgress("commitCount", "commitBar", data.commits.length, goals.commits);
  updateProgress("connectionCount", "connectionBar", data.connections.length, goals.connections);
}

function renderList(elementId, items, formatter, type) {
  const list = document.getElementById(elementId);
  list.innerHTML = "";

  if (!items.length) {
    const li = document.createElement("li");
    li.className = "empty-item";
    li.textContent = "No entries added yet.";
    list.appendChild(li);
    return;
  }

  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "list-item";

    const text = document.createElement("span");
    text.textContent = formatter(item);

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => deleteEntry(type, index);

    li.appendChild(text);
    li.appendChild(deleteButton);
    list.appendChild(li);
  });
}

function deleteEntry(type, index) {
  const confirmed = confirm("Delete this entry?");
  if (!confirmed) return;

  data[type].splice(index, 1);
  render();
}

function updateProgress(countId, barId, current, goal) {
  document.getElementById(countId).textContent = `${current}/${goal}`;
  document.getElementById(barId).style.width = `${Math.min((current / goal) * 100, 100)}%`;
}

render();

function exportProgress() {
  const exportData = {
    exportedAt: new Date().toISOString(),
    totals: {
      jobs: data.jobs.length,
      commits: data.commits.length,
      connections: data.connections.length
    },
    data
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "career-quota-progress.json";
  link.click();

  URL.revokeObjectURL(url);
}

function resetTracker() {
  const confirmed = confirm("Clear all saved tracker data?");
  if (!confirmed) return;

  data = {
    jobs: [],
    commits: [],
    connections: []
  };

  localStorage.removeItem(STORAGE_KEY);
  render();
}