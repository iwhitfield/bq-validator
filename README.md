# bq-validator
Middleware to validate fields given in requests to an express app

## Usage
The first parameter defines that fields that are required. In the example below, a request 
to the login api would require a username and a password. The second parameter is a callback
function that is called is any missing or invalid fields are found. This function is passed a
message describing what fields are missing.

The required fields can contain nested operators for conditional fields.

```javascript
var validate = require('bq-validator');
app.use('api/users/login', validate([ 'username', 'password' ], function(missing, req, res){
  res.status(400).json({
    status: 400,
    message: missing
  })
})
```

## Available Operators

### $or
Checks that at least one of the fields are given.
```javascript
app.use('api/users/login', validate([
    { $or: [
      'email',
      'username',
    ] },
    'password'
], function(missing, req, res){
  res.status(400).json({
    status: 400,
    message: "Missing login credentials!"
  })
})
```

### $and
Checks that all the fields are given. The same can be achieved by just using an array however.
```javascript
app.use('api/location/create', validate([
    { $or: [
      { $and: [
        "lat",
        "long"
      ] },
      "address"
    ] }
], function(missing, req, res){
  res.status(400).json({
    status: 400,
    message: missing
  })
})

// the required fields here could just be
[
    { $or: [
      [
        "lat",
        "long"
      ],
      "address"
    ] }
]
```

### $query, $body
The middleware will check the fields in either req.query or req.body, depending on the request method.
This can be overiden for specific fields using $query and $body. In the example below, an appKey must be passed
as a query parameter, with either a name or description in the request body (presuming this is a PUT request).
```javascript
app.use('api/app/update', validate([
  { $query: 'appKey' },
  { $or: [
    'name',
    'description'
  ] }
], function(missing, req, res){
  res.status(400).json({
    status: 400,
    message: missing
  })
})
```

### $number
Checks that a field is a number, and converts it from a string.
```javascript
app.use('api/counter/update', validate([
  { $number: 'count' }
], function(missing, req, res){
  res.status(400).json({
    status: 400,
    message: "Count is required".
  })
})
```

### $int
Checks that a field is an integer, and converts it from a string.
```javascript
app.use('api/event/create', validate([
  "name",
  "location",
  { $number: 'attendence' }
], function(missing, req, res){
  res.status(400).json({
    status: 400,
    message: missing
  })
})
```

### $boolean
Checks that field is a boolean value, true or false, and converts it from a string.
```javascript
app.use('api/event/create', validate([
  "name",
  "location",
  { $boolean: 'private' }
], function(missing, req, res){
  res.status(400).json({
    status: 400,
    message: missing
  })
})
```

### $date
Checks that a field is a date, and converts it from a string into a Date object.
```javascript
app.use('api/event/create', validate([
  "name",
  "location",
  { $date: date }
], function(missing, req, res){
  res.status(400).json({
    status: 400,
    message: missing
  })
})
```

### $email
Checks that a field is a valid email address.
```javascript
app.use('api/user/login', validate([
    { $or: [
      { $email: 'email' },
      'username',
    ] },
    'password'
], function(missing, req, res){
  res.status(400).json({
    status: 400,
    message: missing
  })
})
```

### $json
Checks that a field is a JSON string, and converts it into an object.
```javascript
app.use('api/event/query', validate([
  { $json: 'where' }
], function(missing, req, res){
  res.status(400).json({
    status: 400,
    message: "Query must have where clause in JSON format"
  })
})
```

### Multiple fields of a type

An array can be given to check mutliple fields for operators that check for a specific value type.
The example below shows two dates required to create and event.
```javascript
app.use('api/event/create', validate([
  "name",
  "location",
  { $date: [ 'start', 'end' ] }
], function(missing, req, res){
  res.status(400).json({
    status: 400,
    message: missing
  })
})
```

## Custom Validation

Fields can be checked to match a specific set of values, or be passed to a function for more detailed verification.
To do this, use an object containing the field name as a key, and an array to match against as the corresponding value.

```javascript
app.use('api/car/create', validate([
  { color: ['red', 'blue', 'green', 'black', 'white'] },
  'make',
  'model'
], function(missing, req, res){
  res.status(400).json({
    status: 400,
    message: missing
  })
})
```

Using a function. The value of field given with the request is passed to the function. If the field is not given then
it will fail automatically. If the validation is failed, then the function should have no return value. If a return value
is given, it will overwrite the value of the field.
```javascript
// Change Akari to Akari~n, and leave all other values the same.
app.use('api/character/add', validate([
  { name: [ function(value){
    if(name == 'Akari')
      value = 'Akari~n';
    return value
  } ] }
], function(missing, req, res){
  res.status(400).json({
    status: 400,
    message: "name is required"
  })
})

// Only allow dates after 2015-01-01
// Since $date occurs first, the value will already be a date object
// If no date was given, or it was invalid, the value will be undefined and verification will fail automatically.
// Note the value must be returned.

app.use('api/reminder/create', validate([
  'title',
  'description',
  {
    $date: 'date',
    date: [ function(value){
      if(value > new Date('2015-01-01')){
        return value;
      }
    } ]
  }
], function(missing, req, res){
  res.status(400).json({
    status: 400,
    message: missing
  })
})
```
