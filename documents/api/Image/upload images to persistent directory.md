# upload images to persistent directory

## url

+ `POST` `/api/persistent`
+ `POST` `/api/persistent/images`(version < 0.12.6 && date < 2015-11-26)

### [headers](../request/headers.html)

### request body

array of files

fieldname is ultimate file name.

### [response body](../response.html)

key name | value type
--- | ---
names | string[]
