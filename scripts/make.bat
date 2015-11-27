call set NODE_ENV=development

call npm install && tsc && gulp clean && tsc && gulp make
