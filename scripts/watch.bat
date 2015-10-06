cd frontends
start tsc -w
start gulp watch
cd ..

cd backends
start tsc -w
start nodemon --delay 0.5 ../publish/backends/app.js
cd ..