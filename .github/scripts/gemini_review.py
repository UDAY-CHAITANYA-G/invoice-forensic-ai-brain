import os
import requests
from google.cloud import aiplatform

# GitHub PR Info
pr_number = os.getenv("PR_NUMBER")
repo = os.getenv("GITHUB_REPOSITORY")
token = os.getenv("GITHUB_TOKEN")

# Setup Gemini client
aiplatform.init(project="YOUR_PROJECT_ID", location="us-central1")

def get_diff():
    url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}/files"
    headers = {"Authorization": f"token {token}"}
    resp = requests.get(url, headers=headers)
    return "\n".join([f["patch"] for f in resp.json() if "patch" in f])

def review_code(diff):
    model = aiplatform.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(
        f"Review this code diff and provide constructive suggestions:\n{diff}"
    )
    return response.text

def post_comment(review):
    url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
    headers = {"Authorization": f"token {token}"}
    requests.post(url, json={"body": review}, headers=headers)

if __name__ == "__main__":
    diff = get_diff()
    if diff.strip():
        review = review_code(diff)
        post_comment(review)
