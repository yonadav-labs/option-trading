# Options Command Line Tools

## AWS ECS Build Scripts

The build scripts in this directory are the temporary build tools that will be used to build the deployed AWS ECS frontend and backend containers until we move builds into AWS CodeBuild. The two main commands are:
- `build-ecs-backend`
- `build-ecs-frontend`

The commands support a help flag, which returns the following content:

```text

Usage: build-ecs-backend [OPTIONS]

  Builds the 'options-ecs-backend' docker image.

Options:
  -h, --help                       Display this message
      --ignore-branch-check        Ignore the fact that the current git branch is not '$MAIN_BRANCH_NAME' (USE WITH CAUTION!)
      --ignore-uncommitted-files   Ignore the fact that the current git status is uncommitted file (USE WITH CAUTION!)
      --ignore-aws-profile         Ignore the Tigerstance AWS profile (for use primarily by automated tools)
      --use-latest-tag             Tag this image as the 'latest' image
      --use-git-commit-hash-tag    Use the git commit hash as a tag for this image build
      --tags TAG[,TAG,...]         Provides a comma-delimited list of tags to apply to the built image
      --tagged-image-outfile       Print the images built to the provided file path
      --push                       Push the built image(s) to the remote repository

```

**To tag the image, use the `--use-latest-tag`,` --use-git-commit-hash-tag`, and/or `--tags` option(s). _Only tagged images can be pushed to the remote repository. It is HIGHLY recommended that pushed images are tagged using the `--use-git-commit-hash-tag` option._**

The build tools are set up to make sure you are building on the `main` branch with no uncommitted modified files. This is meant to ensure that we don't use containers in production that don't represent the  clean main branch. The flags `--ignore-branch-check` and `--ignore-uncommitted-files ` can be used to override these checks, but they are meant only for testing.

Providing the `--push` flag will log into the AWS ECS repositories and push the built images to AWS ECR.

For images that are going to be deployed to a customer-visible environment, build the container with a clean `main` branch, and tag it with the current git commit hash. This can be done as follows:

```text
build-ecs-backend --use-git-commit-hash-tag --push
```

The above command will fail if you are not on the `main` branch and/or have uncommitted files. 

## Tunnel Script

The `aws-tunnel` script is a wrapper for creating SSH tunnels to servers in the AWS VPC that are not accessible from outside of the VPC.

```
Usage: aws-tunnel (-h | --help)
       aws-tunnel LOCAL_PORT REMOTE_HOSTNAME REMOTE_PORT
       aws-tunnel close LOCAL_PORT
```

To create a tunnel, enter the local port for the tunnel, the remote host you want to connect to, and the port on the remote to connect to.

For instance, executing `aws-tunnel 9753 remote.host.com 1234` will tunnel to `remote.host.com:1234` via the local port `9753`. The output of this command will be:

```
Tunnel established on port 9753.
Run 'aws-tunnel close 9753' or 'kill -15 54662' to close the tunnel.
```

To close the tunnel, follow the directions printed by the command.
