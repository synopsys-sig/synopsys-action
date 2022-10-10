# Synopsys Action

Synopsys GitHub Action enables configuring pipelines for scanning on Synopsys platforms, leveraging Synopsys Bridge.

Note: This action does not use Synopsys scanning platforms (Coverity, Black Duck and Polaris)’s command line interface. 
It is purely a way to expose Synopsys scan’s output within GitHub.

# Synopsys Bridge Setup

Synopsys Bridge for specific platforms can be downloaded here: 
https://sig-repo.synopsys.com/artifactory/bds-integrations-release/com/synopsys/integration/synopsys-action/

  **STEP 1:**  Create a directory to configure Synopsys Bridge and get into the directory.

                Note - Default path for synopsys bridge is: $HOME/synopsys-bridge

                Mac: mkdir path_to_directory

                Linux: mkdir path_to_directory

                Windows: mkdir path_to_directory

   **STEP 2:** Download the zip file of required version.   

                Mac:  curl -o bridge.zip -L https://sig-repo.synopsys.com/artifactory/bds-integrations-release/com/synopsys/integration/synopsys-action/0.1.67/ci-package-0.1.67-macosx.zip

                Linux: curl -o bridge.zip -L https://sig-repo.synopsys.com/artifactory/bds-integrations-release/com/synopsys/integration/synopsys-action/0.1.67/ci-package-0.1.67-linux.zip

                Windows: Invoke-WebRequest -Uri https://sig-repo.synopsys.com/artifactory/bds-integrations-release/com/synopsys/integration/synopsys-action/0.1.67/ci-package-0.1.67-win64.zip -OutFile bridge.zip

   **STEP 3:** Unzip the bridge.zip

                Mac: unzip bridge.zip

                Linux: unzip bridge.zip

                Windows: tar -xf bridge.zip

**STEP4:**  Verify Bridge executable file is there along with extensions directory having extensions.

**Note:** Synopsys Bridge can also be downloaded and configured passing "bridge_download_url" parameter with value as url to the zip file.


# Using Synopsys Action for different Scanning Platforms

Coverity, BlackDuck and Polaris has many deployment options, usage will depend on the environment and project source code.

Synopsys Action can be used for widely used Synopsys Scanning Platforms – Coverity, BlackDuck and Polaris by passing the scanning platform name as a parameter or by passing the scanning platform related parameters.

This workflow does the following:

- Validates Scanning platform related parameters like project and stream.
- Downloads Synopsys Bridge and related adapters.
- Runs corresponding Bridge commands transfering the Scanning platform related parameters.
- Capture and analyze related operations are done internally by the Synopsys Bridge.

# Synopsys GitHub Action for Polaris

```yaml
name: Synopsys Action

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
        uses: synopsys-sig/synopsys-action@<version>
        with:
          polaris_serverUrl: ${{ secrets.POLARIS_SEVER_URL }}
          polaris_accessToken: ${{ secrets.POLARIS_ACCESS_TOKEN }}
          polaris_application_name: "testapp1"
          polaris_project_name: "testproj1"
          polaris_assessment_types: "SAST"

          # Optional parameter to specify path to synopsys bridge.
          # If not provided bridge will be looked into /{user_home}/synopsys-bridge or in linux /usr/synopsys-bridge
          synopsys_bridge_path: "/path_to_bridge_executable"

          # Optional
          # If provided bridge zip will be downloaded and configured
          # Bridge executable is platform specific
          bridge_download_url: "Bridge download url for specific platform"
```

# Synopsys GitHub Action for Coverity

```yaml

name: Synopsys Action

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
        uses: synopsys-sig/synopsys-action@<version>
        with:
        coverity_url: ${{ secrets.COVERITY_URL }}
        coverity_user: ${{ secrets.COVERITY_USER }}
        coverity_passphrase: ${{ secrets.COVERITY_PASSPHRASE }}
        coverity_install_directory: ${{ secrets.COVERITY_INSTALL_DIRECTORY }}
        coverity_project_name: ${{ secrets.COVERITY_PROJECT_NAME }}
        coverity_stream_name: ${{ secrets.COVERITY_STREAM_NAME }}
        # Below fields are optional
        coverity_policy_view: ${{ secrets.COVERITY_POLICY_VIEW }}
        coverity_repository_name: ${{ secrets.COVERITY_REPOSITORY_NAME }}
        coverity_branch_name: ${{ secrets.COVERITY_BRANCH_NAME }}

```

# Synopsys GitHub Action for Blackduck

```yaml

name: Synopsys Action

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
        uses: synopsys-sig/synopsys-action@<version>
        with:
          blackduck_apiToken: ${{ secrets.BLACKDUCK_API_TOKEN }}
          blackduck_url: ${{ secrets.BLACKDUCK_URL }}
          blackduck_install_directory: "/install_directory"

          # Optional parameter.
          blackduck_scan_full: false

          # Optional parameter. The values could be. ALL|NONE|BLOCKER|CRITICAL|MAJOR|MINOR|OK|TRIVIAL|UNSPECIFIED
          blackduck_scan_failure_severities: "['ALL']"
          
```

 **Note:** Replace <version> with the required synopsys-action version.

# Additional Parameters

- **synopsys_bridge_path** - Provide path, where you want to configure or already configured Synopsys Bridge. [Note - If you don't provide any path, then by default configuration path will be considered as - $HOME/synopsys-bridge]
  
- **bridge_download_url** - Provide url to bridge zip file. If provided Synopsys Bridge will automatically download and configured in the provided bridge path or in the default path. [Note - As per current behaviour, when this value is provided, the bridge_path or default path will be cleaned first then download and configured all the time]


# Future Enhancements

- Provide comments on Pull Requests about code quality issues.
- Prevent a merge if security issues are found during the pull request. Create a GitHub status check and report the policy as failed if new security issues are found.
- Create GitHub Issues to track issues found by a full analysis. This action is currently focused on providing feedback on a pull request. No action is taken if run manually or on a push. A future enhancement is to create GitHub issues to track security weaknesses found during a push.
- Allow developers to dismiss issues from the pull request. If an issue is deemed to be a false positive, a future enhancement could allow the developer to indicate this by replying to the comment, which would in turn report the status to the Coverity Connect instance so that future runs will recognize the issue as having been triaged as such.
