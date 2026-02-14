$targetFile = "C:/Users/chinm/documents/github/PokemonShowdown-Reborn/data/FORMES.md"
$targetWord = ""

if (Test-Path $targetFile) {
    $content = Get-Content $targetFile -Raw
    
    $pattern = "(?s)<<<<<<< .*?\r?\n(.*?)\r?\n?=======\r?\n?(.*?)\r?\n?>>>>>>> .*?(\r?\n|$)"
    
    $newContent = [regex]::Replace($content, $pattern, {
        param($m)
        
        $ourSide   = $m.Groups[1].Value
        $theirSide = $m.Groups[2].Value


        if ($ourSide -like "*$targetWord*") {
	    Write-Host $ourSide
            Write-Host "Resolved a block in $targetFile using 'Theirs'" -ForegroundColor Green
            return ($theirSide + "`n")
        }
        return $m.Value
    })

    Set-Content $targetFile $newContent -NoNewline
}
else {
    Write-Error "File not found: $targetFile"
}