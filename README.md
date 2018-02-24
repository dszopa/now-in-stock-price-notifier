# now-in-stock-price-notifier

A script to automatically send you an email if now-in-stock has an item you want in stock below a specified price.

## Prerequisites
- install [NodeJS](https://www.nowinstock.net/computers/videocards/nvidia/gtx1080ti/)

## Usage
```bash
npm install
cd src
node index.js <price> <url> <flags>
```

### Example Call:
```bash
node index.js 750 "https://www.nowinstock.net/computers/videocards/nvidia/gtx1080ti/" -R -I 500
```

## TODO
- Talk about auth.js (maybe make it work through command line, json, or flags)
- Add flags to README
