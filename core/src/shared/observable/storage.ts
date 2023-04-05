import type { Observable } from './observable';

type ComputedDepCallback = (dep: Observable<any>) => void;

export const computedStack: ComputedDepCallback[] = [];
