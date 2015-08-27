#!/usr/bin/env bash

SRC_ROOT=/opt/src
WEBSITE_ROOT=/opt/SubsNoti

# backup the website
cd $WEBSITE_ROOT
git add . -A
NOW=`date +"%Y-%m-%d %H:%M:%S"`
git commit -m "backup at:$NOW"

# pull the source code
cd $SRC_ROOT
git pull

# install
npm --registry https://registry.npm.taobao.org install
tsd install

# gulp task clean
gulp clean

# compile
tsc -m commonjs *.ts

# gulp task publish
gulp publish

# publish
rsync -a $SRC_ROOT/node_modules/ $SRC_ROOT/publish/node_modules
rsync -a $SRC_ROOT/publish/ $WEBSITE_ROOT

# restart
FOREVER_ROOT=$WEBSITE_ROOT forever restart -l $WEBSITE_ROOT/forever.log $WEBSITE_ROOT/app.js