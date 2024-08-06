export interface GithubClientServiceInterface {
  uploadSarifReport(defaultSarifReportDirectory: string, userSarifFilePath: string): Promise<void>
}
