FROM node:latest

MAINTAINER Yuta Yamate <yyamate@bio.titech.ac.jp>

RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pkg-resources python3-numpy python3-scipy python3-pandas

COPY . /tmp/functree-cli

RUN cd /tmp/functree-cli && \
    npm install -g && \
    cd && \
    rm -rf /tmp/functree-cli
