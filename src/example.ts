import {config} from "dotenv";
import {join} from "path";
import {getBalance, getToken} from "./browser";

(async () => {
    config({path: join(__dirname, "../.env"), debug: true, override: true})
    const token = await getToken({
                                     login: process.env.TEST_LOGIN as string,
                                     password: process.env.TEST_PASSWORD as string
                                 })
    console.log(`token: ${token}`)
    if (!token) {
        throw new Error()
    }
    const result = await getBalance(token)
    console.log(result)

})()
