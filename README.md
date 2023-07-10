# Typescript Bookish Starter

## Overview

This repo contains a starter Express server for use in the Bookish bootcamp exercise. Full details of this exercise are on the Swiki page.

## Developer Setup
- Remember to first install MSSQL server and SSMS, and also to turn on network connection to the SQL server in the SQL Server Configuration Manager
1. If you haven't already, install Node.js v16.13.0, NPM and NVM. There are instructions for how to do this on Windows (with and without WSL) [here](https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-overview).
2. Install [VSCode](https://code.visualstudio.com/download) (or another preferred editor). VSCode is recommended unless you have a strong preference otherwise due to its good compatibility with typescript, excellent community extensions and for consistency across all developers when pairing.
3. Install the project dependencies with `npm install`.
4. Run the code!
     - Run in development mode with hot reloading with `npm run dev`
     - Run without hot reloading using `npm start`
     - You can check that the formatting of all files is acceptable using `npm run lint`

## Useful commands
```
sqlcmd -d bookish -i schema.sql
sqlcmd -d bookish -i seed.sql
```
