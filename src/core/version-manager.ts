import semver from 'semver';
import fs from 'fs-extra';
import path from 'path';

interface VersionObject {
  version?: string;
  tag_name?: string;
}

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: any;
}

interface AngularJson {
  version?: string;
  [key: string]: any;
}

export class VersionManager {
  /**
   * Extract major version from a full version string
   */
  static extractMajorVersion(version: string): string {
    if (!version || version === 'latest' || version === 'main') {
      return 'latest';
    }

    // Clean version string and parse
    const cleanVersion = version.replace(/^v/, '');
    const parsed = semver.parse(cleanVersion);
    
    if (parsed) {
      return `v${parsed.major}`;
    }
    
    // Fallback: try to extract major version from string
    const match = version.match(/(\d+)/);
    if (match) {
      return `v${match[1]}`;
    }
    
    return 'latest';
  }

  /**
   * Compare two versions to determine if an update is needed
   */
  static shouldUpdate(currentVersion: string, newVersion: string): boolean {
    if (!currentVersion || currentVersion === 'latest') {
      return true;
    }

    const cleanCurrent = currentVersion.replace(/^v/, '');
    const cleanNew = newVersion.replace(/^v/, '');

    // Parse versions
    const currentParsed = semver.parse(cleanCurrent);
    const newParsed = semver.parse(cleanNew);

    if (!currentParsed || !newParsed) {
      return true; // Update if we can't parse versions
    }

    // Only update if same major version but newer minor/patch
    return currentParsed.major === newParsed.major && 
           semver.gt(cleanNew, cleanCurrent);
  }

  /**
   * Get the latest version for a specific major version
   */
  static getLatestInMajor(versions: VersionObject[], majorVersion: string): VersionObject | null {
    const sameMajorVersions = versions.filter(v => {
      const vMajor = this.extractMajorVersion(v.version || v.tag_name || '');
      return vMajor === majorVersion;
    });

    if (sameMajorVersions.length === 0) {
      return null;
    }

    // Sort by version and return latest
    return sameMajorVersions.sort((a, b) => {
      const versionA = (a.version || a.tag_name || '').replace(/^v/, '');
      const versionB = (b.version || b.tag_name || '').replace(/^v/, '');
      
      if (semver.valid(versionA) && semver.valid(versionB)) {
        return semver.rcompare(versionA, versionB);
      }
      
      return versionB.localeCompare(versionA);
    })[0];
  }

  /**
   * Get all major versions from a list of versions
   */
  static getMajorVersions(versions: VersionObject[]): string[] {
    const majorVersions = new Set<string>();
    
    versions.forEach(v => {
      const major = this.extractMajorVersion(v.version || v.tag_name || '');
      majorVersions.add(major);
    });

    return Array.from(majorVersions).sort((a, b) => {
      if (a === 'latest') return -1;
      if (b === 'latest') return 1;
      
      const numA = parseInt(a.replace('v', '')) || 0;
      const numB = parseInt(b.replace('v', '')) || 0;
      
      return numB - numA; // Descending order
    });
  }

  /**
   * Detect Angular version from a project directory
   */
  static async detectProjectVersion(projectPath: string = process.cwd()): Promise<string> {
    try {
      // Try to read package.json
      const packagePath = path.join(projectPath, 'package.json');
      if (await fs.pathExists(packagePath)) {
        const packageJson: PackageJson = await fs.readJson(packagePath);
        
        // Check dependencies for Angular core
        const deps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        };
        
        if (deps['@angular/core']) {
          const angularVersion = deps['@angular/core'];
          const cleanVersion = angularVersion.replace(/[\^~]/, '');
          return this.extractMajorVersion(cleanVersion);
        }
      }
      
      // Try angular.json
      const angularJsonPath = path.join(projectPath, 'angular.json');
      if (await fs.pathExists(angularJsonPath)) {
        const angularJson: AngularJson = await fs.readJson(angularJsonPath);
        if (angularJson.version) {
          return this.extractMajorVersion(angularJson.version);
        }
      }
      
    } catch (error) {
      console.warn('Could not detect Angular version from project:', (error as Error).message);
    }
    
    return 'latest';
  }

  /**
   * Check if a version string is a valid Angular version
   */
  static isValidVersion(version: string): boolean {
    if (version === 'latest' || version === 'main') {
      return true;
    }
    
    const cleanVersion = version.replace(/^v/, '');
    return semver.valid(cleanVersion) !== null;
  }
} 