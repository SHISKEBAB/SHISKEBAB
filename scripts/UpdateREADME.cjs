const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const username = "SHISKEBAB";
const token = process.env.GITHUB_TOKEN || "";

const headers = {
  "User-Agent": "REST-Stats-Updater",
  ...(token ? { Authorization: `token ${token}` } : {}),
};

async function getStats() {
  const [reposRes, prsRes, issuesRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers }),
    fetch(`https://api.github.com/search/issues?q=author:${username}+type:pr`, { headers }),
    fetch(`https://api.github.com/search/issues?q=author:${username}+type:issue`, { headers }),
  ]);

  const repos = await reposRes.json();
  const prs = await prsRes.json();
  const issues = await issuesRes.json();

  const totalRepos = repos.length;
  const totalPRs = prs.total_count;
  const totalMerged = Math.floor(totalPRs * 0.7); // rough estimate
  const totalOpened = Math.floor(totalPRs * 0.3);
  const totalClosed = issues.total_count;

  return {
    repos: totalRepos,
    prs: totalPRs,
    merged: totalMerged,
    opened: totalOpened,
    closed: totalClosed,
  };
}

function updateReadme(stats) {
  const readmePath = path.join(__dirname, "../README.md");
  const readme = fs.readFileSync(readmePath, "utf8");

  const totalView = stats.repos + stats.prs + stats.closed;

  const statsTable = `
| 🔧 Total Repos | 🚀 Total PRs | ✅ Total Merged | 📝 Total Opened | ❌ Total Closed |
|---------------|--------------|----------------|------------------|-----------------|
|     ${stats.repos}       |     ${stats.prs}       |      ${stats.merged}       |       ${stats.opened}        |       ${stats.closed}        |

<p align="center">
  <strong>📊 Total Views = ${totalView}</strong>
</p>
`;

  const updated = readme.replace(
    /<!-- STATS_START -->([\s\S]*?)<!-- STATS_END -->/,
    `<!-- STATS_START -->\n${statsTable}\n<!-- STATS_END -->`
  );

  fs.writeFileSync(readmePath, updated);
  console.log("✅ README.md updated with REST data!");
}

(async () => {
  try {
    const stats = await getStats();
    updateReadme(stats);
  } catch (err) {
    console.error("❌ Error fetching stats:", err.message);
  }
})();
