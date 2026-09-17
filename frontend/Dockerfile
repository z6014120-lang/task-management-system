FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

EXPOSE 5173

# Expose host to allow connections from outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
