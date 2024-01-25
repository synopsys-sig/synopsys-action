node {
   checkout scm
   stage("unit-test") {
            echo 'UNIT TEST EXECUTION STARTED'
        }
        stage("functional-test") {
            echo 'FUNCTIONAL TEST EXECUTION STARTED'
        }
        
        stage("synopsys-security-scan") {
             script {
                 echo 'SYNOPSYS SECURITY SCAN EXECUTION STARTED'
                 synopsys_scan product: 'blackduck', blackduck_url: "https://testing.blackduck.synopsys.com/", blackduck_token: "NjRhYTY5ZTEtY2M4ZS00YzQ5LTgwZWItMGViNTljYmYxYjc0OjNmZmQ1YzRhLTI3ZGQtNGNmMi05OTM5LWY0MTRjMzdmZjk1Mw==", blackduck_reports_sarif_create: true, blackduck_reports_sarif_groupSCAIssues: true, blackduck_reports_sarif_severities: 'critical,high,medium,low'
             }
        }
        
        stage("build") {
              echo 'BUILD EXECUTION STARTED'
              echo 'Pulling...' + env.BRANCH_NAME
       }
       
}
