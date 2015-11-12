call set NODE_ENV=development

rem install
echo 'Starting "npm install"...'
call npm install
echo 'Finished "npm install".'

rem compile gulpfile.ts
echo 'Starting "tsc gulpfile.ts"...'
call tsc
echo 'Finished "tsc gulpfile.ts".'

rem gulp task clean
echo 'Starting "gulp clean"...'
call gulp clean
echo 'Finished "gulp clean".'

rem gulp task make
echo 'Starting "gulp make"...'
call gulp make
echo 'Finished "gulp make".'
