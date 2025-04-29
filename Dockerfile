# Use an official Node.js runtime as a parent image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Babel dependencies
RUN npm install --save-dev @babel/cli @babel/core @babel/preset-env

# Copy the rest of the application files to the container
COPY . .

# Build the app
RUN npm run build

# Expose the application port (adjust if your app listens on a different port)
EXPOSE 3000

# Define the command to run the application
CMD npm start
