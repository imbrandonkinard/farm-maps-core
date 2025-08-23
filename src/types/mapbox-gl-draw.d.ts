declare module '@mapbox/mapbox-gl-draw' {
  export default class MapboxDraw {
    constructor(options?: any);

    onAdd(map: any): any;
    onRemove(map: any): any;

    getMode(): string;
    changeMode(mode: string, options?: any): void;
    getAll(): any;
    getSelected(): any;
    delete(ids: string[]): void;
    add(geojson: any): void;
    remove(ids: string[]): void;
    set(geojson: any): void;
    getFeature(id: string): any;
    setFeatureProperty(id: string, property: string, value: any): void;
    getSelectedIds(): string[];

    static constants: {
      classes: {
        CANVAS: string;
        CONTROL_BASE: string;
        CONTROL_PREFIX: string;
        CONTROL_GROUP: string;
        ATTRIBUTION: string;
      };
    };
  }
}
