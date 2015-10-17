cd frontends
tsc -w &
gulp watch &
cd ..

cd backends
tsc -w &
cd ..

cd publish
nodemon --delay 0.5 backends/app.js &
cd ..
