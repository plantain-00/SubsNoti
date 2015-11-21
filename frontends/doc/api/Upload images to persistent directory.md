# Upload images to persistent directory

## Url

+ `POST` `/api/persistent`
+ `POST` `/api/persistent/images`(version < 0.12.6 && date < 2015-11-26)

### [Headers](./Headers.html)

### Request Body

array of files

fieldname is ultimate file name.

### [Response Body](./Response.html)

key name | value type
--- | ---
names | string[]
