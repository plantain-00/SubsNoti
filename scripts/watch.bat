cd frontends
start tsc --pretty -w
start gulp watch
cd ..

cd backends
start tsc --pretty -w
cd ..

cd publish
start nodemon --delay 0.5 backends/app.js
cd ..
