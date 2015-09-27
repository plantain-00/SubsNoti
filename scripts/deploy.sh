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
rsync -a $SRC_ROOT/node_modules/ $SRC_ROOT/publish/node_modules
rsync -a $SRC_ROOT/publish/ $WEBSITE_ROOT
echo 'Finished "rsync".'

# restart
echo 'Starting "restart"...'
FOREVER_ROOT=$WEBSITE_ROOT forever restart -l $WEBSITE_ROOT/forever.log $WEBSITE_ROOT/app.js
echo 'Finished "restart".'