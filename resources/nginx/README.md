This directory provides a `nginx.conf` template redirecting requests to the deployed OpenWhisk Hub actions.

Installation on Bluemix
=======================

Requirements
- A Bluemix account
- the cloudfoundry [CLI](https://github.com/cloudfoundry/cli/releases)

Follow these steps:
1. copy `nginx-template.conf` to `nginx.conf` and substitute `<YOUR APP NAME>` `<YOUR ORG>` and `<YOUR SPACE>` by your values
1. `cf login`
1.  `cf push <YOUR APP NAME> -m 64m -b https://github.com/cloudfoundry/staticfile-buildpack.git`
