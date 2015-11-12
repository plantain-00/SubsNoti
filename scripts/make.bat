call set NODE_ENV=development

rem install
echo 'Starting "npm install"...'
call npm install
echo 'Finished "npm install".'

rem compile gulpfile.ts
echo 'Starting "npm tsc"...'
call npm tsc
echo 'Finished "npm tsc".'

rem gulp task clean
echo 'Starting "gulp clean"...'
call gulp clean
echo 'Finished "gulp clean".'

rem compile
echo 'Starting "tsc"...'
call npm tsc
call npm frontends
call npm backends
echo 'Finished "tsc".'

rem test
echo 'Starting "test"...'
call npm tests
echo 'Finished "test".'

rem gulp tasks
echo 'Starting "css"...'
call gulp css
echo 'Finished "css".'

echo 'Starting "js"...'
call gulp js
echo 'Finished "js".'

echo 'Starting "rev"...'
call gulp rev
echo 'Finished "rev".'

echo 'Starting "html"...'
call gulp html
echo 'Finished "html".'

echo 'Starting "doc"...'
call gulp doc
echo 'Finished "doc".'

echo 'Starting "dot"...'
call gulp dot
echo 'Finished "dot".'

echo 'Starting "icon".'
call gulp icon
echo 'Finished "icon"...'
