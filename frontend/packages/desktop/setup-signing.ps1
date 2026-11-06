# GrowAgentAI Code Signing Setup - Windows

# Create self-signed certificate for development
function Create-DevCertificate {
    Write-Host "Creating self-signed certificate..." -ForegroundColor Green

    $cert = New-SelfSignedCertificate `
        -CertStoreLocation "cert:\CurrentUser\My" `
        -Subject "CN=GrowAgentAI" `
        -KeySpec Signature `
        -KeyLength 2048 `
        -KeyFriendlyName "GrowAgentAI Code Signing" `
        -Provider "Microsoft Enhanced RSA and AES Cryptographic Provider"

    Write-Host "Certificate created: $($cert.Thumbprint)" -ForegroundColor Green
    return $cert
}

# Export certificate as PFX
function Export-Certificate {
    param(
        [string]$CertThumbprint,
        [string]$OutputPath,
        [securestring]$Password
    )

    Write-Host "Exporting certificate to $OutputPath..." -ForegroundColor Green

    $cert = Get-ChildItem -Path Cert:\CurrentUser\My | Where-Object { $_.Thumbprint -eq $CertThumbprint }

    if (-not $cert) {
        Write-Host "Certificate not found!" -ForegroundColor Red
        return $false
    }

    Export-PfxCertificate -Cert $cert -FilePath $OutputPath -Password $Password | Out-Null
    Write-Host "Certificate exported successfully" -ForegroundColor Green
    return $true
}

# Main
Write-Host "GrowAgentAI Code Signing Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Create certificate
$cert = Create-DevCertificate

# Get password for PFX export
$password = Read-Host "Enter password for certificate export" -AsSecureString

# Export certificate
$outputPath = "./certificate.pfx"
Export-Certificate -CertThumbprint $cert.Thumbprint -OutputPath $outputPath -Password $password

# Set environment variables
Write-Host ""
Write-Host "Setting environment variables..." -ForegroundColor Green
[Environment]::SetEnvironmentVariable("CSC_LINK", (Resolve-Path $outputPath).Path, "User")
[Environment]::SetEnvironmentVariable("CSC_KEY_PASSWORD", ([Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($password))), "User")

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "Certificate thumbprint: $($cert.Thumbprint)" -ForegroundColor Cyan
Write-Host "Certificate file: $outputPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now build with: npm run dist:win" -ForegroundColor Cyan
