# Elasticsearch in a Docker Container

This repository is based on [Guttenberg-Search](https://github.com/mpolinowski/Guttenberg-Search) by Patrick Triest.


* `git clone https://github.com/mpolinowski/elasticsearch-docker.git`
* Run Elasticsearch with `docker-compose up -d --build`
* Create ES Index `docker exec es-api "node" "server/load_data.js"` from data in __./books__
* Open the UI in `http://localhost:8888` in your local browser
* Database query `http://localhost:9200/library/_search?q=camera`
* API test `http://localhost:3000/search?term=camera`


To make the app available on your local network, add your servers local IP or domain name on this line `baseUrl: 'http://localhost:3000'` in `.\public\app.js`.