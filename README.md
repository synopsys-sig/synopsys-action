# Synopsys Action

![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/synopsys-sig/synopsys-action?color=blue&label=Latest%20Version&sort=semver)

The latest version of the Synopsys Bridge is available at: [Synopsys Bridge](https://sig-repo.synopsys.com/artifactory/bds-integrations-release/com/synopsys/integration/synopsys-action/)

The Synopsys GitHub Action allows you to configure your pipeline to run Synopsys security testing and take action on the security results. The GitHub Action leverages the Synopsys Bridge, a foundational piece of technology that has built-in knowledge of how to run all major Synopsys security testing solutions, plus common workflows for platforms like GitHub.

**Please Note:** This action requires the appropriate licenses for the Synopsys security testing solutions (E.g. Polaris, Coverity, or Black Duck).

# Quick Start for the Synopsys Action

The Synopsys Action supports all major Synopsys security testing solutions:
- Polaris, our SaaS-based solution that offers SAST, SCA and Managed Services in a single unified platform
- Coverity, using our thin client and cloud-based deployment model
- Black Duck Hub, supporting either on-premises or hosted instances

In this Quick Start, we will provide individual examples for each Synopsys security testing solution, but in practice, the options can be combined to run multiple solutions from a single GitHub workflow step.

These workflows will:
- Validate Scanning platform-related parameters like project and stream
- Download the Synopsys Bridge and related adapters
- Run corresponding Synopsys Bridge commands using the specified parameters
- Synopsys solution functionality is invoked directly by the Synopsys Bridge, and indirectly by the Synopsys Action

## Synopsys GitHub Action - Polaris

Before you can run a pipeline using the Synopsys Action and Polaris, you must make sure the appropriate
applications, projects and entitlements are set in your Polaris environment.

At this time, Polaris does not support the analysis of pull requests. We recommend running the Synopsys Action on
pushes to main branches.

We recommend configuring sensitive data like access tokens and even URLs, using GitHub secrets.

```yaml
name: Synopsys Security Testing

on:
  push:
    # At this time, it is recommended to run Polaris only on pushes to main branches
    # Pull request analysis will be supported by Polaris in the future
    branches: [ master, main ]

  pull_request:
    branches: [ master, main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Synopsys Action
        uses: synopsys-sig/synopsys-action@v1.1.0
        with:
          polaris_serverUrl: ${{ secrets.POLARIS_SERVER_URL }}
          polaris_accessToken: ${{ secrets.POLARIS_ACCESS_TOKEN }}
          polaris_application_name: "testapp1"
          polaris_project_name: "testproj1"
          polaris_assessment_types: "SCA,SAST"
```

# Synopsys GitHub Action - Coverity Cloud Deployment with Thin Client

Please note that the Synopsys Action at this time supports only the Coverity cloud deployment model (Kubernetes-based)
which uses a small footprint thin client to capture the source code, and then submit an analysis job that runs on the server.
This removes the need for a large footprint (many GB) software installation in your GitHub Runner.

**If you are using a regular (non-Kubernetes) deployment of Coverity** please see the [Coverity json-output-v7 Report Action](https://github.com/marketplace/actions/coverity-json-output-v7-report).

On pushes, a full Coverity scan will be run and results committed to the Coverity Connect database.
On pull requests, the scan will typically be incremental, and results will not be committed to the Coverity Connect database.
A future release of the action will provide code review feedback for newly introduced findings to the pull request.

Before you can run a pipeline using the Synopsys Action and Coverity, you must make sure the appropriate
project and stream are set in your Coverity Connect server environment.

We recommend configuring sensitive data like username and password, and even URL, using GitHub secrets.

```yaml

name: Synopsys Security Testing

on:
  push:
    branches: [ master, main ]

  pull_request:
    branches: [ master, main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        
      - name: Synopsys Action
        uses: synopsys-sig/synopsys-action@v1.1.0
        with:
          coverity_url: ${{ secrets.COVERITY_URL }}
          coverity_user: ${{ secrets.COVERITY_USER }}
          coverity_passphrase: ${{ secrets.COVERITY_PASSPHRASE }}
          # Many customers prefer to set their Coverity project and stream names to match
          # the GitHub repository name
          coverity_project_name: ${{ secrets.COVERITY_PROJECT_NAME }}
          coverity_stream_name: ${{ github.event.repository.name }}
          # Optionally you may specify the ID number of a saved view to apply as a "break the build" policy.
          # If any defects are found within this view when applied to the project, the build will be failed
          # with an exit code.
          #coverity_policy_view: 100001
          # Below fields are optional
          coverity_repository_name: ${{ secrets.COVERITY_REPOSITORY_NAME }}
          coverity_branch_name: ${{ secrets.COVERITY_BRANCH_NAME }}
          
```
**Note: To enable feedback from Coverity security testing as pull request comment, set coverity_automation_prcomment: true**
          
## Synopsys GitHub Action - Black Duck
The Synopsys Action supports both self-hosted (e.g. on-prem) and Synopsys-hosted Black Duck Hub instances.

No preparation is typically needed before running the pipeline. In the default Black Duck Hub permission model,
projects and project versions are created on the fly and as needed.

On pushes, a full "intelligent" Black Duck scan will be run. On pull requests, a "rapid" ephemeral scan will be run.
A future release of the action will provide code review feedback for newly introduced findings to the pull request.

We recommend configuring sensitive data like access tokens and even URLs, using GitHub secrets.

**Note about Detect command line parameters:** Any command line parameters that you need to pass to detect
can be passed through environment variables. This is a standard capability of Detect. For example, if you
wanted to only report newly found policy violations on rapid scans, you would normally use the command line 
`--detect.blackduck.rapid.compare.mode=BOM_COMPARE_STRICT`. You can replace this by setting the 
`DETECT_BLACKDUCK_RAPID_COMPARE_MODE` environment variable to `BOM_COMPARE_STRICT` and configure this in your
GitHub workflow.

**Note about Fix Pull requests creation:** <br/>
* **blackduck_automation_fixpr:**- By default fix pull request creation will be disabled (i.e. Create
fix pull requests if vulnerabilities are reported). To enable this feature, set blackduck_automation_fixpr
as true.<br/> 
* **github_token:** It is mandatory to pass github_token parameter with required permissions. The token can be github
specified secrets.GITHUB_TOKEN with required permissions. For more information on Github token see [Github Doc](https://docs.github.com/en/actions/security-guides/automatic-token-authentication) <br/>
  * Note - If blackduck_automation_fixpr is set to false, github_token is not required
  
* **As per observation, due to rate limit restriction of github rest api calls, we may
observe fewer pull requests to be created.**

**Note: To enable feedback from Blackduck security testing as pull request comments, set blackduck_automation_prcomment: true**

```yaml

name: Synopsys Security Testing

on:
  push:
    branches: [ master, main ]

  pull_request:
    branches: [ master, main ]

jobs:
  build:
    runs-on: [self-hosted]
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Synopsys Action
        uses: synopsys-sig/synopsys-action@v1.1.0
        with:
          blackduck_apiToken: ${{ secrets.BLACKDUCK_API_TOKEN }}
          blackduck_url: ${{ secrets.BLACKDUCK_URL }}

          # Optional parameter. By default, pushes will initiate a full "intelligent" scan and pull requests
          # will initiate a rapid scan.
          blackduck_scan_full: false
          # Required parameter if blackduck_automation_fixpr is enabled
          # Make sure GITHUB_TOKEN have appropriate permissions
          github_token: ${{ secrets.GITHUB_TOKEN }}
          # Optional parameter. By default, create fix pull requests if vulnerabilities are reported
          # Passing false will disable fix pull request creation 
          blackduck_automation_fixpr: true
          # Optional parameter. The values could be. ALL|NONE|BLOCKER|CRITICAL|MAJOR|MINOR|OK|TRIVIAL|UNSPECIFIED
          # Single parameter
          blackduck_scan_failure_severities: "ALL"
          # multiple parameters
          # blackduck_scan_failure_severities: "BLOCKER,CRITICAL,TRIVIAL"
```

## Additional Parameters

- **synopsys_bridge_path** - Provide a path, where you want to configure or already configured Synopsys Bridge. [Note - If you don't provide any path, then by default configuration path will be considered as - $HOME/synopsys-bridge]
  
- **bridge_download_url** - Provide URL to bridge zip file. If provided, Synopsys Bridge will be automatically downloaded and configured in the provided bridge- or default- path. [Note - As per current behavior, when this value is provided, the bridge_path or default path will be cleaned first then download and configured all the time]

- **bridge_download_version** - Provide bridge version. If provided, the specified version of Synopsys Bridge will be downloaded and configured.

[Note - If **bridge_download_version** or **bridge_download_url** is not provided, Synopsys Action will download and configure the latest version of Bridge]


# Synopsys Bridge Setup

The most common way to set up the Synopsys Bridge is to configure the action to download the small (~50 MB) CLI utility that is then automatically run at the right stage of your pipeline.

The latest version of Synopsys Bridge will be downloaded by default.

## Manual Synopsys Bridge

If you are unable to download the Synopsys Bridge from our internet-hosted repository or have been directed by support or services to use a custom version of the Synopsys Bridge, you can either specify a custom URL or pre-configure your GitHub runner to include the Synopsys Bridge. In this latter case, you would specify the `synopsys_bridge_path` parameter to specify the location of the directory in which the Synopsys Bridge is pre-installed.

# Future Enhancements

- Provide comments on Pull Requests about code quality issues.
- Prevent a merge if security issues are found during the pull request. Create a GitHub status check and report the policy as failed if new security issues are found.
- Create GitHub Issues to track issues found by a full analysis. This action is currently focused on providing feedback on a pull request. No action is taken if run manually or on a push. A future enhancement is to create GitHub issues to track security weaknesses found during a push.
- Allow developers to dismiss issues from the pull request. If an issue is deemed to be a false positive, a future enhancement could allow the developer to indicate this by replying to the comment, which would in turn report the status to the Coverity Connect instance so that future runs will recognize the issue as having been triaged as such.
