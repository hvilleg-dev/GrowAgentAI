#!/bin/bash

# GrowAgentAI Code Signing Setup - macOS/Linux

set -e

echo "GrowAgentAI Code Signing Setup"
echo "=============================="
echo ""

# macOS - Check for Apple Developer Certificate
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "macOS detected"
    echo ""
    echo "Steps to setup code signing for macOS:"
    echo "1. Go to https://developer.apple.com/account/resources"
    echo "2. Create 'Developer ID Application' certificate"
    echo "3. Download and import into Keychain"
    echo "4. Export as .p12 file"
    echo ""

    read -p "Enter path to your .p12 certificate: " CERT_PATH

    if [ ! -f "$CERT_PATH" ]; then
        echo "Certificate file not found!"
        exit 1
    fi

    # Read password
    read -sp "Enter certificate password: " CERT_PASSWORD
    echo ""

    # Set environment variables
    export CSC_LINK="$CERT_PATH"
    export CSC_KEY_PASSWORD="$CERT_PASSWORD"
    export APPLE_ID="$(<read Apple ID email)"
    export APPLE_PASSWORD="$(<read App-specific password)"
    export APPLE_TEAM_ID="$(<read Apple Team ID)"

    # Save to .env.local for next time
    cat > .env.local << EOF
CSC_LINK="$CERT_PATH"
CSC_KEY_PASSWORD="$CERT_PASSWORD"
APPLE_ID="$APPLE_ID"
APPLE_PASSWORD="$APPLE_PASSWORD"
APPLE_TEAM_ID="$APPLE_TEAM_ID"
EOF

    chmod 600 .env.local
    echo "Configuration saved to .env.local"

# Linux - GPG signing
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Linux detected"
    echo ""
    echo "Setting up GPG signing for Linux packages"
    echo ""

    # Check if GPG is installed
    if ! command -v gpg &> /dev/null; then
        echo "GPG not installed. Installing..."
        sudo apt-get update
        sudo apt-get install -y gnupg
    fi

    # Generate GPG key if needed
    gpg --list-keys GrowAgentAI || {
        echo "Creating GPG key for GrowAgentAI..."
        gpg --batch --generate-key << EOF
%echo Generating GrowAgentAI key
Key-Type: RSA
Key-Length: 4096
Name-Real: GrowAgentAI
Name-Email: noreply@growagentai.com
Expire-Date: 0
%no-ask-passphrase
%commit
%echo Done
EOF
    }

    # Get key ID
    KEY_ID=$(gpg --list-secret-keys --with-colons | grep "sec:" | head -1 | cut -d: -f5)

    if [ -z "$KEY_ID" ]; then
        echo "Failed to create/find GPG key"
        exit 1
    fi

    export CSC_LINK="$KEY_ID"

    # Save to .env.local
    echo "CSC_LINK=\"$CSC_LINK\"" > .env.local
    chmod 600 .env.local

    echo "GPG signing configured"
    echo "Key ID: $KEY_ID"
fi

echo ""
echo "Code signing setup complete!"
echo ""
echo "Environment variables set:"
echo "- CSC_LINK"
echo "- CSC_KEY_PASSWORD"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "- APPLE_ID"
    echo "- APPLE_PASSWORD"
    echo "- APPLE_TEAM_ID"
fi
echo ""
echo "You can now build with: npm run dist"
