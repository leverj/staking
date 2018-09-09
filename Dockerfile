FROM coinpit/nodejs:v8
COPY build ./dist/build/
COPY deployment ./dist/deployment/
COPY package.json yarn.lock Fee.sol Stake.sol ./dist/
RUN  apt-get update && apt-get install git -y && \
    npm install -g yarn && cd dist && yarn

