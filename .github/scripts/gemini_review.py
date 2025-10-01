import google.generativeai as genai
import os
import requests

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def get_pr_diff(repo, pr_number, github_token):
    """Fetch the PR diff from GitHub."""
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

def review_code(diff_text):
    """Call Gemini to review the code diff."""
    prompt = (
        "You are a code reviewer. Review the following diff for style, correctness, "
        "security issues, and improvements. Provide comments and suggestions.\n\n"
        f"{diff_text}"
    )
    model = genai.GenerativeModel("gemini-2.5-pro")
    response = model.generate_content(prompt)
    return response.text

def main():
    pr_number = os.getenv("PR_NUMBER")
    github_token = os.getenv("GH_TOKEN")
    repo = os.getenv("GITHUB_REPOSITORY")

    if not (pr_number and github_token and repo):
        raise RuntimeError("Missing required environment variables: PR_NUMBER, GH_TOKEN, GITHUB_REPOSITORY")

    diff_text = get_pr_diff(repo, pr_number, github_token)

    if not diff_text.strip():
        print("No diff to review. Exiting.")
        return

    review = review_code(diff_text)

    # Output review so GitHub Actions can capture it
    print("::set-output name=review_text::" + review)

if __name__ == "__main__":
    main()
