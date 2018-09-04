#!/bin/bash

export GOPATH=$(pwd)/../../../..
export GOOS=darwin
export GOARCH=amd64
go build -o kubesecret_darwin_amd64
export GOOS=linux
export GOARCH=amd64
go build -o kubesecret_linux_amd64
if [ "$(uname)" == "Darwin" ]
then
    gsha256sum kubesecret_darwin_amd64 >kubesecret_darwin_amd64.sha256
    gsha256sum kubesecret_linux_amd64 >kubesecret_linux_amd64.sha256
else
    sha256sum kubesecret_darwin_amd64 >kubesecret_darwin_amd64.sha256
    sha256sum kubesecret_linux_amd64 >kubesecret_linux_amd64.sha256
fi

if ! [ -d bin ]
then
    mkdir bin
fi
mv kubesecret_* bin/


