# Security Policy

## Supported Versions

AI Prompt Lab is currently maintained from the `main` branch.

## Reporting a Vulnerability

If you find a security issue, please open a private report if GitHub security advisories are enabled for the repository. If that is not available, open an issue with a minimal description and avoid posting exploit details publicly.

Useful reports include:

- affected file or feature
- steps to reproduce
- expected and actual behavior
- browser and operating system

## Security Notes

- The app is static and does not send prompt content to a server.
- Prompt history is stored in the user's browser through `localStorage`.
- No API keys or credentials should be pasted into prompt examples or issues.
