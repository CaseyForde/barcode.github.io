@ECHO OFF
ng build --prod --output-path docs --base-href /barcode.github.io/
git add .
git commit -m 'CommitMsg'
git push -u origin