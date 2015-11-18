# Send token via email

will send a link with it to the given email.

## Url

`post` `/api/token_sent`

## version >=0.3

### Expiration Date

no

### [Parameters](./Parameters.html)

### Request Body

key name | value type | required
--- | --- | ---
email | string | true
name | string | false
guid | string | true
code | string | true

### [Response Body](./Response.html)
