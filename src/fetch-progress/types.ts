export interface FetchProgressData {
    total: number;
    transferred: number;
    speed: number;
    eta: number;
    remaining?: number;
    percentage?: number;
}

export interface FetchProgressInitOptions {
    defaultSize?: number;
    emitDelay?: number;
    onProgress?: onProgressFn;
    onComplete?: () => void;
    onError?: (error: Error) => void;
    response: Response;
}

export type onProgressFn = (progress: FetchProgressData) => void;
