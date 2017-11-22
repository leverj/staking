FROM coinpit/nodejs:v8
COPY automation.js ../package.json conf.js ../contracts ./dist
RUN apt-get update && apt-get install -y git && cd dist && npm iinstall --production
