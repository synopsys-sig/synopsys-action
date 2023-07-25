# Synopsys Action

![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/synopsys-sig/synopsys-action?color=blue&label=Latest%20Version&sort=semver)


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
- Run corresponding Synopsys Bridge commands using the specified parameters
- Synopsys solution functionality is invoked directly by the Synopsys Bridge, and indirectly by the Synopsys Action

# Prerequisites

Before configuring Synopsys Action into your workflow, note the following prerequisites:

**GitHub Runner Setup:**

- Runners are the machines that execute jobs in a GitHub Actions workflow. To use GitHub runners in your project, GitHub Actions must be enabled for a repository/organization settings in order for required workflows to run (Repository Settings → SelectActions → General → Actions permissions)
- GitHub runner can be Self-hosted or GitHub-hosted. For installing Self-hosted runners refer [Self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners) and for installing GitHub-hosted runners refer [GitHub-hosted Runners](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners)

**Configure GitHub Secrets:**
- Sensitive data such as access tokens, user names, passwords and even URLs must be configured using GitHub secrets (GitHub → Project → Settings → Secrets and Variables → Actions).

**Configure GitHub Token:** 

- `github_token` is required as input when running Black Duck Fix PR, Black Duck/Coverity PR Comment. There are 2 different types of tokens that can be passed to `github_token`:

  1. Token can be github specified `secrets.GITHUB_TOKEN` with required workflow read & write permissions(GitHub → Project → Settings → Actions → General → Workflow Permissions). It will be created by GitHub at start of each workflow run.
  2. If you need a token that requires permissions that aren't available in the `secrets.GITHUB_TOKEN`, you can create a Personal Access Token(PAT) with required scopes (Select Profile Photo → Settings → Developer Settings → Personal access tokens). For more information, refer [ Granting Additional Permissions ](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#granting-additional-permissions) <br/> PAT must have **repo** scope to perform Black Duck Fix PR, Black Duck/Coverity PR Comment.

**Create workflow:**

- Create a new workflow (GitHub → Project → Actions → New Workflow → Setup a workflow yourself) and configure required fields.
- Push those changes and GitHub runner will initiate the workflow which can be seen on the `Actions` tab on main page of repository.

## Synopsys GitHub Action - Polaris

Before you can run a pipeline using the Synopsys Action and Polaris, you must make sure the appropriate
applications, projects and entitlements are set in your Polaris environment.

At this time, Polaris does not support the analysis of pull requests. We recommend running the Synopsys Action on
pushes to main branches.

Synopsys Action available in the GitHub Marketplace is the recommended solution for integrating Polaris into a GitHub workflow. The action will download the Synopsys Bridge CLI, execute a scan, and offer post-scan features such as break-the-build quality gates.

Here's an example workflow for Polaris scan using the Synopsys Action:

```yaml

name: polaris-sig-action
on:
  push:
    branches: [ main, master, develop, stage, release ]
  workflow_dispatch:  
jobs:
  build:
    runs-on: [ ubuntu-latest ]
    steps:
      - name: Checkout Source
        uses: actions/checkout@v3
        
      - name: Polaris Scan
        uses: synopsys-sig/synopsys-action@v1.2.0
        with:
          polaris_serverUrl: ${{ secrets.POLARIS_SERVERURL }}
          polaris_accessToken: ${{ secrets.POLARIS_ACCESSTOKEN }}
          polaris_application_name: ${{ github.event.repository.name }}
          polaris_project_name: ${{ github.event.repository.name }}
          ### Accepts Multiple Values
          polaris_assessment_types: "SAST,SCA"
          ### Uncomment below configuration if Synopsys Bridge diagnostic files needs to be uploaded
          # include_diagnostics: true

```
**Please find the following mandatory and optional parameters for Polaris below:**

