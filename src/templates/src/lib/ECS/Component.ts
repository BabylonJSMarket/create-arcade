import { Entity } from "./Entity";

// Type Definitions - can be in a separate file if desired
export interface ComponentClass<T = any> {
    new (data: any): Component;
}

export abstract class Component {
    loading: boolean = false;
    loaded: boolean = false;
    enabled: boolean = true;
    entity: Entity | null = null;

    constructor(data: any = {}) {
        this.enabled = typeof data.enabled == "undefined" ? true : data.enabled;
        Object.assign(this, data);
    }

    get isReady() {
        return this.loaded && !this.loading;
    }

    set ready(b: boolean) {
        this.loaded = b;
        this.loading = !b;
    }

    protected valid(data: any): boolean {
        if (data.enabled === false) {
            console.log(`Component ${this.constructor.name} is disabled`);
        } else {
            throw new Error(
                `Component ${this.constructor.name} does not impliment a method called valid(data).  Please implement`,
            );
        }
        return true;
    }

    serialize() {
        let data = {};
        // Iterate over the component's own properties (excluding prototype properties)
        for (const key in this) {
            if (this.hasOwnProperty(key)) {
                data[key] = this[key];
            }
        }
        return data;
    }
}
