declare module '../tools/doc-fetcher/index' {
  export class AngularDocumentationFetcher {
    fetch(version: string, options?: { force?: boolean }): Promise<{
      skipped?: boolean;
      majorVersion: string;
      version: string;
      processed: number;
      duration: string;
      categorized: Record<string, number>;
      uncategorized: number;
    }>;
  }
}

declare module '../tools/index' {
  export { AngularDocumentationFetcher } from './doc-fetcher/index';
} 