#!/usr/bin/env bash
webpack --entry ./entry.js --output-path dist --output-file bundle.js \
--colors \
--profile \
--display-modules