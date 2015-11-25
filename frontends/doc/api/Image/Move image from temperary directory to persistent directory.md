# move image from temperary directory to persistent directory

## url

+ `POST` `/api/persistence`
+ `POST` `/api/images/persistent`(version < 0.12.6 && date < 2015-11-26)

### [headers](../request/headers.html)

### request body

key name | value type
--- | ---
name | string
newName | string

### [response Body](../response.html)
