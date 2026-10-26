# Genera los íconos PNG de la extensión: un escudo con una lupa.
# Uso: powershell -ExecutionPolicy Bypass -File scripts/generate-icons.ps1

Add-Type -AssemblyName System.Drawing

$outputDir = Join-Path $PSScriptRoot '..\public\icons'
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$shieldColor = [System.Drawing.ColorTranslator]::FromHtml('#1E3A5F')
$lensColor = [System.Drawing.Color]::White

foreach ($size in 16, 32, 48, 128) {
  $bitmap = New-Object System.Drawing.Bitmap $size, $size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::Transparent)

  # Todo se dibuja en una grilla de 128 x 128 y se escala al tamaño final.
  $graphics.ScaleTransform($size / 128, $size / 128)

  $shield = New-Object System.Drawing.Drawing2D.GraphicsPath
  $shield.AddLine(64, 6, 114, 22)
  $shield.AddLine(114, 22, 114, 58)
  $shield.AddBezier(114, 58, 114, 90, 92, 112, 64, 124)
  $shield.AddBezier(64, 124, 36, 112, 14, 90, 14, 58)
  $shield.AddLine(14, 58, 14, 22)
  $shield.CloseFigure()
  $graphics.FillPath((New-Object System.Drawing.SolidBrush $shieldColor), $shield)

  $lensPen = New-Object System.Drawing.Pen $lensColor, 10
  $graphics.DrawEllipse($lensPen, 40, 36, 40, 40)

  $handlePen = New-Object System.Drawing.Pen $lensColor, 13
  $handlePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $handlePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $graphics.DrawLine($handlePen, 77, 73, 92, 88)

  $bitmap.Save((Join-Path $outputDir "icon-$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}
