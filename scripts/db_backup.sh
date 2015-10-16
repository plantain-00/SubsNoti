#!/usr/bin/env bash

HOST=0.0.0.0
USER=
PASSWORD=''
DB_NAME=
NOW=`date +"%Y%m%d"`

mysqldump -h $HOST -u $USER --password=$PASSWORD $DB_NAME > '/opt/database backup/main-$NOW.sql'
