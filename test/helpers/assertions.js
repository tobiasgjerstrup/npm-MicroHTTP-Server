import { expect } from 'vitest';

export async function expectRequestToFail(request, expectedStatus, expectedBody) {
    try {
        await request();
    } catch (err) {
        expect(err.status).toBe(expectedStatus);
        if (expectedBody !== undefined) {
            expect(err.body).toBe(expectedBody);
        }
        return;
    }

    throw new Error('Expected request to fail');
}
