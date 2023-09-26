import semver from "semver";
import {options} from "./cli.js";

export interface NodeVersion {
    version: string;
    date: Date;
    files: ("aix-ppc64"
        | "headers"
        | "linux-arm64"
        | "linux-armv7l"
        | "linux-ppc64le"
        | "linux-s390x"
        | "linux-x64"
        | "osx-arm64-tar"
        | "osx-x64-pkg"
        | "osx-x64-tar"
        | "src"
        | "win-arm64-7z"
        | "win-arm64-zip"
        | "win-x64-7z"
        | "win-x64-exe"
        | "win-x64-msi"
        | "win-x64-zip"
        | "win-x86-7z"
        | "win-x86-exe"
        | "win-x86-msi"
        | "win-x86-zip"
        | "sunos-x64"
        | "linux-armv6l"
        | "linux-x86"
        | "sunos-x86"
        | "osx-x86-tar")[];
}

export async function getNodeVersionsInRange(from: string, to: string): Promise<NodeVersion[]> {
    const response = await fetch("https://nodejs.org/dist/index.json");
    const body: NodeVersion[] = await response.json();

    return body
        .filter(({version}) => semver.satisfies(version, `>= ${from} <= ${to}`))
        .sort((a, b) => semver.compare(a.version, b.version));
}
