#!/bin/sh
set -e

WRAPPER_DIR="$(cd "$(dirname "$0")"; pwd -P)/.mvn/wrapper"
PROPERTIES_FILE="$WRAPPER_DIR/maven-wrapper.properties"

MAVEN_WRAPPER_JAR_URL=$(grep -E "^wrapperUrl=" "$PROPERTIES_FILE" | cut -d'=' -f2-)
MAVEN_DIST_URL=$(grep -E "^distributionUrl=" "$PROPERTIES_FILE" | cut -d'=' -f2-)

BASE_DIR="$(cd "$(dirname "$0")"; pwd -P)"
WRAPPER_JAR="$WRAPPER_DIR/maven-wrapper.jar"
MAVEN_DIR="$BASE_DIR/.mvn/wrapper"
MVN_CMD="$BASE_DIR/.mvn/wrapper/apache-maven/bin/mvn"

download() {
  url="$1"
  dest="$2"
  mkdir -p "$(dirname "$dest")"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$url" -o "$dest"
  elif command -v wget >/dev/null 2>&1; then
    wget -q "$url" -O "$dest"
  else
    echo "Need curl or wget to download $url" >&2
    exit 1
  fi
}

if [ ! -f "$WRAPPER_JAR" ]; then
  download "$MAVEN_WRAPPER_JAR_URL" "$WRAPPER_JAR"
fi

if [ ! -x "$MVN_CMD" ]; then
  TMP_ZIP="$MAVEN_DIR/apache-maven.zip"
  download "$MAVEN_DIST_URL" "$TMP_ZIP"
  rm -rf "$MAVEN_DIR/apache-maven"
  unzip -q "$TMP_ZIP" -d "$MAVEN_DIR"
  mv "$MAVEN_DIR"/apache-maven-* "$MAVEN_DIR/apache-maven"
  rm -f "$TMP_ZIP"
fi

exec "$MVN_CMD" "$@"


