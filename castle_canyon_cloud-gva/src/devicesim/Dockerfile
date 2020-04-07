FROM ubuntu:xenial

# Allowed --build-arg
ARG NODE_VER

ENV PATH /home/ubuntu/npm_home/bin:/home/ubuntu/castle_canyon/node_modules/pm2/bin:$PATH
ENV NODE_PATH "."

# - Include SSH for git cloning.
# - Include git/build-essential/ca-certificates for NPM-triggered downloads/compilations.
# - Verify gpg and sha256: https://nodejs.org/dist/v<VERSION>/SHASUMS256.txt.gpg
#   gpg: aka "Rod Vagg <rod@vagg.org>"

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl build-essential git openssh-client nano net-tools \
    && curl -SLO "https://nodejs.org/dist/v$NODE_VER/node-v$NODE_VER-linux-x64.tar.gz" \
    && curl -SLO "https://nodejs.org/dist/v$NODE_VER/SHASUMS256.txt.asc" \
    && grep " node-v$NODE_VER-linux-x64.tar.gz\$" SHASUMS256.txt.asc | sha256sum -c - \
    && tar -xzf "node-v$NODE_VER-linux-x64.tar.gz" -C /usr/local --strip-components=1 \
    && rm "node-v$NODE_VER-linux-x64.tar.gz" SHASUMS256.txt.asc \
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --shell /bin/bash ubuntu

ADD package.json                        /home/ubuntu/castle_canyon/
ADD package-lock.json                   /home/ubuntu/castle_canyon/
ADD devicesim                           /home/ubuntu/castle_canyon/devicesim/
ADD common                              /home/ubuntu/castle_canyon/common/
ADD node_modules                        /home/ubuntu/castle_canyon/node_modules/
ADD README.md                           /home/ubuntu/castle_canyon/
ADD containers/devicesim/runprocs.sh    /home/ubuntu/castle_canyon/

RUN chown -R ubuntu.ubuntu /home/ubuntu/castle_canyon

ENV TERM linux

USER ubuntu:ubuntu

CMD ["/bin/bash", "-c", "/home/ubuntu/castle_canyon/runprocs.sh"]

