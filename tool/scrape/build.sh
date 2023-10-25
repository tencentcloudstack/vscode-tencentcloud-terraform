#!/usr/bin/env bash
workdir=$(
    cd $(dirname $0)
    pwd
)

if [ $# == 0 ]; then
    echo "docker build with no params..."
    docker build -f ${workdir}/Dockerfile ${workdir}/
else
    if [ ! -n "${2}" ]; then
        echo "docker build with [specified image]...[${1}][${2}][${workdir}]"
        docker build -f ${workdir}/Dockerfile ${workdir}/ -t ${1}
        # docker build -f /Users/luoyin/Code/terraform-scrape/Dockerfile /Users/luoyin/Code/terraform-autocomplete -t tiat-terraform-scrape:v1
    else
        echo "docker build with [build-arg]...[${1}][${2}][${workdir}]"
        docker build --build-arg base=${2} -f ${workdir}/Dockerfile ${workdir}/ -t ${1}
    fi
fi
