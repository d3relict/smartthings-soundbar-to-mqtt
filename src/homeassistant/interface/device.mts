import IDestroyable from "./destroyable.mjs";

interface IDevice extends IDestroyable {
    get label(): string;

    get type(): string;

    updateState(value: any): void;
}

export default IDevice;