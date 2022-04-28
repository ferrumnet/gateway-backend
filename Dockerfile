FROM node:16

# Create app directory
WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 8080

CMD [ "node", "server.js" ]
