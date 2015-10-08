# Get themes of an organization

## Url

/api/organizations/:organization_id/themes

## Method

get

## version 1

### Expiration Date

no

### [Parameters](./Parameters.html)

### [Cookies](./Cookies.html)

### [Response Body](./Response.html)

key name | value type | description
--- | --- | ---
themes | [Theme](#theme)[] | exists when is success

### Theme

key name | value type
--- | ---
id | number
title | string
detail | string
organizationId | number
createTime | number