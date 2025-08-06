const token = "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"; // ⚠️ Only for local testing!
const username = "SHISKEBAB";

const headers = {
  Authorization: `token ${token}`,
};

async function fetchAndCount(endpoint, label) {
  try {
    const res = await fetch(endpoint, { headers });
    const data = await res.json();
    return (data.items || data).length || 0;
  } catch (e) {
    console.error(`Failed to fetch ${label}`, e);
    return "?";
  }
}

async function updateStats() {
  const repoCount = await fetchAndCount(`https://api.github.com/users/${username}/repos`, "Repos");
  const prCount = await fetchAndCount(`https://api.github.com/search/issues?q=author:${username}+type:pr`, "PRs");
  const mergedCount = await fetchAndCount(`https://api.github.com/search/issues?q=author:${username}+type:pr+is:merged`, "Merged PRs");
  const closedCount = await fetchAndCount(`https://api.github.com/search/issues?q=author:${username}+type:pr+is:closed`, "Closed PRs");

  document.getElementById("repos-planet").innerText = repoCount;
  document.getElementById("prs-planet").innerText = prCount;
  document.getElementById("merged-planet").innerText = mergedCount;
  document.getElementById("closed-planet").innerText = closedCount;
}

updateStats();
