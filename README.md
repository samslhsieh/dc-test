# DC Test

## Introduction

1. 為了模糊資訊，部分名詞會取用暱稱，EX: DC


2. Demo: https://dc-test-api.samhsieh.xyz


3. 此 Demo 部署在 AWS 中


4. 使用架構為 `Node 14.15.4 (node:14.15.4-alpine3.12)` 和 `Redis 6.0.10 (redis:6.0.10-alpine3.13)`

   ```
   選擇使用 Redis 的原因：
   此 Project 中的 RateLimit 主要是比較 Client 端 IP 在固定時間內的請求次數。
    
   所以可以將數據存成 `key(ip): value(amount)` 的形式，並加上 `expiredTime`，
   不太需要 RDB 那些強大但是複雜的關聯式查詢。
    
   再加上其主要是 in-memory 的形式執行，在效能上來說會比其他的 NoSQL 來得好
   ```

5. RateLimit 策略為
   ```
   第一筆 Request 開始算起 (該時間點稱 n)， 60 秒內請求總計超過 60 次即會啟動 RateLimit。
   
   若 n + 60 秒後不論是否觸發 RateLimit，皆會重置計數器
   ```
   
6. 此 Demo 不支援 IPv6


## Installation

### Requirements

1. Docker


2. NPM 6


### Getting started
1. 切換至專案並安裝所需的套件 
   ```
   $ cd dc-test && npm ci
   ```

2. 執行 `docker-compose`
   ```
   $  docker-compose up
   ```

3. 就會看見伺服器成功啟動 `http://127.0.0.1:40003`
   ```
   Hello World!
   ```

### Configuration
```
$ vi .env
$ docker-compose restart
```

| Key                      | Value      | Default Value |
| ----                     | ----       | ----          |
| REDIS_HOST               | Redis Host | redis         |
| REDIS_PORT               | Redis Port | 6379          |
| RATE_LIMIT_EXPIRED_TIME  | 幾秒後重置   | 60            |
| RATE_LIMIT_AMOUNT        | 呼叫次數上限 | 60            |


## Call API
### Curl
```
$ curl --location --request GET 'https://dc-test-api.samhsieh.xyz/counters'
```

## Test
Unit Test 會對 Redis 進行讀寫測試，必須先啟動 Redis

執行前面 [#Installation](#installation) 章節的步驟或是執行 `$ docker-compose run dc-redis `
### Unit Test
```
$ npm run test
```

### E2E Test
```
$ npm run test:e2e
```
