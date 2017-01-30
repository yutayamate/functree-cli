FROM node:6.9

MAINTAINER Yuta Yamate <yyamate@bio.titech.ac.jp>

# Install dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pkg-resources \
    python3-numpy \
    python3-scipy \
    python3-pandas

# Install FuncTree-CLI globally
RUN npm install --global functree-cli

CMD ["functree"]
