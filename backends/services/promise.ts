'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

/**
 * change `callback` to promise(0 input).
 */
export function promisify1<TResult>(callback: (next: (error: Error, result: TResult) => void) => void): () => Promise<TResult> {
    return () => {
        return new Promise((resolve, reject) => {
            callback((error: Error, result: TResult) => {
                return error !== null ? reject(error) : resolve(result);
            });
        });
    };
}

/**
 * change `callback` to promise(1 input).
 */
export function promisify2<T1, TResult>(callback: (t1: T1, next: (error: Error, result: TResult) => void) => void): (t1: T1) => Promise<TResult> {
    return (t1: T1) => {
        return new Promise((resolve, reject) => {
            callback(t1, (error: Error, result: TResult) => {
                return error !== null ? reject(error) : resolve(result);
            });
        });
    };
}

/**
 * change `callback` to promise(2 input).
 */
export function promisify3<T1, T2, TResult>(callback: (t1: T1, t2: T2, next: (error: Error, result: TResult) => void) => void): (t1: T1, t2: T2) => Promise<TResult> {
    return (t1: T1, t2: T2) => {
        return new Promise((resolve, reject) => {
            callback(t1, t2, (error: Error, result: TResult) => {
                return error !== null ? reject(error) : resolve(result);
            });
        });
    };
}

/**
 * change `callback` to promise(3 input).
 */
export function promisify4<T1, T2, T3, TResult>(callback: (t1: T1, t2: T2, t3: T3, next: (error: Error, result: TResult) => void) => void): (t1: T1, t2: T2, t3: T3) => Promise<TResult> {
    return (t1: T1, t2: T2, t3: T3) => {
        return new Promise((resolve, reject) => {
            callback(t1, t2, t3, (error: Error, result: TResult) => {
                return error !== null ? reject(error) : resolve(result);
            });
        });
    };
}
