import {Query} from "../Query/Query";
import {Result} from "../Result/Result";
import {HttpClient} from "./HttpClient";
import {Response} from "./Response";

/**
 * AxiosClient
 */
export class TestClient implements HttpClient {

    public calls: any[] = [];

    /**
     * Get
     *
     * @param url
     * @param method
     * @param credentials
     * @param parameters
     * @param data
     *
     * @return {Promise<Response>}
     */
    public async get(
        url: string,
        method: string,
        credentials: any,
        parameters: any = {},
        data: any = {},
    ): Promise<Response> {

        this.calls.push({
            url,
            method,
            credentials,
            parameters,
            data,
        });

        if (credentials.token === "error") {
            throw new Error("Error found");
        }

        return new Promise<Response>(
            (resolve) => resolve(new Response(
                200,
                ((
                    method === "get" &&
                    url === "/"
                )
                ? Result.createFromArray({
                    query: Query.createMatchAll(),
                }).toArray()
                : ""),
            )),
        );
    }

    /**
     * Generate a new cancellation token for a query
     *
     * @param url
     */
    public generateCancelToken(url: string)
    {

    }

    /**
     * Abort current request
     * And regenerate the cancellation token
     *
     * @param url
     */
    public abort(url: string)
    {

    }
}
