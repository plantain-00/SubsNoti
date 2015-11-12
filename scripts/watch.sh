cd frontends
tsc -w --pretty &
gulp watch &
cd ..

cd backends
tsc -w --pretty &
cd ..

cd publish
nodemon --delay 0.5 backends/app.js &
cd ..
