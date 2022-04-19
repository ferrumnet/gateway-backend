FROM node:16

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . /app

RUN npm install

EXPOSE 8080
CMD [ "node", "server.js" ]
