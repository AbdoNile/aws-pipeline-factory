import { StackInformation } from './cloudformation-manager';

export class DiscoveryJob {
  name: string;
  owner: string;
}
export class Branch {
  constructor(public branchName: string, public commitSha: string) {}
  public pipelineStack: StackInformation;
}

export class SettingsOverrides {
  gitHubTokenSecretArn?: string;
  buildSpecLocation?: string;
  buildAsRoleArn?: string;
  monitoredBranches?: string[];
}

export class Repository {
  name: string;
  owner: string;
  defaultBranch: string;
  topics: string[];
  repositoryId: string;
  branches: Branch[];
  settings?: SettingsOverrides;
}

export class RepositoryBuildConfiguration {
  constructor(public repository: Repository, public branchesWithPipeline: string[]) {}

  shouldBeMonitored(): boolean {
    return this.repository.topics.filter((t) => t.toLowerCase() == 'pipeline-factory').length > 0;
  }

  requestedBranches(): Branch[] {
    const monitoredBySettingsFile: string[] = this.repository.settings?.monitoredBranches || [];
    monitoredBySettingsFile.push(this.repository.defaultBranch);
    const allRequestedBranchNames = monitoredBySettingsFile.map((b) => b.toLowerCase());
    return this.repository.branches.filter((b) =>
      allRequestedBranchNames.find((br) => br == b.branchName.toLowerCase()),
    );
  }

  private isRequestedForMonitoring(branchName: string): boolean {
    const result =
      this.requestedBranches().findIndex((b) => b.branchName.toLowerCase() == branchName.toLocaleLowerCase()) > -1;
    return result;
  }

  private isNew(branchName: string): boolean {
    const result =
      this.branchesWithPipeline.filter((b) => b.toLowerCase() == branchName.toLocaleLowerCase()).length == 0;
    return result;
  }

  private isAlreadyMonitored(branchName: string): boolean {
    const result = this.branchesWithPipeline.findIndex((b) => b.toLowerCase() == branchName.toLocaleLowerCase()) > -1;
    return result;
  }

  branchesToAdd(): Branch[] {
    const requestedBranches = this.requestedBranches();
    const newRequestedBranches: Branch[] = requestedBranches.filter((b) => this.isNew(b.branchName));

    return newRequestedBranches;
  }

  obsoletePipelines(): Branch[] {
    const obsoleteBranches: Branch[] = [];

    this.repository.branches.forEach((branch) => {
      if (!this.isRequestedForMonitoring(branch.branchName) && this.isAlreadyMonitored(branch.branchName)) {
        obsoleteBranches.push(branch);
      }
    });

    return obsoleteBranches;
  }
}
