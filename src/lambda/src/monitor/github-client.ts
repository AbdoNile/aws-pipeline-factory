import { Octokit } from '@octokit/rest';
import { decode } from 'js-base64';

export interface ISourceControlClient {
  findBranches(owner: string, repositoryName: string): Promise<{ branchName: string; commitSha: string }[]>;

  findSubscribedRepositories(
    organization: string,
  ): Promise<{ repositoryName: string; owner: string; defaultBranch: string }[]>;

  getPipelineFactorySettings(owner: string, repositoryName: string, branchName: string): Promise<any>;

  fetchFile(owner: string, repo: string, branchName: string, filePath: string): Promise<string | null>;
}

export class GithubClient implements ISourceControlClient {
  private octokit: Octokit;
  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  public async findSubscribedRepositories(
    organization: string,
  ): Promise<{ repositoryName: string; owner: string; defaultBranch: string }[]> {
    const repos = await this.octokit.paginate(this.octokit.repos.listForOrg, {
      org: organization,
    });

    return repos
      .filter((r) => r.name.startsWith('stage'))
      .map((r) => {
        return {
          repositoryName: r.name,
          owner: r.owner.login,
          defaultBranch: r.default_branch,
        };
      });
  }

  public async findBranches(
    owner: string,
    repositoryName: string,
  ): Promise<{ branchName: string; commitSha: string }[]> {
    const listBranchesResponse = await this.octokit.repos.listBranches({
      repo: repositoryName,
      owner: owner,
    });

    return (
      listBranchesResponse.data
        //   .filter((b) => b.name == 'master' || b.name == 'abdo')
        .map((branch) => {
          return {
            branchName: branch.name,
            commitSha: branch.commit.sha,
          };
        })
    );
  }

  public async getPipelineFactorySettings(owner: string, repositoryName: string, branchName: string): Promise<any> {
    const settingsFileContent: any = await this.fetchFile(
      owner,
      repositoryName,
      branchName,
      'pipeline-factory.settings',
    );

    const settingsFileJSON = JSON.parse(settingsFileContent);
    return settingsFileJSON;
  }

  public async fetchFile(owner: string, repo: string, branchName: string, filePath: string): Promise<string | null> {
    let settingsFileContent;
    return await this.octokit.repos
      .getContent({
        owner: owner,
        repo: repo,
        ref: branchName,
        path: filePath,
      })
      .then((settingsFileResponse) => {
        if (settingsFileResponse.status == 200) {
          settingsFileContent = decode(settingsFileResponse.data.content);
          return settingsFileContent;
        } else {
          return null;
        }
      })
      .catch((e) => {
        if (e.status != '404') {
          console.error(JSON.stringify(e, null, 4));
        }
        return null;
      });
  }
}
