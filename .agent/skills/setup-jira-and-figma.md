---
description: Ensure Jira + Figma auth prerequisites are set
---

# Skill: Setup Jira + Figma

## Jira setup

1. Jira API token at `~/.jira.d/.api_token`
2. Jira config at `~/.jira.d/config.yml`

```bash
mkdir -p ~/.jira.d
echo 'endpoint: https://quranfoundation.atlassian.net
login: osama@quran.com' > ~/.jira.d/config.yml
read -s -p "Enter Jira API token: " && echo "$REPLY" > ~/.jira.d/.api_token && chmod 600 ~/.jira.d/.api_token
```

## Figma setup

```bash
read -s -p "Enter Figma token: " && echo "$REPLY" > ~/.figma_token && chmod 600 ~/.figma_token
```
