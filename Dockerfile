# 此 Dockerfile 並無實際測試過，只是闡述 Production 部署概念

FROM node:14.15.4-alpine3.12

RUN mkdir -p /home/node/app
    && mkdir -p /tmp/project

COPY * /tmp/project

RUN cd /tmp/project
    && npm ci
    && npm run build
    && cp -r dist /home/node/app
    && cp -r node_modules /home/node/app
    && cp .env /home/node/app

WORKDIR /home/node/app

# 如果有 CI/CD 流程可以將上面那段 ci && build 移到那邊做
# 註解掉上面 RUN 部分，並打開下面 Copy 將 dist, node_modules, .env 複製進 Workdir
#COPY dist .
#COPY node_modules .
#COPY .env .

CMD ['node', 'dist/main.js']