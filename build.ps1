# ==============================================================================
# ARCHANA PORTFOLIO BUILD COMPILER (build.ps1)
# Menggabungkan berkas modular (index_gas_modular.html, css.html, modals.html, js.html)
# menjadi file tunggal produksi: index.html (Vercel) & preview.html (Local)
# ==============================================================================

Write-Host "Compiling Archana Portfolio for Vercel & Standalone..." -ForegroundColor Cyan

$basePath = $PSScriptRoot
$modularIndex = Join-Path $basePath "index_gas_modular.html"
$cssPath = Join-Path $basePath "css.html"
$modalsPath = Join-Path $basePath "modals.html"
$jsPath = Join-Path $basePath "js.html"

if (-not (Test-Path $modularIndex)) {
    Write-Host "Error: index_gas_modular.html not found!" -ForegroundColor Red
    exit 1
}

$base = [System.IO.File]::ReadAllText($modularIndex, [System.Text.Encoding]::UTF8)
$css = [System.IO.File]::ReadAllText($cssPath, [System.Text.Encoding]::UTF8)
$modals = [System.IO.File]::ReadAllText($modalsPath, [System.Text.Encoding]::UTF8)
$js = [System.IO.File]::ReadAllText($jsPath, [System.Text.Encoding]::UTF8)

$bundled = $base.Replace("<?!= HtmlService.createHtmlOutputFromFile('css').getContent(); ?>", $css)
$bundled = $bundled.Replace("<?!= HtmlService.createHtmlOutputFromFile('modals').getContent(); ?>", $modals)
$bundled = $bundled.Replace("<?!= HtmlService.createHtmlOutputFromFile('js').getContent(); ?>", $js)

$indexPath = Join-Path $basePath "index.html"
$previewPath = Join-Path $basePath "preview.html"

[System.IO.File]::WriteAllText($indexPath, $bundled, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText($previewPath, $bundled, [System.Text.Encoding]::UTF8)

$size = (Get-Item $indexPath).Length
Write-Host "Build successful! Created index.html and preview.html ($size bytes)" -ForegroundColor Green
