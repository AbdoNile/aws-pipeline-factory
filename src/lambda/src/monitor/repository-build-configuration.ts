import { Branch, Repository } from '../models';

export class RepositoryBuildConfiguration {
  constructor(public repository: Repository, public branchesWithPipeline: string[]) {}

  shouldBeMonitored(repositorySelector: string): boolean {
    return this.repository.topics.filter((t) => t.toLowerCase() == repositorySelector).length > 0;
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
