Initial readme
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
docker-compose exec server npm run logs
docker-compose logs -f server