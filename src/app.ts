import {urlencoded} from "body-parser";
import {config} from "dotenv";
import express from "express";
import {Redis} from "ioredis";
import {join} from "path";
import {getBalance, getToken} from "./browser";

export const app = express()
export const redis = new Redis()
config({
           path: join(__dirname, "../.env"),
           debug: true,
           override: true
       })
app
    .post('/auth', urlencoded({extended: false}), async (req, res, next) => {
        const {login , password } = req.body
        console.log(login, password)
        try {
            const token = await getToken({login, password})
            if (token) {
                await redis.set(login, token)
            }
        } catch (e) {
            res.status(200)
               .json({
                         action: "auth",
                         status: false
                     })
               .end()
            return
        }
        res.status(200)
           .json({
                     action: "auth",
                     status: true
                 })
           .end()

    })
app
    .get('/balance', async (req, res, next) => {
        const {login} = req.query
        if (login == undefined) {
            res.status(200)
               .json({
                         action: "balance",
                         status: false
                     })
               .end()
        }
        const token = await redis.get(login as string)
        if (token) {
            const result = await getBalance(token)
            res.status(200)
               .json({
                         action: "balance",
                         status: true,
                         result
                     })
               .end()
        }

    })
