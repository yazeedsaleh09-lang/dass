# Single-host image: build both دسّ clients, then run the Colyseus/HTTP server.
# Works on Railway, Fly.io, Render (Docker), any container host.
FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm ci --include=dev && npm run dassbuild
ENV PORT=8000
EXPOSE 8000
CMD ["npm", "run", "dassserver"]
