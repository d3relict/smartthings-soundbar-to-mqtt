interface IDestroyable {
    destroy: () => Promise<void>,
}

export default IDestroyable;