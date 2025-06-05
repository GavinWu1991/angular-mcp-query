import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Version Manager - Handles supported Angular version information
 */
export class VersionManager {
  private static supportedVersionsPath: string;
  private static cachedVersions: string[] | null = null;

  static {
    // Get the path to the supported-versions.txt file at project root
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    // From dist/src/utils to project root is ../../../
    this.supportedVersionsPath = path.resolve(currentDir, '../../../supported-versions.txt');
  }

  /**
   * Read supported versions from the text file
   */
  static async getSupportedVersions(): Promise<string[]> {
    if (this.cachedVersions !== null) {
      return this.cachedVersions;
    }

    try {
      const content = await fs.readFile(this.supportedVersionsPath, 'utf8');
      this.cachedVersions = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#'));
      
      return this.cachedVersions;
    } catch (error) {
      throw new Error(`Failed to read supported versions file: ${(error as Error).message}`);
    }
  }

  /**
   * Check if a version is supported
   */
  static async isSupportedVersion(version: string): Promise<boolean> {
    const supportedVersions = await this.getSupportedVersions();
    return supportedVersions.includes(version);
  }

  /**
   * Get the latest supported version
   */
  static async getLatestVersion(): Promise<string> {
    const supportedVersions = await this.getSupportedVersions();
    if (supportedVersions.length === 0) {
      throw new Error('No supported versions found');
    }
    
    // Return the last version in the list (assuming it's ordered)
    return supportedVersions[supportedVersions.length - 1];
  }

  /**
   * Get all supported versions for fetching
   */
  static async getVersionsToFetch(): Promise<string[]> {
    return await this.getSupportedVersions();
  }

  /**
   * Clear the cached versions (useful for testing or when the file changes)
   */
  static clearCache(): void {
    this.cachedVersions = null;
  }

  /**
   * Validate and normalize a version string to major version format
   */
  static async validateAndNormalizeVersion(version: string): Promise<string> {
    const supportedVersions = await this.getSupportedVersions();
    
    // Extract major version from input (e.g., "18.2.10" -> "v18", "v18" -> "v18", "18" -> "v18")
    const majorVersion = this.extractMajorVersion(version);
    
    // Check if this major version is supported
    if (supportedVersions.includes(majorVersion)) {
      return majorVersion;
    }
    
    throw new Error(`Unsupported version: ${version}. Supported major versions: ${supportedVersions.join(', ')}`);
  }

  /**
   * Extract major version from a version string (e.g., "18.2.10" -> "v18")
   */
  static extractMajorVersion(version: string): string {
    // Remove 'v' prefix if present
    const cleanVersion = version.startsWith('v') ? version.slice(1) : version;
    
    // Extract major version number
    const majorMatch = cleanVersion.match(/^(\d+)/);
    if (!majorMatch) {
      throw new Error(`Invalid version format: ${version}`);
    }
    
    return `v${majorMatch[1]}`;
  }

  /**
   * Get the actual version to fetch for a major version
   * This maps major versions to specific tags that exist in the repository
   */
  static getVersionToFetch(majorVersion: string): string {
    const versionMap: Record<string, string> = {
      'v18': '18.2.10',
      'v20': '20.0.1'
    };
    
    const fetchVersion = versionMap[majorVersion];
    if (!fetchVersion) {
      throw new Error(`No fetch version configured for major version: ${majorVersion}`);
    }
    
    return fetchVersion;
  }
} 