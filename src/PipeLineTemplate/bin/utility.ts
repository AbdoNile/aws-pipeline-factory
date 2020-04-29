export class Utility {
    public static    sanitizeStackName  (rawName :string ): string {
        return rawName.replace(new RegExp('_', 'g'), '-').replace(new RegExp('/', 'g'), '-');

    }
}