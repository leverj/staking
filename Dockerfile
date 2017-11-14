FROM coinpit/nodejs:v8
COPY dist ./dist
RUN cd dist && npm install -production && useradd leverj
EXPOSE 9000
USER leverj
CMD node dist/src/server/index.js
