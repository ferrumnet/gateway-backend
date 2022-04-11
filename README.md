# Gateway Backend

1. install latest node packages
2. install latest npm packages
3. sudo npm i
4. nodemone server.js [env] [type]
    a. env can be: dev || qa || uat || staging || prod
    b. type can be: api || cron
    c. for example: nodemone server.js dev api
5. node server.js [env] [type]
6. pm2 start server.js -- [env] [type] --name "server"
app will run on 8080 port, you can update in server.js
