export function assertNever(
    never: never,
    message: string | ((value: any) => string),
): never {
    const errorMessage = typeof message === "string" ? message : message(never);
    throw new Error(errorMessage);
}
