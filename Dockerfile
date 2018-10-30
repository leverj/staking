FROM coinpit/nodejs:v10.12.0
COPY build ./dist/build/
COPY deployment ./dist/deployment/
COPY package.json yarn.lock Fee.sol Stake.sol ./dist/
RUN  apt-get update && apt-get install git -y && \
    npm install -g yarn && cd dist && yarn

