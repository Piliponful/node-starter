# Development setup

## Prerequisites
1. docker
2. docker-compose

### Commands you'll use in development
1. docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
2. docker-compose ps to see if there are any errors after start up
3. docker-compose logs [-f to see logs update in real-time] server/client/nginx/mongodb to see stdout for specific service
4. docker-compose exec server npm run logs to see any internal server logs

### Database setup
1. Connect to database using robomongo(with user - `root` and password - `password`) or mongo shell(docker-compose exec mongodb mongo staging -u root -p 'password')
2. Add root admin by hand, that's the only way. Password needs to be a hash. For this example we use hash of `password` password.
```json
{
  "firstname": "Yourname",
  "lastname": "Yourlastname",
  "email": "youremail@gmail.com",
  "password": "$2a$10$8AtwmYZaCeVCc.H4RiGgOONlgG25.kGoniDF.wHXtUyp1uLewdO1W",
  "rootAdmin": true,
  "tenantAdmin": false,
  "deleted": false
}```

### API Interaction(with cURL)

1. With the following request you'll get root admin JWT that you can include with all subsequent requests
  `curl -X POST -H "Content-Type: application/json" -d '{"email": "youremail@gmail.com", "password": "password"}' localhost/api/user/login`
2. Create first tenant admin. Tenant will be created automaticaly if it doesn't exist
`curl -X POST -H "authorization: JWT" -H "Content-Type: application/json" -d '{"email": "tenantadminemil@gmail.com", "password": "password", "firstname": "Firstname", "lastname": "lastname", "tenantAdmin": true, "tenantName": "test"}' localhost/api/user
