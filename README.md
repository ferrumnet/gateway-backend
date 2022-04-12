# Gateway Backend

1. Install latest node packages
2. Install latest npm packages
3. sudo npm i
4. nodemone server.js [env] [type]
5. env can be: dev || qa || uat || staging || prod
6. type can be: api || cron
7. For example: nodemone server.js dev api
8. node server.js [env] [type]
9. pm2 start server.js -- [env] [type] --name "server"
10. App will run on 8080 port, you can update in server.js
