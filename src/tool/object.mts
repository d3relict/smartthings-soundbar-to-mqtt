const jsonClone = (object: object): void => {
    try {
        return JSON.parse(JSON.stringify(object));
    } catch (err) {
        return undefined;
    }
}

export {
    jsonClone
}