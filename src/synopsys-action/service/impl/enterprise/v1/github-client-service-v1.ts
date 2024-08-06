import {GithubClientServiceBase} from '../../github-client-service-base'

/*
 This class extends GithubClientServiceBase and is designed to override its methods.
 It allows for the incorporation of future API changes and enhancements for GitHub enterprise server (version 3.11 and 3.12)
 without modifying the base class.
*/
export class GithubClientServiceV1 extends GithubClientServiceBase {}
