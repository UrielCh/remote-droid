#!/bin/bash
IMG=urielch/remote-droid;

RED="\e[31m"
GREEN="\e[32m"
NC="\e[0m"

VERSION=""
# $(grep '"version"' package.json | cut -d : -f2 | cut '-d"' -f2)

if [ ! $# -eq 1 ]
then
 echo "usage $0 version_number"
 # echo "vesion number not profig using ${VERSION} from package.json"
 echo "Check previous version at https://hub.docker.com/repository/docker/${IMG}"
 exit 1;
else
 VERSION="$1"
fi

git pull

if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
then
 echo "version_number \"${GREEN}${VERSION}${NC}\" must be a like 1.0.0"
 exit 1
fi

set -e

echo ""
echo -e "Building ${RED}${IMG}${NC} version \"${GREEN}${VERSION}${NC}\""
echo ""

ARCH=$(arch)
if [ $ARCH == 'aarch64' ]; then ARCH=arm64; fi
if [ $ARCH == 'x86_64' ]; then ARCH=amd64; fi

# prebuild image:
time docker build --pull --rm -f Dockerfile -t ${IMG}:${VERSION}-${ARCH} . && docker push ${IMG}:${VERSION}-${ARCH}

echo -e "Image ${RED}${IMG}${NC}:${GREEN}${VERSION}-${ARCH}${NC} Ready"
echo -e "Building manifest for version \"${GREEN}${VERSION}${NC}\""
echo ""

for FINAL in ${IMG}:${VERSION} ${IMG}:latest
do
  docker manifest rm ${FINAL} 2> /dev/null || true
  docker manifest create ${FINAL} ${IMG}:${VERSION}-arm64 ${IMG}:${VERSION}-amd64;
  docker manifest annotate ${FINAL} ${IMG}:${VERSION}-arm64 --arch arm64;
  docker manifest annotate ${FINAL} ${IMG}:${VERSION}-amd64 --arch amd64;
  docker manifest push ${FINAL};
  docker manifest inspect ${FINAL};
done

echo -e ${RED}${IMG}${NC} VERSION ${GREEN}${VERSION}${NC} is now published. You can safely delete single arch tags from:
echo "https://hub.docker.com/repository/docker/${IMG}/tags"