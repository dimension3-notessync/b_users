
export default function usernameChecker(username) {
    const pattern = /^[a-zA-Z0-9]([a-zA-Z0-9_-])*[a-zA-Z0-9]$/;
    return pattern.test(username) && !/\s/.test(username);
}