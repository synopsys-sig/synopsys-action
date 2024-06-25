export interface IGithubClientService {
  uploadSarifReport(defaultSarifReportDirectory: string, userSarifFilePath: string): Promise<void>
}
