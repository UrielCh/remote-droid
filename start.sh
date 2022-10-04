#!/bin/sh
export HOSTNAME=$(hostname);
docker compose pull
docker compose up -d
