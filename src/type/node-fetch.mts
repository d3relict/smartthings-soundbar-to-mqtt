import { RequestInfo, RequestInit, Response } from 'node-fetch';

type TFetch = (
    url: RequestInfo,
    init?: RequestInit,
) => Promise<Response>;

export { TFetch, RequestInfo, RequestInit, Response };