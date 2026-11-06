#!/bin/bash

# Build script for GrowAgentAI desktop app
# Creates installers for Windows, macOS, and Linux

set -e

echo "GrowAgentAI Desktop Build System"
echo "=================================="
echo ""

# Load environment variables if .env.local exists
if [ -f ".env.local" ]; then
    echo "Loading environment variables from .env.local..."
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Functions
build_all() {
    echo "Building for all platforms (Windows, macOS, Linux)..."
    npm run dist
}

build_windows() {
    echo "Building for Windows..."
    npm run dist:win
}

build_macos() {
    echo "Building for macOS..."
    npm run dist:mac
}

build_linux() {
    echo "Building for Linux..."
    npm run dist:linux
}

# Parse arguments
if [ $# -eq 0 ]; then
    build_all
else
    case "$1" in
        win|windows)
            build_windows
            ;;
        mac|macos)
            build_macos
            ;;
        linux)
            build_linux
            ;;
        all)
            build_all
            ;;
        *)
            echo "Usage: $0 [all|win|mac|linux]"
            echo ""
            echo "Examples:"
            echo "  $0              # Build for all platforms"
            echo "  $0 win          # Build for Windows only"
            echo "  $0 mac          # Build for macOS only"
            echo "  $0 linux        # Build for Linux only"
            exit 1
            ;;
    esac
fi

echo ""
echo "Build complete!"
echo "Output in: dist/"
ls -lh dist/
