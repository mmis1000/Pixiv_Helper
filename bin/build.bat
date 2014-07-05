@echo off

node bin/version.js >> temp.txt
set version= < temp.txt
del temp.txt

set url=https://github.com/jnordberg/gif.js

if exist node_modules/commonjs-everywhere/lib/command.js (
    echo Packaging pixiv_helper.js %version%
    node node_modules/commonjs-everywhere/lib/command.js ^
        --export pixiv_helper ^
        --root src/ ^
        --source-map dist/pixiv_helper.js.map ^
        --output dist/pixiv_helper.js ^
        --inline-sources ^
        pixiv_helper.coffee
    echo. >> dist\pixiv_helper.js
    echo // pixiv_helper.js %version% >> dist\pixiv_helper.js
    
    node bin\postCompile.js 
    
    echo build done!
) else (
    echo Dependencies missing. Run npm install
)