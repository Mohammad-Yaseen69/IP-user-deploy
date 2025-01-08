import { shuffle } from "./Shuffle";

export const generateRandomIv = (length) => {
    let pool = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    pool = pool.repeat(5)
    pool = shuffle(pool)
    pool = pool.substring(0, length);
    return pool.toString()
}