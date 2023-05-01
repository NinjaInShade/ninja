#!/usr/bin/env node

import { spawn } from 'child_process';
const [execPath, jsFile, ...args] = process.argv;
spawn('node', ['--loader=./dist/cli/node/loader.js', '--experimental-specifier-resolution=node', './dist/cli/cli.js', ...args], { stdio: 'inherit' });
