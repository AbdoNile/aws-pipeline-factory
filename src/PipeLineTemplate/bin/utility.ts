export class Utility {
    public static    sanitizeStackName  (rawName :string ): string {
        return rawName.replace("_", "-");
    }
}