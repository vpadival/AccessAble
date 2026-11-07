FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npx playwright install --with-deps chromium && chmod -R a+rX /ms-playwright
COPY --chown=node:node src ./src
USER node
EXPOSE 4000
CMD ["node", "src/server.js"]
