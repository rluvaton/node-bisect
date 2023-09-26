import semver from "semver";

export interface NodeVersion {
    version: string;
    date: Date;
    files: string[];
}

export async function getNodeVersionsInRange(from: string, to: string): Promise<NodeVersion[]> {
    const response = await fetch("https://nodejs.org/dist/index.json");
    const body: NodeVersion[] = await response.json();

    return body
        .filter(({version}) => semver.satisfies(version.replace('v', ''), `>= ${from} <= ${to}`))
        .sort((a, b) => semver.compare(a.version.replace('v', ''), b.version.replace('v', '')));
}
