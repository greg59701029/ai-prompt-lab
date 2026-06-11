# Publishing Guide

## Create the GitHub Repository

Create a new public repository on GitHub:

```text
Repository name: ai-prompt-lab
Visibility: Public
Initialize with README: No
Add .gitignore: No
Choose a license: No
```

This local project already includes the README, `.gitignore`, and license.

## Push from This Computer

Run these commands after the empty GitHub repository exists:

```bash
cd C:\Users\User\ai-prompt-lab
git remote add origin https://github.com/greg59701029/ai-prompt-lab.git
git push -u origin main
```

If `origin` already exists, use:

```bash
git remote set-url origin https://github.com/greg59701029/ai-prompt-lab.git
git push -u origin main
```

## After Push

- Pin `ai-prompt-lab` on the GitHub profile
- Enable GitHub Pages from the `main` branch and `/root`
- Add topics such as `ai`, `prompt-engineering`, `javascript`, `static-site`, and `github-pages`
- Copy `PROFILE_SNIPPET.md` into a profile README repository named `greg59701029`
