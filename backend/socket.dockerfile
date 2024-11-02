FROM node:21.1.0

RUN mkdir /socket-core

WORKDIR /socket-core
# Copy package.json and package-lock.json before other files
# Utilise Docker cache to save re-installing dependencies if unchanged
COPY ./package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

RUN npx prisma generate

CMD [ "npm", "run", "start:socket" ]
