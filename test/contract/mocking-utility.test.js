"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetMockPolarisParams = exports.mockPolarisParamsExcept = exports.mockBridgeDownloadUrlAndSynopsysBridgePath = exports.getBridgeDownloadUrl = exports.setAllMocks = void 0;
const configVariables = __importStar(require("@actions/artifact/lib/internal/config-variables"));
const validator = __importStar(require("../../src/synopsys-action/validators"));
const toolCache = __importStar(require("@actions/tool-cache"));
const io = __importStar(require("@actions/io"));
const utility = __importStar(require("../../src/synopsys-action/utility"));
const inputs = __importStar(require("../../src/synopsys-action/inputs"));
const polarisParamsMap = new Map();
polarisParamsMap.set('POLARIS_SERVER_URL', 'POLARIS_SERVER_URL');
polarisParamsMap.set('POLARIS_ACCESS_TOKEN', 'POLARIS_ACCESS_TOKEN');
polarisParamsMap.set('POLARIS_APPLICATION_NAME', 'POLARIS_APPLICATION_NAME');
polarisParamsMap.set('POLARIS_PROJECT_NAME', 'POLARIS_PROJECT_NAME');
polarisParamsMap.set('POLARIS_ASSESSMENT_TYPES', '["SCA", "SAST"]');
function setAllMocks() {
    jest.spyOn(configVariables, 'getWorkSpaceDirectory').mockReturnValue('/Users/kishori/Project');
    jest.spyOn(validator, 'validatePolarisInputs').mockReturnValueOnce(true);
    jest.spyOn(toolCache, 'downloadTool').mockResolvedValueOnce(__dirname);
    jest.spyOn(io, 'rmRF').mockResolvedValue();
    jest.spyOn(toolCache, 'extractZip').mockResolvedValueOnce('Extracted');
    jest.spyOn(validator, 'validateBridgeUrl').mockReturnValue(true);
    jest.spyOn(utility, 'cleanupTempDir').mockResolvedValue();
    jest.spyOn(utility, 'createTempDir').mockResolvedValue(__dirname);
}
exports.setAllMocks = setAllMocks;
function getBridgeDownloadUrl() {
    return 'https://sig-repo.synopsys.com/artifactory/bds-integrations-release/com/synopsys/integration/synopsys-action/0.1.61/ci-package-0.1.61-macosx.zip';
}
exports.getBridgeDownloadUrl = getBridgeDownloadUrl;
function mockBridgeDownloadUrlAndSynopsysBridgePath() {
    Object.defineProperty(inputs, 'BRIDGE_DOWNLOAD_URL', { value: getBridgeDownloadUrl() });
    Object.defineProperty(inputs, 'SYNOPSYS_BRIDGE_PATH', { value: __dirname });
}
exports.mockBridgeDownloadUrlAndSynopsysBridgePath = mockBridgeDownloadUrlAndSynopsysBridgePath;
function mockPolarisParamsExcept(polarisConstant) {
    polarisParamsMap.forEach((value, key) => {
        if (polarisConstant != key) {
            Object.defineProperty(inputs, key, { value: value });
        }
    });
}
exports.mockPolarisParamsExcept = mockPolarisParamsExcept;
function resetMockPolarisParams() {
    polarisParamsMap.forEach((value, key) => {
        Object.defineProperty(inputs, key, { value: null });
    });
}
exports.resetMockPolarisParams = resetMockPolarisParams;
