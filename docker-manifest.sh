#!/bin/bash
IMG=urielch/remote-droid;

git pull

# VERSION=$(grep '"version"' package.json | cut -d : -f2 | cut '-d"' -f2)
VERSION=""

if [ ! $# -eq 1 ]
then
 echo "usage $0 version_number"
 # echo "vesion number not profig using ${VERSION} from package.json"
 echo Check previous version at https://hub.docker.com/repository/docker/${IMG}
 exit 1;
else
 VERSION="$1"
fi

if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
then
 echo "version_number \"$VERSION\" must be a like 1.0.0"
 exit 1
fi

set -e

echo ""
echo "Building ${IMG} version \"$VERSION\""
echo ""

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
  echo You can delete remote tag ${IMG}:${VERSION}-arm64 and ${IMG}:${VERSION}-x86_64
done

echo ALL DONE