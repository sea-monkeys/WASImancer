# Stage 1: Build stage
FROM node:21-alpine AS builder

#WORKDIR /usr/src/app
WORKDIR /app
COPY package*.json ./

RUN npm install
COPY index.js .

# Stage 2: Production stage
FROM gcr.io/distroless/nodejs20-debian12

# Create non-root user (in distroless, user with ID 1000 is nonroot)
USER nonroot:nonroot

WORKDIR /app

COPY --from=builder --chown=nonroot:nonroot /app .

# Command to run the application
CMD ["index.js"]
