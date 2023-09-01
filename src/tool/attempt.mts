async function attempt<T, E>(thenable: Promise<T>,) {
    let error: E | undefined;
    let result: T | undefined;

    try {
        result = await thenable;
    } catch (rejection) {
        error = rejection;
    }

    return [error, result];
};

export default attempt;