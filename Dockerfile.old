FROM coinpit/nodejs:v8
COPY dist ./dist
RUN apt-get update && apt-get install git -y && cd dist && npm install -production && useradd leverj
EXPOSE 8888
USER leverj
CMD node dist/src/server/index.js
