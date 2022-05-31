# Hauki load testing

Scripts for load testing Hauki API.

## Prerequisities

* [k6](https://k6.io/docs/getting-started/installation) installed

## How to run the tests

This script works as a wrapper for the k6 command and ensures that the proper authentication token is provided in the requests. Thus you can pass all the same parameters as you would do when using k6 directly.

```bash
    ./run.sh -v 1 -i 1 <SCRIPT>
```

## How to run Hauki scenarios

```bash
./run.sh hauki-scenarios.js
```
