const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const username = "SHISKEBAB"; // Your GitHub username
const token = process.env.GITHUB_TOKEN;

const headers = {
  Authorization: `token ${token}`,
  "User-Agent": "GitHub-Stats-Script",
};

async function fetchAllRepos() {
  let repos = [];
  let page = 1;

  while (true) {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&page=${page}`, { headers });
    const data = await res.json();
    if (data.length === 0) break;
    repos = repos.concat(data.filter(repo => !repo.fork)); // only original repos
    page++;
  }

  return repos;
}

async function fetchPRStats() {
  const query = `type:pr author:${username}`;
  const res = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=100`, { headers });
  const data = await res.json();

  const prs = data.items || [];
  const totalPRs = data.total_count;
  const opened = prs.filter(pr => pr.state === "open").length;
  const merged = prs.filter(pr => pr.pull_request && pr.state === "closed").length;

  return { totalPRs, opened, merged };
}

async function fetchClosedIssues() {
  const query = `type:issue author:${username} state:closed`;
  const res = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=100`, { headers });
  const data = await res.json();
  return data.total_count || 0;
}

function updateReadme(stats) {
  const readmePath = path.join(__dirname, "../README.md");
  let readme = fs.readFileSync(readmePath, "utf8");

  const statsTable = `
| 🔧 Total Repos | 🚀 Total PRs | ✅ Total Merged | 📝 Total Opened | ❌ Total Closed |
|---------------|--------------|----------------|------------------|-----------------|
|     ${stats.repos}       |     ${stats.totalPRs}       |      ${stats.merged}       |       ${stats.opened}        |       ${stats.closed}        |

<p align="center">
  <strong>📊 Total Views = ${stats.totalView}</strong>
</p>
`;

  readme = readme.replace(
    /<!-- STATS_START -->([\s\S]*?)<!-- STATS_END -->/,
    `<!-- STATS_START -->\n${statsTable}\n<!-- STATS_END -->`
  );

  fs.writeFileSync(readmePath, readme);
}

async function main() {
  const repos = await fetchAllRepos();
  const prStats = await fetchPRStats();
  const closedIssues = await fetchClosedIssues();

  const stats = {
    repos: repos.length,
    totalPRs: prStats.totalPRs,
    opened: prStats.opened,
    merged: prStats.merged,
    closed: closedIssues,
    totalView: repos.length + prStats.totalPRs + prStats.merged + prStats.opened + closedIssues,
  };

  updateReadme(stats);
}

main().catch(console.error);
