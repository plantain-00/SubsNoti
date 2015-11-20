# Upload images to persistent directory

## Url

+ `post` `/api/persistent`
+ `post` `/api/persistent/images`(version < 0.12.6 && date < 2015-11-26)

### [Parameters](./Parameters.html)

### Request Body

array of files

fieldname is ultimate file name.

### [Response Body](./Response.html)

key name | value type
--- | ---
names | string[]
