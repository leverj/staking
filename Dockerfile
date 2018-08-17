FROM coinpit/nodejs:v8
COPY dist ./dist
RUN apt-get update && \
   apt-get install git -y && \
   npm install -g yarn && \
   cd dist && \
   yarn install -production && \
   apt-get remove -y git && \
   rm -rf /var/lib/apt/lists/* && rm -f ~/.npmrc && \
   useradd leverj

EXPOSE 8888
USER leverj
CMD node dist/src/server/index.js
