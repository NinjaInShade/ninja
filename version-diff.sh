#!/bin/bash

# Check if fromVersion is provided
if [ $# -lt 2 ]; then
  echo "Usage: $0 <project> <fromVersion> [<toVersion>]"
  exit 1
fi

project="$1"
fromVersion="${project}-$2"

# If toTag is not provided, set it to "HEAD" (current state)
if [ "$#" -lt 3 ]; then
  toVersion="HEAD"
else
  toVersion="${project}-$3"
fi

# Get the list of commit hashes between fromVersion and toVersion
commit_hashes=$(git rev-list ${fromVersion}..${toVersion})

# Iterate over commit hashes and filter commits starting with "(project)"
for commit_hash in $commit_hashes; do
  commit_message=$(git log --format=%B -n 1 $commit_hash)

  # Check if the commit message starts with "(project)"
  if [[ $commit_message == "(${project}"* ]]; then
    echo "Commit $commit_hash: $commit_message"
  fi
done
