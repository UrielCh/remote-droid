#!/bin/bash

if [ ! $# -eq 1 ]
then
 echo "usage $0 version_number"
 exit 1
fi

VERSION="$1"

if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
then
 echo "version_number \"$VERSION\" must be a like 1.0.0"
 exit 1
fi

echo ""
echo "Building version \"$VERSION\""
echo ""

set -e
git pull
IMG=urielch/remote-droid;

# prebuild image:
time docker build --pull --rm -f Dockerfile -t ${IMG}:${VERSION}-$(arch) . && docker push ${IMG}:${VERSION}-$(arch)

echo ""
echo "Building manifest for version \"$VERSION\""
echo ""

for FINAL in ${IMG}:${VERSION} ${IMG}:latest
do
  docker manifest rm ${FINAL} || true
  docker manifest create ${FINAL} ${IMG}:${VERSION}-arm64 ${IMG}:${VERSION}-x86_64;
  docker manifest annotate ${FINAL} ${IMG}:${VERSION}-arm64 --arch arm64;
  docker manifest annotate ${FINAL} ${IMG}:${VERSION}-x86_64 --arch amd64;
  docker manifest push ${FINAL};
  docker manifest inspect ${FINAL};
done

echo ALL DONE