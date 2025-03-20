import { TransformNode } from "@babylonjs/core";

// Entity.ts
export class Entity extends TransformNode {
    private static _nextId = 1;
    public name: string;
    private _components: Map<string, any>;
    public meshLoaded = false;

    constructor(name: string) {
        super();
        this._components = new Map();
        this.name = name;
    }

    getAllComponents() {
        return this._components;
    }

    isReady() {
        const c = this.getAllComponents();
        for (let i in c) {
            if (!c[i].ready()) {
                return false;
            }
        }
        return true;
    }

    // Add a component to this entity
    addComponent(component: any): Entity {
        component.entity = this;
        this._components.set(component.constructor.name, component);
        return this;
    }

    // Remove a component from this entity by its class
    removeComponent(componentClass: any): Entity {
        this._components.delete(componentClass.name);
        return this;
    }

    // Get a component by its class
    getComponent<T>(componentClass: new (...args: any[]) => T): T {
        return this._components.get(componentClass.name) as T;
    }

    // Check if the entity has a specific component
    hasComponent(componentClass: any): boolean {
        return this._components.has(componentClass.name);
    }

    getComponentByName(name: string) {
        return this._components.get(name + "Component");
    }

    getComponentTypes(): string[] {
        return Array.from(this._components.keys());
    }

    isPrimitive(value: any) {
        return (
            value === null ||
            (typeof value !== "object" && typeof value !== "function")
        );
    }

    serialize() {
        const data = {
            id: this.id,
            name: this.name,
            components: new Map(),
        };

        for (const [key, value] of this._components) {
            if (this.isPrimitive(value)) data.components.set(key, value);
        }
        return data;
    }
}
