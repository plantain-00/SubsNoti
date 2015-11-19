# Upload images to persistent directory

## Url

+ `post` `/api/persistent`
+ `post` `/api/persistent/images`(available < 0.12.6 and earlier than 2015-11-26)

## version >=0.5.3

### Expiration Date

no

### [Parameters](./Parameters.html)

### Request Body

array of files

fieldname is ultimate file name.

### [Response Body](./Response.html)

key name | value type
--- | ---
names | string[]
