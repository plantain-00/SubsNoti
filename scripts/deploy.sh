#!/usr/bin/env bash

SRC_ROOT=
WEBSITE_ROOT=

# backup the website
cd $WEBSITE_ROOT
echo 'Starting "backup"...'
git add . -A
NOW=`date +"%Y-%m-%d %H:%M:%S"`
git commit -m "backup at:$NOW"
echo 'Finished "backup".'

# publish
echo 'Starting "rsync"...'
rsync -a $SRC_ROOT/publish/ $WEBSITE_ROOT
rsync -a $SRC_ROOT/node_modules/ $WEBSITE_ROOT/node_modules
echo 'Finished "rsync".'

# restart
echo 'Starting "restart"...'
pm2 restart all
echo 'Finished "restart".'
