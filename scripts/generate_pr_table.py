import requests
from datetime import datetime

# ✅ Replace these with your actual repo and token
REPO_OWNER = "your-username"
REPO_NAME = "your-repo"
TOKEN = "ghp_YourGitHubPersonalAccessToken"

# GitHub API URL
url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/pulls?state=closed&per_page=100"

# Auth headers
headers = {
    "Authorization": f"token {TOKEN}",
    "Accept": "application/vnd.github+json"
}

# Fetch closed PRs (we'll filter only merged ones)
response = requests.get(url, headers=headers)
prs = response.json()

# Filter merged PRs
merged_prs = [pr for pr in prs if pr.get("merged_at")]

# Create table header
markdown_table = "| PR # | Title | Author | Merged At | Link |\n"
markdown_table += "|------|-------|--------|-----------|------|\n"

# Populate rows
for pr in merged_prs:
    number = pr["number"]
    title = pr["title"]
    user = pr["user"]["login"]
    merged_at = datetime.strptime(pr["merged_at"], "%Y-%m-%dT%H:%M:%SZ").strftime("%Y-%m-%d")
    html_url = pr["html_url"]

    markdown_table += f"| #{number} | {title} | {user} | {merged_at} | [View PR]({html_url}) |\n"

# Save to file
with open("merged_prs.md", "w", encoding="utf-8") as file:
    file.write("## ✅ Merged Pull Requests\n\n")
    file.write(markdown_table)

print("✅ Merged PR table generated in 'merged_prs.md'")
