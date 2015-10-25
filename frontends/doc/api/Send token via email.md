# Send token via email

will send a link with it to the given email.

## Url

/api/token_sent

## Method

post

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

## version <0.3

### Expiration Date

2015-11-01

### [Parameters](./Parameters.html)

### Request Body

key name | value type | required
--- | --- | ---
email | string | true
name | string | false

### [Response Body](./Response.html)
