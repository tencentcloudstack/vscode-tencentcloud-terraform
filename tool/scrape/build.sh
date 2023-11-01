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

        echo "docker run [${1}] to generate tiat-resources.json."
        docker run -it ${1} >../../config/tips/tiat-resources.json
    else
        echo "docker build with [build-arg]...[${1}][${2}][${workdir}]"
        docker build --build-arg base=${2} -f ${workdir}/Dockerfile ${workdir}/ -t ${1}
    fi
fi
