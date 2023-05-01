#!/usr/bin/env node

import { spawn } from 'child_process';
spawn('node', ['--loader=./dist/cli/node/loader.js', '--experimental-specifier-resolution=node', './dist/cli/cli.js'], { stdio: 'inherit' });