|Input Parameter            |Description                                                       |Mandatory / Optional | 
|----------------------------|-------------------------------------------------------------------|--------------------|
| `polaris_serverUrl`        | URL for Polaris Server                                            | Mandatory          |
| `polaris_accessToken`      | Access token for Polaris                                          | Mandatory          |
| `polaris_application_name` | Application name in Polaris                                       | Mandatory          |
| `polaris_project_name`     | Project name in Polaris                                           | Mandatory          |
| `polaris_assessment_types` | Polaris assessment types. <br> Example: SCA,SAST  </br>           | Mandatory          |

# Synopsys GitHub Action - Coverity Cloud Deployment with Thin Client

At this time, Synopsys Security Scan only supports the Coverity thin client/cloud deployment model, which removes the need for a large footprint installation in your agent.

Before running Coverity using the Synopsys Security Scan, ensure the appropriate `project` and `stream` are set in your Coverity Connect server environment.

Synopsys Action available in the GitHub Marketplace is the recommended solution for integrating Coverity CNC into a GitHub workflow. The action will download the Synopsys Bridge CLI, execute a scan, and offer post-scan features such as break-the-build quality gates and PR comments.

Here's an example workflow for Coverity scan using the Synopsys Action:

```yaml

name: cnc-sig-action
on:
  push:
    branches: [ main, master, develop, stage, release ]
  pull_request:
    branches: [ main, master, develop, stage, release ]
  workflow_dispatch:  
jobs:
  build:
    runs-on: [ ubuntu-latest ]
    steps:
      - name: Checkout Source
        uses: actions/checkout@v3

      - name: Coverity Full Scan
        if: ${{ github.event_name != 'pull_request' }}
        uses: synopsys-sig/synopsys-action@v1.2.0
        with:
          coverity_url: ${{ secrets.COVERITY_URL }}
          coverity_user: ${{ secrets.COVERITY_USER }}
          coverity_passphrase: ${{ secrets.COVERITY_PASSPHRASE }}
          coverity_project_name: ${{ github.event.repository.name }}
          coverity_stream_name: ${{ github.event.repository.name }}-${{ github.ref_name }}
          coverity_policy_view: 'Outstanding Issues'
          ### Uncomment below configuration if Synopsys Bridge diagnostic files needs to be uploaded
          # include_diagnostics: true  
          
      - name: Coverity PR Scan
        if: ${{ github.event_name == 'pull_request' }}
        uses: synopsys-sig/synopsys-action@v1.2.0
        with:
          coverity_url: ${{ secrets.COVERITY_URL }}
          coverity_user: ${{ secrets.COVERITY_USER }}
          coverity_passphrase: ${{ secrets.COVERITY_PASSPHRASE }}
          coverity_project_name: ${{ github.event.repository.name }}
          coverity_stream_name: ${{ github.event.repository.name }}-${{ github.base_ref }}
          ### Below configuration is used to enable feedback from Coverity security testing as pull request comment
          coverity_automation_prcomment: true
          github_token: ${{ secrets.GITHUB_TOKEN }} # Mandatory when coverity_automation_prcomment is set to 'true'   
          ### Uncomment below configuration if Synopsys Bridge diagnostic files needs to be uploaded
          # include_diagnostics: true  
        
```
**Please find the following mandatory and optional parameters for Coverity below:**

|Input Parameter   |Description                           |Mandatory / Optional |
|-------------------|---------------------------------------|----------|
| `coverity_url`    | URL for Coverity server               | Mandatory     |
| `coverity_user`        | Username for Coverity            | Mandatory     |
| `coverity_passphrase`        | Passphrase for Coverity    | Mandatory     |
| `coverity_project_name`        | Project name in Coverity. <br> Many customers prefer to set their Coverity project and stream names to match the GitHub repository name  </br>                     | Mandatory     |
| `coverity_stream_name`        | Stream name in Coverity   | Mandatory     |
| `coverity_install_directory`        | Directory path to install Coverity | Optional    |
| `coverity_policy_view`        | ID number/Name of a saved view to apply as a "break the build" policy. If any defects are found within this view when applied to the project, the build will be failed with an exit code. <br> Example: `coverity_policy_view: '100001'` or `coverity_policy_view: 'Outstanding Issues'`  </br>       | Optional    |
| `coverity_automation_prcomment`        | To enable feedback from Coverity security testing as pull request comment. Merge Request must be created first from feature branch to main branch to run Coverity PR Comment. <br> Supported values: true or false </br> | Optional     |
| `github_token` | GitHub Access Token <br> Example: `github_token: ${{ secrets.GITHUB_TOKEN }}` | Mandatory if coverity_automation_prcomment is set as true |
          
