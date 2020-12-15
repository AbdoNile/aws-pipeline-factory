import AWS from 'aws-sdk';

export interface OrganizationInfo {
  name: string;
  githubToken: string;
}

export class OrganizationManager {
  public async get(organizationName: string): Promise<OrganizationInfo> {
    const githubSecretName = `/pipeline-factory/organization/${organizationName}/githubToken`;
    try {
      const secretManagerClient = new AWS.SecretsManager();
      const githubTokenSecret = await secretManagerClient
        .getSecretValue({
          SecretId: githubSecretName,
        })
        .promise();

      if (!githubTokenSecret.SecretString) {
        throw new Error(`Cannot find secret ${githubSecretName}`);
      }
      const organizationInfo: OrganizationInfo = {
        name: organizationName,
        githubToken: githubTokenSecret.SecretString,
      };

      return organizationInfo;
    } catch (er) {
      console.error(`Cannot find secret ${githubSecretName}`);

      throw er;
    }
  }
}
