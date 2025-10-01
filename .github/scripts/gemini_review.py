# import os
# import requests
# from google.cloud import aiplatform
import os
import requests
import google.generativeai as genai

# Configure API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

models = genai.list_models()
for m in models:
    print(m)

def get_diff(repo, pr_number, github_token):
    url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}/files"
    headers = {"Authorization": f"token {github_token}"}
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    files = resp.json()
    patches = [f["patch"] for f in files if "patch" in f]
    return "\n".join(patches)


def review_code(diff_text):
    prompt = (
        "You are a code reviewer. Review the following diff for style, correctness, "
        "security issues, and improvements. Provide comments and suggestions.\n\n"
        f"{diff_text}"
    )

    # Create the Gemini model instance
    model = genai.GenerativeModel("gemini-1.5")

    # Generate the response
    response = model.generate_content(prompt)

    return response.text

def post_comment(repo, pr_number, github_token, comment_body):
    url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
    headers = {"Authorization": f"token {github_token}"}
    resp = requests.post(url, json={"body": comment_body}, headers=headers)
    resp.raise_for_status()

def main():
    pr_number = os.getenv("PR_NUMBER")
    github_token = os.getenv("GITHUB_TOKEN")
    repo = os.getenv("GITHUB_REPOSITORY")

    diff_text = get_diff(repo, pr_number, github_token)
    if not diff_text.strip():
        print("No diff to review.")
        return

    review = review_code(diff_text)
    post_comment(repo, pr_number, github_token, review)
    print("Review posted.")

if __name__ == "__main__":
    main()


# import vertexai
# from vertexai.generative_models import GenerativeModel

# def get_diff(repo, pr_number, github_token):
#     """Fetch diff (patch) from GitHub PR."""
#     url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}/files"
#     headers = {
#         "Authorization": f"token {github_token}",
#         "Accept": "application/vnd.github.v3+json"
#     }
#     resp = requests.get(url, headers=headers)
#     resp.raise_for_status()
#     files = resp.json()
#     patches = []
#     for f in files:
#         if "patch" in f:
#             patches.append(f["patch"])
#     return "\n".join(patches)

# def review_code(diff_text, project_id):
#     """Call Gemini / Vertex AI to review code diff."""
#     vertexai.init(project=project_id, location="us-central1")

#     model = GenerativeModel("gemini-1.5-flash")

#     prompt = (
#         "You are a code reviewer. Review the following diff for style, correctness, "
#         "security issues, and improvements. Provide comments and suggestions.\n\n"
#         f"{diff_text}"
#     )

#     response = model.generate_content(prompt)
#     return response.text

# def post_comment(repo, pr_number, github_token, comment_body):
#     """Post the review back on the PR (as a comment)."""
#     url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
#     headers = {
#         "Authorization": f"token {github_token}",
#         "Accept": "application/vnd.github.v3+json"
#     }
#     resp = requests.post(url, json={"body": comment_body}, headers=headers)
#     resp.raise_for_status()
#     return resp.json()

# def main():
#     pr_number = os.getenv("PR_NUMBER")
#     github_token = os.getenv("GITHUB_TOKEN")
#     repo = os.getenv("GITHUB_REPOSITORY")
#     project_id = os.getenv("GCP_PROJECT_ID")

#     if not (pr_number and github_token and repo and project_id):
#         raise RuntimeError("Missing one of required environment variables")

#     diff_text = get_diff(repo, pr_number, github_token)
#     if not diff_text.strip():
#         print("No diff to review. Exiting.")
#         return

#     review = review_code(diff_text, project_id)

#     post_comment(repo, pr_number, github_token, review)
#     print("Review posted.")

# if __name__ == "__main__":
#     main()
