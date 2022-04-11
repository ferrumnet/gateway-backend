# Gateway Backend

install latest node packages
install latest npm packages
sudo npm i
nodemone server.js [env] [type]
env can be: dev || qa || uat || staging || prod
type can be: api || cron
for example: nodemone server.js dev api
node server.js [env] [type]
pm2 start server.js -- [env] [type] --name "server"

app will run on 8080 port, you can update in server.js
