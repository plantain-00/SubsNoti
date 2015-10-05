call npm install
call tsd install -ros
call tsc
call gulp css --gulpfile frontends/gulpfile.js
call gulp js --gulpfile frontends/gulpfile.js
call gulp rev --gulpfile frontends/gulpfile.js
call gulp html --gulpfile frontends/gulpfile.js
call dot.bat
call gitbook.bat
call gulp doc --gulpfile frontends/gulpfile.js