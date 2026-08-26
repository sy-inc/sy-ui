#!/bin/bash
# SY UI Skill Installer
# Usage: curl -sSL https://sy-ui.com/install | bash -s [skill-name]
# Default: sy-ui-react
# Available skills: sy-ui-react, sy-ui-native, sy-ui-migration
# https://sy-ui.com

set -e

# Skill selection (default: sy-ui-react)
SKILL_NAME="${1:-sy-ui-react}"

# URLs
BASE_URL="${BASE_URL:-{{BASE_URL}}}"
SKILL_URL="${BASE_URL}/skills/${SKILL_NAME}.tar.gz"

# Codex CLI config home (override with CODEX_HOME)
CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"

INSTALLED=0

echo "Installing SY UI skill: ${SKILL_NAME}..."
echo ""

# Claude Code - Skill only (skills are auto-discovered, no command needed)
if [ -d "$HOME/.claude" ]; then
  mkdir -p "$HOME/.claude/skills/${SKILL_NAME}"
  curl -sL "$SKILL_URL" | tar xz -C "$HOME/.claude/skills/${SKILL_NAME}"
  echo "✓ Installed ${SKILL_NAME} skill for Claude Code"
  INSTALLED=$((INSTALLED + 1))

  # Cleanup old sy-ui skill (only when installing sy-ui-react)
  if [ "$SKILL_NAME" = "sy-ui-react" ] && [ -d "$HOME/.claude/skills/sy-ui" ]; then
    rm -rf "$HOME/.claude/skills/sy-ui"
    echo "✓ Removed old sy-ui skill"
  fi
fi

# Cursor - Install skill
if [ -d "$HOME/.cursor" ]; then
  mkdir -p "$HOME/.cursor/skills/${SKILL_NAME}"
  curl -sL "$SKILL_URL" | tar xz -C "$HOME/.cursor/skills/${SKILL_NAME}"
  echo "✓ Installed ${SKILL_NAME} skill for Cursor"
  INSTALLED=$((INSTALLED + 1))

  # Cleanup old sy-ui skill and command (only when installing sy-ui-react)
  if [ "$SKILL_NAME" = "sy-ui-react" ]; then
    OLD_SKILL_FOUND=0
    if [ -d "$HOME/.cursor/skills/sy-ui" ]; then
      rm -rf "$HOME/.cursor/skills/sy-ui"
      echo "✓ Removed old sy-ui skill"
      OLD_SKILL_FOUND=1
    fi

    if [ $OLD_SKILL_FOUND -eq 1 ] && [ -f "$HOME/.cursor/commands/sy-ui.md" ]; then
      rm -f "$HOME/.cursor/commands/sy-ui.md"
      echo "✓ Removed old /sy-ui command"
    fi
  fi
fi

# OpenCode - Install skill
if command -v opencode &> /dev/null || [ -d "$HOME/.config/opencode" ]; then
  mkdir -p "$HOME/.config/opencode/skill/${SKILL_NAME}"
  curl -sL "$SKILL_URL" | tar xz -C "$HOME/.config/opencode/skill/${SKILL_NAME}"
  echo "✓ Installed ${SKILL_NAME} skill for OpenCode"
  INSTALLED=$((INSTALLED + 1))

  # Cleanup old sy-ui skill and command (only when installing sy-ui-react)
  if [ "$SKILL_NAME" = "sy-ui-react" ]; then
    OLD_SKILL_FOUND=0
    if [ -d "$HOME/.config/opencode/skill/sy-ui" ]; then
      rm -rf "$HOME/.config/opencode/skill/sy-ui"
      echo "✓ Removed old sy-ui skill"
      OLD_SKILL_FOUND=1
    fi

    if [ $OLD_SKILL_FOUND -eq 1 ] && [ -f "$HOME/.config/opencode/command/sy-ui.md" ]; then
      rm -f "$HOME/.config/opencode/command/sy-ui.md"
      echo "✓ Removed old /sy-ui command"
    fi
  fi
fi

# Codex CLI - Install skill
if command -v codex &> /dev/null || [ -d "$CODEX_HOME" ]; then
  mkdir -p "$CODEX_HOME/skills/${SKILL_NAME}"
  curl -sL "$SKILL_URL" | tar xz -C "$CODEX_HOME/skills/${SKILL_NAME}"
  echo "✓ Installed ${SKILL_NAME} skill for Codex"
  INSTALLED=$((INSTALLED + 1))

  # Cleanup old sy-ui skill and command (only when installing sy-ui-react)
  if [ "$SKILL_NAME" = "sy-ui-react" ]; then
    OLD_SKILL_FOUND=0
    if [ -d "$CODEX_HOME/skills/sy-ui" ]; then
      rm -rf "$CODEX_HOME/skills/sy-ui"
      echo "✓ Removed old sy-ui skill"
      OLD_SKILL_FOUND=1
    fi

    if [ $OLD_SKILL_FOUND -eq 1 ] && [ -f "$CODEX_HOME/prompts/sy-ui.md" ]; then
      rm -f "$CODEX_HOME/prompts/sy-ui.md"
      echo "✓ Removed old /sy-ui command"
    fi
  fi
fi

# Antigravity (Gemini CLI) - Install skill
if [ -d "$HOME/.gemini" ]; then
  mkdir -p "$HOME/.gemini/antigravity/skills/${SKILL_NAME}"
  curl -sL "$SKILL_URL" | tar xz -C "$HOME/.gemini/antigravity/skills/${SKILL_NAME}"
  echo "✓ Installed ${SKILL_NAME} skill for Antigravity"
  INSTALLED=$((INSTALLED + 1))

  # Cleanup old sy-ui skill and command (only when installing sy-ui-react)
  if [ "$SKILL_NAME" = "sy-ui-react" ]; then
    OLD_SKILL_FOUND=0
    if [ -d "$HOME/.gemini/antigravity/skills/sy-ui" ]; then
      rm -rf "$HOME/.gemini/antigravity/skills/sy-ui"
      echo "✓ Removed old sy-ui skill"
      OLD_SKILL_FOUND=1
    fi

    if [ $OLD_SKILL_FOUND -eq 1 ] && [ -f "$HOME/.gemini/antigravity/global_workflows/sy-ui.md" ]; then
      rm -f "$HOME/.gemini/antigravity/global_workflows/sy-ui.md"
      echo "✓ Removed old /sy-ui command"
    fi
  fi
fi

echo ""

if [ $INSTALLED -eq 0 ]; then
  echo "No supported tools detected."
  echo ""
  echo "Install one of these first:"
  echo "  • Claude Code: https://claude.ai/code"
  echo "  • Cursor: https://cursor.com"
  echo "  • OpenCode: https://opencode.ai"
  echo "  • Codex: https://openai.com/codex"
  echo "  • Antigravity: https://antigravity.google"
  exit 1
fi

echo ""
echo "Done! The ${SKILL_NAME} skill is now available."
echo ""
echo "Your AI agent will use it automatically when relevant."
