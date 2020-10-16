import AWS from 'aws-sdk';

export default class AuthHelper {
  public static LoadCredentials = (profileName: string): AWS.Credentials => {
    const credentials = new AWS.SharedIniFileCredentials({ profile: profileName });
    AWS.config.update({
      credentials: credentials,
    });
    return credentials;
  };
}
