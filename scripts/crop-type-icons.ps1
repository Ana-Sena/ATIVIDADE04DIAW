# Recorta os 18 icones originais sem redesenhar, redimensionar ou alterar o alpha.
Add-Type -AssemblyName System.Drawing
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$sourcePath = Join-Path $projectRoot 'src/assets/images/Simbolos Elementos Pokemon (1).png'
$outputDirectory = Join-Path $projectRoot 'src/assets/images/types'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

$columns = @(
    @('normal', 'fire', 'water', 'electric', 'grass', 'ice'),
    @('fighting', 'poison', 'ground', 'flying', 'psychic', 'bug'),
    @('rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy')
)
$source = [Drawing.Bitmap]::FromFile($sourcePath)
try {
    if ($source.Width -ne 1256 -or $source.Height -ne 674) {
        throw 'A imagem original deve ter 1256 x 674 pixels para estes recortes.'
    }
    for ($column = 0; $column -lt 3; $column++) {
        for ($row = 0; $row -lt 6; $row++) {
            $bounds = [Drawing.Rectangle]::new((25 + 400 * $column), (39 + 104 * $row), 70, 70)
            $icon = $source.Clone($bounds, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
            try {
                $icon.Save((Join-Path $outputDirectory ($columns[$column][$row] + '.png')), [Drawing.Imaging.ImageFormat]::Png)
            } finally { $icon.Dispose() }
        }
    }
} finally { $source.Dispose() }
Write-Output '18 icones PNG recortados com transparencia preservada.'
