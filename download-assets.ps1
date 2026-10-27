# Downloads the 43 Figma assets into ./assets (run from inside the src folder, in PowerShell).
# The Figma links expire 7 days after they were generated.
$ProgressPreference = 'SilentlyContinue'
$dir = Join-Path $PWD.Path 'assets'
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$P = 'https://www.figma.com/api/mcp/asset/4dd10c79-351d-4320-9c2d-15f0de9a9aea'

$assets = @(
  'notification-bell.svg 8193f.svg',
  'upload.svg a67a8.svg',
  'avatar.png 7ff10.png',
  'dashboard-line.svg 7e231.svg',
  'logo.svg 5b6b0.svg',
  'magnifier-quick.svg 0cdfd.svg',
  'avatar-status.svg 53996.svg',
  'chat-ai.svg 0f139.svg',
  'magnifier-search.svg 3ca86.svg',
  'advisory-flag.svg 52069.svg',
  'info.svg f3c60.svg',
  'refresh.svg 8690d.svg',
  'menu.svg d8e5c.svg',
  'filter.svg fcf03.svg',
  'arrow-up.svg ab47d.svg',
  'trend-up.svg 2752b.svg',
  'line-4.svg aee6b.svg',
  'line-5.svg 2b687.svg',
  'chart-curve.svg 2bd9a.svg',
  'marker-line-peak.svg ef24f.svg',
  'marker-line-high.svg 88aac.svg',
  'marker-dot.svg a34aa.svg',
  'marker-line-mid.svg 52aa6.svg',
  'marker-line-low.svg 6ecb4.svg',
  'legend-revenue.svg 66561.svg',
  'legend-customers.svg 16b50.svg',
  'legend-stable.svg dcaaf.svg',
  'legend-offline.svg 9ef13.svg',
  'pattern-a.svg 8de5c.svg',
  'pattern-b.svg 66d02.svg',
  'pattern-c.svg da9a6.svg',
  'clipboard-row.svg e1f6c.svg',
  'trend-down.svg f71d2.svg',
  'dashboard-line-nav.svg 79ea4.svg',
  'nav-eda.svg 121a4.svg',
  'nav-data-analysis.svg 8c238.svg',
  'nav-risk-detection.svg 583dd.svg',
  'nav-advisory.svg 2d7f0.svg',
  'nav-preferences.svg 5b31d.svg',
  'nav-theme.svg 6a840.svg',
  'nav-help.svg d7a04.svg',
  'nav-settings.svg 14513.svg',
  'nav-report.svg 5df72.svg'
)

foreach ($line in $assets) {
  $name, $file = $line -split ' '
  try {
    Invoke-WebRequest -Uri "$P/$file" -OutFile (Join-Path $dir $name) -ErrorAction Stop
    Write-Host "ok  $name"
  } catch {
    Write-Host "FAILED  $name  ($($_.Exception.Message))"
  }
}