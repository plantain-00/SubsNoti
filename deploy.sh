#!/usr/bin/env bash

SRC_ROOT=/opt/src
WEBSITE_ROOT=/opt/SubsNoti
cd $WEBSITE_ROOT
git add . -A
NOW=`date +"%Y-%m-%d %H:%M:%S"`
git commit -m "backup at:$NOW"
cd $SRC_ROOT
git pull
npm --registry https://registry.npm.taobao.org install
tsd install
tsc -m commonjs *.ts
gulp default
rsync -a $SRC_ROOT/node_modules/ $SRC_ROOT/publish/node_modules
rsync -a $SRC_ROOT/publish/ $WEBSITE_ROOT
FOREVER_ROOT=$WEBSITE_ROOT forever restart -l $WEBSITE_ROOT/forever.log $WEBSITE_ROOT/app.js