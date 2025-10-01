import os
import requests
from google.cloud import aiplatform

def get_diff(repo, pr_number, github_token):
    """Fetch diff (patch) from GitHub PR."""
    url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}/files"
    headers = {
        "Authorization": f"token {github_token}",
        "Accept": "application/vnd.github.v3+json"
    }
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    files = resp.json()
    patches = []
    for f in files:
        if "patch" in f:
            patches.append(f["patch"])
    return "\n".join(patches)

def review_code(diff_text, project_id):
    """Call Gemini / Vertex AI to review code diff."""
    aiplatform.init(project=project_id, location="us-central1")

    # Here choose your Gemini model; adjust based on availability
    model = aiplatform.GenerativeModel("gemini-1.5-flash")

    prompt = (
        "You are a code reviewer. Review the following diff for style, correctness, "
        "security issues, and improvements. Provide comments and suggestions.\n\n"
        f"{diff_text}"
    )

    response = model.generate_content(prompt)
    return response.text

def post_comment(repo, pr_number, github_token, comment_body):
    """Post the review back on the PR (as a comment)."""
    url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
    headers = {
        "Authorization": f"token {github_token}",
        "Accept": "application/vnd.github.v3+json"
    }
    resp = requests.post(url, json={"body": comment_body}, headers=headers)
    resp.raise_for_status()
    return resp.json()

def main():
    pr_number = os.getenv("PR_NUMBER")
    github_token = os.getenv("GITHUB_TOKEN")
    repo = os.getenv("GITHUB_REPOSITORY")
    project_id = os.getenv("GCP_PROJECT_ID")

    if not (pr_number and github_token and repo and project_id):
        raise RuntimeError("Missing one of required environment variables")

    diff_text = get_diff(repo, pr_number, github_token)
    if not diff_text.strip():
        print("No diff to review. Exiting.")
        return

    review = review_code(diff_text, project_id)

    post_comment(repo, pr_number, github_token, review)
    print("Review posted.")

if __name__ == "__main__":
    main()
