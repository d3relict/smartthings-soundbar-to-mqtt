#!/bin/sh
npm install
npm run build
docker-compose build
docker-compose up -d