## Synopsys GitHub Action - Black Duck

Synopsys Action supports both self-hosted (e.g. on-prem) and Synopsys-hosted Black Duck Hub instances.

In the default Black Duck Hub permission model, projects and project versions are created on the fly as needed.

The action will download the Bridge and Detect CLIs, run a SCA scan, and optionally break the build.

On pushes, a full **Intelligent** Black Duck scan will be run. On pull requests, a **Rapid** ephemeral scan will be run.

Synopsys Action available in the GitHub Marketplace is the recommended solution for integrating Black Duck into a GitHub workflow. The action will download the Synopsys Bridge CLI, execute a scan, and offer post-scan features such as break-the-build quality gates, Fix PR and PR comments.

Here's an example workflow for Black Duck scan using the Synopsys Action:

```yaml

name: bd-sig-action

on:
  push:
    branches: [ main, master, develop, stage, release ]
  pull_request:
    branches: [ main, master, develop, stage, release ]
  workflow_dispatch:  
jobs:
  build:
    runs-on: [ ubuntu-latest ]
    steps:
      - name: Checkout Source
        uses: actions/checkout@v3

      - name: Black Duck Full Scan
        if: ${{ github.event_name != 'pull_request' }}
        uses: synopsys-sig/synopsys-action@v1.2.0
        ### Use below configuration to set specific detect environment variables
        env:
          DETECT_PROJECT_NAME: ${{ github.event.repository.name }}
        with:
          blackduck_url: ${{ secrets.BLACKDUCK_URL }}
          blackduck_apiToken: ${{ secrets.BLACKDUCK_API_TOKEN }}
          blackduck_scan_full: true
          ### Accepts Multiple Values
          blackduck_scan_failure_severities: 'BLOCKER,CRITICAL'
          ### Uncomment below configuration to enable automatic fix pull request creation if vulnerabilities are reported
          # blackduck_automation_fixpr: true 
          # github_token: ${{ secrets.GITHUB_TOKEN }} # Mandatory when blackduck_automation_fixpr is set to 'true'
          ### Uncomment below configuration if Synopsys Bridge diagnostic files needs to be uploaded
          # include_diagnostics: true  

      - name: Black Duck PR Scan
        if: ${{ github.event_name == 'pull_request' }}
        uses: synopsys-sig/synopsys-action@v1.2.0
        ### Use below configuration to set specific detect environment variables
        env:
          DETECT_PROJECT_NAME: ${{ github.event.repository.name }}
        with:
          blackduck_url: ${{ secrets.BLACKDUCK_URL }}
          blackduck_apiToken: ${{ secrets.BLACKDUCK_API_TOKEN }}
          blackduck_scan_full: false
          ### Below configuration is used to enable automatic pull request comment based on Black Duck scan result
          blackduck_automation_prcomment: true
          github_token: ${{ secrets.GITHUB_TOKEN }} # Mandatory when blackduck_automation_prcomment is set to 'true'
          ### Uncomment below configuration if Synopsys Bridge diagnostic files needs to be uploaded
          # include_diagnostics: true
```
**Please find the following mandatory and optional parameters for Black Duck below:**

