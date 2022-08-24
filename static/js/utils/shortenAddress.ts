export const shortenAddress = (publicKey: string): string => {
    return publicKey.slice(0, 5) + '...' + publicKey.slice(-5)
}