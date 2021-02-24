# AWS ECS Build Scripts

The build scripts in this directory are the temporary build tools that will be used to build the deployed AWS ECS frontend and backend containers until we move builds into AWS CodeBuild. The two main commands are:
- `build-ecs-backend`
- `build-ecs-frontend`

These command will build the respective image and tag it with two tags: the git commit hash for the code, and the `latest` tag.  The commands support a help flag, which returns the following content:

```

Usage: build-ecs-backend [OPTIONS]

  Builds the 'options-ecs-backend' docker image.

Options:
  -h, --help                       Display this message
      --ignore-branch-check        Ignore the fact that the current git branch is not 'main' (USE WITH CAUTION!)
      --ignore-uncommitted-files   Ignore the fact that the current git status is uncommitted file (USE WITH CAUTION!)
      --skip-latest-tag            Skip the 'latest' tag for this image build
      --tag TAG                    Override the git commit hash image tag for this build with the provided TAG
      --push                       Push the built image(s) to the remote repository

```

The build tools are set up to make sure you are building on the `main` branch with no uncommitted modified files. This is meant to ensure that we don't use containers in production that don't represent the the clean main branch. The flags `--ignore-branch-check` and `--ignore-uncommitted-files ` can be used to override these checks, but they are meant only for testing.

Providing the `--push` flag will log into the AWS ECS repositories and push the built images to AWS ECR.
