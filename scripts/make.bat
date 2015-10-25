call set NODE_ENV=development

rem install
echo 'Starting "npm update"...'
call npm update
echo 'Finished "npm update".'

rem compile gulpfile.ts
echo 'Starting "tsc gulpfile.ts"...'
call tsc
echo 'Finished "tsc gulpfile.ts".'

rem gulp task clean
echo 'Starting "gulp clean"...'
call gulp clean
echo 'Finished "gulp clean".'

rem compile
echo 'Starting "tsc"...'
call tsc
call tsc -p frontends
call tsc -p backends
echo 'Finished "tsc".'

rem test
echo 'Starting "test"...'
call mocha publish/backends/tests
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
