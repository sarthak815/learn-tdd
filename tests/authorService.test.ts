
// Write a unit test for the GET / authors service. 
// The service should respond with a list of author names and lifetimes sorted by family name of the authors.It should respond
// with a "No authors found" message when there are no authors in the database.If an error occurs when retrieving the authors then the
// service responds with an error code of 500. The unit test

import request from "supertest";
import Author from "../models/author";
import app from "../server";

describe("Verify GET /authors service", () => {
    const mockAuthors = [
        { name: "Doe, Jon", lifespan: "1990 - 2020" },
        { name: "Lam, Jane", lifespan: "1995 - 2020" },
        { name: "Camj, Jim", lifespan: "1993 - 2020" },

    ];

    let consoleSpy: jest.SpyInstance;

    beforeAll(() => {
        consoleSpy = jest.spyOn(console, "error").mockImplementation();
    });

    afterAll(() => {
        consoleSpy.mockRestore();
    });

    it("should respond with a message when the database has no authors", async () => {
        Author.getAllAuthors = jest.fn().mockResolvedValue([]);
        const response = await request(app).get("/authors");
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("No authors found");
    });

    it("should respond with a list of authors and lifetimes sorted by family name", async () => {
        const expectedSortedAuthors = [...mockAuthors].sort((a, b) => a.name.localeCompare(b.name));
        Author.getAllAuthors = jest.fn().mockImplementationOnce((sortOpts) => {
            if (sortOpts && sortOpts.family_name === 1) {
                return Promise.resolve(expectedSortedAuthors);
            }
            return Promise.resolve(mockAuthors);
        })

        const response = await request(app).get("/authors");
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual(expectedSortedAuthors);
    });

    it("should respond with an error message when there is an error processing the request", async () => {
        Author.getAllAuthors = jest.fn().mockRejectedValue(new Error("Database error"));
        const response = await request(app).get("/authors");
        expect(response.statusCode).toBe(500);
        expect(consoleSpy).toHaveBeenCalled();
    });
});
