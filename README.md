# Development setup

## Prerequisites
1. docker
2. docker-compose

### Commands you'll use in development
1. docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
2. docker-compose ps to see if there are any errors after start up
3. docker-compose logs [-f to see logs update in real-time] server/client/nginx/mongodb to see stdout for specific service
4. docker-compose exec server npm run logs to see any internal server logs
5. docker-compose down && sudo rm -r package-lock.json node_modules && docker volume rm -f arialpoint_node_modules to update dependencies if you added a new one for example

### Environment variables setup
- `SECRET` - secret used to sign JWT token
- `MONGODB_ROOT_PASSWORD` - you will use this password to connect to db as root user
- `SENDGRID_API_KEY` - sendgrid is a service for email delivery, you need to create account there to get api key. Or you can get it from PM/teamwork.code-care.pro
- `ACCESS_KEY` - AWS access key, you can get it from PM, teamwork.code-care.pro or generate a new one in AWS account settings
- `SECRET_ACCESS_KEY` - AWS sercret access key, you can get it from PM/teamwork.code-care.pro or generate a new one in AWS account settings

### Code Style

For code style on backend we use `standardjs`

What you need to do:
1. Install standardjs globaly with `npm i -g standard` or localy with all the docker containers stopped with `cd server && npm i` and only then start app. It won't work if you have docker server container running
2. Install extension for your code editor for standardjs

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
`curl -X POST -H "authorization: JWT" -H "Content-Type: application/json" -d '{"email": "tenantadminemil@gmail.com", "password": "password", "firstname": "Firstname", "lastname": "lastname", "tenantAdmin": true, "tenantName": "test"}' localhost/api/user`

3. Finish user registration
`curl -X POST -H "authorization: JWT" -H "Content-Type: application/json" -d '{ "finishRegistrationCode": "You'll get this code on your email within link or as endpoint result",
additionalFields: { "address": "Address", "city": "Kharkiv", "state": "Kharkiv", "password": "password" } }' localhost/api/user/finish-registration

### Production setup
1. Setup all the required environment variables as described in dev setup with addition of APP_URL variable being equal to current server domain