|Input Parameter |Description | Mandatory / Optional |
|-----------------|-------------|---------------------|
|`blackduck_url`  | URL for Black Duck server  | Mandatory     |
| `blackduck_apiToken` | API token for Black Duck | Mandatory     |
| `blackduck_install_directory` | Directory path to install Black Duck  | Optional     |
| `blackduck_scan_full` | Specifies whether full scan is required or not. By default, pushes will initiate a full "intelligent" scan and pull requests will initiate a rapid scan. <br> Supported values: true or false </br>| Optional     |
| `blackduck_scan_failure_severities`      | Scan failure severities of Black Duck. <br> Supported values: ALL, NONE, BLOCKER, CRITICAL, MAJOR, MINOR, OK, TRIVIAL, UNSPECIFIED </br>| Optional |
| `blackduck_automation_prcomment`    | Flag to enable automatic pull request comment based on Black Duck scan result. Merge Request must be created first from feature branch to main branch to run Black Duck PR Comment. <br> Supported values: true or false </br>| Optional    |
| `blackduck_automation_fixpr`      | Flag to enable automatic creation for fix pull request when Black Duck vulnerabilities reported. <br> By default fix pull request creation will be disabled. <br> **Black Duck automation fix pull request is currently supported for NPM projects only.** <br> Supported values: true or false </br>| Optional    |
| `github_token` | GitHub Access Token <br> Example: `github_token: ${{ secrets.GITHUB_TOKEN }}` | Mandatory if blackduck_automation_fixpr or blackduck_automation_prcomment is set as true |

**Note about Detect command line parameters:** Any command line parameters that you need to pass to detect
can be passed through environment variables. This is a standard capability of Detect. </br>For example, if you
wanted to only report newly found policy violations on rapid scans, you would normally use the command line 
`--detect.blackduck.rapid.compare.mode=BOM_COMPARE_STRICT`. You can replace this by setting the 
`DETECT_BLACKDUCK_RAPID_COMPARE_MODE` environment variable to `BOM_COMPARE_STRICT` and configure this in your
GitHub workflow.
  
**GitHub Rate Limit:** As per observation, due to rate limit restriction of GitHub REST API calls, we may observe fewer pull requests to be created.

## Additional Parameters
| Input Parameter                     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `synopsys_bridge_install_directory` | Provide a path, where you want to configure or already configured Synopsys Bridge. [Note - If you don't provide any path, then by default configuration path will be considered as - $HOME/synopsys-bridge]. If the configured Synopsys Bridge is not the latest one, latest Synopsys Bridge version will be downloaded                                                                                                                                           |
| `bridge_download_url`               | Provide URL to bridge zip file. <br> If provided, Synopsys Bridge will be automatically downloaded and configured.                                                                                                                                                                                                                                                                                                                                                |
| `bridge_download_version`           | Provide bridge version.<br> If provided, the specified version of Synopsys Bridge will be automatically downloaded and configured.                                                                                                                                                                                                                                                                                                                                |
| `include_diagnostics`               | Synopsys Bridge diagnostics files will be available to download when it is set to `true`. Additionally `diagnostics_retention_days` can be passed as integer value between 1 to 90 to retain the files (Be default file be available for 90 days).                                                                                                                                                                                                                |
| `network_air_gap`                   | If the `network_air_gap` is set to true, Synopsys Action will not download the Synopsys Bridge but instead use the pre-configured Synopsys Bridge. If the Synopsys Bridge is configured at a specific location, provide the path through `synopsys_bridge_install_directory`, <br/><br/>The Synopsys Action will look for the Synopsys Bridge from `synopsys_bridge_install_directory` path; otherwise, it will look for the Synopsys Bridge in the default path. |

**Notes:**
- Synopsys Bridge can be downloaded from [here](https://sig-repo.synopsys.com/artifactory/bds-integrations-release/com/synopsys/integration/synopsys-bridge/).
- By default, Synopsys Bridge will be downloaded in `$HOME/synopsys-bridge` directory.
- If `bridge_download_version` or `bridge_download_url` is not provided, Synopsys Action will download and configure the latest version of Bridge.
