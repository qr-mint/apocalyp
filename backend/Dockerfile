FROM node:21.1.0

RUN mkdir /game-core

WORKDIR /game-core
# Copy package.json and package-lock.json before other files
# Utilise Docker cache to save re-installing dependencies if unchanged
COPY ./package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

RUN npx prisma generate

# Run npm start script when container starts
CMD [ "npm", "start" ]
