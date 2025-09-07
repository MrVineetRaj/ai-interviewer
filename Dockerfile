# Use official Node.js 22 image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm i pnpm -g
RUN pnpm install

# Remove existing node_modules to avoid conflicts, then copy everything
RUN rm -rf node_modules

# Copy the rest of your app
COPY . .

# Reinstall dependencies
RUN pnpm install

# Expose the port your app runs on
EXPOSE 3000

# Start the app in development
CMD ["pnpm", "run", "dev"]