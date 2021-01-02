type .\.nvmrc | %{$_ -replace "v",""} | %{nvm install $_}
type .\.nvmrc | %{$_ -replace "v",""} | %{nvm use $_}