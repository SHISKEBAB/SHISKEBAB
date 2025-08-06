const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const username = "SHISKEBAB"; // <-- your GitHub username
const token = process.env.GITHUB_TOKEN;

async function fetchGitHubStats() {
  const headers = {
    Authorization: `token ${token}`,
    "User-Agent": "octobot-stats-script",
  };

  const [repos, prs, issues] = await Promise.all([
    fetch(`https://api.github.com/users/${username}/repos`, { headers }).then(res => res.json()),
    fetch(`https://api.github.com/search/issues?q=author:${username}+type:pr`, { headers }).then(res => res.json()),
    fetch(`https://api.github.com/search/issues?q=author:${username}+type:issue`, { headers }).then(res => res.json())
  ]);

  const mergedPRs = prs.items?.filter(pr => pr.state === "closed")?.length || 0;
  const openPRs = prs.items?.filter(pr => pr.state === "open")?.length || 0;
  const closedIssues = issues.items?.filter(issue => issue.state === "closed")?.length || 0;

  return {
    repos: repos.length,
    totalPRs: prs.total_count,
    merged: mergedPRs,
    opened: openPRs,
    closed: closedIssues,
    totalView: repos.length + prs.total_count + closedIssues, // or whatever logic
  };
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

fetchGitHubStats()
  .then(updateReadme)
  .catch(console.error);
