# Single-host image (Option A): build the web client, run the Colyseus server which serves it.
# Works on Railway, Fly.io, Render (Docker), any container host.
FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm install --include=dev && node apps/v2web/build.mjs
ENV PORT=2568
EXPOSE 2568
CMD ["npm", "run", "v2server"]
