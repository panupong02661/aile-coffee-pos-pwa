# Deployable backend + same-origin POS/Guest/Customer web apps.
# Requires working internet access to npm at image build time.
FROM node:22-alpine
RUN apk add --no-cache font-noto
WORKDIR /opt/aile
ENV NODE_ENV=production PORT=4000
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY api ./api
COPY db ./db
COPY web ./web
COPY assets ./assets
COPY scripts ./scripts
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 CMD node -e "fetch('http://127.0.0.1:4000/api/health/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["sh","-c","node api/src/init.js && exec node api/src/server.js"]
