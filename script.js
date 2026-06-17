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

function getInputValue(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
}

function setInputValue(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.value = value;
  }
}

function addJob() {
  const company = getInputValue("jobCompany");
  const role = getInputValue("jobRole");
  const status = getInputValue("jobStatus") || "Applied";
  const followUpDate = getInputValue("jobFollowUp");
  const link = getInputValue("jobLink");

  if (!company || !role) {
    alert("Add at least the company and role.");
    return;
  }

  data.jobs.push({
    company,
    role,
    status,
    followUpDate,
    link,
    date: new Date().toLocaleDateString()
  });

  setInputValue("jobCompany", "");
  setInputValue("jobRole", "");
  setInputValue("jobStatus", "Applied");
  setInputValue("jobFollowUp", "");
  setInputValue("jobLink", "");

  render();
}

function addCommit() {
  const message = getInputValue("commitMessage");
  const feature = getInputValue("commitFeature");
  const link = getInputValue("commitLink");

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

  setInputValue("commitMessage", "");
  setInputValue("commitFeature", "");
  setInputValue("commitLink", "");

  render();
}

function addConnection() {
  const name = getInputValue("connectionName");
  const company = getInputValue("connectionCompany");
  const followUpDate = getInputValue("connectionFollowUp");
  const link = getInputValue("connectionLink");

  if (!name) {
    alert("Add the person's name.");
    return;
  }

  data.connections.push({
    name,
    company,
    followUpDate,
    link,
    date: new Date().toLocaleDateString()
  });

  setInputValue("connectionName", "");
  setInputValue("connectionCompany", "");
  setInputValue("connectionFollowUp", "");
  setInputValue("connectionLink", "");

  render();
}

function render() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  renderList(
    "jobList",
    data.jobs,
    item => {
      const status = item.status || "Applied";
      const followUpText = item.followUpDate ? ` | Follow up: ${item.followUpDate}` : "";
      return `${item.date} | ${status} | ${item.company}: ${item.role}${followUpText}`;
    },
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
    item => {
      const company = item.company ? ` (${item.company})` : "";
      const followUpText = item.followUpDate ? ` | Follow up: ${item.followUpDate}` : "";
      return `${item.date} | ${item.name}${company}${followUpText}`;
    },
    "connections"
  );

  updateProgress("jobCount", "jobBar", data.jobs.length, goals.jobs);
  updateProgress("commitCount", "commitBar", data.commits.length, goals.commits);
  updateProgress("connectionCount", "connectionBar", data.connections.length, goals.connections);

  renderFollowUps();
}

function renderList(elementId, items, formatter, type) {
  const list = document.getElementById(elementId);

  if (!list) return;

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
  const countElement = document.getElementById(countId);
  const barElement = document.getElementById(barId);

  if (!countElement || !barElement) return;

  countElement.textContent = `${current}/${goal}`;
  barElement.style.width = `${Math.min((current / goal) * 100, 100)}%`;
}

function renderFollowUps() {
  const list = document.getElementById("followUpList");

  if (!list) return;

  list.innerHTML = "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const jobFollowUps = data.jobs
    .filter(job => job.followUpDate)
    .map(job => ({
      type: "Job",
      date: job.followUpDate,
      title: `${job.company}: ${job.role}`,
      detail: job.status || "Applied"
    }));

  const connectionFollowUps = data.connections
    .filter(connection => connection.followUpDate)
    .map(connection => ({
      type: "Connection",
      date: connection.followUpDate,
      title: connection.name,
      detail: connection.company || "LinkedIn"
    }));

  const dueItems = [...jobFollowUps, ...connectionFollowUps]
    .filter(item => {
      const followUpDate = new Date(item.date + "T00:00:00");
      return followUpDate <= today;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!dueItems.length) {
    const li = document.createElement("li");
    li.className = "empty-item";
    li.textContent = "No follow-ups due today.";
    list.appendChild(li);
    return;
  }

  dueItems.forEach(item => {
    const li = document.createElement("li");
    li.className = "followup-item";

    const type = document.createElement("span");
    type.className = "followup-type";
    type.textContent = item.type;

    const text = document.createElement("span");
    text.textContent = ` ${item.date} | ${item.title} | ${item.detail}`;

    li.appendChild(type);
    li.appendChild(text);
    list.appendChild(li);
  });
}

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

function generateSummary() {
  const jobCount = data.jobs.length;
  const commitCount = data.commits.length;
  const connectionCount = data.connections.length;

  const jobStatusCounts = getJobStatusCounts();
  const statusSummary = formatStatusSummary(jobStatusCounts);

  const summary = `This period I completed ${jobCount} job application${jobCount === 1 ? "" : "s"}, made ${commitCount} GitHub commit${commitCount === 1 ? "" : "s"}, and added ${connectionCount} LinkedIn connection${connectionCount === 1 ? "" : "s"}. I also continued building my Career Quota Tracker app to document my job search activity, networking progress, GitHub development work, and follow-up tasks.${statusSummary}`;

  const output = document.getElementById("summaryOutput");

  if (!output) return;

  output.value = summary;
}

function getJobStatusCounts() {
  return data.jobs.reduce((counts, job) => {
    const status = job.status || "Applied";
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
}

function formatStatusSummary(statusCounts) {
  const statuses = Object.entries(statusCounts);

  if (!statuses.length) {
    return "";
  }

  const formattedStatuses = statuses
    .map(([status, count]) => `${count} ${status}`)
    .join(", ");

  return ` Job status breakdown: ${formattedStatuses}.`;
}

function copySummary() {
  const output = document.getElementById("summaryOutput");

  if (!output || !output.value) {
    alert("Generate a summary first.");
    return;
  }

  if (navigator.clipboard) {
    navigator.clipboard.writeText(output.value);
    alert("Summary copied.");
    return;
  }

  output.select();
  document.execCommand("copy");
  alert("Summary copied.");
}


render();