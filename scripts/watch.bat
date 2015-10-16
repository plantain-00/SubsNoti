cd frontends
start tsc -w
start gulp watch
cd ..

cd backends
start tsc -w
cd ..

cd publish
start nodemon --delay 0.5 backends/app.js
cd ..
